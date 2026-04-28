
export interface RawData {
  date: string;
  open: number;
  close: number;
  change_pct: number;
}

export interface DiagnosisReport {
  score: number;
  rating: string;
  suggestion: string;
  details: {
    cumulativeReturn: number;
    annualizedReturn: number;
    annualizedVolatility: number;
    averageIntradayVolatility: number;
    trendChangeFreq: number;
    maxConsecutiveUp: number;
    maxConsecutiveDown: number;
    bollingerRatio: number;
  };
  problems: string[];
  advantages: string[];
  risks: string[];
  interpretations: {
    收益率: string;
    波动率: string;
    震荡特征: string;
    价格分布: string;
  };
  logics: {
    收益率: string;
    波动率: string;
    震荡特征: string;
    价格分布: string;
  };
  metricsInfo?: {
    收益率: MetricInfo;
    波动率: MetricInfo;
    震荡特征: MetricInfo;
    价格分布: MetricInfo;
  };
  scoreLogic: string;
  summary: {
    totalDays: number;
    currentPrice: number;
    date: string;
  };
  backtest: {
    avgDailyAmplitude: number;
    medianDailyAmplitude: number;
    maxDrawdown1Y: number;
    maxDrawdown3Y: number;
    historicalMin: number;
    historicalMax: number;
    recommendedGridSize: number;
    safeGridMin: number;
    safeGridMax: number;
  };
}

export interface MetricInfo {
  definition: string[];
  standards: string[];
  significance: string;
  evaluation: string;
}

