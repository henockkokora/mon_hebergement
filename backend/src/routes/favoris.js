import express from 'express';
import { authRequired } from '../middleware/auth.js';
import User from '../models/User.js';
import Annonce from '../models/Annonce.js';
import isValidObjectId from '../utils/isValidObjectId.js';

const router = express.Router();

// GET /api/favorites - Récupérer les annonces favorites de l'utilisateur
router.get('/', authRequired, async (req, res, next) => {
  try {
    // Si l'utilisateur est admin, retourner un tableau vide
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: [] });
    }
    
    // Pour les autres utilisateurs, chercher normalement
    const user = await User.findById(req.user.id).populate('favoris');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user.favoris || []
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des favoris:', err);
    next(err);
  }
});

// POST /api/favorites/:annonceId - Ajouter une annonce aux favoris
router.post('/:annonceId', authRequired, async (req, res, next) => {
  try {
    // Si l'utilisateur est admin, interdire l'action avec un message clair
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Les administrateurs ne peuvent pas ajouter d\'annonces aux favoris. Veuillez vous connecter avec un compte client.'
      });
    }
    
    const annonce = await Annonce.findById(req.params.annonceId);
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // S'assurer que favoris est un tableau
    if (!user.favoris) {
      user.favoris = [];
    }
    
    // Vérifier si l'annonce est déjà dans les favoris
    const annonceId = req.params.annonceId;
    const isAlreadyFavorite = user.favoris.some(fav => 
      fav && fav.toString() === annonceId
    );
    
    if (!isAlreadyFavorite) {
      user.favoris.push(annonceId);
      await user.save();
      
      // Recharger l'utilisateur pour s'assurer d'avoir les données à jour
      const updatedUser = await User.findById(req.user.id).populate('favoris');
      
      return res.json({
        success: true,
        message: 'Annonce ajoutée aux favoris',
        data: updatedUser.favoris || []
      });
    }

    // Si l'annonce est déjà dans les favoris
    const userWithFavs = await User.findById(req.user.id).populate('favoris');
    res.json({
      success: true,
      message: 'Annonce déjà dans les favoris',
      data: userWithFavs.favoris || []
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favorites/:annonceId - Retirer une annonce des favoris
router.delete('/:annonceId', authRequired, async (req, res, next) => {
  try {
    // Si l'utilisateur est admin, interdire l'action avec un message clair
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Les administrateurs ne peuvent pas retirer d\'annonces des favoris. Veuillez vous connecter avec un compte client.'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // S'assurer que favoris est un tableau
    if (!user.favoris) {
      user.favoris = [];
    }
    
    // Vérifier si l'annonce est dans les favoris
    const annonceId = req.params.annonceId;
    const initialLength = user.favoris.length;
    user.favoris = user.favoris.filter(
      favId => favId && favId.toString() !== annonceId
    );

    // Si la longueur a changé, sauvegarder les modifications
    if (user.favoris.length !== initialLength) {
      await user.save();
      // Recharger l'utilisateur pour s'assurer d'avoir les données à jour
      const updatedUser = await User.findById(req.user.id).populate('favoris');
      
      return res.json({
        success: true,
        message: 'Annonce retirée des favoris',
        data: updatedUser.favoris || []
      });
    }

    // Si l'annonce n'était pas dans les favoris
    res.status(400).json({
      success: false,
      message: 'Annonce non trouvée dans les favoris',
      data: user.favoris || []
    });
  } catch (err) {
    next(err);
  }
});

export default router;
