import mongoose from 'mongoose';

const mongooseConnection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/df-2.0-live-chat-with-websocket'); // df-2.0-live-chat-with-websocket doesn't exist yet

export const connectDb = async () => {
  try {
    await mongooseConnection;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};
