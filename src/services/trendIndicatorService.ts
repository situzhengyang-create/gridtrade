import { RawData, TrendIndicator, MA20Signal, MACDSignal, BollingerSignal, ADXSignal } from '../types';
import { TrendParams, defaultTrendParams } from '../types/params';

export function calculateSMA(data: number[], periods: number): number[] {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < periods - 1) {
      sma.push(NaN);
      continue;
    }
    const window = data.slice(i - periods + 1, i + 1);
    const sum = window.reduce((a, b) => a + b, 0);
    sma.push(sum / periods);
  }
  return sma;
}

export function calculateEMA(data: number[], periods: number): number[] {
  const ema = [];
  const multiplier = 2 / (periods + 1);

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[0]);
      continue;
    }
    if (i < periods - 1) {
      ema.push(NaN);
      continue;
    }
    const currentEMA = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(currentEMA);
  }
  return ema;
}

export function calculateStdDev(data: number[], periods: number): number[] {
  const stdDev = [];
  for (let i = 0; i < data.length; i++) {
    if (i < periods - 1) {
      stdDev.push(NaN);
      continue;
    }
    const window = data.slice(i - periods + 1, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / periods;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / periods;
    stdDev.push(Math.sqrt(variance));
  }
  return stdDev;
}

export function calculateNormalizedSlope(data: number[], periods: number): number | null {
  const windowData = data.slice(-periods);
  if (windowData.length < periods) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const n = periods;
  const base = windowData[0];

  if (!base) return 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = (windowData[i] / base) - 1;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
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

  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const dif: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    dif.push(ema12[i] - ema26[i]);
  }
  const dea = calculateEMA(dif, 9);
  const histogram: number[] = [];
  for (let i = 0; i < dif.length; i++) {
    histogram.push(dif[i] - dea[i]);
  }

  const n = closes.length;
  const currentDif = dif[n - 1];
  const currentDea = dea[n - 1];
  const currentHist = histogram[n - 1];
  const prevDif = dif[n - 2];
  const prevDea = dea[n - 2];
  const prevHist = histogram[n - 2];

  let crossSignal: MACDSignal['signals']['cross_signal'];
  let crossScore = 0;
  if (prevDif <= prevDea && currentDif > currentDea) {
    crossSignal = {
      type: 'golden',
      strength: currentDif - currentDea,
      description: `DIF上穿DEA形成金叉（强度：${(currentDif - currentDea).toFixed(4)}）`
    };
    crossScore = 0.3;
  } else if (prevDif >= prevDea && currentDif < currentDea) {
    crossSignal = {
      type: 'dead',
      strength: currentDea - currentDif,
      description: `DIF下穿DEA形成死叉（强度：${(currentDea - currentDif).toFixed(4)}）`
    };
    crossScore = -0.3;
  } else {
    crossSignal = {
      type: 'none',
      strength: Math.abs(currentDif - currentDea),
      description: '无交叉信号'
    };
  }

  let positionSignal: MACDSignal['signals']['position_signal'];
  let positionScore = 0;
  if (currentDif > 0 && currentDea > 0) {
    positionSignal = {
      type: 'above_zero',
      bias: 'bullish',
      description: '位于零轴上方，多头区域'
    };
    positionScore = 0.2;
  } else if (currentDif < 0 && currentDea < 0) {
    positionSignal = {
      type: 'below_zero',
      bias: 'bearish',
      description: '位于零轴下方，空头区域'
    };
    positionScore = -0.2;
  } else {
    positionSignal = {
      type: 'near_zero',
      bias: 'neutral',
      description: '位于零轴附近，中性区域'
    };
  }

  let divergenceSignal: MACDSignal['signals']['divergence_signal'];
  let divergenceScore = 0;
  const lookback = 30;
  const startIdx = Math.max(0, n - lookback);
  let priceHigh = -Infinity, priceLow = Infinity;
  let macdHigh = -Infinity, macdLow = Infinity;
  for (let i = startIdx; i < n; i++) {
    if (closes[i] > priceHigh) priceHigh = closes[i];
    if (closes[i] < priceLow) priceLow = closes[i];
    if (dif[i] > macdHigh) macdHigh = dif[i];
    if (dif[i] < macdLow) macdLow = dif[i];
  }

  if (closes[n - 1] >= priceHigh * 0.98 && dif[n - 1] < macdHigh * 0.95) {
    divergenceSignal = {
      type: 'top',
      confidence: 0.8,
      description: '价格创近期新高但MACD未创新高，顶背离预警'
    };
    divergenceScore = -0.25;
  } else if (closes[n - 1] <= priceLow * 1.02 && dif[n - 1] > macdLow * 1.05) {
    divergenceSignal = {
      type: 'bottom',
      confidence: 0.8,
      description: '价格创近期新低但MACD未创新低，底背离预警'
    };
    divergenceScore = 0.25;
  } else {
    divergenceSignal = {
      type: 'none',
      confidence: 0,
      description: '无背离信号'
    };
  }

  let momentumSignal: MACDSignal['signals']['momentum_signal'];
  let momentumScore = 0;
  const histChange = currentHist - prevHist;
  const histChangeRate = prevHist !== 0 ? histChange / Math.abs(prevHist) : 0;

  if (histChangeRate > 0.05 && Math.sign(currentHist) === Math.sign(prevHist)) {
    momentumSignal = {
      trend: 'accelerating',
      histogram_change: histChange,
      description: `柱状图加速扩大（+${histChange.toFixed(4)}）`
    };
    momentumScore = 0.15;
  } else if (histChangeRate < -0.05 && Math.sign(currentHist) === Math.sign(prevHist)) {
    momentumSignal = {
      trend: 'decelerating',
      histogram_change: histChange,
      description: `柱状图减速收缩（${histChange.toFixed(4)}）`
    };
    momentumScore = -0.15;
  } else if (Math.sign(currentHist) !== Math.sign(prevHist) && prevHist !== 0) {
    momentumSignal = {
      trend: 'reversal',
      histogram_change: histChange,
      description: `柱状图发生反转（${histChange.toFixed(4)}）`
    };
    momentumScore = currentHist > 0 ? 0.1 : -0.1;
  } else {
    momentumSignal = {
      trend: 'stable',
      histogram_change: histChange,
      description: '柱状图动量稳定'
    };
  }

  let volumeSignal: MACDSignal['signals']['volume_signal'];
  let volumeScore = 0;
  const volMa5 = calculateSMA(volumes.slice(-6).slice(0, -1), 5);
  const lastVolMa5 = volMa5[volMa5.length - 1];
  if (lastVolMa5 > 0) {
    const volChange = (volumes[n - 1] - lastVolMa5) / lastVolMa5;
    if (crossSignal.type !== 'none') {
      if ((crossSignal.type === 'golden' && volChange > 0) || (crossSignal.type === 'dead' && volChange > 0)) {
        volumeSignal = {
          confirmed: true,
          volume_change: volChange,
          description: `成交量放大${(volChange * 100).toFixed(1)}%，信号增强`
        };
        volumeScore = 0.1;
      } else {
        volumeSignal = {
          confirmed: false,
          volume_change: volChange,
          description: `成交量变化${(volChange * 100).toFixed(1)}%，无明显放量`
        };
      }
    } else {
      volumeSignal = {
        confirmed: false,
        volume_change: volChange,
        description: '无交叉信号，成交量参考价值低'
      };
    }
  } else {
    volumeSignal = {
      confirmed: false,
      volume_change: 0,
      description: '成交量数据不足'
    };
  }

  const totalScore = crossScore + positionScore + divergenceScore + momentumScore + volumeScore;

  let level: MACDSignal['comprehensive_signal']['level'];
  let action: string;
  if (totalScore >= 0.7) {
    level = 'strong_bullish';
    action = '买入或加仓';
  } else if (totalScore >= 0.3) {
    level = 'bullish';
    action = '考虑买入';
  } else if (totalScore >= -0.3) {
    level = 'neutral';
    action = '观望';
  } else if (totalScore >= -0.7) {
    level = 'bearish';
    action = '考虑卖出';
  } else {
    level = 'strong_bearish';
    action = '卖出或减仓';
  }

  let confidence: 'high' | 'medium' | 'low';
  if (crossSignal.type !== 'none' && Math.abs(crossSignal.strength) > 0.05 && volumeSignal.confirmed) {
    confidence = 'high';
  } else if (crossSignal.type !== 'none' || divergenceSignal.type !== 'none') {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  const reasoning: string[] = [];
  if (crossSignal.type !== 'none') {
    reasoning.push(crossSignal.description);
  }
  reasoning.push(positionSignal.description);
  if (divergenceSignal.type !== 'none') {
    reasoning.push(divergenceSignal.description);
  }
  reasoning.push(momentumSignal.description);

  return {
    date: new Date().toISOString().split('T')[0],
    macd_values: {
      dif: currentDif,
      dea: currentDea,
      histogram: currentHist
    },
    signals: {
      cross_signal: crossSignal,
      position_signal: positionSignal,
      divergence_signal: divergenceSignal,
      momentum_signal: momentumSignal,
      volume_signal: volumeSignal
    },
    comprehensive_signal: {
      score: totalScore,
      level,
      confidence,
      action,
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

  const atr: number[] = [];
  const plusDm14: number[] = [];
  const minusDm14: number[] = [];
  const alpha = 1 / 14;

  for (let i = 0; i < n; i++) {
    if (i < 13) {
      atr.push(NaN);
      plusDm14.push(NaN);
      minusDm14.push(NaN);
    } else if (i === 13) {
      const sumTr = tr.slice(0, 14).reduce((a, b) => a + b, 0);
      const sumPlus = plusDm.slice(0, 14).reduce((a, b) => a + b, 0);
      const sumMinus = minusDm.slice(0, 14).reduce((a, b) => a + b, 0);
      atr.push(sumTr / 14);
      plusDm14.push(sumPlus / 14);
      minusDm14.push(sumMinus / 14);
    } else {
      atr.push((tr[i] - atr[i - 1]) * alpha + atr[i - 1]);
      plusDm14.push((plusDm[i] - plusDm14[i - 1]) * alpha + plusDm14[i - 1]);
      minusDm14.push((minusDm[i] - minusDm14[i - 1]) * alpha + minusDm14[i - 1]);
    }
  }

  const plusDi: number[] = [];
  const minusDi: number[] = [];
  const dx: number[] = [];

  for (let i = 0; i < n; i++) {
    if (isNaN(atr[i]) || atr[i] === 0) {
      plusDi.push(NaN);
      minusDi.push(NaN);
      dx.push(NaN);
    } else {
      plusDi.push((plusDm14[i] / atr[i]) * 100);
      minusDi.push((minusDm14[i] / atr[i]) * 100);

      const sumDi = plusDi[i] + minusDi[i];
      if (sumDi === 0) {
        dx.push(0);
      } else {
        dx.push(Math.abs(plusDi[i] - minusDi[i]) / sumDi * 100);
      }
    }
  }

  const adx: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i < 27) {
      adx.push(NaN);
    } else if (i === 27) {
      const sumDx = dx.slice(14, 28).reduce((a, b) => a + b, 0);
      adx.push(sumDx / 14);
    } else {
      adx.push((dx[i] - adx[i - 1]) * alpha + adx[i - 1]);
    }
  }

  const currentAdx = adx[n - 1] || 0;
  const currentPlusDi = plusDi[n - 1] || 0;
  const currentMinusDi = minusDi[n - 1] || 0;

  let strengthLevel: ADXSignal['strength_analysis']['level'];
  let strengthRange: string;
  let strengthColor: string;
  let strengthDesc: string;

  if (currentAdx >= 75) {
    strengthLevel = 'extreme_trend';
    strengthRange = '>75';
    strengthColor = '#8B0000';
    strengthDesc = '极强趋势，极端行情';
  } else if (currentAdx >= 50) {
    strengthLevel = 'strong_trend';
    strengthRange = '50-75';
    strengthColor = '#FF0000';
    strengthDesc = '强趋势，趋势加速';
  } else if (currentAdx >= 25) {
    strengthLevel = 'medium_trend';
    strengthRange = '25-50';
    strengthColor = '#00B050';
    strengthDesc = '中等趋势，明确的趋势行情';
  } else if (currentAdx >= 20) {
    strengthLevel = 'trend_forming';
    strengthRange = '20-25';
    strengthColor = '#FFC000';
    strengthDesc = '趋势萌芽，可能转势';
  } else {
    strengthLevel = 'no_trend';
    strengthRange = '0-20';
    strengthColor = '#808080';
    strengthDesc = '无趋势，震荡盘整';
  }

  const diSpread = Math.abs(currentPlusDi - currentMinusDi);
  let directionBias: ADXSignal['direction_analysis']['bias'];
  let directionDesc: string;

  if (currentPlusDi > currentMinusDi && diSpread > 5) {
    directionBias = 'bullish';
    directionDesc = `+DI(${currentPlusDi.toFixed(1)})持续位于-DI(${currentMinusDi.toFixed(1)})上方，差值${diSpread.toFixed(1)}，买方力量主导`;
  } else if (currentMinusDi > currentPlusDi && diSpread > 5) {
    directionBias = 'bearish';
    directionDesc = `-DI(${currentMinusDi.toFixed(1)})持续位于+DI(${currentPlusDi.toFixed(1)})上方，差值${diSpread.toFixed(1)}，卖方力量主导`;
  } else {
    directionBias = 'neutral';
    directionDesc = `+DI(${currentPlusDi.toFixed(1)})与-DI(${currentMinusDi.toFixed(1)})差值${diSpread.toFixed(1)}，多空力量均衡`;
  }

  let lastCrossType: 'golden' | 'dead' | 'none' = 'none';
  let daysAgo = 0;
  let adxAtCross = 0;
  let adxTrendAtCross: 'rising' | 'falling' | 'flat' = 'flat';

  for (let i = Math.max(0, n - 21); i < n - 1; i++) {
    if (!isNaN(plusDi[i]) && !isNaN(minusDi[i]) && !isNaN(plusDi[i + 1]) && !isNaN(minusDi[i + 1])) {
      if (plusDi[i] <= minusDi[i] && plusDi[i + 1] > minusDi[i + 1]) {
        lastCrossType = 'golden';
        daysAgo = n - 1 - (i + 1);
        adxAtCross = adx[i + 1] || 0;
        if (i >= 5 && !isNaN(adx[i - 4])) {
          const slope = calculateNormalizedSlope(adx.slice(i - 4, i + 2), 6) || 0;
          adxTrendAtCross = slope > 0.005 ? 'rising' : slope < -0.005 ? 'falling' : 'flat';
        }
        break;
      } else if (plusDi[i] >= minusDi[i] && plusDi[i + 1] < minusDi[i + 1]) {
        lastCrossType = 'dead';
        daysAgo = n - 1 - (i + 1);
        adxAtCross = adx[i + 1] || 0;
        if (i >= 5 && !isNaN(adx[i - 4])) {
          const slope = calculateNormalizedSlope(adx.slice(i - 4, i + 2), 6) || 0;
          adxTrendAtCross = slope > 0.005 ? 'rising' : slope < -0.005 ? 'falling' : 'flat';
        }
        break;
      }
    }
  }

  let crossValidity: 'valid' | 'invalid' = 'invalid';
  let crossDesc: string;

  if (lastCrossType !== 'none') {
    if (adxAtCross >= 20 && adxTrendAtCross === 'rising') {
      crossValidity = 'valid';
      crossDesc = `${lastCrossType === 'golden' ? '有效金叉' : '有效死叉'}信号，发生在${adxTrendAtCross === 'rising' ? 'ADX上升期' : 'ADX盘整期'}`;
    } else {
      crossDesc = `${lastCrossType === 'golden' ? '金叉' : '死叉'}信号${adxAtCross < 20 ? '，但ADX低于20' : ''}${adxTrendAtCross !== 'rising' ? '，ADX未上升' : ''}`;
    }
  } else {
    crossDesc = '最近20日内无DI交叉信号';
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
    reasoning.push('ADX处于中等趋势区间，趋势跟踪策略适用');
  } else if (strengthLevel === 'strong_trend') {
    totalScore += 0.2;
    reasoning.push('ADX处于强趋势区间');
  } else if (strengthLevel === 'no_trend') {
    totalScore -= 0.3;
    reasoning.push('ADX处于无趋势区间，震荡市');
  }

  if (directionBias === 'bullish') {
    totalScore += 0.25;
    reasoning.push('+DI高于-DI，多头占优');
  } else if (directionBias === 'bearish') {
    totalScore -= 0.25;
    reasoning.push('-DI高于+DI，空头占优');
  }

  if (adxTrend === 'rising' && adxSlope5d > 0.01) {
    totalScore += 0.2;
    reasoning.push('ADX上升，趋势强度在增强');
  }
  if (lastCrossType === 'golden' && crossValidity === 'valid') {
    totalScore += 0.2;
    reasoning.push('有效金叉信号');
  } else if (lastCrossType === 'dead' && crossValidity === 'valid') {
    totalScore -= 0.2;
    reasoning.push('有效死叉信号');
  }

  if (divergenceType === 'none') {
    totalScore += 0.1;
  } else if (divergenceType === 'top') {
    totalScore -= 0.2;
    reasoning.push('顶背离预警');
  } else if (divergenceType === 'bottom') {
    totalScore += 0.1;
    reasoning.push('底背离，可能见底');
  }

  if (plusDiWarning === 'none' && minusDiWarning === 'none') {
    totalScore += 0.1;
  } else if (plusDiWarning === 'extreme' || minusDiWarning === 'extreme') {
    totalScore -= 0.2;
    reasoning.push('DI极端值预警');
  }

  totalScore = Math.max(-1, Math.min(1, totalScore));

  let finalLevel: ADXSignal['comprehensive_assessment']['level'];
  let finalAction: string;
  let finalConfidence: 'high' | 'medium' | 'low';

  if (totalScore >= 0.6) {
    finalLevel = 'strong_bullish';
    finalAction = '买入/加仓';
  } else if (totalScore >= 0.3) {
    finalLevel = 'bullish';
    finalAction = '考虑买入';
  } else if (totalScore >= -0.3) {
    finalLevel = 'neutral';
    finalAction = '观望';
  } else if (totalScore >= -0.6) {
    finalLevel = 'bearish';
    finalAction = '考虑卖出';
  } else {
    finalLevel = 'strong_bearish';
    finalAction = '卖出/减仓';
  }

  if (crossValidity === 'valid' && adxTrend === 'rising' && divergenceType === 'none') {
    finalConfidence = 'high';
  } else if (lastCrossType !== 'none' || divergenceType !== 'none') {
    finalConfidence = 'medium';
  } else {
    finalConfidence = 'low';
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

  let signalLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH_INTENSITY';
  let signalName: string;
  let description: string;

  if (consecutiveDays >= 5) {
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

  const sma20 = calculateSMA(closes, params.bollinger.period);
  const ma20 = sma20[lastIndex] || 0;

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
