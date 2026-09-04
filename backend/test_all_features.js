import app from './server.js';
import mongoose from 'mongoose';
import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';
import Task from './models/Task.js';
import Admin from './models/Admin.js';

let server;

async function runComprehensiveVerification() {
  console.log('====================================================');
  console.log('🧪 SYSTEM VERIFICATION & COMPREHENSIVE SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details}`);
      failed++;
    }
  }

  // Ensure DB connection is ready
  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => mongoose.connection.once('connected', resolve));
  }

  const port = 5099;
  server = app.listen(port);
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Admin Login Verification
    let adminToken = '';
    const adminRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@company.com', password: 'Password@123' })
    });
    const adminData = await adminRes.json();
    assert(adminRes.ok && adminData.token, '1. Admin Login', `(Token: ${adminData.token ? 'Received' : 'None'})`);
    adminToken = adminData.token || '';

    // 2. Employee Creation Fast Response Verification
    const testEmpId = `TEST${Date.now().toString().slice(-4)}`;
    const createStartTime = Date.now();
    const createRes = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        employeeId: testEmpId,
        name: 'Automation Test User',
        email: `${testEmpId.toLowerCase()}@test.com`,
        phone: '9876543210',
        department: 'Software Development',
        designation: 'QA Engineer',
        joiningDate: '2026-01-01',
        password: 'TestPassword@123'
      })
    });
    const createDuration = Date.now() - createStartTime;
    const createData = await createRes.json();
    
    assert(createRes.status === 201 && createData._id, '2. Create Employee', `(Time: ${createDuration}ms)`);
    assert(createData.plainTextPassword === undefined, '3. Password Security: No plainTextPassword in response');
    
    const createdDbEmp = await Employee.findById(createData._id).lean();
    assert(createdDbEmp && createdDbEmp.plainTextPassword === undefined, '4. DB Security: plainTextPassword removed from Schema');
    assert(createdDbEmp && /^\$2[aby]\$/.test(createdDbEmp.password), '5. DB Security: Password stored as bcrypt hash');

    // 3. Employee Login Verification
    const empLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmpId, password: 'TestPassword@123' })
    });
    const empLoginData = await empLoginRes.json();
    assert(empLoginRes.ok && empLoginData.token, '6. Employee Login with Bcrypt Password', `(Role: ${empLoginData.role})`);
    assert(empLoginData.plainTextPassword === undefined, '7. Employee Login Response: No plain text password exposed');

    // 4. Paginated Employee List Verification
    const listRes = await fetch(`${baseUrl}/employees?page=1&limit=5&search=${testEmpId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const listData = await listRes.json();
    assert(listData.employees && Array.isArray(listData.employees) && listData.total >= 1, '8. Paginated Employee List Query', `(Found: ${listData.total}, Page: ${listData.page}/${listData.pages})`);

    // 5. Employee Details & Performance Verification
    const perfRes = await fetch(`${baseUrl}/performance/${createData._id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const perfData = await perfRes.json();
    assert(perfRes.ok && perfData.stats && perfData.employee, '9. Employee Performance Stats API', `(Completion Rate: ${perfData.stats.completionRate}%)`);

    // 6. Cleanup Created Test Employee
    await fetch(`${baseUrl}/employees/${createData._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('🧹 Cleaned up test employee record.');

  } catch (err) {
    console.error('Fatal Verification Error:', err);
    failed++;
  } finally {
    if (server) server.close();
    console.log('\n====================================================');
    console.log(`📊 SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runComprehensiveVerification();
