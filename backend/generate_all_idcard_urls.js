import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';
import { uploadIDCardToDrive } from './services/googleDriveService.js';

dotenv.config();

// 1x1 transparent PNG base64 placeholder for initial batch sync
const SAMPLE_IDCARD_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function generateAllIdCards() {
  await connectDB();
  console.log('🚀 Uploading sample ID cards to Google Drive & updating MongoDB...');

  const employees = await Employee.find({});
  let updatedCount = 0;

  for (const emp of employees) {
    try {
      const driveUrl = await uploadIDCardToDrive({
        base64Data: SAMPLE_IDCARD_BASE64,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department || 'General'
      });

      if (driveUrl) {
        emp.idCardUrl = driveUrl;
        await emp.save();
        updatedCount++;
        console.log(`✅ [${emp.employeeId} - ${emp.name}]: Saved ID Card Drive URL -> ${driveUrl}`);
      }
    } catch (err) {
      console.error(`❌ Failed for ${emp.employeeId}:`, err.message);
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} / ${employees.length} employees with Google Drive ID Card URLs in MongoDB!`);
  process.exit(0);
}

generateAllIdCards().catch(err => {
  console.error('❌ Batch ID Card creation failed:', err);
  process.exit(1);
});
