import express from 'express';
import Avis from '../models/Avis.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Ajouter un avis à une annonce
router.post('/:annonceId', authRequired, async (req, res) => {
  try {
    const { note, commentaire } = req.body;
    // Vérifier si un avis existe déjà pour ce couple (utilisateur, annonce)
    const existingReview = await Avis.findOne({
      annonce: req.params.annonceId,
      auteur: req.user.id
    });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "Vous avez déjà laissé un avis pour cette annonce." });
    }
    const avis = await Avis.create({
      annonce: req.params.annonceId,
      auteur: req.user.id,
      note,
      commentaire
    });
    res.json({ success: true, avis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer tous les avis d'une annonce
router.get('/:annonceId', async (req, res) => {
  try {
    const avis = await Avis.find({ annonce: req.params.annonceId })
      .populate('auteur', 'nom')
      .sort({ date: -1 });
    res.json({ success: true, avis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
