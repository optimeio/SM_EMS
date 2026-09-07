import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';

async function checkSizes() {
  await connectDB();
  const stats = await Employee.aggregate([
    {
      $project: {
        employeeId: 1,
        name: 1,
        profilePhotoLen: { $strLenCP: { $ifNull: ['$profilePhoto', ''] } },
        idCardImageLen: { $strLenCP: { $ifNull: ['$idCardImage', ''] } },
        qrCodeImageLen: { $strLenCP: { $ifNull: ['$qrCodeImage', ''] } }
      }
    }
  ]);
  console.log('Employee Image field sizes in MongoDB:');
  for (const s of stats) {
    console.log(s.employeeId, s.name, {
      profilePhotoKB: (s.profilePhotoLen / 1024).toFixed(1) + ' KB',
      idCardImageKB: (s.idCardImageLen / 1024).toFixed(1) + ' KB',
      qrCodeImageKB: (s.qrCodeImageLen / 1024).toFixed(1) + ' KB',
    });
  }
  process.exit(0);
}
checkSizes().catch(err => {
  console.error(err);
  process.exit(1);
});
