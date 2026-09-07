import mongoose from 'mongoose';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';

dotenv.config();

const BASE_URL = 'https://ems.thesmgroups.com';

async function updateAllQRs() {
  await connectDB();
  const emps = await Employee.find({});

  for (let emp of emps) {
    const verificationUrl = `${BASE_URL}/verify/${emp.employeeId}`;
    
    // Generate high quality, compliant QR Code
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 600,
      margin: 3, // 3 modules quiet zone ensures 100% optical camera recognition
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H' // 30% error correction level for physical ID cards
    });

    emp.qrCodeImage = qrDataUrl;
    await emp.save();
    console.log(`✅ Generated permanent QR for ${emp.employeeId} (${emp.name}) -> ${verificationUrl}`);
  }

  console.log('🎉 All employee QR codes updated with permanent URL and optimal margin!');
  process.exit(0);
}

updateAllQRs().catch(err => {
  console.error('Error updating QRs:', err);
  process.exit(1);
});
