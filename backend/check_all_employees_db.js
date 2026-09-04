import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';

dotenv.config({ path: './.env' });

async function checkAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected to database:', mongoose.connection.name);
  const emps = await Employee.find({}).select('name employeeId email department').lean();
  console.log('Total employees found in database:', emps.length);
  console.log(JSON.stringify(emps, null, 2));
  await mongoose.disconnect();
}

checkAll();
