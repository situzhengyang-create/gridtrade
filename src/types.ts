export interface GridLevel {
  level: number; // 0 is initial, positive is above, negative is below
  price: number;
  amount: number;
  profit: number;
  type: 'buy' | 'sell' | 'initial';
  cumulativeAmount?: number;
  percentFromInitial?: number;
}

export interface BacktestResult {
  averageAmplitude: number;
  medianAmplitude?: number;
  maxDrawdown: number; // Keep for compatibility or remove later
  maxDrawdown1Y?: number;
  maxDrawdown3Y?: number;
  minPrice: number;
  maxPrice: number;
  suggestedGridInterval: number;
  suggestedBottom: number;
  suggestedTop: number;
  updatedAt: number;
}

export interface GridStrategy {
  id: string;
  name: string;
  initialPrice?: number;
  gridInterval?: number; // 间距 %
  initialAmount?: number; // 初始金额
  stepValue?: number; // 步进值 (百分比或金额)
  stepType: 'percent' | 'amount'; // 步进类型
  commissionRate?: number; // 佣金率 %
  symbol?: string; // 股票/基金代码
  securityName?: string; // 证券名称
  currentPrice?: number; // 最新价格
  lastPriceTime?: number; // 最后更新时间
  notes?: string; // 策略笔记 (HTML)
  placedLevels?: number[]; // 已设置的层级
  triggeredLevels?: number[]; // 已触发的层级
  backtest?: BacktestResult; // 回测数据
  createdAt: number;
}

export interface AppState {
  strategies: GridStrategy[];
  activeStrategyId: string | null;
}

export interface RawData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  change_pct: number;
  volume: number;
}

export interface MA20Signal {
  main_trend: 'Bullish' | 'Bearish' | 'Flat';
  strength: 'Accelerating' | 'Decelerating' | 'Steady' | 'None';
  signal: 'Bullish_Accelerating' | 'Bullish_Decelerating' | 'Bullish_Steady' |
          'Bearish_Accelerating' | 'Bearish_Decelerating' | 'Bearish_Steady' |
          'Sideways' | 'Insufficient_Data';
  display_text: {
    zh: string;
    en: string;
  };
  meaning: string;
  market_status: string;
  suggestion: string;
  indicators: {
    slope_main: number;
    slope_short: number;
    slope_long: number;
  };
  risk_warnings: {
    slope_reversal: 'warning' | 'none';
    slope_deceleration: 'warning' | 'none';
    description: string;
  };
  calculation_time: string;
}

export interface MACDSignal {
  date: string;
  macd_values: {
    dif: number;
    dea: number;
    histogram: number;
  };
  signals: {
    cross_signal: {
      type: 'golden' | 'dead' | 'none';
      strength: number;
      description: string;
    };
    position_signal: {
      type: 'above_zero' | 'below_zero' | 'near_zero';
      bias: 'bullish' | 'bearish' | 'neutral';
      description: string;
    };
    divergence_signal: {
      type: 'top' | 'bottom' | 'none';
      confidence: number;
      description: string;
    };
    momentum_signal: {
      trend: 'accelerating' | 'decelerating' | 'stable' | 'reversal';
      histogram_change: number;
      description: string;
    };
    volume_signal: {
      confirmed: boolean;
      volume_change: number;
      description: string;
    };
  };
  comprehensive_signal: {
    score: number;
    level: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';
    confidence: 'high' | 'medium' | 'low';
    action: string;
    reasoning: string[];
  };
}

export interface ADXSignal {
  date: string;
  adx_period: number;
  indicators: {
    adx: number;
    plus_di: number;
    minus_di: number;
    adx_slope_5d: number;
  };
  strength_analysis: {
    level: 'no_trend' | 'trend_forming' | 'medium_trend' | 'strong_trend' | 'extreme_trend';
    range: string;
    color: string;
    description: string;
  };
  direction_analysis: {
    bias: 'bullish' | 'bearish' | 'neutral';
    di_spread: number;
    description: string;
  };
  signal_analysis: {
    last_cross: {
      type: 'golden' | 'dead' | 'none';
      days_ago: number;
      adx_at_cross: number;
      adx_trend_at_cross: 'rising' | 'falling' | 'flat';
      validity: 'valid' | 'invalid';
      description: string;
    };
    current_signal: 'none' | 'golden_cross' | 'dead_cross';
  };
  momentum_analysis: {
    adx_trend: 'rising' | 'falling' | 'flat';
    slope_value: number;
    description: string;
  };
  exhaustion_analysis: {
    divergence: {
      type: 'top' | 'bottom' | 'none';
      confidence: number;
      description: string;
    };
    di_extremes: {
      plus_di_warning: 'none' | 'high' | 'extreme';
      minus_di_warning: 'none' | 'high' | 'extreme';
      description: string;
    };
  };
  comprehensive_assessment: {
    score: number;
    level: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';
    confidence: 'high' | 'medium' | 'low';
    action: string;
    reasoning: string[];
  };
  risk_warnings: {
    adx_extreme: 'warning' | 'none';
    description: string;
  };
}

export interface BollingerSignal {
  date: string;
  bollinger_data: {
    upper_band: number;
    middle_band: number;
    lower_band: number;
    width: number;
    width_percent: number;
  };
  squeeze_analysis: {
    historical_min_width: number;
    current_percentile: number;
    experience_rule_met: boolean;
    percentile_rule_met: boolean;
    consecutive_days: number;
    dual_criteria_met: boolean;
  };
  squeeze_signal: {
    signal_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH_INTENSITY';
    signal_name: string;
    description: string;
  };
  indicators: {
    experience_condition: string;
    percentile_condition: string;
  };
  risk_warnings: {
    breakdown_below_lower: 'warning' | 'none';
    breakout_above_upper: 'warning' | 'none';
    description: string;
  };
}

export interface TrendIndicator {
  symbol: string;
  name: string;
  price: number;
  ma20: number;
  ma20Signal: MA20Signal;
  macdSignal: MACDSignal | null;
  adxSignal: ADXSignal | null;
  bollingerSignal: BollingerSignal | null;
  updatedAt: number;
}

export type FilterMetric = 'score' | 'avgAmp' | 'medAmp' | 'maxDrawdown' | 'totalReturn' | 'suggestedGrid';
export type FilterPeriod = 0 | 1 | 2; // 0=1Y, 1=2Y, 2=3Y
export type FilterOperator = '>' | '<' | '>=' | '<=';

export interface FilterCondition {
  id: string;
  metric: FilterMetric;
  period: FilterPeriod;
  operator: FilterOperator;
  value: number;
}
export interface FilterPreset {
  id: string;
  name: string;
  conditions: FilterCondition[];
}
