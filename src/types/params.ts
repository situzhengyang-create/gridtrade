export interface TrendParams {
  ma20: {
    mainTrendWindow: number;
    shortTrendWindow: number;
    longTrendWindow: number;
    slopeThreshold: number;
    accelerationThreshold: number;
  };
  adx: {
    period: number;
    slopeWindow: number;
    diWarningLevel: number;
    diStrongWarningLevel: number;
    trendStartLevel: number;
    trendOptimalLevel: number;
    trendHotLevel: number;
  };
  bollinger: {
    period: number;
    stdDevMultiplier: number;
    historyWindow: number;
    toleranceFactor: number;
    lowPercentile: number;
    minDuration: number;
  };
  macd: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    momentumThreshold: number;
    divergenceWindow: number;
  };
}

export const defaultTrendParams: TrendParams = {
  ma20: {
    mainTrendWindow: 10,
    shortTrendWindow: 5,
    longTrendWindow: 20,
    slopeThreshold: 0.003,
    accelerationThreshold: 0.001,
  },
  adx: {
    period: 14,
    slopeWindow: 5,
    diWarningLevel: 40,
    diStrongWarningLevel: 50,
    trendStartLevel: 20,
    trendOptimalLevel: 25,
    trendHotLevel: 50,
  },
  bollinger: {
    period: 20,
    stdDevMultiplier: 2,
    historyWindow: 120,
    toleranceFactor: 1.05,
    lowPercentile: 0.2,
    minDuration: 5,
  },
  macd: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    momentumThreshold: 0.05,
    divergenceWindow: 30,
  },
};

