import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const initializeAdmin = async () => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_USERNAME,
      role: 'admin' 
    });
    
    if (adminExists) {
      console.log('✅ Compte administrateur déjà existant');
      return;
    }

    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      // Créer un nouvel admin avec uniquement l'email et le mot de passe
      const admin = new User({
        email: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        nom: 'Admin',
        telephone: '2250000000000',
        role: 'admin',
        isPhoneVerified: true
      });

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);

      // Sauvegarder l'admin
      await admin.save();
      
      console.log('✅ Compte administrateur créé avec succès');
    } else {
      console.warn('⚠️ Variables ADMIN_USERNAME et/ou ADMIN_PASSWORD manquantes dans .env. Compte administrateur non créé.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte administrateur:', error);
  }
};
