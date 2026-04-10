const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://help.aliyun.com/zh/model-studio/getting-started/models', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table');
  const alibabaPrices = await page.evaluate(() => {
      const models = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
          const rawName = row.innerText.trim().split('\n')[0].trim();
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
          if ((id.includes('qwen') || id.includes('通义')) && 
              (id.includes('max') || id.includes('plus') || id.includes('flash') || id.includes('vl'))) {
            const extractNum = (str) => {
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
              }
              return val;
            };
            const priceCells = Array.from(cells).map(c => c.innerText.trim()).filter(t => t.includes('元') || /^[0-9]+\.?[0-9]*$/.test(t));
            if (priceCells.length >= 2) {
                const cleanStr = (s) => {
                  let cleaned = s.replace(/.*≤\s*[0-9]+[KkMm]?\s*/g, '');
                  const trailingPriceMatch = cleaned.match(/([0-9]+\.?[0-9]*)\s*元/);
                  if (trailingPriceMatch) return trailingPriceMatch[1];
                  return cleaned;
                };
                const inputPrice = extractNum(cleanStr(priceCells[0]));
                const outputPrice = extractNum(cleanStr(priceCells[1]));
                if (inputPrice !== null && outputPrice !== null) {
                  models.push({ id, name: cleanName, inputPrice, outputPrice, raw: rawName });
                }
            }
          }
        }
      });
      return models;
  });
  console.log(alibabaPrices);
  await browser.close();
})();