export const paramDescriptions: Record<string, {
  label: string;
  description: string;
  explanation: string;
}> = {
  ma20_mainTrendWindow: {
    label: '主趋势窗口',
    description: '计算MA20主趋势斜率的天数',
    explanation: '主趋势窗口用于判断当前市场的主要方向。通过计算最近N日MA20均线的线性回归斜率来确定趋势方向。窗口越大，趋势判断越稳定，但响应越慢；窗口越小，响应越快，但可能产生更多假信号。',
  },
  ma20_shortTrendWindow: {
    label: '短期趋势窗口',
    description: '计算短期趋势斜率的天数',
    explanation: '短期趋势窗口用于判断趋势的加速度。与长期窗口对比，计算斜率差值来判断趋势是加速还是减速。短期窗口通常小于主趋势窗口。',
  },
  ma20_longTrendWindow: {
    label: '长期趋势窗口',
    description: '计算长期趋势斜率的天数',
    explanation: '长期趋势窗口作为对比基准。通过短期斜率与长期斜率的差值来判断趋势的加速度状态。',
  },
  ma20_slopeThreshold: {
    label: '斜率判定阈值',
    description: '判定趋势方向的斜率阈值',
    explanation: '当主趋势斜率大于此阈值时判定为看涨，小于负的此阈值时判定为看跌，在中间时判定为走平。阈值越小，对趋势变化越敏感；阈值越大，趋势判断越严格。',
  },
  ma20_accelerationThreshold: {
    label: '加速/减速阈值',
    description: '判定趋势加速或减速的斜率差值阈值',
    explanation: '短期斜率减去长期斜率的差值。大于此阈值判定为加速，小于负的此阈值判定为减速。用于判断趋势的动能变化。',
  },
  adx_period: {
    label: 'ADX计算周期',
    description: 'ADX指标的计算周期',
    explanation: 'ADX（平均趋向指数）的标准计算周期为14日。该参数决定了ADX的平滑程度，周期越长，ADX越平滑，但响应越慢。',
  },
  adx_slopeWindow: {
    label: 'ADX斜率窗口',
    description: '计算ADX斜率的天数',
    explanation: '用于判断ADX自身的趋势方向，即趋势强度是在增强还是减弱。通过计算ADX的线性回归斜率来判定动能变化。',
  },
  adx_diWarningLevel: {
    label: 'DI预警线',
    description: 'DI极端值预警线',
    explanation: '当+DI或-DI超过此值时，表明一方力量非常强劲，可能处于超买或超卖状态。通常设置为40。',
  },
  adx_diStrongWarningLevel: {
    label: 'DI强烈预警线',
    description: 'DI极端值强烈预警线',
    explanation: '当+DI或-DI超过此值时，表明市场情绪极度偏向一方，趋势可能即将反转。通常设置为50。',
  },
  adx_trendStartLevel: {
    label: '趋势萌芽线',
    description: 'ADX趋势萌芽的阈值',
    explanation: 'ADX超过此值表明趋势开始形成，但还不够强劲。ADX在20-25之间通常被认为是趋势萌芽阶段。',
  },
  adx_trendOptimalLevel: {
    label: '最佳趋势线',
    description: 'ADX进入最佳交易区的阈值',
    explanation: 'ADX超过此值表明趋势已经确立，是顺势交易的最佳时机。ADX在25-50之间被认为是中等趋势，是最佳交易区。',
  },
  adx_trendHotLevel: {
    label: '趋势过热线',
    description: 'ADX趋势过热的阈值',
    explanation: 'ADX超过此值表明趋势非常强劲，但也可能即将进入衰竭阶段。ADX大于50时需要防范趋势过热带来的回调风险。',
  },
  bollinger_period: {
    label: '布林带周期',
    description: '布林带的计算周期',
    explanation: '布林带的标准计算周期为20日。周期越长，带宽越宽，反转信号越少但越可靠。',
  },
  bollinger_stdDevMultiplier: {
    label: '标准差倍数',
    description: '布林带上下轨的标准差倍数',
    explanation: '通常设置为2倍标准差，这是统计学上的常用值，约包含95%的数据点。倍数越大，布林带越宽。',
  },
  bollinger_historyWindow: {
    label: '历史参照窗口',
    description: '计算历史极值的天数',
    explanation: '用于确定布林带宽度的历史极值，以此判断当前带宽是否处于挤压状态。窗口越长，参照的历史数据越多。',
  },
  bollinger_toleranceFactor: {
    label: '容错系数',
    description: '经验法则的容错系数',
    explanation: '用于布林带挤压的双重判定标准之一。当前宽度小于历史最低极值乘以此系数时，满足经验法则的挤压条件。',
  },
  bollinger_lowPercentile: {
    label: '低位分位',
    description: '统计法则的低位百分位',
    explanation: '用于布林带挤压的双重判定标准之一。当前宽度处在历史后N%时，满足统计法则的挤压条件。通常设置为20%。',
  },
  bollinger_minDuration: {
    label: '最小持续时间',
    description: '高强度挤压的最小持续天数',
    explanation: '双重挤压条件必须连续维持N个交易日以上，才算高强度挤压。过滤短暂的宽度收缩假象。',
  },
  macd_fastPeriod: {
    label: 'MACD快速周期',
    description: 'MACD快线的计算周期',
    explanation: 'MACD的标准快速周期为12日。快线反应较快，与慢线交叉产生金叉/死叉信号。',
  },
  macd_slowPeriod: {
    label: 'MACD慢速周期',
    description: 'MACD慢线的计算周期',
    explanation: 'MACD的标准慢速周期为26日。慢线反应较慢，作为快线的对比基准。',
  },
  macd_signalPeriod: {
    label: 'MACD信号周期',
    description: 'MACD信号线的计算周期',
    explanation: 'MACD信号线是DIFF线的EMA，标准周期为9日。信号线与DIFF线交叉产生交易信号。',
  },
  macd_momentumThreshold: {
    label: '动量变化阈值',
    description: '柱状图动量变化的判定阈值',
    explanation: '当日MACD柱状图变化率相比昨日必须超过此阈值才能判定为动量加速。用于过滤微小波动。',
  },
  macd_divergenceWindow: {
    label: '背离检测窗口',
    description: '检测顶底背离的天数',
    explanation: '在最近N个交易日窗口内，检测价格极值与MACD/ADX极值是否背离。窗口太短可能漏检，太长可能包含无关数据。',
  },
};