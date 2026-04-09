import express from 'express';
import cors from 'cors';
import schedule from 'node-schedule';
import { scrapePrices, ModelPrice, FALLBACK_PRICES } from './scraper';

const app = express();
const port = 3001;

app.use(cors());

// In-memory cache
let cachedPrices: ModelPrice[] = [...FALLBACK_PRICES];
let lastUpdated: Date | null = null;
let updating = false;

// The endpoint to fetch prices
app.get('/api/prices', (req, res) => {
  res.json({
    data: cachedPrices,
    lastUpdated
  });
});

// Update job
async function updatePrices() {
  if (updating) {
    console.log('Skip updatePrices(): previous job still running');
    return;
  }
  updating = true;
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
  } finally {
    updating = false;
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
