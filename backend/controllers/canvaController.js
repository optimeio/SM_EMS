import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// In-memory or database token cache for Canva API access token
let canvaTokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

/**
 * @desc    Get Canva API status and template info
 * @route   GET /api/canva/status
 * @access  Public
 */
export const getCanvaStatus = async (req, res) => {
  try {
    const isConfigured = Boolean(
      process.env.CANVA_CLIENT_ID &&
      process.env.CANVA_CLIENT_SECRET &&
      process.env.CANVA_TEMPLATE_ID
    );

    res.json({
      configured: isConfigured,
      clientId: process.env.CANVA_CLIENT_ID || null,
      templateId: process.env.CANVA_TEMPLATE_ID || 'DAHT2AZD4rw',
      templateUrl: process.env.CANVA_TEMPLATE_URL || 'https://canva.link/rmuleulxpdvg2nd',
      redirectUri: process.env.CANVA_REDIRECT_URI || 'http://127.0.0.1:5000/api/canva/callback',
      isConnected: Boolean(canvaTokenStore.accessToken),
      tokenExpiresAt: canvaTokenStore.expiresAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Generate Canva OAuth2 Authorization URL
 * @route   GET /api/canva/auth-url
 * @access  Public
 */
export const getCanvaAuthUrl = (req, res) => {
  const clientId = process.env.CANVA_CLIENT_ID || 'OC-AaBXUrmzaBx1';
  const redirectUri = process.env.CANVA_REDIRECT_URI || 'http://127.0.0.1:5000/api/canva/callback';
  
  const scopes = [
    'brandtemplate:meta:read',
    'brandtemplate:content:write',
    'design:content:write',
    'design:meta:read',
    'asset:read',
    'asset:write'
  ].join(' ');

  const authUrl = `https://www.canva.com/api/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

  res.json({ authUrl });
};

/**
 * @desc    Handle Canva OAuth2 Callback
 * @route   GET /api/canva/callback
 * @access  Public
 */
export const canvaCallback = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  const redirectUri = process.env.CANVA_REDIRECT_URI;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post(
      'https://api.canva.com/v1/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    canvaTokenStore = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
          <h2 style="color: #059669;">Canva Integration Connected Successfully!</h2>
          <p>Template ID: <strong>${process.env.CANVA_TEMPLATE_ID}</strong></p>
          <p>You can close this window and return to your application.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage('canva_connected', '*');
            }
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Canva Token Exchange Error:', err.response?.data || err.message);
    res.status(500).send(`Canva Authentication Failed: ${err.response?.data?.error_description || err.message}`);
  }
};

/**
 * @desc    Autofill Canva Brand Template for an Employee
 * @route   POST /api/canva/autofill
 * @access  Public
 */
export const autofillCanvaTemplate = async (req, res) => {
  const { employeeId, name, designation, department, phone, dateOfBirth, bloodGroup } = req.body;
  const templateId = process.env.CANVA_TEMPLATE_ID || 'DAHT2AZD4rw';

  if (!canvaTokenStore.accessToken) {
    const clientId = process.env.CANVA_CLIENT_ID || 'OC-AaBXUrmzaBx1';
    const redirectUri = process.env.CANVA_REDIRECT_URI || 'http://127.0.0.1:5000/api/canva/callback';
    const scopes = ['brandtemplate:meta:read', 'brandtemplate:content:write', 'design:content:write', 'design:meta:read', 'asset:read', 'asset:write'].join(' ');
    const authUrl = `https://www.canva.com/api/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

    return res.status(200).json({
      success: false,
      needsAuth: true,
      authUrl: authUrl,
      message: 'Canva authorization required. Opening Canva OAuth window...',
      templateId: templateId
    });
  }

  try {
    const response = await axios.post(
      `https://api.canva.com/v1/brand-templates/${templateId}/autofill`,
      {
        title: `ID Card - ${name} (${employeeId})`,
        data: {
          employee_name: { type: 'text', text: name },
          designation: { type: 'text', text: designation || 'SALES EXECUTIVE' },
          employee_id: { type: 'text', text: employeeId },
          date_of_birth: { type: 'text', text: dateOfBirth || '02/04/2004' },
          blood_group: { type: 'text', text: bloodGroup || 'O+ve' },
          department: { type: 'text', text: department },
          contact_number: { type: 'text', text: phone }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${canvaTokenStore.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      job: response.data.job,
      templateId: templateId
    });
  } catch (err) {
    console.error('Canva Autofill Error:', err.response?.data || err.message);
    res.status(500).json({
      message: err.response?.data?.message || err.message,
      canvaError: err.response?.data || null
    });
  }
};
