import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';

async function fixDepartments() {
  await connectDB();

  // Normalize all employee departments in DB
  const employees = await Employee.find({});
  for (let emp of employees) {
    let oldDept = emp.department;
    let newDept = oldDept;

    const d = (oldDept || '').trim().toLowerCase();
    if (d.includes('coi') || d.includes('center of information') || d.includes('hr') || d.includes('telecalling')) {
      newDept = 'COI (Center Of Information)';
    } else if (d.includes('sales') || d.includes('marketing')) {
      newDept = 'Sales And Marketing';
    } else if (d.includes('software') || d.includes('dev') || d.includes('engineering') || d.includes('it')) {
      newDept = 'Software Development';
    }

    if (oldDept !== newDept) {
      emp.department = newDept;
      await emp.save();
      console.log(`✅ Normalized ${emp.employeeId} (${emp.name}): "${oldDept}" ➔ "${newDept}"`);
    } else {
      console.log(`✓ ${emp.employeeId} (${emp.name}) already in "${emp.department}"`);
    }
  }

  console.log('\n--- Final Department Counts in Database ---');
  const all = await Employee.find({});
  const counts = {};
  all.forEach(e => {
    counts[e.department] = (counts[e.department] || 0) + 1;
  });
  console.log(counts);

  process.exit(0);
}

fixDepartments().catch(err => {
  console.error(err);
  process.exit(1);
});
