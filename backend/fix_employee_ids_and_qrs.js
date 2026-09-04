import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import QRCode from 'qrcode';

dotenv.config({ path: './.env' });

async function fixEmployeeIdsAndQRs() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected to database:', mongoose.connection.name);

  const updates = [
    { email: 'sachinpoongodi795@gmail.com', targetId: 'TSMGS011' },
    { email: 'mithunbala0214@gmail.com', targetId: 'TSMGS012' },
    { email: 'rupasri0211@gmail.com', targetId: 'TSMGS013' },
    { email: 'soundharyanagaraj15@gmail.com', targetId: 'TSMGS014' }
  ];

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  for (let u of updates) {
    const emp = await Employee.findOne({ email: u.email });
    if (emp) {
      emp.employeeId = u.targetId;
      const verificationUrl = `${baseUrl}/verify/${u.targetId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 335,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      emp.qrCodeImage = qrDataUrl;
      await emp.save();
      console.log(`✅ Updated ${emp.name} ➔ ID: ${emp.employeeId} | Embedded URL: ${verificationUrl}`);
    }
  }

  await mongoose.disconnect();
  console.log('🎉 Employee IDs & QR Codes successfully updated!');
}

fixEmployeeIdsAndQRs();
