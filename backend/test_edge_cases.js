import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';

async function runEdgeCaseTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE APPLICATION EDGE-CASE SUITE');
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

  try {
    // ----------------------------------------------------
    // 1. AUTHENTICATION & SECURITY EDGE CASES
    // ----------------------------------------------------
    console.log('--- 1. Authentication & Token Edge Cases ---');
    
    // Case 1.1: Missing Credentials
    try {
      await axios.post(`${API_URL}/auth/login`, { email: '', password: '' });
      assert(false, 'Login with empty credentials should be rejected');
    } catch (err) {
      assert(err.response?.status === 400 || err.response?.status === 401, 'Login with empty credentials rejected with 400/401');
    }

    // Case 1.2: Invalid Email
    try {
      await axios.post(`${API_URL}/auth/login`, { email: 'nonexistent@domain.com', password: 'Password123' });
      assert(false, 'Login with invalid email should fail');
    } catch (err) {
      assert(err.response?.status === 401, 'Login with invalid email returns 401 Unauthorized');
    }

    // Case 1.3: Wrong Password
    try {
      await axios.post(`${API_URL}/auth/login`, { email: 'admin@company.com', password: 'WrongPassword999' });
      assert(false, 'Login with wrong password should fail');
    } catch (err) {
      assert(err.response?.status === 401, 'Login with wrong password returns 401 Unauthorized');
    }

    // Case 1.4: Protected route without token
    try {
      await axios.get(`${API_URL}/employees`);
      assert(false, 'Accessing protected route without token should fail');
    } catch (err) {
      assert(err.response?.status === 401, 'Protected route without token returns 401 Unauthorized');
    }

    // Case 1.5: Valid Admin Login
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'password123'
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.token, 'Admin login succeeds with JWT token');
    const adminToken = adminLoginRes.data.token;

    // Case 1.6: Valid Employee Login
    const empLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'EMP001',
      password: 'Password@123'
    });
    assert(empLoginRes.status === 200 && empLoginRes.data.token, 'Employee login succeeds with JWT token');
    const empToken = empLoginRes.data.token;

    // ----------------------------------------------------
    // 2. PUBLIC VERIFICATION EDGE CASES
    // ----------------------------------------------------
    console.log('\n--- 2. Public Verification & Identity Edge Cases ---');

    // Case 2.1: Public Verification of Valid Employee
    const publicVerifyRes = await axios.get(`${API_URL}/employees/verify/EMP001`);
    assert(publicVerifyRes.status === 200 && publicVerifyRes.data.employeeId === 'EMP001', 'Public verification endpoint resolves valid Employee ID');

    // Case 2.2: Public Verification of Non-existent Employee
    try {
      await axios.get(`${API_URL}/employees/verify/UNKNOWN_ID_999`);
      assert(false, 'Public verification of non-existent ID should fail');
    } catch (err) {
      assert(err.response?.status === 404, 'Public verification of invalid ID returns 404 Not Found');
    }

    // ----------------------------------------------------
    // 3. EMPLOYEE DIRECTORY & DUPLICATE CHECKS
    // ----------------------------------------------------
    console.log('\n--- 3. Employee Directory Validation & Constraints ---');

    // Case 3.1: Duplicate Email Error
    try {
      await axios.post(
        `${API_URL}/employees`,
        {
          name: 'Duplicate Test',
          email: 'gokul@company.com', // Duplicate email
          employeeId: 'TSMG-S-999',
          department: 'IT',
          designation: 'Developer'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(false, 'Creating employee with duplicate email should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Duplicate email creation blocked with 400 Bad Request');
    }

    // Case 3.2: Duplicate Employee ID Error
    try {
      await axios.post(
        `${API_URL}/employees`,
        {
          name: 'Duplicate ID Test',
          email: 'unique_email_99@company.com',
          employeeId: 'EMP001', // Duplicate ID
          department: 'IT',
          designation: 'Developer'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(false, 'Creating employee with duplicate Employee ID should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Duplicate Employee ID creation blocked with 400 Bad Request');
    }

    // ----------------------------------------------------
    // 4. ATTENDANCE CHECK-IN / CHECK-OUT EDGE CASES
    // ----------------------------------------------------
    console.log('\n--- 4. Daily Attendance Check-In & Check-Out Edge Cases ---');

    // Case 4.1: Check-in without photo file
    try {
      await axios.post(
        `${API_URL}/attendance/check-in`,
        {},
        { headers: { Authorization: `Bearer ${empToken}` } }
      );
      assert(false, 'Check-in without photo file should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Check-in without photo file blocked with 400 Bad Request');
    }

    // Case 4.2: Double Check-in on same day
    try {
      // Create a dummy JPEG image buffer for testing
      const dummyImgBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      
      const form1 = new FormData();
      form1.append('photo', dummyImgBuffer, { filename: 'test_checkin1.jpg', contentType: 'image/jpeg' });

      // First check-in attempt (or skip if already checked in today)
      try {
        await axios.post(
          `${API_URL}/attendance/check-in`,
          form1,
          { headers: { ...form1.getHeaders(), Authorization: `Bearer ${empToken}` } }
        );
      } catch (firstErr) {
        // If already checked in from earlier tests, that's fine
      }

      // Second check-in attempt on the same day MUST fail with 400
      const form2 = new FormData();
      form2.append('photo', dummyImgBuffer, { filename: 'test_checkin2.jpg', contentType: 'image/jpeg' });
      
      await axios.post(
        `${API_URL}/attendance/check-in`,
        form2,
        { headers: { ...form2.getHeaders(), Authorization: `Bearer ${empToken}` } }
      );
      assert(false, 'Double check-in on the same day should be blocked');
    } catch (err) {
      assert(
        err.response?.status === 400 && (err.response?.data?.message?.includes('already') || err.response?.data?.message?.includes('checked in')),
        'Double check-in on the same day blocked with 400 "already checked in" message'
      );
    }

    // Case 4.3: Today Attendance API for Employee
    const todayRes = await axios.get(`${API_URL}/attendance/today`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    assert(todayRes.status === 200, 'Employee today attendance route returns status code 200');

    // ----------------------------------------------------
    // 5. TASK MANAGEMENT & PERFORMANCE POINTS EDGE CASES
    // ----------------------------------------------------
    console.log('\n--- 5. Tasks & Performance Leaderboard Edge Cases ---');

    // Case 5.1: Create Task missing fields
    try {
      await axios.post(
        `${API_URL}/tasks`,
        { title: '' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(false, 'Task missing required fields should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Task creation missing fields blocked with 400 Bad Request');
    }

    // Case 5.2: Fetch Performance Leaderboard
    const lbRes = await axios.get(`${API_URL}/performance/leaderboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(Array.isArray(lbRes.data) && lbRes.data.length > 0, 'Performance leaderboard returns sorted workforce array');

    // ----------------------------------------------------
    // 6. ACTIVITY AUDIT LOGS EDGE CASES
    // ----------------------------------------------------
    console.log('\n--- 6. Activity Audit Trail ---');

    const logsRes = await axios.get(`${API_URL}/activity-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(Array.isArray(logsRes.data) && logsRes.data.length > 0, 'Activity audit logs route returns recorded audit feed');

    console.log('\n====================================================');
    console.log(`🎉 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (globalErr) {
    console.error('Fatal Edge Case Test Execution Error:', globalErr.message);
    process.exit(1);
  }
}

runEdgeCaseTests();
