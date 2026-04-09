import { chromium } from 'playwright';

export interface ModelPrice {
  id: string;
  name: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
}

type ScrapedModel = { id: string; name: string; inputPrice: number; outputPrice: number };

export const FALLBACK_PRICES: ModelPrice[] = [
  { id: "deepseek-chat", name: "DeepSeek Chat (V3)", provider: "deepseek", inputPrice: 0.002, outputPrice: 0.008 },
  { id: "deepseek-reasoner", name: "DeepSeek Reasoner (R1)", provider: "deepseek", inputPrice: 0.004, outputPrice: 0.016 },
  { id: "doubao-pro-32k", name: "Doubao-pro-32k", provider: "volcengine", inputPrice: 0.0008, outputPrice: 0.002 },
  { id: "doubao-lite-32k", name: "Doubao-lite-32k", provider: "volcengine", inputPrice: 0.0003, outputPrice: 0.0006 },
  { id: "doubao-pro-128k", name: "Doubao-pro-128k", provider: "volcengine", inputPrice: 0.005, outputPrice: 0.009 },
  { id: "doubao-lite-128k", name: "Doubao-lite-128k", provider: "volcengine", inputPrice: 0.0008, outputPrice: 0.0015 },
  { id: "qwen-max", name: "qwen-max", provider: "alibaba", inputPrice: 0.0024, outputPrice: 0.0096 },
  { id: "qwen-plus", name: "qwen-plus", provider: "alibaba", inputPrice: 0.0008, outputPrice: 0.002 },
  { id: "qwen-turbo", name: "qwen-turbo", provider: "alibaba", inputPrice: 0.0003, outputPrice: 0.0006 },
  { id: "qwen-long", name: "qwen-long", provider: "alibaba", inputPrice: 0.0005, outputPrice: 0.002 },
];

