import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';
import Task from './models/Task.js';
import Admin from './models/Admin.js';

dotenv.config();

async function inspectDatabase() {
  console.log('====================================================');
  console.log('🔍 MONGODB DATABASE AUDIT & DATA VERIFICATION');
  console.log('====================================================\n');

  await connectDB();

  // 1. Audit Employees & ID Card URLs
  console.log('\n--- 1. EMPLOYEES & ID CARD URLS ---');
  const employees = await Employee.find({});
  console.log(`Total Employees in MongoDB: ${employees.length}`);
  
  let employeesWithIdCard = 0;
  employees.forEach((emp, i) => {
    if (emp.idCardUrl) employeesWithIdCard++;
    console.log(`[${i + 1}] ${emp.employeeId} - ${emp.name} (${emp.department})`);
    console.log(`     - Email: ${emp.email}`);
    console.log(`     - Phone: ${emp.phone}`);
    console.log(`     - ID Card Drive URL: ${emp.idCardUrl || '⚠️ Not generated yet'}`);
  });
  console.log(`📊 Employees with ID Card URL stored: ${employeesWithIdCard} / ${employees.length}`);

  // 2. Audit Attendance & Check-In Photo URLs
  console.log('\n--- 2. ATTENDANCE & CHECK-IN PHOTO URLS ---');
  const attendanceRecords = await Attendance.find({}).populate('employee', 'name employeeId department');
  console.log(`Total Attendance Records in MongoDB: ${attendanceRecords.length}`);

  attendanceRecords.forEach((att, i) => {
    const empName = att.employee ? `${att.employee.employeeId} - ${att.employee.name}` : 'Unknown Employee';
    console.log(`[${i + 1}] Date: ${att.date} | Status: ${att.status} | Emp: ${empName}`);
    console.log(`     - Check-In Time: ${att.checkInTime || 'N/A'}`);
    console.log(`     - Photo Drive URL: ${att.checkInPhoto?.driveUrl || 'Local / None'}`);
    console.log(`     - Photo File ID: ${att.checkInPhoto?.fileId || 'N/A'}`);
    console.log(`     - Local Storage Path: ${att.checkInPhoto?.localPath || 'N/A'}`);
  });

  // 3. Audit Tasks
  console.log('\n--- 3. TASKS IN MONGODB ---');
  const tasks = await Task.find({}).populate('assignedTo', 'name employeeId');
  console.log(`Total Tasks in MongoDB: ${tasks.length}`);
  tasks.slice(0, 5).forEach((t, i) => {
    const assigned = t.assignedTo ? `${t.assignedTo.employeeId} - ${t.assignedTo.name}` : 'Unassigned';
    console.log(`[${i + 1}] "${t.title}" | Status: ${t.status} | Priority: ${t.priority} | Assigned: ${assigned}`);
  });

  // 4. Audit Admin Auth Accounts
  console.log('\n--- 4. ADMIN AUTH ACCOUNTS ---');
  const admins = await Admin.find({}, '-password');
  console.log(`Total Admin Accounts in MongoDB: ${admins.length}`);
  admins.forEach((u, i) => {
    console.log(`[${i + 1}] ${u.name} <${u.email}> | Role: ${u.role}`);
  });

  console.log('\n====================================================');
  console.log('✅ MONGODB DATA INSPECTION COMPLETED');
  console.log('====================================================');
  process.exit(0);
}

inspectDatabase().catch(err => {
  console.error('❌ Error inspecting MongoDB:', err);
  process.exit(1);
});
