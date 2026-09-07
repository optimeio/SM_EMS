import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';
import sharp from 'sharp';
import mongoose from 'mongoose';

async function compressAllPhotos() {
  console.log('🚀 Starting profile photo optimization in MongoDB...');
  await connectDB();

  const employeeList = await Employee.find({}).select('_id employeeId name').lean();
  console.log(`Found ${employeeList.length} employees to inspect.`);

  let totalBeforeBytes = 0;
  let totalAfterBytes = 0;
  let compressed = 0;

  for (const item of employeeList) {
    const emp = await Employee.findById(item._id).select('employeeId name profilePhoto');
    if (!emp || !emp.profilePhoto) {
      console.log(`- ${item.employeeId} (${item.name}): No profile photo.`);
      continue;
    }

    const beforeLen = emp.profilePhoto.length;
    totalBeforeBytes += beforeLen;

    // If already small (< 30KB), skip
    if (beforeLen < 30 * 1024) {
      console.log(`⏭️  ${emp.employeeId} (${emp.name}): Already small (${(beforeLen / 1024).toFixed(1)} KB), skipping.`);
      totalAfterBytes += beforeLen;
      continue;
    }

    let base64Data = emp.profilePhoto;
    if (base64Data.includes(';base64,')) {
      base64Data = base64Data.split(';base64,')[1];
    }

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const compressedBuffer = await sharp(buffer)
        .resize(200, 200, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();

      const newBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
      const afterLen = newBase64.length;
      totalAfterBytes += afterLen;

      await Employee.findByIdAndUpdate(emp._id, { $set: { profilePhoto: newBase64 } });
      compressed++;

      console.log(`✅ ${emp.employeeId} (${emp.name}): ${(beforeLen / 1024).toFixed(1)} KB ➔ ${(afterLen / 1024).toFixed(1)} KB (${Math.round((1 - afterLen / beforeLen) * 100)}% reduction)`);
    } catch (err) {
      console.error(`❌ Failed to compress photo for ${emp.employeeId}:`, err.message);
      totalAfterBytes += beforeLen;
    }
  }

  console.log('\n🎉 Compression Summary:');
  console.log(`Compressed: ${compressed}/${employeeList.length} employees`);
  console.log(`Before: ${(totalBeforeBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`After:  ${(totalAfterBytes / 1024).toFixed(2)} KB`);
  const saved = totalBeforeBytes - totalAfterBytes;
  console.log(`Savings: ${(saved / (1024 * 1024)).toFixed(2)} MB freed (${Math.round((saved / totalBeforeBytes) * 100)}% total reduction)\n`);

  await mongoose.disconnect();
  process.exit(0);
}

compressAllPhotos().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
