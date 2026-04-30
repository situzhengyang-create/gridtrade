import axios from 'axios';
import { BacktestResult } from '../types';
import { RawData } from './gridDiagnosticService';

export async function fetchBacktestData(symbol: string): Promise<BacktestResult | null> {
  try {
    const formattedSymbol = symbol.toLowerCase().replace(/sh|sz/, '');
      
    const end = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const start = threeYearsAgo.toISOString().slice(0,10).replace(/-/g, '');
    
    let data = null;
    
    // 尝试两个市场的前缀: 0(深交所) 和 1(上交所)
    for (const prefix of ['0', '1']) {
      const secid = `${prefix}.${formattedSymbol}`;
      const url = `/api/proxy/market-data?secid=${secid}&beg=${start}&end=${end}`;
      
      const response = await axios.get(url);
      if (response.data && response.data.data && response.data.data.klines && response.data.data.klines.length > 0) {
        data = response.data.data;
        break;
      }
    }
    
    if (!data) {
      return null;
    }

    const klines = data.klines;
    
    // 1 year threshold for amplitude/min/max
    const oneYearAgoStr = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
    
    let totalAmplitude = 0;
    let amplitudeCount = 0;
    let amplitudes1Y: number[] = [];
    
    let maxPriceSeen3Y = -1;
    let maxDrawdown3Y = 0;
    
    let globalMin1Y = Infinity;
    let globalMax1Y = -1;

    for (const kline of klines) {
      const parts = kline.split(',');
      // f51: Date(YYYY-MM-DD), f52: Open, f53: Close, f54: High, f55: Low ... f58: Amplitude(%)
      const dateStr = parts[0];
      const high = parseFloat(parts[3]);
      const low = parseFloat(parts[4]);
      const amplitude = parseFloat(parts[7]);

      // Drawdown calculation (3 Years)
      if (high > maxPriceSeen3Y) {
        maxPriceSeen3Y = high;
      }
      if (maxPriceSeen3Y > 0) {
        const drawdown = (maxPriceSeen3Y - low) / maxPriceSeen3Y * 100;
        if (drawdown > maxDrawdown3Y) {
          maxDrawdown3Y = drawdown;
        }
      }

      // 1 Year metrics
      if (dateStr >= oneYearAgoStr) {
        if (!isNaN(amplitude)) {
          totalAmplitude += amplitude;
          amplitudeCount++;
          amplitudes1Y.push(amplitude);
        }
        if (high > globalMax1Y) globalMax1Y = high;
        if (low < globalMin1Y) globalMin1Y = low;
      }
    }

    // In case no data is available for 1 year (e.g., IPO < 1 year ago), fallback to 3Y data for min/max
    if (globalMin1Y === Infinity) {
      // Just use the last available data or leave it as is, but practically it should exist
      globalMin1Y = klines.length > 0 ? parseFloat(klines[klines.length-1].split(',')[4]) : 0;
      globalMax1Y = klines.length > 0 ? parseFloat(klines[klines.length-1].split(',')[3]) : 0;
    }

    const averageAmplitude = amplitudeCount > 0 ? totalAmplitude / amplitudeCount : 0;
    
    let medianAmplitude = averageAmplitude;
    if (amplitudes1Y.length > 0) {
      amplitudes1Y.sort((a, b) => a - b);
      const mid = Math.floor(amplitudes1Y.length / 2);
      medianAmplitude = amplitudes1Y.length % 2 !== 0 ? amplitudes1Y[mid] : (amplitudes1Y[mid - 1] + amplitudes1Y[mid]) / 2;
    }
    
    // Default suggestions based on 1 year
    const suggestedGridInterval = Number(Math.max(0.1, Math.min(medianAmplitude, 10)).toFixed(2));
    
    return {
      averageAmplitude: Number(averageAmplitude.toFixed(2)),
      medianAmplitude: Number(medianAmplitude.toFixed(2)),
      maxDrawdown: Number(maxDrawdown3Y.toFixed(2)),
      minPrice: globalMin1Y,
      maxPrice: globalMax1Y,
      suggestedGridInterval,
      suggestedBottom: Number((globalMin1Y * 0.9).toFixed(3)),
      suggestedTop: Number((globalMax1Y * 1.1).toFixed(3)),
      updatedAt: Date.now()
    };
  } catch (err) {
    console.error('Error fetching backtest data:', err);
    return null;
  }
}

export async function fetchDiagnosticData(symbol: string): Promise<RawData[] | null> {
  try {
    const formattedSymbol = symbol.toLowerCase().replace(/sh|sz/, '');
      
    const end = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const start = threeYearsAgo.toISOString().slice(0,10).replace(/-/g, '');
    
    let klines: string[] = [];
    
    // 尝试两个市场的前缀: 0(深交所) 和 1(上交所)
    for (const prefix of ['0', '1']) {
      const secid = `${prefix}.${formattedSymbol}`;
      const url = `/api/proxy/market-data?secid=${secid}&beg=${start}&end=${end}`;
      
      const response = await axios.get(url);
      if (response.data && response.data.data && response.data.data.klines && response.data.data.klines.length > 0) {
        klines = response.data.data.klines;
        break;
      }
    }
    
    if (klines.length === 0) {
      return null;
    }

    return klines.map(kline => {
      const parts = kline.split(',');
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        change_pct: parseFloat(parts[8]) // f59 is percentage change
      };
    });
  } catch (err) {
    console.error('Error fetching diagnosis data:', err);
    return null;
  }
}
