import mongoose from 'mongoose';

export default function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && (String(new mongoose.Types.ObjectId(id)) === id);
}
