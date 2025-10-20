import mongoose from 'mongoose';

const MessageThreadSchema = new mongoose.Schema({
  annonceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Annonce', required: false },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  proprietaireId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  lastMessage: { type: String },
  lastSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  type: { type: String, enum: ['normal', 'support'], default: 'normal' }
}, { timestamps: true });

const MessageThread = mongoose.model('MessageThread', MessageThreadSchema);
export default MessageThread;
