import express from 'express';
const router = express.Router();

import { Annonce } from '../models/index.js';

// Route GET /api/proprietaires/stats
router.get('/stats', async (req, res) => {
  try {
    // Nombre d'annonces actives
    const annoncesActives = await Annonce.countDocuments({ status: 'active' });
    // Nombre d'annonces expirées
    const annoncesExpirees = await Annonce.countDocuments({ status: 'expired' });

    // Date il y a 7 jours
    const date7j = new Date();
    date7j.setDate(date7j.getDate() - 7);

    // Annonces modifiées ou créées dans les 7 derniers jours
    const annonces7j = await Annonce.find({
      updatedAt: { $gte: date7j }
    });
    const vues7j = annonces7j.reduce((sum, a) => sum + (a.views || 0), 0);
    const contacts7j = annonces7j.reduce((sum, a) => sum + (a.contacts || 0), 0);

    res.json({
      annoncesActives,
      tauxEvolutionActives: 0, // TODO: calculer évolution réelle
      annoncesExpirees,
      tauxEvolutionExpirees: 0, // TODO
      vues7j,
      tauxEvolutionVues: 0, // TODO
      contacts7j,
      tauxEvolutionContacts: 0 // TODO
    });
  } catch (err) {
    console.error('Erreur stats propriétaires:', err);
    res.status(500).json({ message: "Erreur lors du calcul des stats", error: err.message });
  }
});

export default router;
