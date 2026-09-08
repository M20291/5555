import { google } from 'googleapis';
import WebTorrent from 'webtorrent';
import { Readable } from 'stream';

// Initialize Google Drive client
async function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('Token refreshed successfully using refresh token');
  } catch (error) {
    console.error('Failed to refresh token:', error.message);
    throw new Error('Failed to refresh access token. Please check your OAuth credentials.');
  }

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Download torrent from magnet link
async function downloadFromMagnet(magnetUri, timeout = 900000) {
  return new Promise((resolve, reject) => {
    const client = new WebTorrent();
    
    client.add(magnetUri, { path: '/tmp' }, (torrent) => {
      console.log('Torrent added:', torrent.name);
      
      // Wait for the first file to download
      const file = torrent.files[0];
      if (!file) {
        client.destroy();
        return reject(new Error('No files in torrent'));
      }

      console.log('Downloading file:', file.name);
      
      // Create a buffer to store the file
      const chunks = [];
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });

      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        client.destroy();
        resolve({
          buffer: buffer,
          fileName: file.name,
          mimeType: file.name.endsWith('.mp4') ? 'video/mp4' : 
                   file.name.endsWith('.mp3') ? 'audio/mpeg' :
                   file.name.endsWith('.pdf') ? 'application/pdf' :
                   'application/octet-stream'
        });
      });

      file.on('error', (err) => {
        client.destroy();
        reject(err);
      });
    });

    client.on('error', (err) => {
      client.destroy();
      reject(err);
    });

    // Timeout handling
    setTimeout(() => {
      client.destroy();
      reject(new Error('Download timeout'));
    }, timeout);
  });
}

// Upload file to Google Drive
async function uploadToDrive(drive, fileBuffer, fileName, mimeType) {
  const fileMetadata = {
    name: fileName,
  };

  const bufferStream = new Readable();
  bufferStream.push(fileBuffer);
  bufferStream.push(null);

  const media = {
    mimeType: mimeType,
    body: bufferStream,
  };

  const result = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink',
  });

  return result.data;
}

// Main handler for Express
export async function magnetHandler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { magnetUri, fileName, mimeType, timeout } = req.body;

    if (!magnetUri) {
      return res.status(400).json({ error: 'Magnet URI is required' });
    }

    if (!magnetUri.startsWith('magnet:')) {
      return res.status(400).json({ error: 'Invalid magnet URI' });
    }

    console.log('Starting download from magnet:', magnetUri);
    
    // Download from magnet
    const { buffer, fileName: downloadedFileName, mimeType: downloadedMimeType } = 
      await downloadFromMagnet(magnetUri, timeout || 900000);

    console.log('Download completed, uploading to Drive...');

    // Upload to Google Drive
    const drive = await getDriveClient();
    const uploadResult = await uploadToDrive(
      drive,
      buffer,
      fileName || downloadedFileName,
      mimeType || downloadedMimeType
    );

    res.status(200).json({
      success: true,
      file: uploadResult,
      message: 'File downloaded from magnet and uploaded successfully to Google Drive',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to process magnet link',
      details: error.message,
    });
  }
}