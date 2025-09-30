import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    role: { type: String, enum: ['client', 'proprietaire', 'admin'], default: 'proprietaire' },
    nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telephone: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      match: [/^225[0-9]{10}$/, 'Le numéro de téléphone doit être au format 225xxxxxxxxx']
    },
    password: { type: String, required: true, minlength: 6 },
    isPhoneVerified: { type: Boolean, default: false },
    favoris: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Annonce' 
    }],
    // Champs d'administration
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    blockedReason: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', UserSchema);
