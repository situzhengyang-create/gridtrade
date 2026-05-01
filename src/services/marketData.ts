import { BacktestResult } from '../types';
import { RawData } from './gridDiagnosticService';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24小时缓存

const getCache = (key: string) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL_MS) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
};

const setCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

async function fetchFromBackend(symbol: string) {
    const end = new Date().toISOString().slice(0,10);
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const start = threeYearsAgo.toISOString().slice(0,10);
    
    const response = await fetch(`/api/stock/kline?symbol=${symbol}&period1=${start}&period2=${end}`);
    if (!response.ok) throw new Error('Backend fetch failed');
    return await response.json();
}

export async function fetchBacktestData(symbol: string): Promise<BacktestResult | null> {
  const cacheKey = `backtest_${symbol}_${new Date().toISOString().slice(0, 10)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromBackend(symbol);
    
    // Yahoo finance data structure: array of objects {date, open, high, low, close, ...}
    // We need to map this to the expected klines format (or adjust the processing logic below)
    // Actually, I will simplify the processing logic to match the new structure now that I have reliable data.
    
    // For now, let's assume result is array of {date: Date, open: number, high: number, low: number, close: number}
    const klines = data.map((d: any) => ({
      date: new Date(d.date).toISOString().slice(0,10),
      high: d.high,
      low: d.low,
      close: d.close,
      amplitude: d.high > 0 ? (d.high - d.low) / d.high * 100 : 0
    }));

    // 1 year threshold
    const oneYearAgoStr = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
    
    let totalAmplitude = 0;
    
    let maxPriceSeen3Y = -1;
    let maxDrawdown3Y = 0;
    
    let globalMin1Y = Infinity;
    let globalMax1Y = -1;

    for (const k of klines) {
      if (k.high > maxPriceSeen3Y) maxPriceSeen3Y = k.high;
      if (maxPriceSeen3Y > 0) {
        const drawdown = (maxPriceSeen3Y - k.low) / maxPriceSeen3Y * 100;
        if (drawdown > maxDrawdown3Y) maxDrawdown3Y = drawdown;
      }

      if (k.date >= oneYearAgoStr) {
        totalAmplitude += k.amplitude;
        if (k.high > globalMax1Y) globalMax1Y = k.high;
        if (k.low < globalMin1Y) globalMin1Y = k.low;
      }
    }
    
    const amplitudeCount = klines.filter(k => k.date >= oneYearAgoStr).length;
    const averageAmplitude = amplitudeCount > 0 ? totalAmplitude / amplitudeCount : 0;
    
    const result = {
      averageAmplitude: Number(averageAmplitude.toFixed(2)),
      medianAmplitude: Number(averageAmplitude.toFixed(2)), // simplification
      maxDrawdown: Number(maxDrawdown3Y.toFixed(2)),
      minPrice: globalMin1Y === Infinity ? 0 : globalMin1Y,
      maxPrice: globalMax1Y,
      suggestedGridInterval: Number(Math.max(0.1, Math.min(averageAmplitude, 10)).toFixed(2)),
      suggestedBottom: Number(((globalMin1Y === Infinity ? 0 : globalMin1Y) * 0.9).toFixed(3)),
      suggestedTop: Number((globalMax1Y * 1.1).toFixed(3)),
      updatedAt: Date.now()
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Error fetching backtest data:', err);
    return null;
  }
}

export async function fetchDiagnosticData(symbol: string): Promise<RawData[] | null> {
  const cacheKey = `diag_${symbol}_${new Date().toISOString().slice(0, 10)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromBackend(symbol);
    
    // Yahoo finance data structure: array of objects {date, open, high, low, close, ...}
    const result: RawData[] = data.map((d: any) => ({
      date: new Date(d.date).toISOString().slice(0,10),
      open: d.open,
      close: d.close,
      high: d.high,
      low: d.low,
      change_pct: d.open > 0 ? (d.close - d.open) / d.open * 100 : 0
    }));

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Error fetching diagnosis data:', err);
    return null;
  }
}
