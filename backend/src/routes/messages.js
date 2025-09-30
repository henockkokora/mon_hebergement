import express from 'express';
import Message from '../models/Message.js';
import MessageThread from '../models/MessageThread.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les messages d'un thread
router.get('/thread/:threadId', authRequired, async (req, res) => {
  try {
    const messages = await Message.find({ threadId: req.params.threadId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Envoyer un message (et créer le thread si besoin)
router.post('/thread/:threadId', authRequired, async (req, res) => {
  try {
    const { body } = req.body;
    const thread = await MessageThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ success: false, message: 'Conversation introuvable' });
    const message = await Message.create({
      threadId: thread._id,
      senderId: req.user.id,
      body
    });
    // Mettre à jour le thread
    thread.lastMessage = body;
    thread.lastSender = req.user.id;
    thread.updatedAt = new Date();
    await thread.save();
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour les messages de support (formulaire de contact)
router.post('/support', async (req, res) => {
  try {
    const { nom, email, telephone, message } = req.body;
    
    // Validation basique
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Veuillez écrire un message plus détaillé (au moins 5 caractères).' });
    }

    // Créer ou récupérer un thread support pour cet utilisateur
    // On utilise l'email comme identifiant unique pour regrouper les messages du même utilisateur
    let thread = await MessageThread.findOne({ 
      type: 'support',
      'metadata.email': email 
    });

    if (!thread) {
      // Créer un nouveau thread support
      thread = await MessageThread.create({
        type: 'support',
        participants: [], // Pas de participants authentifiés pour le support public
        lastMessage: message.substring(0, 100),
        lastSender: null,
        metadata: {
          nom,
          email,
          telephone,
          source: 'contact_form'
        }
      });
    }

    // Créer le message
    const newMessage = await Message.create({
      threadId: thread._id,
      senderId: null, // Pas d'utilisateur authentifié
      body: message,
      metadata: {
        nom,
        email,
        telephone
      }
    });

    // Mettre à jour le thread
    thread.lastMessage = message.substring(0, 100);
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ 
      success: true, 
      message: 'Votre message a bien été transmis au support.',
      data: { messageId: newMessage._id, threadId: thread._id }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message support:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message.' });
  }
});

export default router;
