import express from 'express';
import MessageThread from '../models/MessageThread.js';
import { authRequired } from '../middleware/auth.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import isValidObjectId from '../utils/isValidObjectId.js';

const router = express.Router();

// Route pour récupérer tous les threads de support (admin uniquement)
router.get('/support', authRequired, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }

    // Récupérer tous les threads de type support
    const threads = await MessageThread.find({ type: 'support' })
      .sort({ updatedAt: -1 })
      .lean();

    // Pour chaque thread, récupérer le nombre de messages
    const threadsWithCount = await Promise.all(
      threads.map(async (thread) => {
        const messageCount = await Message.countDocuments({ threadId: thread._id });
        return {
          ...thread,
          messageCount
        };
      })
    );

    res.json({ success: true, data: threadsWithCount });
  } catch (error) {
    console.error('Erreur lors de la récupération des threads support:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour supprimer un thread de support (admin uniquement)
router.delete('/support/:threadId', authRequired, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }

    const { threadId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Identifiant de thread invalide' });
    }

    // Vérifier que le thread existe et est de type support
    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread introuvable' });
    }

    if (thread.type !== 'support') {
      return res.status(403).json({ success: false, message: 'Seuls les threads de support peuvent être supprimés via cette route' });
    }

    // Supprimer tous les messages associés
    await Message.deleteMany({ threadId: thread._id });

    // Supprimer le thread
    await thread.deleteOne();

    res.json({ success: true, message: 'Thread de support supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du thread support:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer tous les threads du client connecté
router.get('/', authRequired, async (req, res) => {
  try {
    // Si l'utilisateur est admin, retourner un tableau vide
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: [] });
    }
    
    // Pour les autres utilisateurs, chercher normalement
    const query = { clientId: req.user.id };
    
    const threads = await MessageThread.find(query)
      .populate('proprietaireId', 'nom email')
      .populate('annonceId', 'titre');
    res.json({ success: true, data: threads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// >>> Nouveau: Récupérer tous les threads du propriétaire connecté
router.get('/owner', authRequired, async (req, res) => {
  try {
    const threads = await MessageThread.find({ proprietaireId: req.user.id })
      .populate('clientId', 'nom email')
      .populate('annonceId', 'titre');
    res.json({ success: true, data: threads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unread counts par thread pour l'utilisateur courant
router.get('/unread-by-thread', authRequired, async (req, res) => {
  try {
    // Si l'utilisateur est admin, retourner un objet vide
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: {} });
    }
    
    // Pour les autres utilisateurs, chercher normalement
    const userThreads = await MessageThread.find({ 
      $or: [{ clientId: req.user.id }, { proprietaireId: req.user.id }] 
    }).select('_id');
    
    const threadIds = userThreads.map(t => t._id);
    if (threadIds.length === 0) return res.json({ success: true, data: {} });

    const agg = await Message.aggregate([
      { 
        $match: { 
          read: false, 
          senderId: { $ne: new mongoose.Types.ObjectId(req.user.id) }, 
          threadId: { $in: threadIds } 
        } 
      },
      { $group: { _id: '$threadId', count: { $sum: 1 } } }
    ]);
    const map = {};
    agg.forEach(({ _id, count }) => { map[_id.toString()] = count; });
    res.json({ success: true, data: map });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compteur total non lus
router.get('/unread-count', authRequired, async (req, res) => {
  try {
    // Si l'utilisateur est admin, retourner 0
    if (req.user.role === 'admin') {
      return res.json({ success: true, count: 0 });
    }
    
    // Pour les autres utilisateurs, compter normalement
    const userThreads = await MessageThread.find({ 
      $or: [{ clientId: req.user.id }, { proprietaireId: req.user.id }] 
    }).select('_id');
    
    const threadIds = userThreads.map(t => t._id);
    if (threadIds.length === 0) return res.json({ success: true, count: 0 });

    const count = await Message.countDocuments({ 
      read: false, 
      senderId: { $ne: new mongoose.Types.ObjectId(req.user.id) }, 
      threadId: { $in: threadIds } 
    });
    
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marquer un thread comme lu pour l'utilisateur courant
router.post('/:threadId/read', authRequired, async (req, res) => {
  const { threadId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return res.status(400).json({ success: false, message: 'Identifiant de thread invalide' });
  }
  try {
    const userId = req.user.id;
    const threadId = req.params.threadId;
    const thread = await MessageThread.findById(threadId);
    if (!thread) return res.status(404).json({ success: false, message: 'Conversation introuvable' });
    const isParticipant = [thread.clientId.toString(), thread.proprietaireId.toString()].includes(userId);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    const result = await Message.updateMany({ threadId: thread._id, read: false, senderId: { $ne: userId } }, { $set: { read: true } });
    res.json({ success: true, updated: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un thread avec infos client/proprietaire
router.get('/:threadId', authRequired, async (req, res) => {
  const { threadId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return res.status(400).json({ success: false, message: 'Identifiant de thread invalide' });
  }
  try {
    const thread = await MessageThread.findById(req.params.threadId)
      .populate('clientId', 'nom email')
      .populate('proprietaireId', 'nom email');
    if (!thread) return res.status(404).json({ success: false, message: 'Conversation introuvable' });
    res.json({
      success: true,
      thread: {
        _id: thread._id,
        annonceId: thread.annonceId,
        client: thread.clientId,
        proprietaire: thread.proprietaireId,
        lastMessage: thread.lastMessage,
        lastSender: thread.lastSender,
        updatedAt: thread.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un thread et tous ses messages (participant uniquement)
router.delete('/:threadId', authRequired, async (req, res) => {
  const { threadId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return res.status(400).json({ success: false, message: 'Identifiant de thread invalide' });
  }
  try {
    const thread = await MessageThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ success: false, message: 'Conversation introuvable' });

    const userId = req.user.id?.toString();
    const isParticipant = [thread.clientId?.toString(), thread.proprietaireId?.toString()].includes(userId);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    // Supprimer tous les messages puis le thread
    await Message.deleteMany({ threadId: thread._id });
    await thread.deleteOne();

    // Émettre un événement temps réel aux membres du thread
    const io = req.app.get('io');
    if (io) {
      io.to(thread._id.toString()).emit('thread_deleted', { threadId: thread._id.toString() });
    }

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trouver ou créer un thread de discussion
router.post('/find-or-create', authRequired, async (req, res) => {
  try {
    const { annonceId, clientId, proprietaireId } = req.body;
    if (!annonceId || !clientId || !proprietaireId) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants.' });
    }
    let thread = await MessageThread.findOne({ annonceId, clientId, proprietaireId });
    if (!thread) {
      thread = await MessageThread.create({ annonceId, clientId, proprietaireId });
    }
    return res.json({ success: true, threadId: thread._id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour récupérer tous les threads de support (admin uniquement)
router.get('/support', authRequired, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }

    // Récupérer tous les threads de type support
    const threads = await MessageThread.find({ type: 'support' })
      .sort({ updatedAt: -1 })
      .lean();

    // Pour chaque thread, récupérer le nombre de messages
    const threadsWithCount = await Promise.all(
      threads.map(async (thread) => {
        const messageCount = await Message.countDocuments({ threadId: thread._id });
        return {
          ...thread,
          messageCount
        };
      })
    );

    res.json({ success: true, data: threadsWithCount });
  } catch (error) {
    console.error('Erreur lors de la récupération des threads support:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
