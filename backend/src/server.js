import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import { existsSync } from 'fs';
import 'dotenv/config';

// Pour modules ES : reconstitue __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

if (existsSync(envPath)) {
  console.log(`✅ Fichier .env trouvé à: ${envPath}`);
} else {
  console.error(`❌ ERREUR: Fichier .env introuvable. Attendu à: ${envPath}`);
  console.error("Veuillez vous assurer que le fichier .env est bien à la racine du dossier 'backend'.");
}

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import annoncesRouter from './routes/annonces.js';
import { errorHandler, notFoundHandler } from './utils/errorHandler.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import otpRouter from './routes/otp.js';
import favorisRouter from './routes/favoris.js';
import avisRouter from './routes/avis.js';
import proprietairesRouter from './routes/proprietaires.js';
import { authRequired } from './middleware/auth.js';
import messagesRouter from './routes/messages.js';
import threadsRouter from './routes/threads.js';
import reportsRouter from './routes/reports.js';
import tarifsRouter from './routes/tarifs.js';

const app = express();

// Middlewares
// Configuration de sécurité pour la production
const isProduction = process.env.NODE_ENV === 'production';

app.use(
  helmet({
    // Configuration de sécurité renforcée en production
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: [
          "'self'",
          ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [])
        ],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        formAction: ["'self'"],
      },
    } : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    hsts: isProduction ? { maxAge: 63072000, includeSubDomains: true, preload: true } : false,
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  })
);
app.use(express.json({ limit: '1mb' }));
// Configuration CORS pour la production
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [];
    // En développement, on accepte tout pour faciliter les tests
    if (!isProduction) {
      return callback(null, true);
    }
    // En production, on vérifie l'origine
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Disposition',
    'Content-Length'
  ],
  maxAge: 86400, // 24 heures
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Gestion des requêtes OPTIONS (pré-vol CORS)
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Middleware pour ajouter les en-têtes CORS manuellement
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isProduction && origin) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [];
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Répondre immédiatement aux requêtes OPTIONS (pré-vol CORS)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/annonces', annoncesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/otp', otpRouter);
app.use('/api/favorites', favorisRouter);
app.use('/api/avis', avisRouter);
app.use('/api/proprietaires', authRequired, proprietairesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/threads', threadsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/tarifs', tarifsRouter);

