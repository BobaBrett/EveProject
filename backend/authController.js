import axios from 'axios';
import { EVE_CLIENT_ID, EVE_CLIENT_SECRET, FRONTEND_URL } from './config/config.js';
//import { getDatabase } from './database.js'; // Import the database instance

export const exchangeToken = async (req, res) => {
  const { code } = req.body;

  console.log('Test123', 'test123')
  console.log('Authorization Code:', code);

  try {
    const response = await axios.post('https://login.eveonline.com/v2/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${FRONTEND_URL}/callback`, // Ensure this matches your registered redirect URI
      client_id: EVE_CLIENT_ID,
      client_secret: EVE_CLIENT_SECRET      
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log('ClientID', EVE_CLIENT_ID);
    console.log('Secret', EVE_CLIENT_SECRET);

      // Log the authorization code
   
    // In a real application, you'd store these tokens securely (e.g., encrypted in a database)
    // and associate them with the user's session
    const { access_token, refresh_token } = response.data;

     // Store the tokens in the database
     // const db = await getDatabase();
     // await db.run(`
     //  INSERT INTO auth_tokens (access_token, refresh_token)
     //  VALUES (?, ?)
     //`, [access_token, refresh_token]);

    res.json({ access_token, refresh_token });
    console.log('Success', 'True')
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
    console.log('Success', 'False')
  }
};

export const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const response = await axios.post('https://login.eveonline.com/v2/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: EVE_CLIENT_ID,
      client_secret: EVE_CLIENT_SECRET,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token: new_refresh_token } = response.data;

    res.json({ access_token, refresh_token: new_refresh_token });
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};