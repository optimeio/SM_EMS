import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import QRCode from 'qrcode';
import ActivityLog from './models/ActivityLog.js';

dotenv.config({ path: './.env' });

const employeesToCreate = [
  {
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
    password: 'Password@123'
  },
  {
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
    password: 'Password@123'
  },
  {
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
    password: 'Password@123'
  },
  {
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
    password: 'Password@123'
  }
];

async function seedEmployees() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI missing in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    for (let empData of employeesToCreate) {
      // Check if employee already exists by email
      const existing = await Employee.findOne({ email: empData.email });
      if (existing) {
        console.log(`⚠️ Employee already exists for ${empData.email} (${existing.employeeId}). Updating details...`);
        Object.assign(existing, empData);
        await existing.save();
        console.log(`✅ Updated existing employee: ${existing.name} (${existing.employeeId})`);
        continue;
      }

      // Generate next unique employee ID
      const count = await Employee.countDocuments();
      const employeeId = `TSMGS${(count + 1).toString().padStart(3, '0')}`;
      empData.employeeId = employeeId;

      // Generate permanent QR code
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${baseUrl}/verify/${employeeId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 335,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      empData.qrCodeImage = qrDataUrl;

      const created = await Employee.create(empData);
      console.log(`🎉 Created new employee: ${created.name} (${created.employeeId}) [${created.department}]`);

      await ActivityLog.create({
        action: 'Created Employee',
        performedBy: 'Admin',
        employeeId: created._id,
        description: `Imported employee record for ${created.name} (${created.employeeId})`
      }).catch(() => {});
    }

    console.log('\n====================================================');
    console.log('✅ ALL 4 EMPLOYEES SUCCESSFULLY CREATED IN MONGODB!');
    console.log('====================================================');

  } catch (err) {
    console.error('Error creating employees:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedEmployees();
