import { RawData, 
  MACDResult, DMIResult, BOLLResult, EXPMAResult, ENEResult, BBIResult, TRIXResult,
  KDJResult, SKDJResult, RSIResult, CCIResult, WRResult, LWRResult, BIASResult, MTMResult,
  OBVResult, VRResult, BRARResult, CRResult, DMAResult, LONResult, BullBearLineResult,
  ComprehensiveIndicatorReport
} from '../types';

export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[i]);
    } else if (i < period) {
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += data[j];
      }
      ema.push(sum / (i + 1));
    } else {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
  }
  return ema;
}

export function calculateStdDev(data: number[], period: number): number[] {
  const sma = calculateSMA(data, period);
  const stdDev: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      stdDev.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        const diff = data[i - j] - sma[i];
        sum += diff * diff;
      }
      stdDev.push(Math.sqrt(sum / period));
    }
  }
  return stdDev;
}

function calculateWilderEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const alpha = 1 / period;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
    } else {
      result.push(data[i] * alpha + result[i - 1] * (1 - alpha));
    }
  }
  return result;
}

export function calculateMACD(
  data: RawData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  if (data.length < slowPeriod + signalPeriod) return [];

  const closes = data.map(d => d.close);
  const ema12 = calculateEMA(closes, fastPeriod);
  const ema26 = calculateEMA(closes, slowPeriod);
  
  const dif: number[] = [];
  for (let i = 0; i < data.length; i++) {
    dif.push(isNaN(ema12[i]) || isNaN(ema26[i]) ? NaN : ema12[i] - ema26[i]);
  }

  const validDif = dif.map((v, i) => v || 0);
  const dea = calculateEMA(validDif, signalPeriod);

  const results: MACDResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      ema12: ema12[i] || 0,
      ema26: ema26[i] || 0,
      dif: dif[i] || 0,
      dea: dea[i] || 0,
      histogram: isNaN(dif[i]) || isNaN(dea[i]) ? 0 : (dif[i] - dea[i]) * 2
    });
  }
  return results;
}

export function calculateDMI(
  data: RawData[],
  period: number = 14,
  adxPeriod: number = 6
): DMIResult[] {
  if (data.length < period * 2) return [];

  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      tr.push(data[i].high - data[i].low);
      plusDM.push(0);
      minusDM.push(0);
    } else {
      const highDiff = data[i].high - data[i - 1].high;
      const lowDiff = data[i - 1].low - data[i].low;
      
      const tr1 = data[i].high - data[i].low;
      const tr2 = Math.abs(data[i].high - data[i - 1].close);
      const tr3 = Math.abs(data[i].low - data[i - 1].close);
      tr.push(Math.max(tr1, tr2, tr3));

      let plusDm = highDiff > lowDiff ? Math.max(highDiff, 0) : 0;
      let minusDm = lowDiff > highDiff ? Math.max(lowDiff, 0) : 0;
      
      if (highDiff === lowDiff) {
        plusDm = 0;
        minusDm = 0;
      }

      plusDM.push(plusDm);
      minusDM.push(minusDm);
    }
  }

  const atr = calculateWilderEMA(tr, period);
  const plusDI14 = calculateWilderEMA(plusDM, period);
  const minusDI14 = calculateWilderEMA(minusDM, period);

  const plusDI: number[] = [];
  const minusDI: number[] = [];
  const dx: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (isNaN(atr[i]) || atr[i] === 0) {
      plusDI.push(NaN);
      minusDI.push(NaN);
      dx.push(NaN);
    } else {
      const pDI = (plusDI14[i] / atr[i]) * 100;
      const mDI = (minusDI14[i] / atr[i]) * 100;
      plusDI.push(pDI);
      minusDI.push(mDI);
      
      const sum = pDI + mDI;
      if (sum === 0) {
        dx.push(0);
      } else {
        dx.push(Math.abs(pDI - mDI) / sum * 100);
      }
    }
  }

  const validDx = dx.map(v => v || 0);
  const adx = calculateWilderEMA(validDx, adxPeriod);

  const results: DMIResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      tr: tr[i] || 0,
      plus_dm: plusDM[i] || 0,
      minus_dm: minusDM[i] || 0,
      atr: atr[i] || 0,
      plus_di: plusDI[i] || 0,
      minus_di: minusDI[i] || 0,
      dx: dx[i] || 0,
      adx: adx[i] || 0
    });
  }
  return results;
}

