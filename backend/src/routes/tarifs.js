import express from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired, adminOnly } from '../middleware/auth.js';
import Tarif from '../models/Tarif.js';

const router = express.Router();

// GET /api/tarifs - list all (public)
router.get('/', async (req, res, next) => {
  try {
    const items = await Tarif.find().sort({ durationDays: 1 });
    res.json({ success: true, data: { items } });
  } catch (err) { next(err); }
});

// POST /api/tarifs - create
router.post(
  '/',
  authRequired,
  adminOnly,
  [
    body('name').isString().isLength({ min: 2 }).withMessage('Nom invalide'),
    body('durationDays').isInt({ min: 1 }).withMessage('Durée invalide'),
    body('priceFcfa').isInt({ min: 0 }).withMessage('Prix invalide'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, durationDays, priceFcfa } = req.body;
      const pack = await Tarif.create({ name, durationDays, priceFcfa });
      res.status(201).json({ success: true, data: pack });
    } catch (err) { next(err); }
  }
);

// PUT /api/tarifs/:id - update
router.put(
  '/:id',
  authRequired,
  adminOnly,
  [
    body('name').optional().isString().isLength({ min: 2 }).withMessage('Nom invalide'),
    body('durationDays').optional().isInt({ min: 1 }).withMessage('Durée invalide'),
    body('priceFcfa').optional().isInt({ min: 0 }).withMessage('Prix invalide'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const pack = await Tarif.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!pack) return res.status(404).json({ message: 'Pack introuvable' });
      res.json({ success: true, data: pack });
    } catch (err) { next(err); }
  }
);

// DELETE /api/tarifs/:id - delete
router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const pack = await Tarif.findByIdAndDelete(req.params.id);
    if (!pack) return res.status(404).json({ message: 'Pack introuvable' });
    res.json({ success: true, message: 'Pack supprimé' });
  } catch (err) { next(err); }
});

export default router; 