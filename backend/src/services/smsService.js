// Service SMS avec API Yellika directe
import fetch from 'node-fetch';

// Configuration Yellika SMS
const YELLIKA_API_URL = process.env.YELLIKA_API_URL || 'https://panel.yellikasms.com/api/v3';
const YELLIKA_TOKEN = process.env.YELLIKA_TOKEN;
const YELLIKA_SENDER_ID = process.env.YELLIKA_SENDER_ID;

// Log de la configuration au démarrage
console.log('=== Configuration Yellika ===');
console.log('URL:', YELLIKA_API_URL);
console.log('Token:', YELLIKA_TOKEN ? '*** (présente)' : 'NON DÉFINIE');
console.log('Sender ID:', YELLIKA_SENDER_ID);
console.log('============================');

// Générer un code OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Normaliser le numéro de téléphone au format international (225xxxxxxxxx)
export function normalizePhoneNumber(phoneNumber) {
  // Supprimer tous les espaces, tirets et caractères spéciaux
  let cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Si le numéro commence par 225, le garder tel quel
  if (cleaned.startsWith('225')) {
    return cleaned;
  }
  
  // Si le numéro commence par 0, remplacer par 225
  if (cleaned.startsWith('0')) {
    return '225' + cleaned.substring(1);
  }
  
  // Si le numéro ne commence ni par 225 ni par 0, ajouter 225
  if (!cleaned.startsWith('225')) {
    return '225' + cleaned;
  }
  
  return cleaned;
}

// Valider le format du numéro de téléphone ivoirien
export function validatePhoneNumber(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Vérifier que le numéro commence par 225 et a 13 chiffres au total
  const phoneRegex = /^225[0-9]{10}$/;
  
  return {
    isValid: phoneRegex.test(normalized),
    normalized: normalized,
    error: phoneRegex.test(normalized) ? null : 'Le numéro doit être au format 225xxxxxxxxx (13 chiffres)'
  };
}

// Envoyer un SMS OTP via API Yellika
export async function sendOTP(phoneNumber, otpCode) {
  try {
    // Normaliser le numéro
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    const message = `Votre code de verification Mon Hebergement est: ${otpCode}. Ce code expire dans 5 minutes.`;
    
    console.log(`Envoi SMS Yellika vers ${normalizedPhone}: ${otpCode}`);
    
    // Appel API Yellika avec les bons paramètres
    const response = await fetch(`${YELLIKA_API_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${YELLIKA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: normalizedPhone,
        sender_id: YELLIKA_SENDER_ID,
        type: 'plain',
        message: message
      })
    });

    const result = await response.json();
    console.log('Réponse Yellika:', result);

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Erreur API Yellika');
    }

    return {
      success: true,
      messageId: result.message_id || result.id || result.messageId,
      message: 'OTP envoyé avec succès',
      phoneNumber: normalizedPhone,
      response: result
    };
  } catch (error) {
    console.error('Erreur envoi SMS Yellika:', {
      message: error.message,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          'Authorization': '*** (masqué)'
        },
        data: error.config?.data
      }
    });
    return { 
      success: false, 
      error: 'Erreur lors de l\'envoi du SMS',
      details: error.response?.data || error.message
    };
  }
}

// Vérifier le statut d'un SMS
export async function checkSMSStatus(messageId) {
  try {
    const response = await fetch(`${YELLIKA_API_URL}/sms/status/${messageId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${YELLIKA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur API Yellika');
    }

    return {
      success: true,
      status: result.status
    };
  } catch (error) {
    console.error('Erreur vérification statut SMS:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la vérification du statut'
    };
  }
} 