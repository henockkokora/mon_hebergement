import mongoose from 'mongoose';

const { Schema } = mongoose;

const AvisSchema = new Schema({
  annonce: { type: Schema.Types.ObjectId, ref: 'Annonce', required: true },
  auteur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: Number, min: 1, max: 5, required: true },
  commentaire: { type: String, trim: true, maxlength: 1000 },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Avis', AvisSchema);
