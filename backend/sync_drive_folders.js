import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Employee from './models/Employee.js';
import { google } from 'googleapis';

dotenv.config({ path: 'c:/Users/Lenovo/Desktop/ID_Scan/backend/.env' });

const ROOT_ATTENDANCE_FOLDER = 'THE SM GROUPS Attendance';
const ROOT_IDCARD_FOLDER = 'THE SM GROUPS ID Cards';

const getDriveClient = () => {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: 'v3', auth: oAuth2Client });
  }
  return null;
};

const getOrCreateFolder = async (drive, folderName, parentId = null) => {
  let query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    },
    fields: 'id'
  });

  return folder.data.id;
};

async function syncFolders() {
  await connectDB();
  const drive = getDriveClient();

  if (!drive) {
    console.error('❌ Could not initialize Google Drive client. Check .env credentials.');
    process.exit(1);
  }

  console.log('🚀 Synchronizing Google Drive Folders...');

  // Create Root Folders
  const rootAttendanceId = await getOrCreateFolder(drive, ROOT_ATTENDANCE_FOLDER);
  console.log(`✅ Root Attendance Folder created/found: "${ROOT_ATTENDANCE_FOLDER}" (ID: ${rootAttendanceId})`);

  const rootIdCardId = await getOrCreateFolder(drive, ROOT_IDCARD_FOLDER);
  console.log(`✅ Root ID Cards Folder created/found: "${ROOT_IDCARD_FOLDER}" (ID: ${rootIdCardId})`);

  // Fetch employees to create department & employee subfolders
  const employees = await Employee.find({});
  const departments = [...new Set(employees.map(e => e.department || 'General'))];

  for (const dept of departments) {
    const deptAttId = await getOrCreateFolder(drive, dept, rootAttendanceId);
    const deptIdCardId = await getOrCreateFolder(drive, dept, rootIdCardId);
    console.log(`  📂 Department Folder created: "${dept}"`);

    const deptEmployees = employees.filter(e => (e.department || 'General') === dept);
    for (const emp of deptEmployees) {
      const empFolderName = `${emp.employeeId} - ${emp.name}`;
      await getOrCreateFolder(drive, empFolderName, deptAttId);
      console.log(`    👤 Employee Folder created: "${empFolderName}"`);
    }
  }

  console.log('\n🎉 GOOGLE DRIVE FOLDER SYNC COMPLETE! Check your Google Drive now.');
  process.exit(0);
}

syncFolders().catch(err => {
  console.error('❌ Sync failed:', err.message);
  process.exit(1);
});