export function calculateBOLL(
  data: RawData[],
  period: number = 20,
  stdMultiplier: number = 2
): BOLLResult[] {
  if (data.length < period) return [];

  const closes = data.map(d => d.close);
  const middle = calculateSMA(closes, period);
  const stdDev = calculateStdDev(closes, period);

  const results: BOLLResult[] = [];
  for (let i = 0; i < data.length; i++) {
    const upper = isNaN(middle[i]) || isNaN(stdDev[i]) ? NaN : middle[i] + stdMultiplier * stdDev[i];
    const lower = isNaN(middle[i]) || isNaN(stdDev[i]) ? NaN : middle[i] - stdMultiplier * stdDev[i];
    const width = isNaN(upper) || isNaN(lower) || middle[i] === 0 ? NaN : (upper - lower) / middle[i] * 100;

    results.push({
      date: data[i].date,
      middle_band: middle[i] || 0,
      std_dev: stdDev[i] || 0,
      upper_band: upper || 0,
      lower_band: lower || 0,
      width: width || 0
    });
  }
  return results;
}

export function calculateEXPMA(
  data: RawData[],
  shortPeriod: number = 12,
  longPeriod: number = 50
): EXPMAResult[] {
  if (data.length < longPeriod) return [];

  const closes = data.map(d => d.close);
  const exp1 = calculateEMA(closes, shortPeriod);
  const exp2 = calculateEMA(closes, longPeriod);

  const results: EXPMAResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      exp1: exp1[i] || 0,
      exp2: exp2[i] || 0
    });
  }
  return results;
}

export function calculateENE(
  data: RawData[],
  period: number = 25,
  upperOffset: number = 0.06,
  lowerOffset: number = 0.06
): ENEResult[] {
  if (data.length < period) return [];

  const closes = data.map(d => d.close);
  const middle = calculateSMA(closes, period);

  const results: ENEResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      middle: middle[i] || 0,
      upper: isNaN(middle[i]) ? 0 : middle[i] * (1 + upperOffset),
      lower: isNaN(middle[i]) ? 0 : middle[i] * (1 - lowerOffset)
    });
  }
  return results;
}

export function calculateBBI(
  data: RawData[],
  periods: number[] = [3, 6, 12, 24]
): BBIResult[] {
  const maxPeriod = Math.max(...periods);
  if (data.length < maxPeriod) return [];

  const closes = data.map(d => d.close);
  const ma3 = calculateSMA(closes, 3);
  const ma6 = calculateSMA(closes, 6);
  const ma12 = calculateSMA(closes, 12);
  const ma24 = calculateSMA(closes, 24);

  const results: BBIResult[] = [];
  for (let i = 0; i < data.length; i++) {
    const values = [ma3[i], ma6[i], ma12[i], ma24[i]].filter(v => !isNaN(v));
    const bbi = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : NaN;

    results.push({
      date: data[i].date,
      ma3: ma3[i] || 0,
      ma6: ma6[i] || 0,
      ma12: ma12[i] || 0,
      ma24: ma24[i] || 0,
      bbi: bbi || 0
    });
  }
  return results;
}

export function calculateTRIX(
  data: RawData[],
  emaPeriod: number = 12,
  signalPeriod: number = 9
): TRIXResult[] {
  if (data.length < emaPeriod * 3 + signalPeriod) return [];

  const closes = data.map(d => d.close);
  const ema1 = calculateEMA(closes, emaPeriod);
  
  const validEma1 = ema1.map(v => v || 0);
  const ema2 = calculateEMA(validEma1, emaPeriod);
  
  const validEma2 = ema2.map(v => v || 0);
  const ema3 = calculateEMA(validEma2, emaPeriod);

  const trix: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0 || isNaN(ema3[i]) || isNaN(ema3[i - 1]) || ema3[i - 1] === 0) {
      trix.push(NaN);
    } else {
      trix.push((ema3[i] - ema3[i - 1]) / ema3[i - 1] * 100);
    }
  }

  const validTrix = trix.map(v => v || 0);
  const matrix = calculateSMA(validTrix, signalPeriod);

  const results: TRIXResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      ema1: ema1[i] || 0,
      ema2: ema2[i] || 0,
      ema3: ema3[i] || 0,
      trix: trix[i] || 0,
      matrix: matrix[i] || 0
    });
  }
  return results;
}

