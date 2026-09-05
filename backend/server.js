import dns from 'dns';
if (process.platform === 'win32') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import canvaRoutes from './routes/canvaRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

import { syncAllEmployeePasswords } from './utils/syncEmployeePasswords.js';

// Connect to database and sync passwords
connectDB().then(() => {
  syncAllEmployeePasswords();
});

const app = express();

// Middleware - Permissive CORS and Preflight handler for production domains
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', analyticsRoutes); // contains /api/dashboard and /api/performance
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/canva', canvaRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

export default app;
