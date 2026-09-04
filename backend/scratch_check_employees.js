import 'dotenv/config';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';

async function checkEmployees() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees:`);
    for (let emp of employees) {
      console.log(`ID: ${emp.employeeId} | Name: ${emp.name} | Email: ${emp.email} | PlainPass: ${emp.plainTextPassword} | Hash: ${emp.password?.substring(0, 15)}...`);
      const testMatch = await emp.matchPassword(emp.plainTextPassword || 'Password@123');
      console.log(`  -> Match check for '${emp.plainTextPassword || 'Password@123'}': ${testMatch}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkEmployees();
