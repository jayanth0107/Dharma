// Programmatically enable Google Geocoding API on dharmadaily-1fa89
// using the firebase-admin service-account key.
const { GoogleAuth } = require('google-auth-library');
const PROJECT_ID = 'dharmadaily-1fa89';
const SERVICE = 'geocoding-backend.googleapis.com';

(async () => {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();

    // Step 1: check current state
    const stateResp = await client.request({
      url: `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${SERVICE}`,
    });
    console.log('Current state:', stateResp.data?.state || 'unknown');

    if (stateResp.data?.state === 'ENABLED') {
      console.log('Already enabled — nothing to do.');
      return;
    }

    // Step 2: enable
    console.log('Enabling', SERVICE, 'on', PROJECT_ID, '...');
    const enableResp = await client.request({
      url: `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${SERVICE}:enable`,
      method: 'POST',
    });
    console.log('Enable response (operation):', JSON.stringify(enableResp.data).slice(0, 300));

    // Step 3: re-check state (may take a moment)
    await new Promise(r => setTimeout(r, 5000));
    const after = await client.request({
      url: `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${SERVICE}`,
    });
    console.log('Post-enable state:', after.data?.state || 'unknown');
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response?.data) console.error('Body:', JSON.stringify(e.response.data).slice(0, 500));
    process.exit(1);
  }
})();
