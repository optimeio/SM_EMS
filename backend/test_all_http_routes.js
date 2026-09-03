import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: 'c:/Users/Lenovo/Desktop/ID_Scan/backend/.env' });

const API_BASE = 'http://localhost:5000/api';

async function runFullSystemTest() {
  console.log('====================================================');
  console.log('🧪 FULL AUTOMATED API & GOOGLE DRIVE INTEGRATION TEST');
  console.log('====================================================\n');

  let adminToken = '';
  let employeeToken = '';
  let testEmpId = '';
  let testEmpDbId = '';
  let testTaskId = '';

  // 1. Test Admin Login
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      adminToken = data.token;
      console.log('✅ [POST] /api/auth/login (Admin): PASS');
    } else {
      console.error('❌ [POST] /api/auth/login (Admin): FAILED', data);
    }
  } catch (err) {
    console.error('❌ [POST] /api/auth/login (Admin) Exception:', err.message);
  }

  // 2. Test Employee Login
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'EMP001', password: 'Password@123' })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      employeeToken = data.token;
      console.log('✅ [POST] /api/auth/login (Employee): PASS');
    } else {
      console.error('❌ [POST] /api/auth/login (Employee): FAILED', data);
    }
  } catch (err) {
    console.error('❌ [POST] /api/auth/login (Employee) Exception:', err.message);
  }

  // 3. Test GET Employees (Admin)
  try {
    const res = await fetch(`${API_BASE}/employees`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      console.log(`✅ [GET] /api/employees: PASS (${data.length} Employees found)`);
    } else {
      console.error('❌ [GET] /api/employees: FAILED', data);
    }
  } catch (err) {
    console.error('❌ [GET] /api/employees Exception:', err.message);
  }

  // 4. Test POST Create Temporary Test Employee
  try {
    const tempEmail = `sys_test_${Date.now()}@company.com`;
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Auto System Test User',
        email: tempEmail,
        phone: '9998887770',
        department: 'IT',
        designation: 'QA Tester',
        dateOfBirth: '1998-05-15',
        joiningDate: '2026-01-01',
        address: '123 Test Street',
        emergencyContact: '9998887771',
        bloodGroup: 'B+'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data._id) {
      testEmpDbId = data._id;
      testEmpId = data.employeeId;
      console.log(`✅ [POST] /api/employees (Create Employee): PASS (Created ID: ${testEmpId})`);
    } else {
      console.error('❌ [POST] /api/employees: FAILED', data);
    }
  } catch (err) {
    console.error('❌ [POST] /api/employees Exception:', err.message);
  }

  // 5. Test PUT Update Employee
  if (testEmpDbId) {
    try {
      const res = await fetch(`${API_BASE}/employees/${testEmpDbId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Updated System Test User',
          phone: '9998887772',
          department: 'IT',
          designation: 'Senior QA Tester',
          address: '456 Updated Street'
        })
      });
      const data = await res.json();
      if (res.ok && data.name === 'Updated System Test User') {
        console.log('✅ [PUT] /api/employees/:id (Update Employee): PASS');
      } else {
        console.error('❌ [PUT] /api/employees/:id: FAILED', data);
      }
    } catch (err) {
      console.error('❌ [PUT] /api/employees/:id Exception:', err.message);
    }
  }

  // 6. Test PATCH Update Employee Status
  if (testEmpDbId) {
    try {
      const res = await fetch(`${API_BASE}/employees/${testEmpDbId}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Inactive' })
      });
      const data = await res.json();
      if (res.ok && data.status === 'Inactive') {
        console.log('✅ [PATCH] /api/employees/:id/status: PASS');
      } else {
        console.error('❌ [PATCH] /api/employees/:id/status: FAILED', data);
      }
    } catch (err) {
      console.error('❌ [PATCH] /api/employees/:id/status Exception:', err.message);
    }
  }

  // 7. Test DELETE Employee
  if (testEmpDbId) {
    try {
      const res = await fetch(`${API_BASE}/employees/${testEmpDbId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.message) {
        console.log('✅ [DELETE] /api/employees/:id (Delete Employee): PASS');
      } else {
        console.error('❌ [DELETE] /api/employees/:id: FAILED', data);
      }
    } catch (err) {
      console.error('❌ [DELETE] /api/employees/:id Exception:', err.message);
    }
  }

  // 8. Test GET Attendance (Admin)
  try {
    const res = await fetch(`${API_BASE}/attendance/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.records)) {
      console.log(`✅ [GET] /api/attendance/admin: PASS (${data.records.length} Records found, ${data.summary.presentCount} Present)`);
    } else {
      console.error('❌ [GET] /api/attendance/admin: FAILED', data);
    }
  } catch (err) {
    console.error('❌ [GET] /api/attendance/admin Exception:', err.message);
  }

  // 9. Test POST Create Task
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'System Automated Test Task',
        description: 'Verify system HTTP task operations',
        assignedTo: '6a96a71a8b535388d1365f22', // Gokul
        points: 25,
        priority: 'High',
        dueDate: '2026-09-10'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data._id) {
      testTaskId = data._id;
      console.log('✅ [POST] /api/tasks (Create Task): PASS');
    } else {
      console.error('❌ [POST] /api/tasks: FAILED', data);
    }
  } catch (err) {
    console.error('❌ [POST] /api/tasks Exception:', err.message);
  }

  // 10. Test PATCH Update Task Status
  if (testTaskId) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${testTaskId}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Completed' })
      });
      const data = await res.json();
      if (res.ok && data.status === 'Completed') {
        console.log('✅ [PATCH] /api/tasks/:id/status (Update Task Status): PASS');
      } else {
        console.error('❌ [PATCH] /api/tasks/:id/status: FAILED', data);
      }
    } catch (err) {
      console.error('❌ [PATCH] /api/tasks/:id/status Exception:', err.message);
    }
  }

  // 11. Test GET Leaderboard / Performance
  try {
    const res = await fetch(`${API_BASE}/performance/leaderboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      console.log(`✅ [GET] /api/performance/leaderboard: PASS (${data.length} Leaderboard entries)`);
    } else {
      console.error('❌ [GET] /api/performance/leaderboard: FAILED', data);
    }
  } catch (err) {
    console.error('❌ [GET] /api/performance/leaderboard Exception:', err.message);
  }

  // 12. Test GET Activity Logs
  try {
    const res = await fetch(`${API_BASE}/activity-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      console.log(`✅ [GET] /api/activity-logs: PASS (${data.length} Logs recorded)`);
    } else {
      console.error('❌ [GET] /api/activity-logs: FAILED', data);
    }
  } catch (err) {
    console.error('❌ [GET] /api/activity-logs Exception:', err.message);
  }

  // 13. Test Google Drive API Direct Connectivity & Folder Access
  console.log('\n----------------------------------------------------');
  console.log('☁️ GOOGLE DRIVE INTEGRATION TEST');
  console.log('----------------------------------------------------');
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const driveRes = await drive.files.list({
      q: "name = 'THE SM GROUPS Attendance' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)'
    });

    if (driveRes.data.files.length > 0) {
      const folder = driveRes.data.files[0];
      console.log(`✅ Google Drive API Connection: PASS`);
      console.log(`   - Root Attendance Folder ID: ${folder.id}`);
      console.log(`   - Folder Name: "${folder.name}"`);

      // List subfiles in root attendance folder
      const subFiles = await drive.files.list({
        q: `'${folder.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)'
      });
      console.log(`   - Synced Subfolders & Files: ${subFiles.data.files.length} items verified in Google Drive cloud.`);
    } else {
      console.error('❌ Google Drive Root Folder NOT FOUND');
    }
  } catch (err) {
    console.error('❌ Google Drive API Test Failed:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL API & GOOGLE DRIVE SYSTEM TESTS COMPLETED');
  console.log('====================================================');
}

runFullSystemTest();