export function calculateKDJ(
  data: RawData[],
  n: number = 9,
  m1: number = 3,
  m2: number = 3
): KDJResult[] {
  if (data.length < n) return [];

  const results: KDJResult[] = [];
  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < data.length; i++) {
    let rsv: number;
    if (i < n - 1) {
      rsv = 50;
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      for (let j = 0; j < n; j++) {
        highestHigh = Math.max(highestHigh, data[i - j].high);
        lowestLow = Math.min(lowestLow, data[i - j].low);
      }
      if (highestHigh === lowestLow) {
        rsv = 50;
      } else {
        rsv = (data[i].close - lowestLow) / (highestHigh - lowestLow) * 100;
      }
    }

    const k = (prevK * (m1 - 1) + rsv) / m1;
    const d = (prevD * (m2 - 1) + k) / m2;
    const j = 3 * k - 2 * d;

    results.push({
      date: data[i].date,
      rsv,
      k,
      d,
      j
    });

    prevK = k;
    prevD = d;
  }
  return results;
}

export function calculateSKDJ(
  data: RawData[],
  n: number = 9,
  m: number = 3
): SKDJResult[] {
  if (data.length < n + m * 2) return [];

  const rsvList: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      rsvList.push(50);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      for (let j = 0; j < n; j++) {
        highestHigh = Math.max(highestHigh, data[i - j].high);
        lowestLow = Math.min(lowestLow, data[i - j].low);
      }
      if (highestHigh === lowestLow) {
        rsvList.push(50);
      } else {
        rsvList.push((data[i].close - lowestLow) / (highestHigh - lowestLow) * 100);
      }
    }
  }

  const slowK = calculateSMA(rsvList, m);
  const slowD = calculateSMA(slowK.map(v => v || 0), m);

  const results: SKDJResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      rsv: rsvList[i],
      slow_k: slowK[i] || 0,
      slow_d: slowD[i] || 0
    });
  }
  return results;
}

export function calculateRSI(
  data: RawData[],
  periods: number[] = [6, 12, 24]
): RSIResult[] {
  const maxPeriod = Math.max(...periods);
  if (data.length < maxPeriod + 1) return [];

  const closes = data.map(d => d.close);
  
  const calculateRSIForPeriod = (period: number): number[] => {
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        gains.push(0);
        losses.push(0);
      } else {
        const change = closes[i] - closes[i - 1];
        gains.push(Math.max(change, 0));
        losses.push(Math.max(-change, 0));
      }
    }

    const avgGains = calculateWilderEMA(gains, period);
    const avgLosses = calculateWilderEMA(losses, period);

    const rsi: number[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (isNaN(avgLosses[i]) || avgLosses[i] === 0) {
        rsi.push(isNaN(avgGains[i]) || avgGains[i] === 0 ? 50 : 100);
      } else {
        const rs = avgGains[i] / avgLosses[i];
        rsi.push(100 - 100 / (1 + rs));
      }
    }
    return rsi;
  };

  const rsi6 = calculateRSIForPeriod(6);
  const rsi12 = calculateRSIForPeriod(12);
  const rsi24 = calculateRSIForPeriod(24);

  const results: RSIResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      rsi6: rsi6[i] || 0,
      rsi12: rsi12[i] || 0,
      rsi24: rsi24[i] || 0
    });
  }
  return results;
}

export function calculateCCI(
  data: RawData[],
  period: number = 14
): CCIResult[] {
  if (data.length < period) return [];

  const tps: number[] = data.map(d => (d.high + d.low + d.close) / 3);
  const maTp = calculateSMA(tps, period);

  const md: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      md.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += Math.abs(tps[i - j] - maTp[i]);
      }
      md.push(sum / period);
    }
  }

  const results: CCIResult[] = [];
  for (let i = 0; i < data.length; i++) {
    const cci = isNaN(md[i]) || md[i] === 0 ? 0 : (tps[i] - maTp[i]) / (0.015 * md[i]);
    results.push({
      date: data[i].date,
      tp: tps[i],
      ma_tp: maTp[i] || 0,
      md: md[i] || 0,
      cci
    });
  }
  return results;
}

