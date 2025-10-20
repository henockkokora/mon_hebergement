import express from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired, adminOnly } from '../middleware/auth.js';
import Report from '../models/Report.js';
import Annonce from '../models/Annonce.js';

const router = express.Router();

// POST /api/reports - création d'un signalement (public ou utilisateur connecté)
router.post(
  '/',
  authRequired,
  [
    body('reason').isString().isLength({ min: 5 }).withMessage('Motif trop court'),
    body('annonceId').optional().isString().notEmpty(),
    body('userId').optional().isString().notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { annonceId, userId, reason } = req.body;
      if (!annonceId && !userId) {
        return res.status(400).json({ message: 'annonceId ou userId requis' });
      }
      const reporterId = req.user?.id || null;
      // Vérifier si ce reporter a déjà signalé cette annonce
      if (annonceId && reporterId) {
        const existing = await Report.findOne({ annonceId, reporterId });
        if (existing) {
          return res.status(409).json({ message: 'Vous avez déjà signalé cette annonce.' });
        }
      }
      // Vérifier si ce reporter a déjà signalé ce profil utilisateur
      if (userId && reporterId) {
        const existing = await Report.findOne({ userId, reporterId });
        if (existing) {
          return res.status(409).json({ message: 'Vous avez déjà signalé ce profil.' });
        }
      }
      const report = await Report.create({
        annonceId: annonceId || undefined,
        userId: userId || undefined,
        reason,
        reporterId: reporterId || undefined,
      });
      res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
  }
);

// GET /api/reports/already-reported?annonceId=xxx
router.get('/already-reported', authRequired, async (req, res, next) => {
  try {
    const { annonceId } = req.query;
    if (!annonceId) return res.status(400).json({ message: 'annonceId requis' });
    const existing = await Report.findOne({ annonceId, reporterId: req.user.id });
    res.json({ alreadyReported: !!existing });
  } catch (err) { next(err); }
});

// GET /api/reports - Liste des signalements (admin)
router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const total = await Report.countDocuments(filter);
    const items = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('annonceId', 'titre')
      .populate('userId', 'nom')
      .populate('reporterId', 'nom');
    res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id/in-progress - Marquer en cours (admin)
router.patch('/:id/in-progress', authRequired, adminOnly, async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'in_progress' }, { new: true });
    if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id/resolve - Marquer résolu (admin)
router.patch('/:id/resolve', authRequired, adminOnly, async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id/resolve-delete - Résoudre et supprimer l'annonce (admin)
router.patch('/:id/resolve-delete', authRequired, adminOnly, async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
    await Annonce.findByIdAndDelete(report.annonceId);
    report.status = 'resolved';
    await report.save();
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
});

export default router;
