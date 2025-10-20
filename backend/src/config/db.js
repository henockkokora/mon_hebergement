import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not defined');
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}
