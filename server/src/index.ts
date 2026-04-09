import express from 'express';
import cors from 'cors';
import schedule from 'node-schedule';
import { scrapePrices, ModelPrice } from './scraper';

const app = express();
const port = 3001;

app.use(cors());

// In-memory cache
let cachedPrices: ModelPrice[] = [];
let lastUpdated: Date | null = null;

// The endpoint to fetch prices
app.get('/api/prices', (req, res) => {
  if (cachedPrices.length === 0) {
    // If not ready, return 503 or a partial fallback. 
    return res.status(503).json({ error: 'Data not ready yet, please try again later.' });
  }
  
  res.json({
    data: cachedPrices,
    lastUpdated
  });
});

// Update job
async function updatePrices() {
  console.log('--- Scheduled Job: Updating prices ---');
  try {
    const prices = await scrapePrices();
    if (prices.length > 0) {
      cachedPrices = prices;
      lastUpdated = new Date();
      console.log(`Prices updated successfully at ${lastUpdated.toISOString()}`);
    }
  } catch (error) {
    console.error('Failed to update prices:', error);
  }
}

// Start server and initialize data
// Listen on all network interfaces (0.0.0.0) so other devices on the LAN can access it
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  
  // Initial fetch
  await updatePrices();
  
  // Schedule to run every hour (e.g., at minute 0)
  schedule.scheduleJob('0 * * * *', updatePrices);
});
