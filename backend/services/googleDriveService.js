import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const ROOT_FOLDER_NAME = 'THE SM GROUPS Attendance';
const ID_CARDS_ROOT_FOLDER = 'THE SM GROUPS ID Cards';

/**
 * Initialize Google Drive Client dynamically at runtime
 */
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

/**
 * Search or create a folder in Google Drive by name under a parent folder
 */
const getOrCreateDriveFolder = async (drive, folderName, parentId = null) => {
  if (!drive) return null;

  try {
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

    // Create new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id'
    });

    return folder.data.id;
  } catch (err) {
    console.error(`Google Drive Folder Error [${folderName}]:`, err.message);
    return null;
  }
};

/**
 * Upload Check-In Photo to Google Drive & Save Local Copy
 * Folder Structure:
 * THE SM GROUPS Attendance / [Department] / [EMP001 - John Doe] / [YYYY-MM-DD] / EMP001_check-in_09-12-35.jpg
 */
export const uploadCheckInPhoto = async ({
  fileBuffer,
  fileName,
  mimeType,
  department,
  employeeId,
  employeeName,
  dateStr
}) => {
  // 1. Always create local folder hierarchy & store local copy
  const sanitizedEmployeeFolder = `${employeeId} - ${employeeName.replace(/[/\\?%*:|"<>]/g, '')}`;
  const localRelativePath = path.join('uploads', 'attendance', department, sanitizedEmployeeFolder, dateStr);
  const localDir = path.join(process.cwd(), localRelativePath);

  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const localFilePath = path.join(localDir, fileName);
  fs.writeFileSync(localFilePath, fileBuffer);

  let driveFileId = null;
  let driveWebUrl = null;

  // 2. Upload to Google Drive if credentials exist
  const drive = getDriveClient();
  if (drive) {
    try {
      // Step A: Find or Create Root Folder ("THE SM GROUPS Attendance")
      const rootId = await getOrCreateDriveFolder(drive, ROOT_FOLDER_NAME);

      // Step B: Find or Create Department Folder (e.g. "Engineering")
      const deptId = await getOrCreateDriveFolder(drive, department, rootId);

      // Step C: Find or Create Employee Folder (e.g. "EMP001 - John Doe")
      const empFolderId = await getOrCreateDriveFolder(drive, `${employeeId} - ${employeeName}`, deptId);

      // Step D: Find or Create Date Folder (e.g. "2026-09-01")
      const dateFolderId = await getOrCreateDriveFolder(drive, dateStr, empFolderId);

      // Step E: Upload Photo File
      const fileMetadata = {
        name: fileName,
        ...(dateFolderId && { parents: [dateFolderId] })
      };

      const media = {
        mimeType: mimeType || 'image/jpeg',
        body: fs.createReadStream(localFilePath)
      };

      const uploadedFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink'
      });

      driveFileId = uploadedFile.data.id;
      driveWebUrl = uploadedFile.data.webViewLink || uploadedFile.data.webContentLink;
      console.log(`✓ Uploaded photo to Google Drive [${fileName}]: ID=${driveFileId}`);

    } catch (err) {
      console.error('Google Drive Photo Upload Error:', err.message);
    }
  }

  return {
    fileId: driveFileId || `LOCAL_${Date.now()}`,
    fileName: fileName,
    driveUrl: driveWebUrl || null,
    localPath: path.join(localRelativePath, fileName).replace(/\\/g, '/')
  };
};

/**
 * Get Google Drive File Stream / Local Stream for viewing photo
 */
export const getPhotoStream = async (attendanceRecord) => {
  const drive = getDriveClient();
  
  if (drive && attendanceRecord.checkInPhoto?.fileId && !attendanceRecord.checkInPhoto.fileId.startsWith('LOCAL_')) {
    try {
      const response = await drive.files.get(
        { fileId: attendanceRecord.checkInPhoto.fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return { stream: response.data, contentType: 'image/jpeg' };
    } catch (err) {
      console.error('Failed to stream photo from Google Drive, falling back to local file:', err.message);
    }
  }

  // Local fallback
  if (attendanceRecord.checkInPhoto?.localPath) {
    const fullPath = path.join(process.cwd(), attendanceRecord.checkInPhoto.localPath);
    if (fs.existsSync(fullPath)) {
      return { stream: fs.createReadStream(fullPath), contentType: 'image/jpeg' };
    }
  }

  throw new Error('Attendance photo file not found');
};

/**
 * Upload ID Card Image to Google Drive
 * Folder Structure:
 * THE SM GROUPS ID Cards / [Department] / [EMP001 - John Doe].png
 */
export const uploadIDCardToDrive = async ({
  base64Data,
  employeeId,
  employeeName,
  department
}) => {
  const drive = getDriveClient();
  if (!drive) {
    console.warn('Google Drive not configured — skipping ID card Drive upload');
    return null;
  }

  try {
    // Convert base64 to Buffer
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid base64 image data');
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${employeeId} - ${employeeName.replace(/[/\\?%*:|"<>]/g, '')}.${ext}`;

    // Get or create root ID Cards folder
    const rootId = await getOrCreateDriveFolder(drive, ID_CARDS_ROOT_FOLDER);
    // Get or create Department subfolder
    const deptId = await getOrCreateDriveFolder(drive, department || 'General', rootId);

    // Check if file already exists (to update it)
    const existing = await drive.files.list({
      q: `name = '${fileName.replace(/'/g, "\\'")}'  and '${deptId}' in parents and trashed = false`,
      fields: 'files(id)'
    });

    const { Readable } = await import('stream');
    const bodyStream = Readable.from(buffer);

    let uploadedFile;
    if (existing.data.files?.length > 0) {
      // Update existing file
      uploadedFile = await drive.files.update({
        fileId: existing.data.files[0].id,
        media: { mimeType, body: bodyStream },
        fields: 'id, webViewLink, webContentLink'
      });
    } else {
      // Create new file
      uploadedFile = await drive.files.create({
        requestBody: { name: fileName, parents: [deptId] },
        media: { mimeType, body: bodyStream },
        fields: 'id, webViewLink, webContentLink'
      });
    }

    // Make the file publicly viewable
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    // Return embeddable thumbnail URL (works reliably in <img> tags)
    const fileId = uploadedFile.data.id;
    const driveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1024`;
    console.log(`✓ ID Card uploaded to Google Drive [${fileName}]: ${driveUrl}`);
    return driveUrl;

  } catch (err) {
    console.error('Google Drive ID Card Upload Error:', err.message);
    return null;
  }
};

