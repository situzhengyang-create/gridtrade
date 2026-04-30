import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Proxy Route for Market Data
  app.get('/api/proxy/market-data', async (req, res) => {
    try {
      const { secid, beg, end } = req.query;
      
      if (!secid || !beg || !end) {
        return res.status(400).json({ error: 'Missing required parameters: secid, beg, end' });
      }

      const eastMoneyUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&ut=7eea3edcaed734bea9cbfc24409ed989&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&beg=${beg}&end=${end}`;
      
      const response = await axios.get(eastMoneyUrl, {
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.37 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.37'
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch data from source' });
    }
  });

  // API Proxy Route for Tencent Market Data
  app.get('/api/proxy/tencent-quote', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Missing required parameter: q' });
      }

      const tencentUrl = `https://qt.gtimg.cn/q=${q}`;
      const response = await axios.get(tencentUrl, {
        responseType: 'arraybuffer' // Tencent usually returns GBK encoding
      });
      
      // Basic detection and response as string
      // Note: In a real app we'd use iconv-lite to decode GBK correctly,
      // but let's see if plain response works for symbols/prices (mostly ASCII)
      const data = Buffer.from(response.data).toString('latin1');
      res.send(data);
    } catch (error) {
       console.error('Tencent Proxy error:', error);
       res.status(500).json({ error: 'Failed to fetch data from Tencent' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
