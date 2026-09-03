import Employee from '../models/Employee.js';
import bcrypt from 'bcryptjs';

export const syncAllEmployeePasswords = async () => {
  try {
    const employees = await Employee.find({});
    let updatedCount = 0;

    for (const emp of employees) {
      const plainPassword = emp.plainTextPassword || 'Password@123';
      let isMatch = false;
      
      if (emp.password) {
        try {
          isMatch = await bcrypt.compare(plainPassword, emp.password);
        } catch (e) {
          isMatch = false;
        }
      }

      if (!isMatch || !emp.plainTextPassword) {
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(plainPassword, salt);
        
        await Employee.updateOne(
          { _id: emp._id },
          { 
            $set: { 
              password: newHash,
              plainTextPassword: plainPassword
            } 
          }
        );
        updatedCount++;
        console.log(`🔐 Re-aligned password hash for ${emp.employeeId} (${emp.name}) -> Password: "${plainPassword}"`);
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Successfully re-synchronized credentials for ${updatedCount} employee accounts.`);
    } else {
      console.log(`✓ All employee credentials in MongoDB are perfectly synchronized.`);
    }
  } catch (error) {
    console.error('⚠️ Password Sync Error:', error.message);
  }
};
