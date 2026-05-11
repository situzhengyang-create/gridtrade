import { RawData, TrendIndicator, MA20Signal, MACDSignal, ADXSignal, BollingerSignal } from '../types';
import { TrendParams, defaultTrendParams } from '../types/params';

function calculateSMA(data: number[], period: number): number[] {
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

function calculateEMA(data: number[], period: number): number[] {
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

function calculateStdDev(data: number[], period: number): number[] {
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

function calculateNormalizedSlope(data: number[], window: number): number | null {
  if (data.length < window || window <= 0) return null;
  const recentData = data.slice(-window);
  const n = recentData.length;
  if (n === 0) return null;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recentData[i];
    sumXY += i * recentData[i];
    sumX2 += i * i;
  }
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const avgY = sumY / n;
  if (avgY === 0) return null;
  return slope / avgY;
}

function calculateATR(high: number[], low: number[], close: number[], period: number = 14): number[] {
  const tr: number[] = [];
  for (let i = 0; i < high.length; i++) {
    if (i === 0) {
      tr.push(high[i] - low[i]);
    } else {
      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - close[i - 1]);
      const tr3 = Math.abs(low[i] - close[i - 1]);
      tr.push(Math.max(tr1, tr2, tr3));
    }
  }
  return calculateEMA(tr, period);
}

function generateMA20Signal(ma20Data: number[], params: TrendParams = defaultTrendParams): MA20Signal {
  const { mainTrendWindow, shortTrendWindow, longTrendWindow, slopeThreshold, accelerationThreshold } = params.ma20;
  
  if (ma20Data.length < longTrendWindow) {
    return {
      main_trend: 'Flat',
      strength: 'None',
      signal: 'Insufficient_Data',
      display_text: {
        zh: '数据不足',
        en: 'Insufficient Data'
      },
      meaning: `历史数据不足${longTrendWindow}个交易日，无法计算有效信号`,
      market_status: '数据不足',
      suggestion: '请等待更多数据',
      indicators: {
        slope_main: 0,
        slope_short: 0,
        slope_long: 0
      },
      risk_warnings: {
        slope_reversal: 'none',
        slope_deceleration: 'none',
        description: '数据不足，无法判定'
      },
      calculation_time: new Date().toLocaleString('zh-CN')
    };
  }

  const recentMA20 = ma20Data.slice(-longTrendWindow);
  const mainTrendData = recentMA20.slice(-mainTrendWindow);
  const shortTrendData = recentMA20.slice(-shortTrendWindow);
  const longTrendData = recentMA20;

  const slope_main = calculateNormalizedSlope(mainTrendData, mainTrendWindow) || 0;
  const slope_short = calculateNormalizedSlope(shortTrendData, shortTrendWindow) || 0;
  const slope_long = calculateNormalizedSlope(longTrendData, longTrendWindow) || 0;

  let main_trend: 'Bullish' | 'Bearish' | 'Flat';
  if (slope_main > slopeThreshold) {
    main_trend = 'Bullish';
  } else if (slope_main < -slopeThreshold) {
    main_trend = 'Bearish';
  } else {
    main_trend = 'Flat';
  }

  let strength: 'Accelerating' | 'Decelerating' | 'Steady' | 'None';
  let signal: MA20Signal['signal'];
  let display_text: MA20Signal['display_text'];
  let meaning: string;
  let market_status: string;
  let suggestion: string;

  if (main_trend !== 'Flat') {
    const diff = slope_short - slope_long;
    if (diff > accelerationThreshold) {
      strength = 'Accelerating';
    } else if (diff < -accelerationThreshold) {
      strength = 'Decelerating';
    } else {
      strength = 'Steady';
    }

    if (main_trend === 'Bullish') {
      if (strength === 'Accelerating') {
        signal = 'Bullish_Accelerating';
        display_text = { zh: '上涨（加速）', en: 'Bullish (Accelerating)' };
        meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日明显上涨，且最近${shortTrendWindow}日上涨速度比最近${longTrendWindow}日更快`;
        market_status = '强势多头';
        suggestion = '可考虑买入或加仓';
      } else if (strength === 'Decelerating') {
        signal = 'Bullish_Decelerating';
        display_text = { zh: '上涨（减速）', en: 'Bullish (Decelerating)' };
        meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日明显上涨，但最近${shortTrendWindow}日上涨速度比最近${longTrendWindow}日更慢`;
        market_status = '多头减弱';
        suggestion = '谨慎持有，注意风险';
      } else {
        signal = 'Bullish_Steady';
        display_text = { zh: '上涨（稳健）', en: 'Bullish (Steady)' };
        meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日明显上涨，且最近${shortTrendWindow}日上涨速度与最近${longTrendWindow}日相当`;
        market_status = '稳定多头';
        suggestion = '可持有现有仓位';
      }
    } else {
      if (strength === 'Accelerating') {
        signal = 'Bearish_Accelerating';
        display_text = { zh: '下跌（加速）', en: 'Bearish (Accelerating)' };
        meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日明显下跌，且最近${shortTrendWindow}日下跌速度比最近${longTrendWindow}日更快`;
        market_status = '强势空头';
        suggestion = '可考虑卖出或减仓';
      } else if (strength === 'Decelerating') {
        signal = 'Bearish_Decelerating';
        display_text = { zh: '下跌（减速）', en: 'Bearish (Decelerating)' };
        meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日明显下跌，但最近${shortTrendWindow}日下跌速度比最近${longTrendWindow}日更慢`;
        market_status = '空头减弱';
        suggestion = '谨慎看空，注意反弹';
      } else {
        signal = 'Bearish_Steady';
        display_text = { zh: '下跌（稳健）', en: 'Bearish (Steady)' };
        meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日明显下跌，且最近${shortTrendWindow}日下跌速度与最近${longTrendWindow}日相当`;
        market_status = '稳定空头';
        suggestion = '可持币观望';
      }
    }
  } else {
    strength = 'None';
    signal = 'Sideways';
    display_text = { zh: '横向震荡', en: 'Sideways' };
    meaning = `${longTrendWindow}日均线在最近${mainTrendWindow}日无明显方向，波动较小`;
    market_status = '震荡整理';
    suggestion = '观望或区间操作';
  }

  return {
    main_trend,
    strength,
    signal,
    display_text,
    meaning,
    market_status,
    suggestion,
    indicators: {
      slope_main,
      slope_short,
      slope_long
    },
    risk_warnings: {
      slope_reversal: slope_main * slope_long < -0.00001 ? 'warning' : 'none',
      slope_deceleration: (slope_short - slope_long) < -0.001 ? 'warning' : 'none',
      description: slope_main * slope_long < -0.00001 ? 'MA20主趋势斜率发生方向性反转' : 
                  (slope_short - slope_long) < -0.001 ? 'MA20斜率差小于-0.001，动能减速' : '无预警'
    },
    calculation_time: new Date().toLocaleString('zh-CN')
  };
}

function generateMACDSignal(closes: number[], volumes: number[], params: TrendParams = defaultTrendParams): MACDSignal | null {
  if (closes.length < 35) {
    return {
      date: new Date().toISOString().split('T')[0],
      macd_values: { dif: 0, dea: 0, histogram: 0 },
      signals: {
        cross_signal: { type: 'none', strength: 0, description: '数据不足' },
        position_signal: { type: 'near_zero', bias: 'neutral', description: '数据不足' },
        divergence_signal: { type: 'none', confidence: 0, description: '数据不足' },
        momentum_signal: { trend: 'stable', histogram_change: 0, description: '数据不足' },
        volume_signal: { confirmed: false, volume_change: 0, description: '数据不足' }
      },
      comprehensive_signal: {
        score: 0,
        level: 'neutral',
        confidence: 'low',
        action: '观望',
        reasoning: ['数据不足，无法计算MACD信号']
      }
    };
  }

  const { fastPeriod, slowPeriod, signalPeriod } = params.macd;
  const dif = calculateEMA(closes, fastPeriod).map((v, i) => v - calculateEMA(closes, slowPeriod)[i]);
  const dea = calculateEMA(dif, signalPeriod);
  const histogram = dif.map((v, i) => v - dea[i]);

  const n = closes.length;
  const lastDif = dif[n - 1];
  const prevDif = dif[n - 2];
  const lastDea = dea[n - 1];
  const prevDea = dea[n - 2];
  const lastHist = histogram[n - 1];
  const prevHist = histogram[n - 2];

  let crossType: 'golden' | 'dead' | 'none' = 'none';
  let crossStrength = 0;
  if (prevDif <= prevDea && lastDif > lastDea) {
    crossType = 'golden';
    crossStrength = lastDif - lastDea;
  } else if (prevDif >= prevDea && lastDif < lastDea) {
    crossType = 'dead';
    crossStrength = lastDea - lastDif;
  }

  let positionType: 'above_zero' | 'below_zero' | 'near_zero' = 'near_zero';
  let positionBias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (lastDif > 0 && lastDea > 0) {
    positionType = 'above_zero';
    positionBias = 'bullish';
  } else if (lastDif < 0 && lastDea < 0) {
    positionType = 'below_zero';
    positionBias = 'bearish';
  }

  let momentumTrend: 'accelerating' | 'decelerating' | 'stable' | 'reversal' = 'stable';
  if (Math.abs(lastHist) > Math.abs(prevHist)) {
    momentumTrend = 'accelerating';
  } else if (Math.abs(lastHist) < Math.abs(prevHist)) {
    momentumTrend = 'decelerating';
  }

  const vol5Avg = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const volChange = vol5Avg > 0 ? (volumes[n - 1] - vol5Avg) / vol5Avg : 0;

  const lookback30 = Math.max(0, n - 30);
  let priceHigh = -Infinity, priceLow = Infinity;
  let histHighIdx = -1, histLowIdx = -1;
  for (let i = lookback30; i < n; i++) {
    if (closes[i] > priceHigh) priceHigh = closes[i];
    if (closes[i] < priceLow) priceLow = closes[i];
    if (histogram[i] > (histogram[histHighIdx] || -Infinity)) histHighIdx = i;
    if (histogram[i] < (histogram[histLowIdx] || Infinity)) histLowIdx = i;
  }

  let divergenceType: 'top' | 'bottom' | 'none' = 'none';
  let divergenceConfidence = 0;
  if (closes[n - 1] >= priceHigh * 0.98 && histogram[n - 1] < histogram[histHighIdx] * 0.95) {
    divergenceType = 'top';
    divergenceConfidence = 0.8;
  } else if (closes[n - 1] <= priceLow * 1.02 && histogram[n - 1] > histogram[histLowIdx] * 1.05) {
    divergenceType = 'bottom';
    divergenceConfidence = 0.8;
  }

  let score = 0;
  const reasoning: string[] = [];

  if (crossType === 'golden') { score += 0.3; reasoning.push('MACD金叉'); }
  else if (crossType === 'dead') { score -= 0.3; reasoning.push('MACD死叉'); }

  if (positionBias === 'bullish') { score += 0.2; reasoning.push('零轴上方'); }
  else if (positionBias === 'bearish') { score -= 0.2; reasoning.push('零轴下方'); }

  if (divergenceType === 'bottom') { score += 0.25; reasoning.push('底背离'); }
  else if (divergenceType === 'top') { score -= 0.25; reasoning.push('顶背离'); }

  if (momentumTrend === 'accelerating') { score += 0.15; reasoning.push('动量加速'); }
  else if (momentumTrend === 'decelerating') { score -= 0.15; reasoning.push('动量减速'); }

  if (volChange >= 0.3) { score += 0.1; reasoning.push('成交量放大'); }

  return {
    date: new Date().toISOString().split('T')[0],
    macd_values: {
      dif: lastDif,
      dea: lastDea,
      histogram: lastHist
    },
    signals: {
      cross_signal: {
        type: crossType,
        strength: crossStrength,
        description: crossType === 'golden' ? 'MACD金叉' : crossType === 'dead' ? 'MACD死叉' : '无交叉信号'
      },
      position_signal: {
        type: positionType,
        bias: positionBias,
        description: positionType === 'above_zero' ? '零轴上方' : positionType === 'below_zero' ? '零轴下方' : '零轴附近'
      },
      divergence_signal: {
        type: divergenceType,
        confidence: divergenceConfidence,
        description: divergenceType === 'top' ? '顶背离' : divergenceType === 'bottom' ? '底背离' : '无背离'
      },
      momentum_signal: {
        trend: momentumTrend,
        histogram_change: lastHist - prevHist,
        description: momentumTrend === 'accelerating' ? '动量加速' : momentumTrend === 'decelerating' ? '动量减速' : '动量稳定'
      },
      volume_signal: {
        confirmed: volChange >= 0.3,
        volume_change: volChange,
        description: volChange >= 0.3 ? '成交量放大' : volChange <= -0.3 ? '成交量萎缩' : '成交量平稳'
      }
    },
    comprehensive_signal: {
      score,
      level: score >= 0.7 ? 'strong_bullish' : score >= 0.3 ? 'bullish' : score >= -0.3 ? 'neutral' : score >= -0.7 ? 'bearish' : 'strong_bearish',
      confidence: score > 0.5 || score < -0.5 ? 'high' : Math.abs(score) > 0.2 ? 'medium' : 'low',
      action: score >= 0.7 ? '积极买入' : score >= 0.3 ? '考虑买入' : score >= -0.3 ? '观望' : score >= -0.7 ? '考虑卖出' : '积极卖出',
      reasoning
    }
  };
}

function generateADXSignal(data: RawData[], params: TrendParams = defaultTrendParams): ADXSignal | null {
  if (data.length < 28) {
    return {
      date: new Date().toISOString().split('T')[0],
      adx_period: 14,
      indicators: { adx: 0, plus_di: 0, minus_di: 0, adx_slope_5d: 0 },
      strength_analysis: {
        level: 'no_trend',
        range: '0-20',
        color: '#808080',
        description: '数据不足，需要至少28个交易日数据'
      },
      direction_analysis: {
        bias: 'neutral',
        di_spread: 0,
        description: '数据不足'
      },
      signal_analysis: {
        last_cross: {
          type: 'none',
          days_ago: 0,
          adx_at_cross: 0,
          adx_trend_at_cross: 'flat',
          validity: 'invalid',
          description: '数据不足'
        },
        current_signal: 'none'
      },
      momentum_analysis: {
        adx_trend: 'flat',
        slope_value: 0,
        description: '数据不足'
      },
      exhaustion_analysis: {
        divergence: {
          type: 'none',
          confidence: 0,
          description: '数据不足'
        },
        di_extremes: {
          plus_di_warning: 'none',
          minus_di_warning: 'none',
          description: '数据不足'
        }
      },
      comprehensive_assessment: {
        score: 0,
        level: 'neutral',
        confidence: 'low',
        action: '观望',
        reasoning: ['数据不足，无法计算ADX信号']
      },
      risk_warnings: {
        adx_extreme: 'none',
        description: '数据不足'
      }
    };
  }

  const high = data.map(d => d.high);
  const low = data.map(d => d.low);
  const close = data.map(d => d.close);
  const n = data.length;

  const tr: number[] = [];
  const plusDm: number[] = [];
  const minusDm: number[] = [];

  for (let i = 0; i < n; i++) {
    if (i === 0) {
      tr.push(high[i] - low[i]);
      plusDm.push(0);
      minusDm.push(0);
    } else {
      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - close[i - 1]);
      const tr3 = Math.abs(low[i] - close[i - 1]);
      tr.push(Math.max(tr1, tr2, tr3));

      const upMove = high[i] - high[i - 1];
      const downMove = low[i - 1] - low[i];

      if (upMove > downMove && upMove > 0) {
        plusDm.push(upMove);
      } else {
        plusDm.push(0);
      }

      if (downMove > upMove && downMove > 0) {
        minusDm.push(downMove);
      } else {
        minusDm.push(0);
      }
    }
  }

  const atr14 = calculateATR(high, low, close, 14);
  const plusDI14 = calculateEMA(plusDm, 14).map((v, i) => atr14[i] > 0 ? (v / atr14[i]) * 100 : 0);
  const minusDI14 = calculateEMA(minusDm, 14).map((v, i) => atr14[i] > 0 ? (v / atr14[i]) * 100 : 0);

  const dx = plusDI14.map((pdi, i) => {
    const mdi = minusDI14[i];
    const sum = pdi + mdi;
    return sum > 0 ? (Math.abs(pdi - mdi) / sum) * 100 : 0;
  });

  const adx = calculateEMA(dx, 14);

  const currentAdx = adx[n - 1];
  const currentPlusDi = plusDI14[n - 1];
  const currentMinusDi = minusDI14[n - 1];

  let strengthLevel: ADXSignal['strength_analysis']['level'];
  let strengthRange: string;
  let strengthColor: string;
  let strengthDesc: string;

  if (currentAdx < 20) {
    strengthLevel = 'no_trend';
    strengthRange = '0-20';
    strengthColor = '#808080';
    strengthDesc = '无明显趋势，震荡整理';
  } else if (currentAdx < 25) {
    strengthLevel = 'trend_forming';
    strengthRange = '20-25';
    strengthColor = '#FFC000';
    strengthDesc = '趋势正在形成，密切关注';
  } else if (currentAdx < 50) {
    strengthLevel = 'medium_trend';
    strengthRange = '25-50';
    strengthColor = '#00B050';
    strengthDesc = '中等趋势，最佳交易区间';
  } else if (currentAdx < 75) {
    strengthLevel = 'strong_trend';
    strengthRange = '50-75';
    strengthColor = '#FF6600';
    strengthDesc = '强趋势，防范过热';
  } else {
    strengthLevel = 'extreme_trend';
    strengthRange = '>75';
    strengthColor = '#FF0000';
    strengthDesc = '极强趋势，衰竭高危区';
  }

  let directionBias: ADXSignal['direction_analysis']['bias'];
  let diSpread = currentPlusDi - currentMinusDi;
  let directionDesc: string;

  if (currentPlusDi > currentMinusDi && diSpread > 10) {
    directionBias = 'bullish';
    directionDesc = '多头主导';
  } else if (currentPlusDi > currentMinusDi && diSpread <= 10) {
    directionBias = 'bullish';
    directionDesc = '多头略占优';
  } else if (currentMinusDi > currentPlusDi && diSpread < -10) {
    directionBias = 'bearish';
    directionDesc = '空头主导';
  } else if (currentMinusDi > currentPlusDi && diSpread >= -10) {
    directionBias = 'bearish';
    directionDesc = '空头略占优';
  } else {
    directionBias = 'neutral';
    directionDesc = '多空平衡';
  }

  let lastCrossType: 'golden' | 'dead' | 'none' = 'none';
  let daysAgo = 0;
  let adxAtCross = 0;
  let adxTrendAtCross: 'rising' | 'falling' | 'flat' = 'flat';
  let crossValidity: 'valid' | 'invalid' = 'invalid';
  let crossDesc: string;

  for (let i = n - 2; i >= Math.max(0, n - 30); i--) {
    const prevPlus = plusDI14[i];
    const currPlus = plusDI14[i + 1];
    const prevMinus = minusDI14[i];
    const currMinus = minusDI14[i + 1];

    if (prevPlus <= prevMinus && currPlus > currMinus) {
      lastCrossType = 'golden';
      daysAgo = n - 1 - i;
      adxAtCross = adx[i];
      adxTrendAtCross = adx[i] > adx[i - 1] ? 'rising' : adx[i] < adx[i - 1] ? 'falling' : 'flat';
      crossValidity = daysAgo <= 5 ? 'valid' : 'invalid';
      break;
    } else if (prevPlus >= prevMinus && currPlus < currMinus) {
      lastCrossType = 'dead';
      daysAgo = n - 1 - i;
      adxAtCross = adx[i];
      adxTrendAtCross = adx[i] > adx[i - 1] ? 'rising' : adx[i] < adx[i - 1] ? 'falling' : 'flat';
      crossValidity = daysAgo <= 5 ? 'valid' : 'invalid';
      break;
    }
  }

  if (lastCrossType === 'none') {
    crossDesc = '最近20日内无DI交叉信号';
  } else if (lastCrossType === 'golden') {
    crossDesc = `金叉发生在${daysAgo}天前，ADX=${adxAtCross.toFixed(1)}，信号${daysAgo <= 5 ? '有效' : '可能失效'}`;
  } else {
    crossDesc = `死叉发生在${daysAgo}天前，ADX=${adxAtCross.toFixed(1)}，信号${daysAgo <= 5 ? '有效' : '可能失效'}`;
  }

  const recentAdx = adx.filter(v => !isNaN(v)).slice(-5);
  const adxSlope5d = recentAdx.length >= 5 ? calculateNormalizedSlope(recentAdx, 5) || 0 : 0;
  
  let adxTrend: 'rising' | 'falling' | 'flat';
  let momentumDesc: string;

  if (adxSlope5d > 0.005) {
    adxTrend = 'rising';
    momentumDesc = `ADX曲线持续上升（5日斜率: ${(adxSlope5d * 100).toFixed(2)}%），趋势强度在增加`;
  } else if (adxSlope5d < -0.005) {
    adxTrend = 'falling';
    momentumDesc = `ADX曲线持续下降（5日斜率: ${(adxSlope5d * 100).toFixed(2)}%），趋势强度在减弱`;
  } else {
    adxTrend = 'flat';
    momentumDesc = 'ADX曲线走平，趋势强度稳定';
  }

  let divergenceType: 'top' | 'bottom' | 'none' = 'none';
  let divergenceConfidence = 0;
  let divergenceDesc = '未发现价格与ADX的背离';

  const lookback30 = Math.max(0, n - 30);
  let priceHigh30 = -Infinity, priceLow30 = Infinity;
  let adxHigh30 = -Infinity, adxLow30 = Infinity;
  let priceHighIdx = -1, priceLowIdx = -1;
  let adxHighIdx = -1, adxLowIdx = -1;

  for (let i = lookback30; i < n; i++) {
    if (close[i] > priceHigh30) {
      priceHigh30 = close[i];
      priceHighIdx = i;
    }
    if (close[i] < priceLow30) {
      priceLow30 = close[i];
      priceLowIdx = i;
    }
    if (!isNaN(adx[i]) && adx[i] > adxHigh30) {
      adxHigh30 = adx[i];
      adxHighIdx = i;
    }
    if (!isNaN(adx[i]) && adx[i] < adxLow30) {
      adxLow30 = adx[i];
      adxLowIdx = i;
    }
  }

  if (close[n - 1] >= priceHigh30 * 0.98 && adx[n - 1] < adxHigh30 * 0.95 && currentAdx > 25) {
    divergenceType = 'top';
    divergenceConfidence = 0.8;
    divergenceDesc = '价格创近期新高但ADX未创新高，顶背离预警';
  } else if (close[n - 1] <= priceLow30 * 1.02 && adx[n - 1] > adxLow30 * 1.05 && currentAdx > 25) {
    divergenceType = 'bottom';
    divergenceConfidence = 0.8;
    divergenceDesc = '价格创近期新低但ADX未创新低，底背离预警';
  }

  let plusDiWarning: 'none' | 'high' | 'extreme';
  let minusDiWarning: 'none' | 'high' | 'extreme';
  let diExtremesDesc: string;

  if (currentPlusDi > 50) {
    plusDiWarning = 'extreme';
  } else if (currentPlusDi > 40) {
    plusDiWarning = 'high';
  } else {
    plusDiWarning = 'none';
  }

  if (currentMinusDi > 50) {
    minusDiWarning = 'extreme';
  } else if (currentMinusDi > 40) {
    minusDiWarning = 'high';
  } else {
    minusDiWarning = 'none';
  }

  if (plusDiWarning === 'extreme') {
    diExtremesDesc = `+DI(${currentPlusDi.toFixed(1)})>50，极强买方力量，警惕超买`;
  } else if (plusDiWarning === 'high') {
    diExtremesDesc = `+DI(${currentPlusDi.toFixed(1)})>40，买方力量较强`;
  } else if (minusDiWarning === 'extreme') {
    diExtremesDesc = `-DI(${currentMinusDi.toFixed(1)})>50，极强卖方力量，警惕超卖`;
  } else if (minusDiWarning === 'high') {
    diExtremesDesc = `-DI(${currentMinusDi.toFixed(1)})>40，卖方力量较强`;
  } else {
    diExtremesDesc = 'DI线处于安全区间';
  }

  let totalScore = 0;
  const reasoning: string[] = [];

  if (strengthLevel === 'medium_trend') {
    totalScore += 0.3;
    reasoning.push('ADX处于中等趋势区间');
  } else if (strengthLevel === 'strong_trend') {
    totalScore += 0.2;
    reasoning.push('ADX处于强趋势区间');
  } else if (strengthLevel === 'no_trend') {
    totalScore -= 0.3;
    reasoning.push('ADX低于20，无趋势');
  }

  if (directionBias === 'bullish') {
    totalScore += 0.2;
    reasoning.push('+DI > -DI，多头方向');
  } else if (directionBias === 'bearish') {
    totalScore -= 0.2;
    reasoning.push('-DI > +DI，空头方向');
  }

  if (crossValidity === 'valid') {
    totalScore += 0.2;
    reasoning.push(lastCrossType === 'golden' ? '5日内金叉有效' : '5日内死叉有效');
  }

  if (divergenceType === 'bottom') {
    totalScore += 0.25;
    reasoning.push('底背离信号');
  } else if (divergenceType === 'top') {
    totalScore -= 0.25;
    reasoning.push('顶背离信号');
  }

  if (adxTrend === 'rising') {
    totalScore += 0.175;
    reasoning.push('ADX上升，趋势增强');
  } else if (adxTrend === 'falling') {
    totalScore -= 0.175;
    reasoning.push('ADX下降，趋势减弱');
  }

  let finalLevel: ADXSignal['comprehensive_assessment']['level'];
  if (totalScore >= 0.8) finalLevel = 'strong_bullish';
  else if (totalScore >= 0.4) finalLevel = 'bullish';
  else if (totalScore >= -0.4) finalLevel = 'neutral';
  else if (totalScore >= -0.8) finalLevel = 'bearish';
  else finalLevel = 'strong_bearish';

  let finalConfidence: 'high' | 'medium' | 'low';
  let finalAction: string;

  if (crossValidity === 'valid' && adxTrend === 'rising' && divergenceType === 'none') {
    finalConfidence = 'high';
  } else if (lastCrossType !== 'none' || divergenceType !== 'none') {
    finalConfidence = 'medium';
  } else {
    finalConfidence = 'low';
  }

  if (finalLevel === 'strong_bullish' || finalLevel === 'bullish') {
    finalAction = '积极买入或持有';
  } else if (finalLevel === 'strong_bearish' || finalLevel === 'bearish') {
    finalAction = '减仓或观望';
  } else {
    finalAction = '中性观望';
  }

  return {
    date: new Date().toISOString().split('T')[0],
    adx_period: 14,
    indicators: {
      adx: currentAdx,
      plus_di: currentPlusDi,
      minus_di: currentMinusDi,
      adx_slope_5d: adxSlope5d
    },
    strength_analysis: {
      level: strengthLevel,
      range: strengthRange,
      color: strengthColor,
      description: strengthDesc
    },
    direction_analysis: {
      bias: directionBias,
      di_spread: diSpread,
      description: directionDesc
    },
    signal_analysis: {
      last_cross: {
        type: lastCrossType,
        days_ago: daysAgo,
        adx_at_cross: adxAtCross,
        adx_trend_at_cross: adxTrendAtCross,
        validity: crossValidity,
        description: crossDesc
      },
      current_signal: 'none'
    },
    momentum_analysis: {
      adx_trend: adxTrend,
      slope_value: adxSlope5d,
      description: momentumDesc
    },
    exhaustion_analysis: {
      divergence: {
        type: divergenceType,
        confidence: divergenceConfidence,
        description: divergenceDesc
      },
      di_extremes: {
        plus_di_warning: plusDiWarning,
        minus_di_warning: minusDiWarning,
        description: diExtremesDesc
      }
    },
    comprehensive_assessment: {
      score: totalScore,
      level: finalLevel,
      confidence: finalConfidence,
      action: finalAction,
      reasoning
    },
    risk_warnings: {
      adx_extreme: currentAdx > 75 ? 'warning' : 'none',
      description: currentAdx > 75 ? `ADX(${currentAdx.toFixed(1)})>75，情绪极端，建议减半持仓` : '无预警'
    }
  };
}