export function calculateWR(
  data: RawData[],
  period: number = 10
): WRResult[] {
  if (data.length < period) return [];

  const results: WRResult[] = [];
  for (let i = 0; i < data.length; i++) {
    let wr10: number;
    if (i < period - 1) {
      wr10 = -50;
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      for (let j = 0; j < period; j++) {
        highestHigh = Math.max(highestHigh, data[i - j].high);
        lowestLow = Math.min(lowestLow, data[i - j].low);
      }
      if (highestHigh === lowestLow) {
        wr10 = -50;
      } else {
        wr10 = (highestHigh - data[i].close) / (highestHigh - lowestLow) * (-100);
      }
    }
    results.push({
      date: data[i].date,
      wr10
    });
  }
  return results;
}

export function calculateLWR(
  data: RawData[],
  period: number = 10
): LWRResult[] {
  const wrResults = calculateWR(data, period);
  if (wrResults.length === 0) return [];

  const wrValues = wrResults.map(r => r.wr10);
  const lwrValues = calculateSMA(wrValues, period);

  const results: LWRResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      lwr10: lwrValues[i] || -50
    });
  }
  return results;
}

export function calculateBIAS(
  data: RawData[],
  periods: number[] = [6, 12, 24]
): BIASResult[] {
  const maxPeriod = Math.max(...periods);
  if (data.length < maxPeriod) return [];

  const closes = data.map(d => d.close);
  const ma6 = calculateSMA(closes, 6);
  const ma12 = calculateSMA(closes, 12);
  const ma24 = calculateSMA(closes, 24);

  const results: BIASResult[] = [];
  for (let i = 0; i < data.length; i++) {
    const bias6 = isNaN(ma6[i]) || ma6[i] === 0 ? 0 : (closes[i] - ma6[i]) / ma6[i] * 100;
    const bias12 = isNaN(ma12[i]) || ma12[i] === 0 ? 0 : (closes[i] - ma12[i]) / ma12[i] * 100;
    const bias24 = isNaN(ma24[i]) || ma24[i] === 0 ? 0 : (closes[i] - ma24[i]) / ma24[i] * 100;

    results.push({
      date: data[i].date,
      bias6,
      bias12,
      bias24
    });
  }
  return results;
}

export function calculateMTM(
  data: RawData[],
  mtmPeriod: number = 12,
  signalPeriod: number = 6
): MTMResult[] {
  if (data.length < mtmPeriod + signalPeriod) return [];

  const closes = data.map(d => d.close);
  const mtm12: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < mtmPeriod) {
      mtm12.push(NaN);
    } else {
      mtm12.push(closes[i] - closes[i - mtmPeriod]);
    }
  }

  const validMtm = mtm12.map(v => v || 0);
  const mtmMA6 = calculateSMA(validMtm, signalPeriod);

  const results: MTMResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      mtm12: mtm12[i] || 0,
      mtm_ma6: mtmMA6[i] || 0
    });
  }
  return results;
}

export function calculateOBV(
  data: RawData[],
  maPeriod: number = 30
): OBVResult[] {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);

  const obv: number[] = [];
  let currentOBV = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      currentOBV = volumes[i];
    } else {
      if (closes[i] > closes[i - 1]) {
        currentOBV += volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        currentOBV -= volumes[i];
      }
    }
    obv.push(currentOBV);
  }

  const maobv30 = calculateSMA(obv, maPeriod);

  const results: OBVResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      obv: obv[i],
      maobv30: maobv30[i] || 0
    });
  }
  return results;
}

export function calculateVR(
  data: RawData[],
  period: number = 26
): VRResult[] {
  if (data.length < period) return [];

  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);

  const results: VRResult[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      results.push({
        date: data[i].date,
        avs: 0,
        bvs: 0,
        cvs: 0,
        vr: 100
      });
    } else {
      let avs = 0;
      let bvs = 0;
      let cvs = 0;
      
      for (let j = 0; j < period; j++) {
        const idx = i - j;
        if (idx === 0) continue;
        
        if (closes[idx] > closes[idx - 1]) {
          avs += volumes[idx];
        } else if (closes[idx] < closes[idx - 1]) {
          bvs += volumes[idx];
        } else {
          cvs += volumes[idx];
        }
      }

      const denominator = bvs + cvs / 2;
      const vr = denominator === 0 ? 100 : (avs + cvs / 2) / denominator * 100;

      results.push({
        date: data[i].date,
        avs,
        bvs,
        cvs,
        vr
      });
    }
  }
  return results;
}

