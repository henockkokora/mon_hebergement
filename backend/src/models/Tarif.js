import mongoose from 'mongoose';

const { Schema } = mongoose;

const TarifSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    durationDays: { type: Number, required: true, min: 1, max: 3650 },
    priceFcfa: { type: Number, required: true, min: 0, max: 100000000 },
  },
  { timestamps: true }
);

TarifSchema.index({ durationDays: 1 });

export default mongoose.model('Tarif', TarifSchema); 