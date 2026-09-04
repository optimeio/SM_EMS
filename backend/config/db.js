import mongoose from 'mongoose';
import dns from 'dns';

// Force Public Google/Cloudflare DNS resolution ONLY on local Windows environments
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

const DIRECT_FALLBACK_URI = "mongodb://mbkdrive82_db_user:K21TjnzWV7zdn3Bj@ac-n61j1cy-shard-00-00.qq9k2vl.mongodb.net:27017,ac-n61j1cy-shard-00-01.qq9k2vl.mongodb.net:27017,ac-n61j1cy-shard-00-02.qq9k2vl.mongodb.net:27017/id_scan?ssl=true&replicaSet=atlas-iqb4s7-shard-0&authSource=admin&retryWrites=true&w=majority";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB connection failed (${error.message}). Trying direct Atlas cluster failover...`);
    try {
      const conn = await mongoose.connect(DIRECT_FALLBACK_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected (Direct Failover): ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`Error connecting to MongoDB: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

