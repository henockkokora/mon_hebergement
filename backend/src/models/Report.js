import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    annonceId: { type: Schema.Types.ObjectId, ref: 'Annonce' }, // optionnel si signalement user
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // optionnel si signalement annonce
    reporterId: { type: Schema.Types.ObjectId, ref: 'User' }, // optionnel si anonyme
    reason: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Report', ReportSchema);