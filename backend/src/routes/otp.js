import express from 'express';
import { generateOTP, sendOTP, validatePhoneNumber, normalizePhoneNumber } from '../services/smsService.js';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Cache en mémoire pour les OTP (pas de stockage en base)
const otpCache = new Map();

// Nettoyer le cache toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phoneNumber, data] of otpCache.entries()) {
    if (data.expiresAt < now) {
      otpCache.delete(phoneNumber);
    }
  }
}, 5 * 60 * 1000);

// Validation personnalisée pour les numéros ivoiriens
const validatePhoneNumberCustom = [
  body('phoneNumber')
    .custom((value) => {
      const validation = validatePhoneNumber(value);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return true;
    })
    .customSanitizer((value) => {
      return normalizePhoneNumber(value);
    })
];

const validateOTP = [
  body('phoneNumber')
    .custom((value) => {
      const validation = validatePhoneNumber(value);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return true;
    })
    .customSanitizer((value) => {
      return normalizePhoneNumber(value);
    }),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Le code OTP doit contenir 6 chiffres')
];

// Envoyer un OTP
router.post('/send', validatePhoneNumberCustom, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phoneNumber } = req.body; // Déjà normalisé par la validation

    // Vérifier s'il y a déjà un OTP non utilisé pour ce numéro
    const existingOTP = otpCache.get(phoneNumber);
    
    if (existingOTP && existingOTP.expiresAt > Date.now() && !existingOTP.isUsed) {
      return res.status(429).json({
        success: false,
        message: 'Un code OTP a déjà été envoyé. Veuillez attendre avant d\'en demander un nouveau.'
      });
    }

    // Générer un nouveau code OTP
    const otpCode = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Envoyer le SMS
    const smsResult = await sendOTP(phoneNumber, otpCode);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
        error: smsResult.error
      });
    }

    // Stocker en mémoire (pas en base de données)
    otpCache.set(phoneNumber, {
      code: otpCode,
      expiresAt: expiresAt,
      attempts: 0,
      isUsed: false,
      resendCount: 0,
      lastResendAt: null,
      originalSentAt: Date.now()
    });

    res.json({
      success: true,
      message: 'Code OTP envoyé avec succès',
      phoneNumber: phoneNumber,
      expiresIn: 300, // 5 minutes en secondes
      resendCount: 0,
      maxResends: 2
    });

  } catch (error) {
    console.error('Erreur envoi OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Vérifier un OTP
router.post('/verify', validateOTP, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phoneNumber, code } = req.body; // phoneNumber déjà normalisé

    // Rechercher l'OTP dans le cache
    const otpData = otpCache.get(phoneNumber);

    if (!otpData || otpData.isUsed || otpData.expiresAt < Date.now()) {
      // Incrémenter les tentatives si l'OTP existe
      if (otpData) {
        otpData.attempts += 1;
      }

      return res.status(400).json({
        success: false,
        message: 'Code OTP invalide ou expiré'
      });
    }

    // Vérifier le code
    if (otpData.code !== code) {
      otpData.attempts += 1;
      
      if (otpData.attempts >= 3) {
        otpCache.delete(phoneNumber);
        return res.status(429).json({
          success: false,
          message: 'Trop de tentatives. Veuillez demander un nouveau code.'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Code OTP incorrect'
      });
    }

    // Marquer l'OTP comme utilisé et le supprimer du cache
    otpCache.delete(phoneNumber);

    // Mettre à jour le statut de vérification du téléphone pour l'utilisateur
    const updatedUser = await User.findOneAndUpdate(
      { telephone: phoneNumber },
      { isPhoneVerified: true },
      { new: true }
    );

    // Si l'utilisateur n'existe pas, on retourne quand même un succès
    // car le code OTP a été validé, mais on envoie un avertissement
    if (!updatedUser) {
      console.warn(`Aucun utilisateur trouvé avec le numéro ${phoneNumber} lors de la vérification OTP`);
    }

    res.json({
      success: true,
      phoneNumber: phoneNumber,
      isPhoneVerified: true
    });

  } catch (error) {
    console.error('Erreur vérification OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Renvoyer un OTP avec limitations
router.post('/resend', validatePhoneNumberCustom, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phoneNumber } = req.body; // Déjà normalisé

    // Vérifier s'il y a un OTP non utilisé dans le cache
    const existingOTP = otpCache.get(phoneNumber);
    const now = Date.now();
    
    // Si OTP existe, n'est pas expiré et n'est pas utilisé, on continue
    // Sinon, on génère un nouveau code
    if (!existingOTP || existingOTP.isUsed || existingOTP.expiresAt < now) {
      // Générer un nouveau code directement
      return sendNewOTP();
    }

    // Vérifier l'intervalle de 1 minute depuis le dernier renvoi
    const oneMinuteAgo = now - (60 * 1000);
    
    if (existingOTP.lastResendAt && existingOTP.lastResendAt > oneMinuteAgo) {
      const remainingTime = Math.ceil((existingOTP.lastResendAt + 60 * 1000 - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Veuillez attendre ${remainingTime} secondes avant de pouvoir renvoyer un nouveau code.`
      });
    }

    async function sendNewOTP() {
      const newOTPCode = generateOTP();
      const expiresAt = Date.now() + (5 * 60 * 1000);

      // Envoyer le nouveau SMS
      const smsResult = await sendOTP(phoneNumber, newOTPCode);

      if (!smsResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'envoi du SMS',
          error: smsResult.error
        });
      }

      // Stocker le nouvel OTP
      otpCache.set(phoneNumber, {
        code: newOTPCode,
        expiresAt: expiresAt,
        attempts: 0,
        isUsed: false,
        resendCount: 0,
        lastResendAt: Date.now(),
        originalSentAt: Date.now()
      });

      return res.json({
        success: true,
        message: 'Nouveau code OTP envoyé avec succès',
        phoneNumber: phoneNumber,
        expiresIn: 300 // 5 minutes en secondes
      });
    }

    // Si on a un OTP existant valide, on continue avec la logique de renvoi
    const newOTPCode = generateOTP();
    const expiresAt = now + (5 * 60 * 1000);

    // Envoyer le nouveau SMS
    const smsResult = await sendOTP(phoneNumber, newOTPCode);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
        error: smsResult.error
      });
    }

    // Mettre à jour l'OTP dans le cache
    existingOTP.code = newOTPCode;
    existingOTP.expiresAt = expiresAt;
    existingOTP.attempts = 0;
    existingOTP.resendCount += 1;
    existingOTP.lastResendAt = now;

    const remainingResends = 2 - existingOTP.resendCount;

    res.json({
      success: true,
      message: 'Nouveau code OTP envoyé avec succès',
      phoneNumber: phoneNumber,
      expiresIn: 300,
      resendCount: existingOTP.resendCount,
      remainingResends: remainingResends
    });

  } catch (error) {
    console.error('Erreur renvoi OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Obtenir le statut d'un OTP (pour l'interface)
router.get('/status/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const existingOTP = otpCache.get(normalizedPhone);

    if (!existingOTP || existingOTP.isUsed || existingOTP.expiresAt < Date.now()) {
      return res.json({
        success: true,
        hasActiveOTP: false,
        message: 'Aucun OTP actif'
      });
    }

    const now = Date.now();
    const canResend = !existingOTP.lastResendAt || 
                     (existingOTP.lastResendAt + 60 * 1000) <= now;
    
    const remainingResends = 2 - existingOTP.resendCount;

    res.json({
      success: true,
      hasActiveOTP: true,
      resendCount: existingOTP.resendCount,
      remainingResends: remainingResends,
      canResend: canResend && remainingResends > 0,
      expiresAt: new Date(existingOTP.expiresAt)
    });

  } catch (error) {
    console.error('Erreur statut OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

export default router;
