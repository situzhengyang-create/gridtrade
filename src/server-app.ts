import express from 'express';
import axios from 'axios';
import iconv from 'iconv-lite';

const app = express();

// JSON parsing middleware
app.use(express.json());

// API Proxy Route for Market Data (EastMoney)
app.get('/api/proxy/market-data', async (req, res) => {
  const { secid, beg, end } = req.query;
  
  try {
    if (!secid || !beg || !end) {
      return res.status(400).json({ error: 'Missing required parameters: secid, beg, end' });
    }

    const eastMoneyUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&ut=7eea3edcaed734bea9cbfc24409ed989&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&beg=${beg}&end=${end}`;
    
    const response = await axios.get(eastMoneyUrl, {
      timeout: 10000,
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error(`[Proxy Error] EastMoney: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to fetch market data', 
      details: error.message 
    });
  }
});

// API Proxy Route for Tencent Market Data
app.get('/api/proxy/tencent-quote', async (req, res) => {
  const { q } = req.query;
  
  try {
    if (!q) {
      return res.status(400).json({ error: 'Missing parameter q' });
    }

    const tencentUrl = `https://qt.gtimg.cn/q=${q}`;
    const response = await axios.get(tencentUrl, {
      timeout: 8000,
      responseType: 'arraybuffer', // Get raw bytes for GBK decoding
      headers: {
        'Referer': 'https://gu.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    
    // Decode GBK to UTF-8
    const decodedText = iconv.decode(Buffer.from(response.data), 'gbk');
    res.send(decodedText);
  } catch (error: any) {
     console.error(`[Proxy Error] Tencent: ${error.message}`);
     res.status(500).json({ 
       error: 'Failed to fetch tencent quote',
       details: error.message
     });
  }
});

export default app;
