import mongoose from 'mongoose';
import dns from 'dns';

if (process.platform === 'win32') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

const DIRECT_FALLBACK_URI = "mongodb://mbkdrive82_db_user:K21TjnzWV7zdn3Bj@ac-n61j1cy-shard-00-00.qq9k2vl.mongodb.net:27017,ac-n61j1cy-shard-00-01.qq9k2vl.mongodb.net:27017,ac-n61j1cy-shard-00-02.qq9k2vl.mongodb.net:27017/id_scan?ssl=true&replicaSet=atlas-iqb4s7-shard-0&authSource=admin&retryWrites=true&w=majority";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || DIRECT_FALLBACK_URI;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB connection failed (${error.message}). Trying direct Atlas cluster failover...`);
    try {
      const conn = await mongoose.connect(DIRECT_FALLBACK_URI, {
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected (Direct Failover): ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`Error connecting to MongoDB: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

