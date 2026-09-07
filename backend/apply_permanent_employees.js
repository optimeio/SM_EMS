import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import Employee from './models/Employee.js';
import ActivityLog from './models/ActivityLog.js';

import { connectDB } from './config/db.js';

dotenv.config();

const employeesData = [
  {
    employeeId: 'TSMG005',
    name: 'SACHIN M',
    email: 'sachinpoongodi795@gmail.com',
    address: '8/30 GANDHINAGAR ,NAINAMPATTY RAJAPALAYAM, SALEM 637501',
    phone: '9688287586',
    emergencyContact: '9043342182',
    department: 'Software Development',
    designation: 'Junior Software developer',
    dateOfBirth: new Date('2004-04-19'),
    joiningDate: new Date('2026-08-27'),
    bloodGroup: 'AB+',
    profilePhoto: 'https://drive.google.com/thumbnail?id=1tbhU-fBGe0WipI2ImIm933A3iJFVomqK&sz=w1024',
    defaultPassword: 'Password@123'
  },
  {
    employeeId: 'TSMG009',
    name: 'Mithun bala.V',
    email: 'mithunbala0214@gmail.com',
    address: '176 Chinna marriyamman Kovil Street, Thangamapuripattinam Mettur dam 02',
    phone: '9360685127',
    emergencyContact: '7904019476',
    department: 'Sales And Marketing',
    designation: 'Sale Executive',
    dateOfBirth: new Date('2004-04-02'),
    joiningDate: new Date('2026-07-21'),
    bloodGroup: 'O+',
    profilePhoto: 'https://drive.google.com/thumbnail?id=1CmRdJGhH5IZzT8msW2PSIYGwhEkH6Jxq&sz=w1024',
    defaultPassword: 'Password@123'
  },
  {
    employeeId: 'TSMG010',
    name: 'Rupasri k',
    email: 'rupasri0211@gmail.com',
    address: 'Erumapalayam main road seelanakanpatti salem',
    phone: '9688238502',
    emergencyContact: '+91 95975 79135',
    department: 'Sales And Marketing',
    designation: 'Sales executive',
    dateOfBirth: new Date('2005-11-02'),
    joiningDate: new Date('2026-08-15'),
    bloodGroup: 'AB+',
    profilePhoto: 'https://drive.google.com/thumbnail?id=1PWN7Iyz0hklSUXkow18EKBmU67G7iFto&sz=w1024',
    defaultPassword: 'Password@123'
  },
  {
    employeeId: 'TSMG011',
    name: 'soundharya nagaraj',
    email: 'soundharyanagaraj15@gmail.com',
    address: '10/242 Elampillai gandhinagar, salem - 637 502',
    phone: '9003761221',
    emergencyContact: '8012471120',
    department: 'COI (Center Of Information)',
    designation: 'Assistant HR',
    dateOfBirth: new Date('2003-09-15'),
    joiningDate: new Date('2026-08-20'),
    bloodGroup: 'O+',
    profilePhoto: 'https://drive.google.com/thumbnail?id=1sMRTu_ABNAr2PW2agIEv8q2toN9MJxgg&sz=w1024',
    defaultPassword: 'Password@123'
  },
  {
    employeeId: 'TSMG012',
    name: 'Aaron M',
    email: 'aaronmax1177@gmail.com',
    address: '18 th lllanthopu 2nd st karimedu madurai 625016',
    phone: '9361973620',
    emergencyContact: '8973516806',
    department: 'COI (Center Of Information)',
    designation: 'Assistant HR',
    dateOfBirth: new Date('1996-04-18'),
    joiningDate: new Date('2026-08-04'),
    bloodGroup: 'A+',
    profilePhoto: '',
    defaultPassword: 'Password@123'
  }
];

const BASE_URL = 'https://ems.thesmgroups.com';

async function applyPermanentEmployees() {
  console.log('Connecting to MongoDB Atlas Cloud...');
  await connectDB();
  console.log('Connected to MongoDB database:', mongoose.connection.name);

  for (const emp of employeesData) {
    const verificationUrl = `${BASE_URL}/verify/${emp.employeeId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 335,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    let record = await Employee.findOne({ email: emp.email });

    if (record) {
      console.log(`Updating existing employee for email: ${emp.email} (Current ID: ${record.employeeId} ➔ New ID: ${emp.employeeId})`);
      record.employeeId = emp.employeeId;
      record.name = emp.name;
      record.address = emp.address;
      record.phone = emp.phone;
      record.emergencyContact = emp.emergencyContact;
      record.department = emp.department;
      record.designation = emp.designation;
      record.dateOfBirth = emp.dateOfBirth;
      record.joiningDate = emp.joiningDate;
      record.bloodGroup = emp.bloodGroup;
      if (emp.profilePhoto) {
        record.profilePhoto = emp.profilePhoto;
      }
      record.qrCodeImage = qrDataUrl;
      record.status = 'Active';

      await record.save();
      console.log(`✅ Successfully updated permanent record: ${record.name} [${record.employeeId}]`);
    } else {
      console.log(`Creating new permanent employee: ${emp.name} [${emp.employeeId}]`);
      record = await Employee.create({
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        password: emp.defaultPassword,
        address: emp.address,
        phone: emp.phone,
        emergencyContact: emp.emergencyContact,
        department: emp.department,
        designation: emp.designation,
        dateOfBirth: emp.dateOfBirth,
        joiningDate: emp.joiningDate,
        bloodGroup: emp.bloodGroup,
        profilePhoto: emp.profilePhoto || '',
        qrCodeImage: qrDataUrl,
        status: 'Active',
        totalPoints: 0
      });
      console.log(`🎉 Successfully created permanent record: ${record.name} [${record.employeeId}]`);

      await ActivityLog.create({
        action: 'Created Employee',
        performedBy: 'Admin',
        employeeId: record._id,
        description: `Permanently registered employee ${record.name} (${record.employeeId})`
      }).catch(() => {});
    }
  }

  console.log('\n====================================================');
  console.log('✅ ALL 5 EMPLOYEES PERMANENTLY SAVED IN MONGODB CLOUD ATLAS!');
  console.log('====================================================\n');

  // Audit results directly from MongoDB
  const allEmployees = await Employee.find({}).sort({ employeeId: 1 });
  console.log(`Total Employees in MongoDB Atlas: ${allEmployees.length}`);
  allEmployees.forEach((e, idx) => {
    console.log(`[${idx + 1}] ${e.employeeId} - ${e.name} | Dept: ${e.department} | Role: ${e.designation} | Phone: ${e.phone}`);
  });

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB.');
}

applyPermanentEmployees().catch(err => {
  console.error('❌ Error applying employees:', err);
  process.exit(1);
});
