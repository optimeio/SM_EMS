import Employee from '../models/Employee.js';
import Admin from '../models/Admin.js';

export const syncAllEmployeePasswords = async () => {
  try {
    // Ensure Admin account credentials (admin@company.com / Password@123) are valid & synchronized
    let admin = await Admin.findOne({ email: 'admin@company.com' });
    if (!admin) {
      admin = new Admin({
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'Password@123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Created default Admin account (admin@company.com / Password@123)');
    } else {
      const isAdminMatch = await admin.matchPassword('Password@123');
      if (!isAdminMatch) {
        admin.password = 'Password@123';
        await admin.save();
        console.log('🔐 Successfully synchronized Admin account password to "Password@123"');
      }
    }
  } catch (error) {
    console.error('⚠️ Admin Password Sync Error:', error.message);
  }
};