export const analyzeGridSuitability = (data: RawData[]): DiagnosisReport => {
  // 3.1 数据预处理
  let processedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Clean data (simple implementation)
  processedData = processedData.map((item, index) => {
    let close = item.close;
    if (close <= 0 && index > 0) close = processedData[index - 1].close;
    
    let changePct = item.change_pct;
    if (Math.abs(changePct) > 20) changePct = 0;
    
    return {...item, close, change_pct: changePct};
  });

  if (processedData.length < 60) {
    throw new Error('数据量不足，至少需要60个交易日数据');
  }

  // 3.2 核心指标计算
  // 1. 收益率
  const earliest = processedData[0].close;
  const latest = processedData[processedData.length - 1].close;
  const cumulativeReturn = ((latest - earliest) / earliest) * 100;
  const annualizedReturn = cumulativeReturn * (252 / processedData.length);

  // 2. 波动率
  const dailyReturns = [];
  for (let i = 1; i < processedData.length; i++) {
    dailyReturns.push((processedData[i].close - processedData[i-1].close) / processedData[i-1].close);
  }
  const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (dailyReturns.length - 1);
  const annualizedVolatility = Math.sqrt(variance) * Math.sqrt(252) * 100;
  
  const intradayVolatility = processedData.reduce((acc, curr) => acc + Math.abs(curr.close - curr.open) / curr.open, 0) / processedData.length * 100;

  // 3. 震荡特征
  let changes = 0;
  for (let i = 2; i < processedData.length; i++) {
    const prevDir = processedData[i-1].change_pct > 0;
    const currDir = processedData[i].change_pct > 0;
    if (prevDir !== currDir) changes++;
  }
  const trendChangeFreq = (changes / (processedData.length - 1)) * 100;

  // Max consecutive
  let maxUp = 0, maxDown = 0, currUp = 0, currDown = 0;
  processedData.forEach(d => {
    if (d.change_pct > 0) {
      currUp++;
      currDown = 0;
      if (currUp > maxUp) maxUp = currUp;
    } else if (d.change_pct < 0) {
      currDown++;
      currUp = 0;
      if (currDown > maxDown) maxDown = currDown;
    } else {
      currUp = currDown = 0;
    }
  });

  // 4. 布林带
  // Simplified Bollinger
  const windowSize = 20;
  let inBandCount = 0;
  let totalBands = 0;
  for (let i = windowSize; i < processedData.length; i++) {
    const slice = processedData.slice(i - windowSize, i).map(d => d.close);
    const mean = slice.reduce((a, b) => a + b, 0) / windowSize;
    const stdDev = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / windowSize);
    
    if (processedData[i].close >= (mean - 2 * stdDev) && processedData[i].close <= (mean + 2 * stdDev)) {
      inBandCount++;
    }
    totalBands++;
  }
  const bollingerRatio = (inBandCount / totalBands) * 100;

  // 3.3 评分
  let score = 0;
  const advantages = [];
  const risks = [];
  
  // A. 波动率 (3分)
  if (annualizedVolatility >= 20 && annualizedVolatility <= 40) { score += 3; advantages.push('波动率处于网格交易的最优区间'); }
  else if ((annualizedVolatility >= 15 && annualizedVolatility < 20) || (annualizedVolatility > 40 && annualizedVolatility <= 50)) { score += 2; risks.push('波动率稍显过低或过高，可能影响网格效率'); }
  else { score += 1; risks.push('波动率风险较高'); }

  // B. 趋势 (3分)
  if (Math.abs(cumulativeReturn) <= 10) { score += 1; advantages.push('震荡市趋势特征明显'); }
  if (Math.max(maxUp, maxDown) <= 3) { score += 2; advantages.push('中短期无明显趋势，震荡频繁'); }
  else { risks.push('存在潜在单边趋势，需警惕网格被套或踏空'); }

  // C. 震荡 (2分)
  if (trendChangeFreq >= 50) { score += 2; advantages.push('价格震荡频繁，提供了充足的交易机会'); }
  else { risks.push('震荡不够频繁，可能导致网格交易冷清'); }

  // D. 价格分布 (2分)
  if (bollingerRatio >= 90) { score += 2; advantages.push('价格主要运行在布林带通道内'); }
  else { risks.push('价格常出现布林带通道突破，风险较高'); }

  // E. 日内波动 (加分1分)
  if (intradayVolatility >= 0.5 && intradayVolatility <= 2.0) { score += 1; advantages.push('日内波动提供了一定的操作空间'); }

  let rating = '不适合';
  let suggestion = '不建议使用网格策略';
  if (score >= 8) { rating = '非常适合'; suggestion = '可正常开展网格交易'; }
  else if (score >= 6) { rating = '适合'; suggestion = '建议开展网格交易'; }
  else if (score >= 4) { rating = '勉强适合'; suggestion = '建议小资金测试'; }

  // 4. 回测辅助指标 (Backtest Metrics)
  const amplitudes = processedData.map(d => Math.abs(d.change_pct));
  amplitudes.sort((a,b) => a-b);
  const avgAmplitude = amplitudes.reduce((a,b) => a+b, 0) / amplitudes.length;
  const medianAmplitude = amplitudes[Math.floor(amplitudes.length / 2)];

  const prices = processedData.map(d => d.close);
  const historicalMin = Math.min(...prices);
  const historicalMax = Math.max(...prices);

  const calcMaxDrawdown = (dataSlice: RawData[]) => {
    if (dataSlice.length === 0) return 0;
    let maxPx = dataSlice[0].close;
    let maxDD = 0;
    for(let i=1; i<dataSlice.length; i++) {
      const px = dataSlice[i].close;
      if (px > maxPx) maxPx = px;
      else {
        const dd = (maxPx - px) / maxPx;
        if (dd > maxDD) maxDD = dd;
      }
    }
    return maxDD * 100;
  };

  const oneYearData = processedData.slice(Math.max(0, processedData.length - 250));
  const threeYearData = processedData.slice(Math.max(0, processedData.length - 750));
  
  const maxDD1Y = calcMaxDrawdown(oneYearData);
  const maxDD3Y = calcMaxDrawdown(threeYearData);

  // Recommendations based on metrics
  const recommendedGridSize = Math.max(0.5, Number((medianAmplitude * 1.2).toFixed(2))); // somewhat arbitrary but sensible
  // Safe interval covers inner 80% range potentially? Or just min-max with a buffer. Let's do 5th and 95th percentiles.
  const sortedPrices = [...prices].sort((a,b) => a-b);
  const safeGridMin = sortedPrices[Math.floor(sortedPrices.length * 0.05)];
  const safeGridMax = sortedPrices[Math.floor(sortedPrices.length * 0.95)];

  return {
    score,
    rating,
    suggestion,
    details: {
      cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
      annualizedReturn: Number(annualizedReturn.toFixed(2)),
      annualizedVolatility: Number(annualizedVolatility.toFixed(2)),
      averageIntradayVolatility: Number(intradayVolatility.toFixed(2)),
      trendChangeFreq: Number(trendChangeFreq.toFixed(2)),
      maxConsecutiveUp: maxUp,
      maxConsecutiveDown: maxDown,
      bollingerRatio: Number(bollingerRatio.toFixed(2)),
    },
    problems: [],
    advantages,
    risks,
    interpretations: {
      收益率: Math.abs(cumulativeReturn) <= 10 ? '属于典型震荡行情' : '具有明显趋势倾向',
      波动率: annualizedVolatility >= 20 && annualizedVolatility <= 40 ? '波动适中' : '波动偏离网格最佳区间',
      震荡特征: trendChangeFreq >= 50 ? '极佳的震荡频繁度' : '震荡性较弱',
      价格分布: bollingerRatio >= 90 ? '价格回落通道内，震荡稳健' : '常脱离通道，需谨慎网格'
    },
    logics: {
      收益率: `累计收益率绝对值 ≤ 10%判定为优良震荡市，当前为 ${Math.abs(cumulativeReturn).toFixed(2)}%。高收益率意味着单边上涨易踏空，大跌则易破网深套。`,
      波动率: `理想波动区间为 20%~40%，当前为 ${annualizedVolatility.toFixed(2)}%。低于20%难以触发网格套利，高于40%则暴涨暴跌风险过高。`,
      震荡特征: `交替频率 ≥ 50% 可充分发挥网格低买高卖优势，当前为 ${trendChangeFreq.toFixed(2)}%。长连跌易致资金站岗。`,
      价格分布: `${bollingerRatio.toFixed(2)}%的时间运行于布林带通道内，该比例越高(≥90%)说明价格均值回归特性越强，适合网格收网。`
    },
    metricsInfo: {
      收益率: {
        definition: [
          "计算目标：了解证券的赚钱能力和趋势特征",
          "1. 累计收益率 = (最新收盘价 - 最早收盘价) / 最早收盘价 × 100%",
          "2. 年化收益率 = 累计收益率 × (252 / 交易日数)"
        ],
        standards: [
          `累计收益率在±10%内：震荡市特征${Math.abs(cumulativeReturn) <= 10 ? ' ✓' : ''}`,
          `累计收益率>20%：可能处于上涨趋势${cumulativeReturn > 20 ? ' ✓' : ''}`,
          `累计收益率<-20%：可能处于下跌趋势${cumulativeReturn < -20 ? ' ✓' : ''}`
        ],
        significance: "累计收益率反映这段时间的总收益，年化收益率便于不同期限的收益比较。震荡市（收益率在±10%）最适合网格。",
        evaluation: `当前累计收益率为 ${cumulativeReturn.toFixed(2)}%。${Math.abs(cumulativeReturn) > 10 ? '高收益率意味着单边趋势，易踏空或破网深套。' : '收益率在合适区间内，属于震荡市特征。'}`
      },
      波动率: {
        definition: [
          "计算目标：衡量证券的风险水平和波动幅度",
          "1. 年化波动率 = 日收益率标准差 × √252 × 100%",
          "2. 平均日内波动 = 平均( |收盘价-开盘价| / 开盘价 × 100% )"
        ],
        standards: [
          `年化波动率20%-40%：最适合网格${annualizedVolatility >= 20 && annualizedVolatility <= 40 ? ' ✓' : ''}`,
          `年化波动率<20%：波动太小，网格空间有限${annualizedVolatility < 20 ? ' ✓' : ''}`,
          `年化波动率>40%：波动太大，风险较高${annualizedVolatility > 40 ? ' ✓' : ''}`,
          `平均日内波动1%-2%：有操作空间${intradayVolatility >= 1 && intradayVolatility <= 2 ? ' ✓' : ''}`
        ],
        significance: "波动是网格盈利的来源，适度的波动才能提供交易机会，波动太小赚不到钱，波动太大风险高。",
        evaluation: `当前年化波动率为 ${annualizedVolatility.toFixed(2)}%。${annualizedVolatility >= 20 && annualizedVolatility <= 40 ? '波动适中，适合网格交易。' : (annualizedVolatility < 20 ? '波动率不足难以触发网格套利。' : '波动率过高则暴涨暴跌风险过高。')}`
      },
      震荡特征: {
        definition: [
          "计算目标：判断证券是否具有震荡市的特征",
          "1. 涨跌交替频率 = 方向变化次数 / 总天数 × 100%",
          "2. 最大连续上涨天数 与 最大连续下跌天数"
        ],
        standards: [
          `涨跌交替频率>50%：震荡特征明显${trendChangeFreq > 50 ? ' ✓' : ''}`,
          `最大连续涨跌≤3天：典型的震荡市${Math.max(maxUp, maxDown) <= 3 ? ' ✓' : ''}`,
          `最大连续涨跌≥5天：可能有趋势${Math.max(maxUp, maxDown) >= 5 ? ' ✓' : ''}`
        ],
        significance: "网格交易需要价格来回波动，涨跌交替频繁才能高抛低吸，连续单边涨跌会耗尽资金或踏空行情。",
        evaluation: `当前涨跌交替频率为 ${trendChangeFreq.toFixed(2)}%。交替频率高可充分发挥网格低买高卖优势，长连跌易致资金站岗。`
      },
      价格分布: {
        definition: [
          "计算目标：分析价格在统计通道内的分布情况",
          "1. 计算20日移动平均线(中轨)和收盘价标准差",
          "2. 上轨及下轨 = 中轨 ± 2×标准差",
          "3. 布林带内比例 = 在上下轨内天数 / 总天数 × 100%"
        ],
        standards: [
          `布林带内比例>90%：价格在通道内运行${bollingerRatio > 90 ? ' ✓' : ''}`,
          `布林带内比例<80%：价格常突破通道${bollingerRatio < 80 ? ' ✓' : ''}`
        ],
        significance: "价格在通道内运行是震荡市的特征，经常突破通道说明有趋势，网格在价格通道内表现最佳。",
        evaluation: `当前有 ${bollingerRatio.toFixed(2)}% 的时间运行于布林通道内，该比例越高说明均值回归特性越强。`
      }
    },
    scoreLogic: `结合波动率(占3分)、中短期趋势(占3分)、震荡频率(占2分)、均值回归特性(占2分)及日内活跃度综合评判。核心逻辑寻找"波动大且无长单边趋势"的品种。`,
    summary: {
      totalDays: processedData.length,
      currentPrice: processedData[processedData.length - 1].close,
      date: new Date().toISOString()
    },
    backtest: {
      avgDailyAmplitude: Number(avgAmplitude.toFixed(2)),
      medianDailyAmplitude: Number(medianAmplitude.toFixed(2)),
      maxDrawdown1Y: Number(maxDD1Y.toFixed(2)),
      maxDrawdown3Y: Number(maxDD3Y.toFixed(2)),
      historicalMin: Number(historicalMin.toFixed(3)),
      historicalMax: Number(historicalMax.toFixed(3)),
      recommendedGridSize,
      safeGridMin: Number(safeGridMin.toFixed(3)),
      safeGridMax: Number(safeGridMax.toFixed(3))
    }
  };
};
