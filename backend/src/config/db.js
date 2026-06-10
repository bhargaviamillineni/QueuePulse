import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
    logger.info('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    logger.error('MongoDB connection error:', error);
    throw error;
  }
  
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
}
