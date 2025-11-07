import express from 'express';
const router = express.Router();

import { Annonce } from '../models/index.js';

// Route GET /api/proprietaires/stats
router.get('/stats', async (req, res) => {
  try {
    // Filtrer par propriétaire connecté
    const proprietaireId = req.user.id;
    
    // Log pour débogage
    console.log('=== DEBUG /api/proprietaires/stats ===');
    console.log('Propriétaire ID:', proprietaireId);
    
    // Vérifier le type de proprietaireId
    console.log('Type de proprietaireId:', typeof proprietaireId);
    
    // Compter les annonces actives
    const queryActives = { status: 'active', proprietaireId };
    console.log('Requête annonces actives:', JSON.stringify(queryActives));
    const annoncesActives = await Annonce.countDocuments(queryActives);
    
    // Compter les annonces expirées
    const queryExpirees = { status: 'expired', proprietaireId };
    console.log('Requête annonces expirées:', JSON.stringify(queryExpirees));
    const annoncesExpirees = await Annonce.countDocuments(queryExpirees);

    // Date il y a 7 jours
    const date7j = new Date();
    date7j.setDate(date7j.getDate() - 7);
    
    // Annonces modifiées ou créées dans les 7 derniers jours
    const query7j = {
      proprietaireId,
      updatedAt: { $gte: date7j }
    };
    console.log('Requête annonces 7j:', JSON.stringify(query7j));
    const annonces7j = await Annonce.find(query7j);
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
