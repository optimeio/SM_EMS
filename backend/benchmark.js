import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';
import Task from './models/Task.js';
import ActivityLog from './models/ActivityLog.js';
import { getEmployees } from './controllers/employeeController.js';
import { getAdminAttendance } from './controllers/attendanceController.js';
import { getDashboardStats } from './controllers/analyticsController.js';
import { getActivityLogs } from './controllers/activityLogController.js';

const mockRes = () => {
  let resData = null;
  let statusCode = 200;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      resData = data;
      return this;
    },
    getData() {
      return resData;
    },
    getStatusCode() {
      return statusCode;
    }
  };
};

async function runBenchmark(name, fn, reqObj) {
  const start = performance.now();
  const res = mockRes();
  await fn(reqObj, res);
  const end = performance.now();
  const durationMs = Math.round(end - start);
  const jsonStr = JSON.stringify(res.getData() || {});
  const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
  const sizeKB = (sizeBytes / 1024).toFixed(2);
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

  console.log(`--------------------------------------------------`);
  console.log(`Benchmark Endpoint: ${name}`);
  console.log(`Time Taken: ${durationMs} ms`);
  console.log(`Payload Size: ${sizeKB} KB (${sizeMB} MB, ${sizeBytes} bytes)`);
  console.log(`Status Code: ${res.getStatusCode()}`);
  return { name, durationMs, sizeBytes, sizeKB, sizeMB };
}

async function main() {
  await connectDB();
  console.log('\n================ BASELINE BENCHMARKS ================');

  const results = [];
  
  // 1. Employees endpoint (paginated)
  results.push(await runBenchmark('GET /api/employees?page=1&limit=20', getEmployees, { query: { page: '1', limit: '20' } }));

  // 2. Employees endpoint (unpaginated)
  results.push(await runBenchmark('GET /api/employees (Unpaginated)', getEmployees, { query: {} }));

  // 3. Employees endpoint with search
  results.push(await runBenchmark('GET /api/employees?search=a&page=1&limit=20', getEmployees, { query: { search: 'a', page: '1', limit: '20' } }));

  // 4. Attendance admin endpoint
  results.push(await runBenchmark('GET /api/attendance/admin', getAdminAttendance, { query: {} }));

  // 5. Attendance admin endpoint with search
  results.push(await runBenchmark('GET /api/attendance/admin?search=a', getAdminAttendance, { query: { search: 'a' } }));

  // 6. Dashboard stats endpoint
  results.push(await runBenchmark('GET /api/dashboard/stats', getDashboardStats, { query: {} }));

  // 7. Activity logs endpoint (dashboard limit=10)
  results.push(await runBenchmark('GET /api/activity-logs?limit=10', getActivityLogs, { query: { limit: '10' } }));

  console.log('\n================ SUMMARY RESULTS ================');
  console.table(results);
  process.exit(0);
}

main().catch(err => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
