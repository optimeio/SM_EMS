import Employee from '../models/Employee.js';
import Admin from '../models/Admin.js';
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

    // Also ensure Admin account is synchronized
    let admin = await Admin.findOne({ email: 'admin@company.com' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password@123', salt);
      await Admin.create({
        name: 'Admin User',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Created default Admin account (admin@company.com / Password@123)');
    } else {
      const isAdminMatch = await admin.matchPassword('Password@123');
      if (!isAdminMatch) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('Password@123', salt);
        await admin.save();
        console.log('🔐 Updated Admin account password to "Password@123"');
      }
    }
  } catch (error) {
    console.error('⚠️ Password Sync Error:', error.message);
  }
};