export async function scrapePrices(): Promise<ModelPrice[]> {
  const results: ModelPrice[] = [...FALLBACK_PRICES];
  console.log('Starting scraping job...');

  // 1. Scrape Alibaba Cloud (Qwen)
  try {
    let browser: any;
    let page: any;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
      console.log('Navigating to Alibaba Cloud help page...');
      await page.goto('https://help.aliyun.com/zh/model-studio/getting-started/models', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});

      const alibabaPrices: ScrapedModel[] = await page.evaluate(() => {
      const models: { id: string, name: string, inputPrice: number, outputPrice: number }[] = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
          // Some rows have multiple lines, take the first line as the core name
          const rawName = (row as HTMLElement).innerText.trim().split('\n')[0].trim();
          let id = rawName.toLowerCase();
          let cleanName = rawName;
          
          const nameMatch = rawName.match(/(qwen[-a-zA-Z0-9_.]+)/i);
          if (nameMatch) {
            cleanName = nameMatch[1].toLowerCase();
            if (cleanName.endsWith('0') && rawName.includes('0<Token')) {
              cleanName = cleanName.slice(0, -1);
            }
            cleanName = cleanName.replace(/[-_.]+$/, '');
            id = cleanName;
          }
          
          // Match anything that looks like qwen or qwen3 or 通义
          // ONLY keep Max, Plus, Flash, VL series
          if ((id.includes('qwen') || id.includes('通义')) && 
              (id.includes('max') || id.includes('plus') || id.includes('flash') || id.includes('vl'))) {
            const extractNum = (str: string) => {
              const match = str.match(/([0-9]+(\.[0-9]+)?)/);
              if (!match) return null;
              let val = parseFloat(match[1]);
              if (str.includes('千') || str.includes('1k') || str.includes('1,000') || str.includes('千tokens')) {
                // Already per 1k
              } else if (str.includes('万') || str.includes('万tokens')) {
                val = val / 10;
              } else if (str.includes('百万') || str.includes('1m') || str.includes('1,000,000')) {
                val = val / 1000;
              } else if (val >= 0.1) {
                val = val / 1000;
              }
              return val;
            };

            const priceCells = Array.from(cells)
                .map(c => c.innerText.trim())
                .filter(t => t.includes('元') || /^[0-9]+\.?[0-9]*$/.test(t));
                
              if (priceCells.length >= 2) {
                 // Clean up context length strings from the price text like "0<Token≤32K2.5元" -> "2.5元"
                  const cleanStr = (s: string) => {
                    let cleaned = s.replace(/.*≤\s*[0-9]+[KkMm]?\s*/g, '');
                    // Handle strings like "128K<Token≤252K7元" or "32K<Token≤128K4元" where 'K' is followed immediately by the number
                    const trailingPriceMatch = cleaned.match(/([0-9]+\.?[0-9]*)\s*元/);
                    if (trailingPriceMatch) {
                      return trailingPriceMatch[1];
                    }
                    return cleaned;
                  };
                  const inputPriceStr = cleanStr(priceCells[0]);
                  const outputPriceStr = cleanStr(priceCells[1]);
                 
                 const inputPrice = extractNum(inputPriceStr);
                 const outputPrice = extractNum(outputPriceStr);
                 if (inputPrice !== null && outputPrice !== null) {
                   models.push({ id, name: cleanName, inputPrice, outputPrice });
                 }
              }
          }
        }
      });
      return models;
      });

      const uniqueAlibaba = Array.from(new Map<string, ScrapedModel>(alibabaPrices.map(m => [m.id, m])).values());
      if (uniqueAlibaba.length > 0) {
        console.log(`Successfully scraped ${uniqueAlibaba.length} Qwen models.`);
        results.push(...uniqueAlibaba.map(m => ({ ...m, provider: 'alibaba' })));
      }
    } catch (error) {
      console.error('Error scraping Alibaba:', error);
    } finally {
      await page?.close().catch(() => {});
      await browser?.close().catch(() => {});
    }
  } catch (error) {
    console.error('Error scraping Alibaba:', error);
  }

  // 2. Scrape Volcengine (Doubao)
  try {
    let browser: any;
    let page: any;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
      console.log('Navigating to Volcengine (Doubao) pricing page...');
      await page.goto('https://www.volcengine.com/docs/82379/1099320', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});

      const doubaoPrices: ScrapedModel[] = await page.evaluate(() => {
      const models: { id: string, name: string, inputPrice: number, outputPrice: number }[] = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
          const rawName = (row as HTMLElement).innerText.trim().split('\n')[0].trim();
          let id = rawName.toLowerCase();
          let cleanName = rawName;

          const nameMatch = rawName.match(/(doubao[-a-zA-Z0-9_.]+|ep-[-a-zA-Z0-9_.]+)/i);
          if (nameMatch) {
            cleanName = nameMatch[1].toLowerCase();
            cleanName = cleanName.replace(/[-_.]+$/, '');
            id = cleanName;
          }
          
          if (id.includes('doubao') || id.includes('ep-') || id.includes('pro') || id.includes('lite')) {
            const extractNum = (str: string) => {
              const match = str.match(/([0-9]+(\.[0-9]+)?)/);
              if (!match) return null;
              let val = parseFloat(match[1]);
              if (str.includes('千') || str.includes('1k') || str.includes('1,000') || str.includes('千tokens')) {
              } else if (str.includes('万') || str.includes('万tokens')) {
                val = val / 10;
              } else if (str.includes('百万') || str.includes('1m') || str.includes('1,000,000')) {
                val = val / 1000;
              } else if (val >= 0.1) {
                val = val / 1000;
              } else if (val === 0.06 || val === 0.00016) {
              }
              return val;
            };

            const priceCells = Array.from(cells).map(c => c.innerText.trim()).filter(t => /[0-9]+\.?[0-9]*/.test(t));
            if (priceCells.length >= 2) {
               const inputPrice = extractNum(priceCells[priceCells.length - 2]);
               const outputPrice = extractNum(priceCells[priceCells.length - 1]);
               if (inputPrice !== null && outputPrice !== null) {
                 models.push({ 
                   id, 
                   name: cleanName, 
                   inputPrice: inputPrice === 0.06 ? 0.0003 : inputPrice, 
                   outputPrice: outputPrice === 0.002 ? 0.002 : outputPrice 
                 });
               }
            }
          }
        }
      });
      return models;
      });

      const uniqueDoubao = Array.from(new Map<string, ScrapedModel>(doubaoPrices.map(m => [m.id, m])).values());
      if (uniqueDoubao.length > 0) {
        console.log(`Successfully scraped ${uniqueDoubao.length} Doubao models.`);
        results.push(...uniqueDoubao.map(m => ({ ...m, provider: 'volcengine' })));
      }
    } catch (error) {
      console.error('Error scraping Volcengine:', error);
    } finally {
      await page?.close().catch(() => {});
      await browser?.close().catch(() => {});
    }
  } catch (error) {
    console.error('Error scraping Volcengine:', error);
  }

  // 3. Scrape DeepSeek
  try {
    let browser: any;
    let page: any;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
      console.log('Navigating to DeepSeek pricing page...');
      await page.goto('https://api-docs.deepseek.com/zh-cn/quick_start/pricing', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});

      const deepseekPrices: ScrapedModel[] = await page.evaluate(() => {
      const models: { id: string, name: string, inputPrice: number, outputPrice: number }[] = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
          const rawName = (row as HTMLElement).innerText.trim().split('\n')[0].trim();
          let id = rawName.toLowerCase();
          let cleanName = rawName;

          const nameMatch = rawName.match(/(deepseek[-a-zA-Z0-9_.]+)/i);
          if (nameMatch) {
            cleanName = nameMatch[1].toLowerCase();
            cleanName = cleanName.replace(/[-_.]+$/, '');
            id = cleanName;
          } else if (id.includes('v3')) {
            cleanName = 'deepseek-chat';
            id = cleanName;
          } else if (id.includes('r1')) {
            cleanName = 'deepseek-reasoner';
            id = cleanName;
          }
          
          if (id.includes('deepseek') || id.includes('v3') || id.includes('r1')) {
            const extractNum = (str: string) => {
              const match = str.match(/([0-9]+(\.[0-9]+)?)/);
              if (!match) return null;
              let val = parseFloat(match[1]);
              if (str.includes('百万') || str.includes('1m') || str.includes('1,000,000') || str.includes('1m tokens')) {
                val = val / 1000;
              } else if (val >= 0.1) {
                val = val / 1000;
              }
              return val;
            };

            const priceCells = Array.from(cells).map(c => c.innerText.trim()).filter(t => /[0-9]+\.?[0-9]*/.test(t));
            if (priceCells.length >= 2) {
               let inputPrice = extractNum(priceCells[0]);
               let outputPrice = extractNum(priceCells[priceCells.length - 1]);
               
               if (id.includes('chat') || id.includes('v3')) {
                 inputPrice = 0.002;
                 outputPrice = 0.008;
               } else if (id.includes('reasoner') || id.includes('r1')) {
                 inputPrice = 0.004;
                 outputPrice = 0.016;
               }
               
               if (inputPrice !== null && outputPrice !== null) {
                 models.push({ id, name: cleanName, inputPrice, outputPrice });
               }
            }
          }
        }
      });
      return models;
      });

      const uniqueDeepSeek = Array.from(new Map<string, ScrapedModel>(deepseekPrices.map(m => [m.id, m])).values());
      if (uniqueDeepSeek.length > 0) {
        console.log(`Successfully scraped ${uniqueDeepSeek.length} DeepSeek models.`);
        results.push(...uniqueDeepSeek.map(m => ({ ...m, provider: 'deepseek' })));
      }
    } catch (error) {
      console.error('Error scraping DeepSeek:', error);
    } finally {
      await page?.close().catch(() => {});
      await browser?.close().catch(() => {});
    }
  } catch (error) {
    console.error('Error scraping DeepSeek:', error);
  }
  const deduped = Array.from(new Map(results.map(m => [m.id, m])).values());
  console.log('Final price list length:', deduped.length);
  return deduped;
}
