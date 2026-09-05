import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';

async function addDhanush() {
  await connectDB();
  console.log('Connected to MongoDB Atlas Cloud.');

  const dhanushData = {
    employeeId: 'TSMG006',
    name: 'DHANUSH K',
    email: 'dhanuzh.glitz@gmail.com',
    phone: '6374847724',
    emergencyContact: '9095283101',
    department: 'Software Development',
    designation: 'Jr Software Developer',
    dateOfBirth: new Date('2005-02-28'),
    joiningDate: new Date('2026-06-08'),
    bloodGroup: 'B+',
    address: 'Sengoda Gounder Rice Mill Near, M. Thathanur , Ayyothiyapattinum.',
    password: 'Password@123',
    status: 'Active',
    totalPoints: 0
  };

  // Generate permanent QR code for TSMG006
  const verificationUrl = `https://ems.thesmgroups.com/verify/${dhanushData.employeeId}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 600,
    margin: 3,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });
  dhanushData.qrCodeImage = qrDataUrl;

  // Check if someone else currently occupies TSMG006
  const existingEmpWithId6 = await Employee.findOne({ employeeId: 'TSMG006' });
  if (existingEmpWithId6 && existingEmpWithId6.email !== dhanushData.email) {
    console.log(`Note: TSMG006 was held by ${existingEmpWithId6.name}. Moving ${existingEmpWithId6.name} to TSMG008...`);
    existingEmpWithId6.employeeId = 'TSMG008';
    const oldEmpVerificationUrl = `https://ems.thesmgroups.com/verify/TSMG008`;
    existingEmpWithId6.qrCodeImage = await QRCode.toDataURL(oldEmpVerificationUrl, {
      width: 600,
      margin: 3,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    await existingEmpWithId6.save();
    console.log(`✅ ${existingEmpWithId6.name} moved to TSMG008`);
  }

  // Check if Dhanush already exists by email
  let dhanush = await Employee.findOne({ email: dhanushData.email });
  if (dhanush) {
    Object.assign(dhanush, dhanushData);
    await dhanush.save();
    console.log(`✅ Updated existing Dhanush record to TSMG006: ${dhanush.name}`);
  } else {
    dhanush = await Employee.create(dhanushData);
    console.log(`🎉 Created permanent employee DHANUSH K with ID TSMG006`);
  }

  // Also export 1000x1000 PNG for Canva / ID Card
  const outDir = path.resolve('../PERMANENT_ID_CARD_QR_CODES');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const filePath = path.join(outDir, 'TSMG006_DHANUSH_K_QR.png');
  await QRCode.toFile(filePath, verificationUrl, {
    width: 1000,
    margin: 3,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });
  console.log(`✅ Exported high-res QR PNG: ${filePath}`);

  console.log('\n--- All Employees in Database ---');
  const all = await Employee.find({}).sort({ employeeId: 1 });
  all.forEach(e => console.log(e.employeeId, '-', e.name, '| Dept:', e.department, '| Phone:', e.phone));

  process.exit(0);
}

addDhanush().catch(err => {
  console.error('Error adding Dhanush:', err);
  process.exit(1);
});
