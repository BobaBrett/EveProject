import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import multer from 'multer';
import { fetchMarketOrders } from './marketDataFetcher.js';
import { initializeDatabase, updateMarketData, getLatestMarketData, backupDatabase } from './database.js';
import { initiatliseSDE, processSDE} from './sde.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
let processState = null;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the database
initializeDatabase();

// Scheduled task to fetch market data every 3 hours
cron.schedule('0 */3 * * *', async () => {
  console.log('Fetching market data...');
  try {
    const marketData = await fetchMarketOrders();
    await updateMarketData(marketData);
    console.log(`Fetched and updated ${marketData.length} market orders`);
  } catch (error) {
    console.error('Error fetching and updating market data:', error);
  }
});

// Scheduled task to backup the database daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Backing up database...');
  try {
    await backupDatabase();
    console.log('Database backup completed successfully');
  } catch (error) {
    console.error('Error backing up database:', error);
  }
});

// Endpoint to get the latest market data
app.get('/api/market-data', async (req, res) => {
  try {
    const latestMarketData = await getLatestMarketData();
    res.json(latestMarketData);
  } catch (error) {
    console.error('Error retrieving market data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to upload SDE file
app.post('/api/upload-sde', upload.single('sde'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  
  // Start processing the SDE file
  processState = "processing";
  processSDE(filePath)
    .then(() => {
      console.log('SDE processing completed');
      processState = "Complete";

      // Clean up the uploaded file
      fs.unlinkSync(filePath);
    })
    .catch((error) => {
      console.error('Error processing SDE:', error);
      processState = "Failed";
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
    });

  res.json({ message: 'SDE file uploaded and processing started' });
});

// Endpoint to check SDE processing status
app.get('/api/sde-status', (req, res) => {
  // You'll need to implement a way to track the SDE processing status
  // For now, we'll just return a mock status
  res.json({ status: processState });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

// Initial fetch of market data when the server starts
fetchMarketOrders()
  .then(async data => {
    await updateMarketData(data);
    console.log(`Initial fetch: ${data.length} market orders updated in database`);
  })
  .catch(error => console.error('Error during initial market data fetch:', error));