export function calculateBRAR(
  data: RawData[],
  period: number = 26
): BRARResult[] {
  if (data.length < period) return [];

  const results: BRARResult[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      results.push({
        date: data[i].date,
        ar: 100,
        br: 100
      });
    } else {
      let arNumerator = 0;
      let arDenominator = 0;
      let brNumerator = 0;
      let brDenominator = 0;

      for (let j = 0; j < period; j++) {
        const idx = i - j;
        if (idx === 0) {
          arNumerator += data[idx].high - data[idx].open;
          arDenominator += data[idx].open - data[idx].low;
        } else {
          arNumerator += data[idx].high - data[idx].open;
          arDenominator += data[idx].open - data[idx].low;

          const brUp = data[idx].high - data[idx - 1].close;
          const brDown = data[idx - 1].close - data[idx].low;
          
          if (brUp > 0) brNumerator += brUp;
          if (brDown > 0) brDenominator += brDown;
        }
      }

      const ar = arDenominator === 0 ? 100 : arNumerator / arDenominator * 100;
      const br = brDenominator === 0 ? 100 : brNumerator / brDenominator * 100;

      results.push({
        date: data[i].date,
        ar,
        br
      });
    }
  }
  return results;
}

export function calculateCR(
  data: RawData[],
  period: number = 26
): CRResult[] {
  if (data.length < period + 1) return [];

  const mids: number[] = [];
  for (let i = 0; i < data.length; i++) {
    mids.push((data[i].high + data[i].low + data[i].close) / 3);
  }

  const results: CRResult[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      results.push({
        date: data[i].date,
        mid: mids[i],
        cr: 100,
        ma5: 0,
        ma10: 0,
        ma20: 0
      });
    } else {
      let crNumerator = 0;
      let crDenominator = 0;

      for (let j = 0; j < period; j++) {
        const idx = i - j;
        if (idx === 0) continue;

        const prevMid = mids[idx - 1];
        const upValue = data[idx].high - prevMid;
        const downValue = prevMid - data[idx].low;

        if (upValue > 0) crNumerator += upValue;
        if (downValue > 0) crDenominator += downValue;
      }

      const cr = crDenominator === 0 ? 100 : crNumerator / crDenominator * 100;
      results.push({
        date: data[i].date,
        mid: mids[i],
        cr,
        ma5: 0,
        ma10: 0,
        ma20: 0
      });
    }
  }

  const crValues = results.map(r => r.cr);
  const ma5 = calculateSMA(crValues, 5);
  const ma10 = calculateSMA(crValues, 10);
  const ma20 = calculateSMA(crValues, 20);

  for (let i = 0; i < results.length; i++) {
    results[i].ma5 = ma5[i] || 0;
    results[i].ma10 = ma10[i] || 0;
    results[i].ma20 = ma20[i] || 0;
  }

  return results;
}

export function calculateDMA(
  data: RawData[],
  shortPeriod: number = 10,
  longPeriod: number = 50,
  amaPeriod: number = 10
): DMAResult[] {
  if (data.length < longPeriod + amaPeriod) return [];

  const closes = data.map(d => d.close);
  const maShort = calculateSMA(closes, shortPeriod);
  const maLong = calculateSMA(closes, longPeriod);

  const dif: number[] = [];
  for (let i = 0; i < data.length; i++) {
    dif.push(isNaN(maShort[i]) || isNaN(maLong[i]) ? 0 : maShort[i] - maLong[i]);
  }

  const ama = calculateSMA(dif, amaPeriod);

  const results: DMAResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      dif: dif[i],
      ama: ama[i] || 0
    });
  }
  return results;
}

export function calculateLON(
  data: RawData[],
  longPeriod: number = 100,
  signalPeriod: number = 10
): LONResult[] {
  if (data.length < longPeriod) return [];

  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);

  const moneyFlow: number[] = [];
  let prevClose: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (prevClose === null) {
      moneyFlow.push(0);
    } else {
      const priceChange = closes[i] - prevClose;
      const direction = priceChange > 0 ? 1 : priceChange < 0 ? -1 : 0;
      const range = data[i].high - data[i].low;
      const flow = range > 0 ? direction * volumes[i] * (priceChange / range) : 0;
      moneyFlow.push(flow);
    }
    prevClose = closes[i];
  }

  const lon = calculateEMA(moneyFlow.map(v => v || 0), longPeriod);
  const lonma = calculateEMA(lon, signalPeriod);

  const results: LONResult[] = [];
  for (let i = 0; i < data.length; i++) {
    results.push({
      date: data[i].date,
      money_flow: moneyFlow[i],
      lon: lon[i] || 0,
      lonma: lonma[i] || 0
    });
  }
  return results;
}

