import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

if (process.platform === 'win32') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

const DIRECT_FALLBACK_URI = "mongodb://mbkattendancedrive_db_user:s2jkJ5f2p6GsCPqc@ac-0xbnm87-shard-00-00.rj7k6f6.mongodb.net:27017,ac-0xbnm87-shard-00-01.rj7k6f6.mongodb.net:27017,ac-0xbnm87-shard-00-02.rj7k6f6.mongodb.net:27017/id_scan?ssl=true&replicaSet=atlas-ve97o4-shard-0&authSource=admin&retryWrites=true&w=majority";

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

