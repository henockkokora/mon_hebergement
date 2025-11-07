import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken, authRequired } from '../middleware/auth.js';
import { validatePhoneNumber, normalizePhoneNumber } from '../services/smsService.js';

const router = express.Router();

// GET /api/auth/me - Récupérer le profil de l'utilisateur connecté
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('nom email telephone role createdAt');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({
      id: user._id,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
});

// Validation personnalisée pour les numéros ivoiriens
const validatePhoneNumberCustom = [
  body('telephone')
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

// POST /api/auth/register
router.post(
  '/register',
  [
    body('nom').isString().isLength({ min: 2 }).withMessage('Nom trop court (minimum 2 lettres)'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (minimum 6 caractères)'),
    body('telephone').custom((value) => {
      const validation = validatePhoneNumber(value);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return true;
    }).customSanitizer((value) => {
      return normalizePhoneNumber(value);
    }),
    body('role').optional().isIn(['client', 'proprietaire', 'admin']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { nom, email, password, telephone, role } = req.body;
      
      // Vérifier si l'email existe déjà
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(409).json({ message: 'Email déjà utilisé' });

      // Vérifier si le téléphone existe déjà
      const phoneExists = await User.findOne({ telephone });
      if (phoneExists) return res.status(409).json({ message: 'Numéro de téléphone déjà utilisé' });

      const user = await User.create({ 
        nom, 
        email, 
        password, 
        telephone,
        role: role || 'proprietaire' 
      });
      
      const token = signToken(user);
      res.status(201).json({
        message: 'Compte créé',
        user: { 
          id: user._id, 
          nom: user.nom, 
          email: user.email, 
          telephone: user.telephone,
          role: user.role 
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isString().isLength({ min: 6 }).withMessage('Mot de passe requis (minimum 6 caractères)'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
      const ok = await user.comparePassword(password);
      if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });

      const token = signToken(user);
      res.json({
        message: 'Connecté',
        user: { 
          id: user._id, 
          nom: user.nom, 
          email: user.email, 
          telephone: user.telephone,
          role: user.role,
          createdAt: user.createdAt
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login-phone - Connexion avec téléphone et mot de passe
router.post(
  '/login-phone',
  [
    body('telephone').custom((value) => {
      const validation = validatePhoneNumber(value);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return true;
    }),
    body('password').isString().isLength({ min: 6 }).withMessage('Mot de passe requis (minimum 6 caractères)'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[dev] /api/auth/login-phone: validation failed');
        }
        return res.status(400).json({ errors: errors.array() });
      }

      const { telephone, password } = req.body;
      const normalizedPhone = normalizePhoneNumber(telephone);
      const user = await User.findOne({ telephone: normalizedPhone });
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[dev] /api/auth/login-phone: invalid credentials (user not found)');
        }
        return res.status(401).json({ message: 'Identifiants invalides' });
      }
      const ok = await user.comparePassword(password);
      
      if (!ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[dev] /api/auth/login-phone: invalid credentials (password)');
        }
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      const token = signToken(user);
      res.json({
        message: 'Connecté',
        user: { 
          id: user._id, 
          nom: user.nom, 
          email: user.email, 
          telephone: user.telephone,
          role: user.role,
          createdAt: user.createdAt
        },
        token,
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('[dev] /api/auth/login-phone: success');
      }
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login-admin - Connexion administrateur
router.post(
  '/login-admin',
  [
    body('username').isString().notEmpty().withMessage('Nom d\'utilisateur requis'),
    body('password').isString().isLength({ min: 1 }).withMessage('Mot de passe requis'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { username, password } = req.body;
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        return res.status(500).json({ message: 'Configuration administrateur manquante (ADMIN_USERNAME/ADMIN_PASSWORD)' });
      }

      const isValid = username === adminUsername && password === adminPassword;
      if (!isValid) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      const adminUser = {
        _id: 'admin',
        nom: process.env.ADMIN_NAME || 'Administrateur',
        email: process.env.ADMIN_EMAIL || 'admin@local',
        telephone: process.env.ADMIN_PHONE || '',
        role: 'admin',
        createdAt: new Date(),
      };

      const token = signToken(adminUser);

      return res.json({
        message: 'Connecté',
        user: {
          id: adminUser._id,
          nom: adminUser.nom,
          email: adminUser.email,
          telephone: adminUser.telephone,
          role: adminUser.role,
          createdAt: adminUser.createdAt,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/auth/password - Modifier le mot de passe de l'utilisateur connecté
router.patch('/password', authRequired, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mot de passe invalide (6 caractères min.)' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const ok = await user.comparePassword(oldPassword);
    if (!ok) return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Récupérer le profil de l'utilisateur connecté
// Vérifier si un numéro de téléphone existe déjà
router.get('/check-phone', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[dev] /api/auth/check-phone called');
    }
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Le numéro de téléphone est requis' 
      });
    }

    // Valider le format du numéro
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.error 
      });
    }

    // Vérifier si le numéro existe
    const normalizedPhone = normalizePhoneNumber(phone);
    const user = await User.findOne({ telephone: normalizedPhone });
    
    res.json({ 
      success: true,
      exists: !!user
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification du numéro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la vérification du numéro' 
    });
  }
});

// Récupérer les informations de l'utilisateur connecté
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('nom email telephone role');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({
      success: true,
      data: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mise à jour du profil utilisateur connecté
router.put('/me', authRequired, async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    const updates = {};
    if (nom) updates.nom = nom;
    if (email) updates.email = email;
    if (telephone) updates.telephone = telephone;

    // Vérifier unicité de l'email ou du téléphone si modifiés
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    if (telephone) {
      const phoneExists = await User.findOne({ telephone, _id: { $ne: req.user.id } });
      if (phoneExists) return res.status(409).json({ message: 'Numéro de téléphone déjà utilisé' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true, context: 'query' });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ADMIN: GET /api/auth/users/count - nombre total d'utilisateurs (hors admin par défaut)
router.get('/users/count', authRequired, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé (admin requis)' });
    // Compter uniquement les utilisateurs qui ne sont pas administrateurs
    const total = await User.countDocuments({ role: { $ne: 'admin' } });
    res.json({ success: true, total });
  } catch (err) { next(err); }
});

// ADMIN: GET /api/auth/users - liste filtrée
router.get('/users', authRequired, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé (admin requis)' });
    const { q = '', role } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (q) {
      filter.$or = [
        { nom: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { telephone: { $regex: q, $options: 'i' } },
      ];
    }
    const items = await User.find(filter).sort({ createdAt: -1 }).select('nom telephone role createdAt status blockedReason');
    res.json({ success: true, data: { items } });
  } catch (err) { next(err); }
});

// Étendre le modèle User via champs virtuels si absents
// ADMIN: POST /api/auth/users/:id/block
router.post('/users/:id/block', authRequired, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé (admin requis)' });
    const { reason = '' } = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'blocked', blockedReason: reason } },
      { new: true }
    ).select('nom telephone role createdAt status blockedReason');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// ADMIN: POST /api/auth/users/:id/unblock
router.post('/users/:id/unblock', authRequired, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé (admin requis)' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $unset: { blockedReason: '' }, $set: { status: 'active' } },
      { new: true }
    ).select('nom telephone role createdAt status blockedReason');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

export default router;
