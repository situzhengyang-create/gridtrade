import axios from 'axios';
import { BacktestResult } from '../types';
import { RawData } from './gridDiagnosticService';
import { jsonp } from '../lib/jsonp';

const secidCache: Record<string, string> = {};
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24小时缓存

/**
 * 模拟人为延迟
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 缓存辅助
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

export async function fetchBacktestData(symbol: string): Promise<BacktestResult | null> {
  const cacheKey = `backtest_${symbol}_${new Date().toISOString().slice(0, 10)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const formattedSymbol = symbol.replace(/SH|SZ/i, '').toUpperCase();
    
    // 随机抖动：批量请求时避免瞬间并发
    await sleep(Math.random() * 500 + 200);
      
    const end = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const start = threeYearsAgo.toISOString().slice(0,10).replace(/-/g, '');
    
    let data = null;
    
    // Try to discover the correct secid with caching
    let discoveredSecid = secidCache[formattedSymbol] || null;
    
    if (!discoveredSecid) {
      try {
        const searchUrl = `https://searchapi.eastmoney.com/api/suggest/get?input=${formattedSymbol}&type=14&v=${Date.now()}`;
        const searchRes: any = await (await fetch(`/api/proxy?url=${encodeURIComponent(searchUrl)}`)).json();
        if (searchRes && searchRes.QuotationCodeTable && searchRes.QuotationCodeTable.Data && searchRes.QuotationCodeTable.Data.length > 0) {
          const match = searchRes.QuotationCodeTable.Data.find((d: any) => d.Code === formattedSymbol || d.Code === symbol.toUpperCase());
          discoveredSecid = match ? match.SecID : searchRes.QuotationCodeTable.Data[0].SecID;
          if (discoveredSecid) secidCache[formattedSymbol] = discoveredSecid;
        }
      } catch (e) {
        console.warn('Discovery failed, using defaults', e);
      }
    }

    const preferredPrefix = (formattedSymbol.startsWith('6') || formattedSymbol.startsWith('5')) ? '1' : '0';
    const prefixes = [preferredPrefix, preferredPrefix === '1' ? '0' : '1', '2', '116', '105', '106', '107', '156', '100'];
    
    if (discoveredSecid) {
       const p = discoveredSecid.split('.')[0];
       if (!prefixes.includes(p)) prefixes.unshift(p);
    }

    // Attempt with retries and jittered sequence
    for (const prefix of prefixes) {
      try {
        const secid = (discoveredSecid && discoveredSecid.endsWith(formattedSymbol)) ? discoveredSecid : `${prefix}.${formattedSymbol}`;
        // 添加一些看起来更真实的参数，包含动态时间戳和 ut
        const baseUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&ut=fa5fd1943c41bc19e5917409249e37&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&beg=${start}&end=${end}&_=${Date.now()}`;
        
        const response: any = await (await fetch(`/api/proxy?url=${encodeURIComponent(baseUrl)}`)).json();
        if (response && response.data && response.data.klines && response.data.klines.length > 0) {
          data = response.data;
          break;
        }
        // 如果失败了，等一会儿再试下一个 prefix
        await sleep(300);
      } catch (error) {
        console.warn(`Failed proxy fetch for ${prefix}`, error);
      }
    }

    // Fallback to Tencent if East Money fails completely
    if (!data || !data.klines || data.klines.length === 0) {
      try {
        const tencentMarket = (formattedSymbol.startsWith('6') || formattedSymbol.startsWith('5')) ? 'sh' : 'sz';
        const tencentUrl = `https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_day&param=${tencentMarket}${formattedSymbol},day,${start.slice(0,4)}-${start.slice(4,6)}-${start.slice(6,8)},${end.slice(0,4)}-${end.slice(4,6)}-${end.slice(6,8)},640,qfq`;
        const res: any = await jsonp(tencentUrl, 'kline_day');
        const kData = res?.data?.[`${tencentMarket}${formattedSymbol}`]?.day || res?.data?.[`${tencentMarket}${formattedSymbol}`]?.qfqday;
        if (kData && kData.length > 0) {
          data = {
            name: '',
            klines: kData.map((d: any) => `${d[0]},${d[1]},${d[2]},${d[3]},${d[4]},${d[5]},${d[6] || 0},${d[7] || 0},${d[8] || 0}`)
          };
        }
      } catch (e) {
        console.warn('Tencent fallback failed in fetchBacktestData', e);
      }
    }
    
    if (!data) {
      return null;
    }

    setCache(cacheKey, data);
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
  const cacheKey = `diag_${symbol}_${new Date().toISOString().slice(0, 10)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const formattedSymbol = symbol.replace(/SH|SZ/i, '').toUpperCase();
    
    // 随机抖动
    await sleep(Math.random() * 500 + 200);
      
    const end = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const start = threeYearsAgo.toISOString().slice(0,10).replace(/-/g, '');
    
    let klines: string[] = [];
    
    // Try to discover the correct secid with caching
    let discoveredSecid = secidCache[formattedSymbol] || null;
    
    if (!discoveredSecid) {
      try {
        const searchUrl = `https://searchapi.eastmoney.com/api/suggest/get?input=${formattedSymbol}&type=14&v=${Date.now()}`;
        const searchRes: any = await (await fetch(`/api/proxy?url=${encodeURIComponent(searchUrl)}`)).json();
        if (searchRes && searchRes.QuotationCodeTable && searchRes.QuotationCodeTable.Data && searchRes.QuotationCodeTable.Data.length > 0) {
          const match = searchRes.QuotationCodeTable.Data.find((d: any) => d.Code === formattedSymbol || d.Code === symbol.toUpperCase());
          discoveredSecid = match ? match.SecID : searchRes.QuotationCodeTable.Data[0].SecID;
          if (discoveredSecid) secidCache[formattedSymbol] = discoveredSecid;
        }
      } catch (e) {
        console.warn('Discovery failed', e);
      }
    }

    const preferredPrefix = (formattedSymbol.startsWith('6') || formattedSymbol.startsWith('5')) ? '1' : '0';
    const prefixes = [preferredPrefix, preferredPrefix === '1' ? '0' : '1', '2', '116', '105', '106', '107', '156', '100'];
    
    if (discoveredSecid) {
       const p = discoveredSecid.split('.')[0];
       if (!prefixes.includes(p)) prefixes.unshift(p);
    }

    for (const prefix of prefixes) {
      try {
        const secid = (discoveredSecid && discoveredSecid.endsWith(formattedSymbol)) ? discoveredSecid : `${prefix}.${formattedSymbol}`;
        const baseUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&ut=fa5fd1943c41bc19e5917409249e37&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&beg=${start}&end=${end}&_=${Date.now()}`;
        
        const response: any = await (await fetch(`/api/proxy?url=${encodeURIComponent(baseUrl)}`)).json();
        if (response && response.data && response.data.klines && response.data.klines.length > 0) {
          klines = response.data.klines;
          break;
        }
        await sleep(300);
      } catch (error) {
         console.warn(`Failed proxy fetch for prefix ${prefix}`, error);
      }
    }

    // Fallback to Tencent if East Money fails
    if (klines.length === 0) {
      try {
        const tencentMarket = (formattedSymbol.startsWith('6') || formattedSymbol.startsWith('5')) ? 'sh' : 'sz';
        const tencentUrl = `https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_day&param=${tencentMarket}${formattedSymbol},day,${start.slice(0,4)}-${start.slice(4,6)}-${start.slice(6,8)},${end.slice(0,4)}-${end.slice(4,6)}-${end.slice(6,8)},640,qfq`;
        const res: any = await jsonp(tencentUrl, 'kline_day');
        const kData = res?.data?.[`${tencentMarket}${formattedSymbol}`]?.day || res?.data?.[`${tencentMarket}${formattedSymbol}`]?.qfqday;
        if (kData && kData.length > 0) {
          klines = kData.map((d: any) => `${d[0]},${d[1]},${d[2]},${d[3]},${d[4]},${d[5]},${d[6] || 0},${d[7] || 0},${d[8] || 0}`);
        }
      } catch (e) {
        console.warn('Tencent fallback failed in fetchDiagnosticData', e);
      }
    }
    
    if (klines.length === 0) {
      return null;
    }

    const result = klines.map(kline => {
      const parts = kline.split(',');
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        change_pct: parseFloat(parts[8]) // f59 is percentage change
      };
    });

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Error fetching diagnosis data:', err);
    return null;
  }
}
