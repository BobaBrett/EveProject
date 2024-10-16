import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import { fetchMarketOrders } from './marketDataFetcher.js';
import { initializeDatabase, updateMarketData, getLatestMarketData, backupDatabase,  getLatestAuthToken } from './database.js';
import { initiatliseSDE, processSDE} from './sde.js';
import path from 'path';
import fs from 'fs';
import { exchangeToken, refreshToken } from './authController.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';



const swaggerDocument = YAML.load('./backend/swagger.yaml');




dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
let processState = null;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the database
initializeDatabase();

// // Scheduled task to fetch market data every 3 hours
// cron.schedule('0 */3 * * *', async () => {
//   console.log('Fetching market data...');
//   try {
//     const marketData = await fetchMarketOrders();
//     await updateMarketData(marketData);
//     console.log(`Fetched and updated ${marketData.length} market orders`);
//   } catch (error) {
//     console.error('Error fetching and updating market data:', error);
//   }
// });

// // Scheduled task to backup the database daily at midnight
// cron.schedule('0 0 * * *', async () => {
//   console.log('Backing up database...');
//   try {
//     await backupDatabase();
//     console.log('Database backup completed successfully');
//   } catch (error) {
//     console.error('Error backing up database:', error);
//   }
// });

// // Endpoint to get the latest market data
// app.get('/api/market-data', async (req, res) => {
//   try {
//     const latestMarketData = await getLatestMarketData();
//     res.json(latestMarketData);
//   } catch (error) {
//     console.error('Error retrieving market data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Endpoint to upload SDE file
// app.post('/api/upload-sde', upload.single('sde'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   const filePath = req.file.path;
  
//   // Start processing the SDE file
//   processState = "processing";
//   processSDE(filePath)
//     .then(() => {
//       console.log('SDE processing completed');
//       processState = "Complete";

//       // Clean up the uploaded file
//       fs.unlinkSync(filePath);
//     })
//     .catch((error) => {
//       console.error('Error processing SDE:', error);
//       processState = "Failed";
//       // Clean up the uploaded file
//       fs.unlinkSync(filePath);
//     });

//   res.json({ message: 'SDE file uploaded and processing started' });
// });

// // Endpoint to check SDE processing status
// app.get('/api/sde-status', (req, res) => {
//   // You'll need to implement a way to track the SDE processing status
//   // For now, we'll just return a mock status
//   res.json({ status: processState });
// });

// New endpoint to fetch character ID
app.get('/api/character-id', async (req, res) => {
  const accessToken = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

  try {
    const response = await axios.get('https://login.eveonline.com/oauth/verify', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { CharacterID } = response.data;
    res.json({ characterID: CharacterID });
  } catch (error) {
    console.error('Error fetching character ID:', error);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch character ID' });
  }
});

// Proxy endpoint
app.get('/api/esi/*', async (req, res) => {
  const esiUrl = `https://esi.evetech.net/latest/${req.params[0]}?datasource=tranquility`;
  const headers = {
    Authorization: req.headers.authorization, // Forward the Authorization header if needed
  };

  try {
    let allData = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await axios.get(`${esiUrl}&page=${page}`, { headers });
      allData = allData.concat(response.data);

      // Check if there are more pages
      totalPages = parseInt(response.headers['x-pages'] || '1', 10);
      page += 1;
    } while (page <= totalPages);

    res.json(allData);
  } catch (error) {
    console.error('Error fetching data from ESI:', error);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch data from ESI' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

// Auth endpoints
app.post('/api/auth/exchange-token', exchangeToken);
app.post('/api/auth/refresh-token', refreshToken);


// Initial fetch of market data when the server starts
//fetchMarketOrders()
//  .then(async data => {
//    await updateMarketData(data);
//    console.log(`Initial fetch: ${data.length} market orders updated in database`);
//  })
//  .catch(error => console.error('Error during initial market data fetch:', error));