export function calculateBullBearLine(
  data: RawData[],
  periods: number[] = [3, 6, 12, 24]
): BullBearLineResult[] {
  const maxPeriod = Math.max(...periods);
  if (data.length < maxPeriod) return [];

  const closes = data.map(d => d.close);
  const ma3 = calculateSMA(closes, 3);
  const ma6 = calculateSMA(closes, 6);
  const ma12 = calculateSMA(closes, 12);
  const ma24 = calculateSMA(closes, 24);

  const results: BullBearLineResult[] = [];
  for (let i = 0; i < data.length; i++) {
    const values = [ma3[i], ma6[i], ma12[i], ma24[i]].filter(v => !isNaN(v));
    const bullBearLine = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : closes[i];

    results.push({
      date: data[i].date,
      bull_bear_line: bullBearLine
    });
  }
  return results;
}

export interface ParseKlineOptions {
  name?: string;
}

export function parseKlines(klines: string[], options?: ParseKlineOptions): RawData[] {
  const data: RawData[] = [];
  
  for (const kline of klines) {
    const parts = kline.split(',');
    if (parts.length >= 8) {
      const date = parts[0];
      const open = parseFloat(parts[1]);
      const close = parseFloat(parts[2]);
      const high = parseFloat(parts[3]);
      const low = parseFloat(parts[4]);
      const volume = parseFloat(parts[5]);
      const changePct = parts[8] ? parseFloat(parts[8]) : 0;

      if (!isNaN(open) && !isNaN(close) && !isNaN(high) && !isNaN(low)) {
        data.push({
          date,
          open,
          close,
          high,
          low,
          change_pct: changePct,
          volume
        });
      }
    }
  }
  
  return data;
}

export function calculateAllIndicators(
  data: RawData[],
  symbol: string,
  name: string = ''
): ComprehensiveIndicatorReport | null {
  if (data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestData = sortedData[sortedData.length - 1];
  const latestDate = latestData.date;

  const macdResults = calculateMACD(sortedData);
  const dmiResults = calculateDMI(sortedData);
  const bollResults = calculateBOLL(sortedData);
  const expmaResults = calculateEXPMA(sortedData);
  const eneResults = calculateENE(sortedData);
  const bbiResults = calculateBBI(sortedData);
  const trixResults = calculateTRIX(sortedData);
  
  const kdjResults = calculateKDJ(sortedData);
  const skdjResults = calculateSKDJ(sortedData);
  const rsiResults = calculateRSI(sortedData);
  const cciResults = calculateCCI(sortedData);
  const wrResults = calculateWR(sortedData);
  const lwrResults = calculateLWR(sortedData);
  const biasResults = calculateBIAS(sortedData);
  const mtmResults = calculateMTM(sortedData);

  const obvResults = calculateOBV(sortedData);
  const vrResults = calculateVR(sortedData);
  const brarResults = calculateBRAR(sortedData);
  const crResults = calculateCR(sortedData);
  const dmaResults = calculateDMA(sortedData);
  const lonResults = calculateLON(sortedData);
  const bullBearResults = calculateBullBearLine(sortedData);

  const latest = (arr: any[]) => arr.length > 0 ? arr[arr.length - 1] : null;

  const latestVolume = latestData.volume || 0;
  const latestTurnover = latestVolume * latestData.close;

  return {
    symbol,
    name,
    latestPrice: latestData.close,
    dataCount: sortedData.length,
    latestDate,
    calculatedAt: new Date().toLocaleString('zh-CN'),

    trend: {
      macd: latest(macdResults),
      dmi: latest(dmiResults),
      boll: latest(bollResults),
      expma: latest(expmaResults),
      ene: latest(eneResults),
      bbi: latest(bbiResults),
      trix: latest(trixResults)
    },

    oscillator: {
      kdj: latest(kdjResults),
      skdj: latest(skdjResults),
      rsi: latest(rsiResults),
      cci: latest(cciResults),
      wr: latest(wrResults),
      lwr: latest(lwrResults),
      bias: latest(biasResults),
      mtm: latest(mtmResults)
    },

    volume: {
      obv: latest(obvResults),
      vr: latest(vrResults),
      brar: latest(brarResults),
      cr: latest(crResults),
      dma: latest(dmaResults),
      lon: latest(lonResults),
      bullBearLine: latest(bullBearResults),
      latestVolume,
      latestTurnover
    }
  };
}