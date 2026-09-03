import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';

dotenv.config();

const dummyEmployees = [
  { employeeId: 'EMP010', name: 'Alice Smith', email: 'alice@company.com', password: 'Password@123', phone: '1234567890', department: 'HR', designation: 'HR Manager', joiningDate: new Date('2023-01-15') },
  { employeeId: 'EMP011', name: 'Bob Johnson', email: 'bob@company.com', password: 'Password@123', phone: '1234567891', department: 'IT', designation: 'Software Engineer', joiningDate: new Date('2023-02-10') },
  { employeeId: 'EMP012', name: 'Charlie Brown', email: 'charlie@company.com', password: 'Password@123', phone: '1234567892', department: 'Sales', designation: 'Sales Executive', joiningDate: new Date('2023-03-05') },
  { employeeId: 'EMP013', name: 'Diana Prince', email: 'diana@company.com', password: 'Password@123', phone: '1234567893', department: 'Marketing', designation: 'Marketing Specialist', joiningDate: new Date('2023-04-20') },
  { employeeId: 'EMP014', name: 'Edward Elric', email: 'edward@company.com', password: 'Password@123', phone: '1234567894', department: 'Engineering', designation: 'Mechanical Engineer', joiningDate: new Date('2023-05-12') },
  { employeeId: 'EMP015', name: 'Fiona Gallagher', email: 'fiona@company.com', password: 'Password@123', phone: '1234567895', department: 'Operations', designation: 'Operations Manager', joiningDate: new Date('2023-06-18') },
  { employeeId: 'EMP016', name: 'George Costanza', email: 'george@company.com', password: 'Password@123', phone: '1234567896', department: 'Real Estate', designation: 'Agent', joiningDate: new Date('2023-07-22') },
  { employeeId: 'EMP017', name: 'Hannah Abbott', email: 'hannah@company.com', password: 'Password@123', phone: '1234567897', department: 'Customer Support', designation: 'Support Lead', joiningDate: new Date('2023-08-30') },
  { employeeId: 'EMP018', name: 'Ian Malcolm', email: 'ian@company.com', password: 'Password@123', phone: '1234567898', department: 'Research', designation: 'Data Scientist', joiningDate: new Date('2023-09-14') },
  { employeeId: 'EMP019', name: 'Julia Roberts', email: 'julia@company.com', password: 'Password@123', phone: '1234567899', department: 'Public Relations', designation: 'PR Officer', joiningDate: new Date('2023-10-01') },
];

const seedEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Remove old test data if needed, or just insert new ones
    for (const emp of dummyEmployees) {
      const exists = await Employee.findOne({ email: emp.email });
      if (!exists) {
        const created = await Employee.create(emp);
        console.log(`Created: ${created.name}`);
      } else {
        console.log(`Skipped (already exists): ${emp.name}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedEmployees();
