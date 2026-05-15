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
      description: string;
    };
    divergence_signal: {
      type: 'bullish' | 'bearish' | 'none';
      strength: number;
      description: string;
    };
    histogram_signal: {
      type: 'increasing' | 'decreasing' | 'none';
      description: string;
    };
  };
  overall: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    description: string;
  };
}

export interface DmiValues {
  plus_di: number;
  minus_di: number;
  adx: number;
  dx: number;
}

export interface DmiSignal {
  date: string;
  values: DmiValues;
  signals: {
    trend_strength: {
      type: 'strong' | 'weak' | 'none';
      description: string;
    };
    trend_direction: {
      type: 'up' | 'down' | 'sideways';
      description: string;
    };
    crossover_signal: {
      type: 'bullish' | 'bearish' | 'none';
      description: string;
    };
  };
  overall: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    description: string;
  };
}

export interface BollSignal {
  date: string;
  values: {
    upper_band: number;
    middle_band: number;
    lower_band: number;
    price: number;
    width: number;
  };
  signals: {
    position: {
      type: 'above_upper' | 'below_lower' | 'between_bands';
      description: string;
    };
    squeeze: {
      type: 'squeezing' | 'expanding' | 'none';
      description: string;
    };
    trend: {
      type: 'up' | 'down' | 'sideways';
      description: string;
    };
  };
  overall: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    description: string;
  };
}

export interface FilterCondition {
  id: string;
  metric: FilterMetric;
  period: FilterPeriod;
  operator: FilterOperator;
  value: number;
}

export type FilterMetric = 'score' | 'avgAmp' | 'medAmp' | 'maxDrawdown' | 'totalReturn' | 'suggestedGrid';

export type FilterPeriod = 0 | 1 | 2;

export type FilterOperator = '>' | '<' | '>=' | '<=';

export interface FilterPreset {
  id: string;
  name: string;
  conditions: FilterCondition[];
}

export interface DiagnosisReport {
  score: number;
  rating: string;
  backtest: BacktestResult;
  details?: {
    cumulativeReturn?: number;
    sharpeRatio?: number;
    winRate?: number;
    profitFactor?: number;
  };
}

export interface TrendIndicator {
  symbol: string;
  name: string;
  ma20?: MA20Signal;
  macd?: MACDSignal;
  dmi?: DmiSignal;
  boll?: BollSignal;
  updatedAt?: number;
}

export interface MACDResult {
  dif: number;
  dea: number;
  histogram: number;
}

export interface DMIResult {
  plus_di: number;
  minus_di: number;
  adx: number;
  dx: number;
}

export interface BOLLResult {
  upper_band: number;
  middle_band: number;
  lower_band: number;
  width: number;
}

export interface EXPMAResult {
  exp1: number;
  exp2: number;
}

export interface ENEResult {
  upper: number;
  middle: number;
  lower: number;
}

export interface BBIResult {
  bbi: number;
  ma3: number;
  ma6: number;
  ma12: number;
  ma24: number;
}

export interface TRIXResult {
  trix: number;
  matrix: number;
}

export interface KDJResult {
  k: number;
  d: number;
  j: number;
}

export interface SKDJResult {
  slow_k: number;
  slow_d: number;
}

export interface RSIResult {
  rsi6: number;
  rsi12: number;
  rsi24: number;
}

export interface CCIResult {
  cci: number;
}

export interface WRResult {
  wr10: number;
}

export interface LWRResult {
  lwr10: number;
}

export interface BIASResult {
  bias6: number;
  bias12: number;
  bias24: number;
}

export interface MTMResult {
  mtm12: number;
  mtm_ma6: number;
}

export interface OBVResult {
  obv: number;
  maobv30: number;
}

export interface VRResult {
  vr: number;
}

export interface BRARResult {
  br: number;
  ar: number;
}

export interface CRResult {
  cr: number;
}

export interface DMAResult {
  dif: number;
  ama: number;
}

export interface LONResult {
  lon: number;
}

export interface TrendResults {
  macd?: MACDResult;
  dmi?: DMIResult;
  boll?: BOLLResult;
  expma?: EXPMAResult;
  ene?: ENEResult;
  bbi?: BBIResult;
  trix?: TRIXResult;
}

export interface OscillatorResults {
  kdj?: KDJResult;
  skdj?: SKDJResult;
  rsi?: RSIResult;
  cci?: CCIResult;
  wr?: WRResult;
  lwr?: LWRResult;
  bias?: BIASResult;
  mtm?: MTMResult;
}

export interface VolumeResults {
  latestVolume: number;
  latestTurnover: number;
  obv?: OBVResult;
  vr?: VRResult;
  brar?: BRARResult;
  cr?: CRResult;
  dma?: DMAResult;
  lon?: LONResult;
}

export interface ComprehensiveIndicatorReport {
  symbol: string;
  name: string;
  latestPrice: number;
  latestDate: string;
  dataCount: number;
  calculatedAt: string;
  trend: TrendResults;
  oscillator: OscillatorResults;
  volume: VolumeResults;
}

export interface CalculationRecord {
  symbol: string;
  name: string;
  status: 'pending' | 'calculating' | 'completed' | 'error';
  message?: string;
  errorMsg?: string;
  report?: ComprehensiveIndicatorReport;
  calculatedAt?: string;
}

export interface PositionTarget {
  id: string;
  name: string;
  planPercentage: number;
  actualMarketValue: number;
  categoryId?: string;
}

export interface PositionCategory {
  id: string;
  name: string;
  planPercentage: number;
  targets: PositionTarget[];
}

export interface PositionModule {
  id: string;
  name: string;
  planPercentage: number;
  categories: PositionCategory[];
  targets: PositionTarget[];
}

export interface PositionPortfolio {
  id: string;
  name: string;
  totalAmount: number;
  modules: PositionModule[];
}

export interface PositionAnalysis {
  totalPlanAmount: number;
  totalActualAmount: number;
  modules: PositionModuleAnalysis[];
}

export interface PositionCategoryAnalysis {
  categoryId: string;
  categoryName: string;
  planPercentage: number;
  planAmount: number;
  actualAmount: number;
  actualPercentage: number;
  amountDeviation: number;
  percentageDeviation: number;
  targets: PositionTargetAnalysis[];
}

export interface PositionModuleAnalysis {
  moduleId: string;
  moduleName: string;
  planPercentage: number;
  planAmount: number;
  actualAmount: number;
  actualPercentage: number;
  amountDeviation: number;
  percentageDeviation: number;
  categories: PositionCategoryAnalysis[];
  targets: PositionTargetAnalysis[];
}

export interface PositionTargetAnalysis {
  targetId: string;
  targetName: string;
  planPercentage: number;
  planAmount: number;
  actualMarketValue: number;
  actualPercentage: number;
  percentageDeviation: number;
}