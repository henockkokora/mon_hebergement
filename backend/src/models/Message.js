import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageThread', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  body: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;