function generateBollingerSignal(closes: number[], params: TrendParams = defaultTrendParams): BollingerSignal | null {
  if (closes.length < 140) {
    return {
      date: new Date().toISOString().split('T')[0],
      bollinger_data: {
        upper_band: 0,
        middle_band: 0,
        lower_band: 0,
        width: 0,
        width_percent: 0
      },
      squeeze_analysis: {
        historical_min_width: 0,
        current_percentile: 0,
        experience_rule_met: false,
        percentile_rule_met: false,
        consecutive_days: 0,
        dual_criteria_met: false
      },
      squeeze_signal: {
        signal_level: 'NONE',
        signal_name: '数据不足',
        description: '数据不足，需要至少140个交易日数据'
      },
      indicators: {
        experience_condition: '',
        percentile_condition: ''
      },
      risk_warnings: {
        breakdown_below_lower: 'none',
        breakout_above_upper: 'none',
        description: '数据不足'
      }
    };
  }

  const n = closes.length;
  const middleBand = calculateSMA(closes, 20);
  const stdDev = calculateStdDev(closes, 20);

  const currentMiddle = middleBand[n - 1];
  const currentStdDev = stdDev[n - 1];

  const upper_band = currentMiddle + 2 * currentStdDev;
  const lower_band = currentMiddle - 2 * currentStdDev;
  const width = (upper_band - lower_band) / currentMiddle;
  const width_percent = width * 100;

  const historicalWidths = [];
  for (let i = 20; i < n; i++) {
    const mb = middleBand[i];
    const sd = stdDev[i];
    if (!isNaN(mb) && !isNaN(sd) && mb > 0) {
      const w = (4 * sd) / mb;
      historicalWidths.push(w);
    }
  }

  const recent120Widths = historicalWidths.slice(-120);
  const currentWidth = width;

  const historicalMin = Math.min(...recent120Widths.slice(0, -1));
  const experienceRuleMet = currentWidth < historicalMin * 1.05;

  const countLessEqual = recent120Widths.filter(w => w <= currentWidth).length;
  const percentileRank = (countLessEqual - 1) / (recent120Widths.length - 1);
  const percentileRuleMet = percentileRank < 0.20;

  const dualCriteriaMet = experienceRuleMet && percentileRuleMet;

  let consecutiveDays = 0;
  for (let i = recent120Widths.length - 1; i >= 0; i--) {
    const w = recent120Widths[i];
    const histMin = Math.min(...recent120Widths.slice(0, i));
    const expMet = w < histMin * 1.05;

    const cntLess = recent120Widths.slice(0, i + 1).filter(x => x <= w).length;
    const pctRank = (cntLess - 1) / i;
    const pctMet = pctRank < 0.20;

    if (expMet && pctMet) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  let signalLevel: BollingerSignal['squeeze_signal']['signal_level'];
  let signalName: string;
  let description: string;

  if (dualCriteriaMet && consecutiveDays >= 5) {
    signalLevel = 'HIGH_INTENSITY';
    signalName = '高强度挤压确认';
    description = `波动率已降至极低水平，双重标准确认且持续${consecutiveDays}个交易日，突破概率显著增加`;
  } else if (dualCriteriaMet) {
    signalLevel = 'MEDIUM';
    signalName = '中级挤压确认';
    description = '双重标准确认，波动率处于历史低位，关注潜在突破';
  } else if (experienceRuleMet || percentileRuleMet) {
    signalLevel = 'LOW';
    signalName = '初级挤压预警';
    if (experienceRuleMet && !percentileRuleMet) {
      description = `经验法则触发，但统计分位未确认（当前百分位${(percentileRank * 100).toFixed(1)}%）`;
    } else if (!experienceRuleMet && percentileRuleMet) {
      description = '统计分位确认，但未达到经验法则阈值';
    } else {
      description = '单一标准满足，需进一步观察';
    }
  } else {
    signalLevel = 'NONE';
    signalName = '无挤压信号';
    description = '波动率处于正常水平';
  }

  return {
    date: new Date().toISOString().split('T')[0],
    bollinger_data: {
      upper_band: upper_band,
      middle_band: currentMiddle,
      lower_band: lower_band,
      width: width,
      width_percent: width_percent
    },
    squeeze_analysis: {
      historical_min_width: historicalMin,
      current_percentile: percentileRank,
      experience_rule_met: experienceRuleMet,
      percentile_rule_met: percentileRuleMet,
      consecutive_days: consecutiveDays,
      dual_criteria_met: dualCriteriaMet
    },
    squeeze_signal: {
      signal_level: signalLevel,
      signal_name: signalName,
      description: description
    },
    indicators: {
      experience_condition: `Width(${width.toFixed(4)}) < Historical_Min(${historicalMin.toFixed(4)}) × 1.05 = ${(historicalMin * 1.05).toFixed(4)}`,
      percentile_condition: `Percentile(${Math.round(percentileRank * 100)}%) < 20%`
    },
    risk_warnings: {
      breakdown_below_lower: closes[n - 1] < lower_band ? 'warning' : 'none',
      breakout_above_upper: closes[n - 1] > upper_band ? 'warning' : 'none',
      description: closes[n - 1] < lower_band ? `价格跌破布林带下轨(${lower_band.toFixed(2)})，做空风险预警` : 
                   closes[n - 1] > upper_band ? `价格突破布林带上轨(${upper_band.toFixed(2)})，做多风险预警` : '无预警'
    }
  };
}

export function computeTrendIndicator(symbol: string, name: string, data: RawData[], params: TrendParams = defaultTrendParams): TrendIndicator {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);
  const lastIndex = data.length - 1;

  const currentPrice = data[lastIndex].close;
  const sma20 = calculateSMA(closes, 20);
  const ma20 = sma20[lastIndex];

  const sma20Valid = sma20.filter(v => !isNaN(v));
  const ma20Signal = generateMA20Signal(sma20Valid, params);
  const macdSignal = generateMACDSignal(closes, volumes, params);
  const adxSignal = generateADXSignal(data, params);
  const bollingerSignal = generateBollingerSignal(closes, params);

  return {
    symbol,
    name,
    price: currentPrice,
    ma20,
    ma20Signal,
    macdSignal,
    adxSignal,
    bollingerSignal,
    updatedAt: Date.now()
  };
}