// Static serving for uploads
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use(
  '/uploads',
  express.static(uploadsPath, {
    setHeaders: (res) => {
      // Autoriser l'affichage cross-origin (évite NotSameOrigin)
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      // CORS permissif pour assets
      const origin = process.env.CORS_ORIGIN || '*';
      res.setHeader('Access-Control-Allow-Origin', Array.isArray(origin) ? origin[0] : origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    },
  })
);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { Message, MessageThread } from './models/index.js';
import { initializeAdmin } from './config/initAdmin.js';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI ||'mongodb://localhost:27017/mon_hebergement';

// Start server only after DB is connected
connectDB(MONGODB_URI)
  .then(async () => {
    // Initialiser le compte administrateur
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      await initializeAdmin();
    } else {
      console.warn('⚠️ Variables ADMIN_USERNAME et/ou ADMIN_PASSWORD manquantes dans .env. Compte administrateur non créé.');
    }
    // Création du serveur HTTP + Socket.io
    const server = http.createServer(app);
    // Configuration de Socket.IO pour la production
    const io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [];
          if (!origin || allowedOrigins.includes(origin) || !isProduction) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      },
      // Optimisations pour la production
      ...(isProduction && {
        pingTimeout: 60000,
        pingInterval: 25000,
        maxHttpBufferSize: 1e8, // 100MB
        connectTimeout: 45000,
        transports: ['websocket'], // Désactive le polling long en production
        allowEIO3: true,
        cookie: false,
        serveClient: false,
        allowRequest: (req, callback) => {
          // Vérification supplémentaire de l'origine si nécessaire
          callback(null, true);
        }
      })
    });

    // Gestion WebSocket pour la messagerie temps réel
    io.on('connection', (socket) => {
      // Rejoindre une conversation
      socket.on('join', async (threadId) => {
        try {
          // Vérifier si threadId est un ObjectId valide
          if (!mongoose.Types.ObjectId.isValid(threadId)) {
            return socket.emit('error', { message: 'ID de conversation invalide', threadId });
          }

          // Convertir explicitement en ObjectId
          const threadObjectId = new mongoose.Types.ObjectId(threadId);

          // Vérifie l'existence du thread
          const thread = await MessageThread.findById(threadObjectId);
          if (!thread) {
            return socket.emit('error', { message: 'Conversation introuvable', threadId });
          }

          socket.join(threadId);

          // Utiliser l'ObjectId pour la requête
          const messages = await Message.find({ threadId: threadObjectId }).sort('createdAt');
          socket.emit('history', messages);

        } catch (error) {
          console.error('Erreur lors de la récupération des messages:', error);
          socket.emit('error', { message: 'Erreur serveur lors du chargement des messages', details: error.message });
        }
      });

      // Envoyer un message
      socket.on('message', async ({ threadId, senderId, body }) => {
        // Conserver une version string pour le nom de room
        const threadIdStr = (threadId && threadId.toString) ? threadId.toString() : String(threadId);
        // Utiliser un ObjectId pour les requêtes Mongo
        const threadObjectId = mongoose.Types.ObjectId.isValid(threadIdStr)
          ? new mongoose.Types.ObjectId(threadIdStr)
          : threadIdStr;
        try {
          // Vérifier que le thread existe et que l'utilisateur y a accès
          const thread = await MessageThread.findById(threadObjectId);
          if (!thread) {
            return socket.emit('error', { message: 'Conversation introuvable' });
          }
          
          // Vérifier que l'utilisateur fait partie de la conversation
          const isParticipant = [thread.clientId.toString(), thread.proprietaireId.toString()].includes(senderId);
          if (!isParticipant) {
            return socket.emit('error', { message: 'Accès non autorisé à cette conversation' });
          }

          // Créer et sauvegarder le message
          const message = new Message({ threadId: threadObjectId, senderId, body });
          await message.save();

          // Mettre à jour le thread avec le dernier message
          thread.lastMessage = body;
          thread.lastSender = senderId;
          thread.updatedAt = new Date();
          await thread.save();

          // Diffuser le message à tous les participants de la conversation (room string)
          io.to(threadIdStr).emit('message', {
            _id: message._id,
            threadId: threadIdStr,
            senderId,
            body,
            createdAt: message.createdAt
          });
          
          // Log avant d'envoyer l'ACK
          console.log('[SOCKET] EMIT ACK', {
            messageId: message._id,
            createdAt: message.createdAt,
            body: message.body
          });
          // Envoyer un ACK explicite à l'émetteur
          socket.emit('message_ack', {
            success: true,
            messageId: message._id,
            createdAt: message.createdAt,
            body: message.body
          });
          
        } catch (error) {
          console.error('Erreur lors de l\'envoi du message:', error);
          socket.emit('error', { 
            message: 'Erreur lors de l\'envoi du message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      });

      // Gestion des erreurs
      socket.on('error', (error) => {
        console.error('Erreur WebSocket:', error);
      });
    }); // Fin de io.on('connection')

    // Exposer io pour les routes (ex: suppression thread)
    app.set('io', io);

    // Configuration du serveur
    const protocol = isProduction ? 'https' : 'http';
    const wsProtocol = isProduction ? 'wss' : 'ws';
    const host = process.env.HOST || '0.0.0.0';
    
    // Démarrer le serveur
    server.listen(PORT, host, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 URL: ${protocol}://${host === '0.0.0.0' ? 'localhost' : host}${PORT === 80 ? '' : ':' + PORT}`);
      console.log(`📡 WebSocket prêt sur ${wsProtocol}://${host === '0.0.0.0' ? 'localhost' : host}${PORT === 80 ? '' : ':' + PORT}`);
      
      if (isProduction) {
        console.log('🚀 Mode: Production');
        console.log(`🌐 CORS autorisé pour: ${process.env.CORS_ORIGIN || 'Toutes les origines'}`);
      } else {
        console.log('🔧 Mode: Développement');
      }
    });
  })
  .catch((error) => {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  });
