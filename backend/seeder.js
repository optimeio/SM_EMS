import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import Employee from './models/Employee.js';
import Task from './models/Task.js';
import ActivityLog from './models/ActivityLog.js';
import { connectDB } from './config/db.js';

const importData = async () => {
  try {
    await connectDB();

    await Admin.deleteMany();
    await Employee.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();

    const createdAdmin = await Admin.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'Password@123',
    });

    const adminId = createdAdmin._id;

    const employees = [
      {
        employeeId: 'EMP001',
        name: 'Gokul',
        email: 'gokul@company.com',
        password: 'Password@123',
        phone: '9876543210',
        department: 'IT',
        designation: 'Senior Developer',
        joiningDate: new Date('2024-01-15'),
        status: 'Active',
        totalPoints: 740,
        bloodGroup: 'O+'
      },
      {
        employeeId: 'EMP002',
        name: 'Arun',
        email: 'arun@company.com',
        password: 'Password@123',
        phone: '9876543211',
        department: 'Telecalling',
        designation: 'Telecalling Executive',
        joiningDate: new Date('2024-02-01'),
        status: 'Active',
        totalPoints: 920,
        bloodGroup: 'A+'
      },
      {
        employeeId: 'EMP003',
        name: 'Priya',
        email: 'priya@company.com',
        password: 'Password@123',
        phone: '9876543212',
        department: 'Marketing',
        designation: 'Marketing Manager',
        joiningDate: new Date('2023-11-10'),
        status: 'Active',
        totalPoints: 680,
        bloodGroup: 'B+'
      },
      {
        employeeId: 'EMP004',
        name: 'Karthik',
        email: 'karthik@company.com',
        password: 'Password@123',
        phone: '9876543213',
        department: 'Telecalling',
        designation: 'Telecalling Executive',
        joiningDate: new Date('2022-05-20'),
        status: 'Inactive',
        totalPoints: 590,
        bloodGroup: 'AB-'
      },
      {
        employeeId: 'EMP005',
        name: 'Rajesh Kumar',
        email: 'rajesh@company.com',
        password: 'Password@123',
        phone: '9876543214',
        department: 'IT',
        designation: 'System Administrator',
        joiningDate: new Date('2024-03-10'),
        status: 'Active',
        totalPoints: 820,
        bloodGroup: 'O+'
      },
      {
        employeeId: 'EMP006',
        name: 'Divya Sharma',
        email: 'divya@company.com',
        password: 'Password@123',
        phone: '9876543215',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        joiningDate: new Date('2023-08-15'),
        status: 'Active',
        totalPoints: 910,
        bloodGroup: 'A-'
      },
      {
        employeeId: 'EMP007',
        name: 'Vikram Singh',
        email: 'vikram@company.com',
        password: 'Password@123',
        phone: '9876543216',
        department: 'IT',
        designation: 'Software Engineer',
        joiningDate: new Date('2023-05-12'),
        status: 'Active',
        totalPoints: 710,
        bloodGroup: 'B-'
      },
      {
        employeeId: 'EMP008',
        name: 'Shalini Sen',
        email: 'shalini@company.com',
        password: 'Password@123',
        phone: '9876543217',
        department: 'Telecalling',
        designation: 'Team Lead - Telecalling',
        joiningDate: new Date('2023-01-20'),
        status: 'Active',
        totalPoints: 860,
        bloodGroup: 'O-'
      },
      {
        employeeId: 'EMP009',
        name: 'Suresh Raina',
        email: 'suresh@company.com',
        password: 'Password@123',
        phone: '9876543218',
        department: 'Marketing',
        designation: 'Digital Marketer',
        joiningDate: new Date('2024-01-05'),
        status: 'Active',
        totalPoints: 640,
        bloodGroup: 'A+'
      },
      {
        employeeId: 'EMP010',
        name: 'Nivedha Krish',
        email: 'nivedha@company.com',
        password: 'Password@123',
        phone: '9876543219',
        department: 'Telecalling',
        designation: 'Telecalling Specialist',
        joiningDate: new Date('2022-09-15'),
        status: 'Inactive',
        totalPoints: 480,
        bloodGroup: 'B+'
      }
    ];

    const hashedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(emp.password, salt);
        return { ...emp, plainTextPassword: emp.password, password: hashedPassword };
      })
    );

    const insertedEmployees = await Employee.insertMany(hashedEmployees);

    const tasks = [
      {
        title: 'Develop Login API',
        description: 'Create the backend API for user login with JWT.',
        assignedTo: insertedEmployees[0]._id,
        points: 50,
        priority: 'High',
        dueDate: new Date('2026-09-05'),
        status: 'In Progress',
        createdBy: adminId
      },
      {
        title: 'Frontend Dashboard',
        description: 'Design and develop the React admin dashboard.',
        assignedTo: insertedEmployees[1]._id,
        points: 30,
        priority: 'Medium',
        dueDate: new Date('2026-09-10'),
        status: 'Pending',
        createdBy: adminId
      }
    ];

    await Task.insertMany(tasks);

    await ActivityLog.create({
      action: 'System Database Seeded',
      performedBy: 'System Admin',
      description: 'Initialized system database with default employee and task records.'
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData();
} else {
  importData();
}
