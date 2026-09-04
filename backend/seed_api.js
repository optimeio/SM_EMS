import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@company.com';
const ADMIN_PASS = 'password123';

const dummyEmployees = [
  { employeeId: 'EMP010', name: 'Alice Smith', email: 'alice@company.com', password: 'Password@123', phone: '1234567890', department: 'Software Development', designation: 'HR Manager', joiningDate: '2023-01-15' },
  { employeeId: 'EMP011', name: 'Bob Johnson', email: 'bob@company.com', password: 'Password@123', phone: '1234567891', department: 'Software Development', designation: 'Software Engineer', joiningDate: '2023-02-10' },
  { employeeId: 'EMP012', name: 'Charlie Brown', email: 'charlie@company.com', password: 'Password@123', phone: '1234567892', department: 'Sales And Marketing', designation: 'Sales Executive', joiningDate: '2023-03-05' },
  { employeeId: 'EMP013', name: 'Diana Prince', email: 'diana@company.com', password: 'Password@123', phone: '1234567893', department: 'Sales And Marketing', designation: 'Marketing Specialist', joiningDate: '2023-04-20' },
  { employeeId: 'EMP014', name: 'Edward Elric', email: 'edward@company.com', password: 'Password@123', phone: '1234567894', department: 'COI (Center Of Information)', designation: 'Mechanical Engineer', joiningDate: '2023-05-12' },
  { employeeId: 'EMP015', name: 'Fiona Gallagher', email: 'fiona@company.com', password: 'Password@123', phone: '1234567895', department: 'COI (Center Of Information)', designation: 'Operations Manager', joiningDate: '2023-06-18' },
  { employeeId: 'EMP016', name: 'George Costanza', email: 'george@company.com', password: 'Password@123', phone: '1234567896', department: 'Software Development', designation: 'Agent', joiningDate: '2023-07-22' },
  { employeeId: 'EMP017', name: 'Hannah Abbott', email: 'hannah@company.com', password: 'Password@123', phone: '1234567897', department: 'Sales And Marketing', designation: 'Support Lead', joiningDate: '2023-08-30' },
  { employeeId: 'EMP018', name: 'Ian Malcolm', email: 'ian@company.com', password: 'Password@123', phone: '1234567898', department: 'Software Development', designation: 'Data Scientist', joiningDate: '2023-09-14' },
  { employeeId: 'EMP019', name: 'Julia Roberts', email: 'julia@company.com', password: 'Password@123', phone: '1234567899', department: 'COI (Center Of Information)', designation: 'PR Officer', joiningDate: '2023-10-01' },
];

async function seed() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASS
    });
    const token = loginRes.data.token;
    console.log('Got token:', token ? 'Yes' : 'No');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    for (const emp of dummyEmployees) {
      try {
        await axios.post(`${API_URL}/employees`, emp, config);
        console.log(`Successfully added ${emp.name}`);
      } catch (err) {
        console.error(`Failed to add ${emp.name}:`, err.response?.data?.message || err.message);
      }
    }
  } catch (error) {
    console.error('Failed to login:', error.response?.data?.message || error.message);
  }
}

seed();
