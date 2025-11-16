import express from 'express';
import Annonce from '../models/Annonce.js';
import Avis from '../models/Avis.js';
import { createAnnonceValidator, updateAnnonceValidator } from '../validators/annonceValidators.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// ROUTE PUBLIQUE POUR LES CLIENTS : GET /api/annonces
// Recherche d'annonces avec filtres et pagination
router.get('/', async (req, res, next) => {
  try {
    const { ville, type, prixMin, prixMax, page = 1, limit = 20, proprietaire } = req.query;
    const filter = {};
    if (ville) filter.ville = ville;
    if (type) filter.type = type;
    if (prixMin) filter.prixParNuit = { ...filter.prixParNuit, $gte: Number(prixMin) };
    if (prixMax) filter.prixParNuit = { ...filter.prixParNuit, $lte: Number(prixMax) };
    if (proprietaire) filter.proprietaireId = proprietaire;
    filter.isActive = true; // Ne récupérer que les annonces actives

    // Récupérer les annonces avec pagination
    const annonces = await Annonce.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('proprietaireId', 'nom email');

    // Récupérer les notes moyennes pour chaque annonce
    const annoncesAvecNotes = await Promise.all(annonces.map(async (annonce) => {
      const result = await Avis.aggregate([
        { $match: { annonce: annonce._id } },
        { $group: { _id: null, averageRating: { $avg: '$note' } } }
      ]);
      
      const averageRating = result[0]?.averageRating?.toFixed(1) || 0;
      
      return {
        ...annonce.toObject(),
        rating: parseFloat(averageRating)
      };
    }));

    const total = await Annonce.countDocuments(filter);

    res.json({
      success: true,
      data: annoncesAvecNotes,
      count: annoncesAvecNotes.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des annonces:', err);
    next(err);
  }
});

// GET /api/annonces - Récupérer toutes les annonces d'un propriétaire (authRequired)
router.get('/my-proprietaire', authRequired, async (req, res, next) => {
  try {
    const annonces = await Annonce.find({ proprietaireId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('proprietaireId', 'nom email');

    res.json({
      success: true,
      data: annonces,
      count: annonces.length
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/annonces/my - Récupérer les annonces de l'utilisateur connecté
router.get('/my', authRequired, async (req, res, next) => {
  try {
    // Si admin, ne pas utiliser le filtre proprietaireId (ou retourner vide pour éviter cast)
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: [], count: 0 });
    }
    const annonces = await Annonce.find({ proprietaireId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('proprietaireId', 'nom email');
    res.json({
      success: true,
      data: annonces,
      count: annonces.length
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/annonces/public/:id - Récupérer une annonce spécifique (public)
router.get('/public/:id', async (req, res, next) => {
  try {
    const annonce = await Annonce.findOne({ _id: req.params.id })
      .populate('proprietaireId', 'nom email');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Récupérer la note moyenne des avis
    const result = await Avis.aggregate([
      { $match: { annonce: annonce._id } },
      { $group: { _id: null, averageRating: { $avg: '$note' } } }
    ]);
    
    const averageRating = result[0]?.averageRating?.toFixed(1) || 0;
    
    res.json({
      success: true,
      data: {
        ...annonce.toObject(),
        rating: parseFloat(averageRating)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/annonces/:id - Récupérer une annonce spécifique
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    // Si l'ID n'est pas un ObjectId valide, passer au prochain routeur (ex: /admin)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next();
    // Si admin, chercher par _id uniquement (pas de filtre proprietaireId)
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, proprietaireId: req.user.id };
    const annonce = await Annonce.findOne(query).populate('proprietaireId', 'nom email');

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({ success: true, data: annonce });
  } catch (err) {
    next(err);
  }
});

// POST /api/annonces - Créer une nouvelle annonce
router.post('/', authRequired, createAnnonceValidator, async (req, res, next) => {
  try {
    const {
      titre,
      description,
      adresse,
      ville,
      quartier,
      type,
      prixParNuit,
      capacite,
      photos,
      videos,
      disponibilites,
      amenities,
      isActive,
    } = req.body;

    const annonce = new Annonce({
      proprietaireId: req.user.id,
      titre,
      description,
      adresse,
      ville,
      quartier,
      type,
      prixParNuit,
      capacite,
      photos,
      videos,
      disponibilites,
      amenities,
      isActive,
      duree: req.body.duree || 30,
    });

    await annonce.save();
    
    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: annonce
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/annonces/:id - Mettre à jour une annonce
router.put('/:id', authRequired, updateAnnonceValidator, async (req, res, next) => {
  try {
    // Si la durée est modifiée, recalculer expiresAt côté modèle (pre-save)
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.proprietaireId = req.user.id;
    }
    const annonce = await Annonce.findOneAndUpdate(
      filter,
      req.body,
      { new: true, runValidators: true }
    );

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      data: annonce
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/annonces/:id/view - Incrémenter le compteur de vues d'une annonce
router.post('/:id/view', async (req, res, next) => {
  try {
    const annonce = await Annonce.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({
      success: true,
      views: annonce.views
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/annonces/:id - Supprimer une annonce
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    // Si l'utilisateur est admin, on peut supprimer n'importe quelle annonce
    // Sinon, on vérifie que l'annonce appartient au propriétaire
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.proprietaireId = req.user.id;
    }

    const annonce = await Annonce.findOneAndDelete(query);

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/annonces/:id/renew - Renouveler une annonce
router.post('/:id/renew', authRequired, async (req, res, next) => {
  try {
    const { duree } = req.body;
    
    if (!duree || ![15, 30, 60].includes(duree)) {
      return res.status(400).json({
        success: false,
        message: 'Durée invalide. Choisissez 15, 30 ou 60 jours'
      });
    }

    const annonce = await Annonce.findOne({
      _id: req.params.id,
      proprietaireId: req.user.id
    });

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    // Calculer la nouvelle date d'expiration
    const newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + duree);

    annonce.expiresAt = newExpirationDate;
    annonce.isActive = true;
    await annonce.save();

    res.json({
      success: true,
      message: `Annonce renouvelée pour ${duree} jours`,
      data: annonce
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/annonces/stats - Statistiques des annonces
router.get('/stats/overview', authRequired, async (req, res, next) => {
  try {
    const stats = await Annonce.aggregate([
      { $match: { proprietaireId: req.user.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          actives: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          expirees: {
            $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] }
          },
          enAttente: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, actives: 0, expirees: 0, enAttente: 0 };

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// ADMIN: GET /api/annonces/admin - liste annonces avec filtres
router.get('/admin', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { q = '', status, proprietaire, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (proprietaire) filter.proprietaireId = proprietaire;
    if (q) {
      filter.$or = [
        { titre: { $regex: q, $options: 'i' } },
        { ville: { $regex: q, $options: 'i' } },
        { quartier: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    const total = await Annonce.countDocuments(filter);
    const items = await Annonce.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('proprietaireId', 'nom');
    res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
});

// ADMIN: POST /api/annonces/:id/matterport - attacher infos 3D
router.post('/:id/matterport', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { matterportModelId, matterportShareUrl } = req.body || {};
    const update = {};
    if (matterportModelId) update.matterportModelId = matterportModelId;
    if (matterportShareUrl) update.matterportShareUrl = matterportShareUrl;
    // stocker également un statut simplifié
    update.matterportStatus = 'ready';
    const annonce = await Annonce.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    res.json({ success: true, data: annonce });
  } catch (err) { next(err); }
});

// ADMIN: GET /api/annonces/admin/active-stats?range=7d|30d|90d
router.get('/admin/active-stats', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { range = '7d' } = req.query;
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
    const since = new Date(Date.now() - days*24*60*60*1000);
    const total = await Annonce.countDocuments({ createdAt: { $gte: since }, isActive: true });
    res.json({ success: true, total });
  } catch (err) { next(err); }
});

// ADMIN: GET /api/annonces/admin/new-per-day?days=7|30|90
router.get('/admin/new-per-day', authRequired, adminOnly, async (req, res, next) => {
  try {
    const days = Number(req.query.days || 7);
    const since = new Date(Date.now() - days*24*60*60*1000);
    const result = await Annonce.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const items = result.map(r => ({ date: r._id, count: r.count }));
    res.json({ success: true, items });
  } catch (err) { next(err); }
});

export default router;
