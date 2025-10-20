import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnnonceSchema = new Schema(
  {
    proprietaireId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    titre: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    adresse: { type: String, required: true, trim: true, maxlength: 255 },
    ville: { type: String, required: true, trim: true, maxlength: 120 },
    quartier: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, required: true, trim: true, maxlength: 50 },
    prixParNuit: { type: Number, required: true, min: 0 },
    capacite: { type: Number, default: 1, min: 1 },
    photos: {
      type: [String],
      validate: {
        validator: (arr) => arr.every((url) => typeof url === 'string' && url.length <= 1000),
        message: 'Chaque photo doit être une URL valide (string)'
      },
      default: []
    },
    videos: {
      type: [String],
      validate: {
        validator: (arr) => arr.every((url) => typeof url === 'string' && url.length <= 1000),
        message: 'Chaque vidéo doit être une URL valide (string)'
      },
      default: []
    },
    disponibilites: {
      start: { type: Date },
      end: { type: Date },
    },
    amenities: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    duree: { type: Number, default: 30, min: 1 }, // durée en jours
    expiresAt: { type: Date },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'pending', 'draft'], 
      default: 'active' 
    },
    views: { type: Number, default: 0 },
    contacts: { type: Number, default: 0 },
    // Champs ajoutés pour Matterport 3D
    matterportModelId: { type: String, maxlength: 100 },
    matterportShareUrl: { type: String, maxlength: 1000 },
    matterportStatus: { type: String, enum: ['pending', 'ready'], default: 'pending' },
  },
  { timestamps: true }
);

// Index pour les recherches
AnnonceSchema.index({ proprietaireId: 1, isActive: 1 });
AnnonceSchema.index({ ville: 1, quartier: 1 });
AnnonceSchema.index({ type: 1 });
AnnonceSchema.index({ prixParNuit: 1 });
AnnonceSchema.index({ expiresAt: 1 });

// Méthode virtuelle pour calculer le statut
AnnonceSchema.virtual('currentStatus').get(function() {
  if (!this.isActive) return 'pending';
  if (this.expiresAt && this.expiresAt < new Date()) return 'expired';
  return 'active';
});

// Middleware pour calculer expiresAt et mettre à jour le statut avant sauvegarde
AnnonceSchema.pre('save', function(next) {
  // Calculer expiresAt dynamiquement à partir de duree
  if (this.isModified('duree') || this.isNew) {
    const jours = this.duree || 30;
    this.expiresAt = new Date(Date.now() + jours * 24 * 60 * 60 * 1000);
  }
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'expired';
    this.isActive = false;
  }
  next();
});

export default mongoose.model('Annonce', AnnonceSchema);
