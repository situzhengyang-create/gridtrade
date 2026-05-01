import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import yahooFinance from "yahoo-finance2";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Specific API for Stock KLine Data
  app.get("/api/stock/kline", async (req, res) => {
    const { symbol, period1, period2 } = req.query;
    if (!symbol || !period1 || !period2) {
      return res.status(400).json({ error: "Missing parameters. Need symbol, period1, period2 (YYYY-MM-DD)" });
    }

    try {
      // Yahoo finance requires .SS for Shanghai, .SZ for Shenzhen
      let yahooSymbol = (symbol as string).toUpperCase();
      if (yahooSymbol.startsWith('60') || yahooSymbol.startsWith('68')) {
        yahooSymbol += '.SS';
      } else if (yahooSymbol.startsWith('00') || yahooSymbol.startsWith('30')) {
        yahooSymbol += '.SZ';
      }

      const queryOptions = {
        period1: period1 as string,
        period2: period2 as string,
        interval: '1d' as const
      };

      const result = await yahooFinance.historical(yahooSymbol, queryOptions);
      res.json(result);
    } catch (error) {
      console.error("Stock KLine error:", error);
      res.status(500).json({ error: "Failed to fetch stock data from Yahoo" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production setup
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
