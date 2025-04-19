import mongoose from 'mongoose';

let isConnected = false;

const connectDb = async (): Promise<void> => {
  if (isConnected || mongoose.connections[0].readyState) {
    console.log('Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    mongoose.set("debug", true); 
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    isConnected = true;
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

export default connectDb;
