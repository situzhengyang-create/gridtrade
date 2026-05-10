import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, ChevronRight, Check, X, AlertTriangle, Minus, ArrowRight, Workflow, Info, Zap, Shield, Target, TrendingUp, HelpCircle, XCircle } from 'lucide-react';
import { TrendIndicator } from '../types';

interface DecisionFlowPanelProps {
  symbol: string;
  indicator: TrendIndicator;
  onBack: () => void;
  onOpenDoc: () => void;
}

interface ModalInfo {
  title: string;
  logic: string[];
  reference: string;
}

interface MatchResult {
  matched: boolean;
  value?: number;
}

type Matcher = (indicator: TrendIndicator) => Record<string, MatchResult>;

const DECISION_HELP: Record<string, ModalInfo & { matcher?: Matcher }> = {
  'ma20-slope': {
    title: 'MA20趋势方向判定逻辑',
    logic: [
      '📊 判定方法：',
      '使用最小二乘法计算MA20最近10日的线性回归斜率',
      '',
      '🔍 判断标准：',
      '• 斜率 > 0.003：看涨 (Bullish)',
      '• 斜率 < -0.003：看跌 (Bearish)',
      '• -0.003 ≤ 斜率 ≤ 0.003：走平 (Flat)',
      '',
      '⚡ 意义：',
      '平滑度大幅提升，消除单日K线异常波动造成的"假反转"',
      '虽有轻微滞后但极度稳定'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - 趋势底色判定',
    matcher: (indicator) => {
      const slope = indicator.ma20Signal?.indicators?.slope_main || 0;
      return {
        'bullish': { matched: slope > 0.003, value: slope },
        'bearish': { matched: slope < -0.003, value: slope },
        'flat': { matched: slope >= -0.003 && slope <= 0.003, value: slope }
      };
    }
  },
  'adx-strength': {
    title: 'ADX趋势强度判定逻辑',
    logic: [
      '📊 ADX四维区间：',
      '• 0 - 20：无趋势（震荡）',
      '• 20 - 25：趋势萌芽（预警）',
      '• 25 - 50：中等趋势（顺势最佳交易区）',
      '• 50 - 75：强趋势（防范过热）',
      '• > 75：极强趋势（衰竭高危区）',
      '',
      '⚡ DI差值分析：',
      '+DI与-DI差值 > 5 确认一方占优',
      '+DI与-DI差值 > 20 确认趋势稳固',
      '',
      '⚠️ 注意：',
      'ADX上升但多空力量绞杀时需谨慎入场'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - 趋势底色判定',
    matcher: (indicator) => {
      const adx = indicator.adxSignal?.indicators?.adx || 0;
      const plusDi = indicator.adxSignal?.indicators?.plus_di || 0;
      const minusDi = indicator.adxSignal?.indicators?.minus_di || 0;
      const diDiff = Math.abs(plusDi - minusDi);
      return {
        'adx_0_20': { matched: adx >= 0 && adx < 20, value: adx },
        'adx_20_25': { matched: adx >= 20 && adx < 25, value: adx },
        'adx_25_50': { matched: adx >= 25 && adx <= 50, value: adx },
        'adx_50_75': { matched: adx > 50 && adx <= 75, value: adx },
        'adx_75_plus': { matched: adx > 75, value: adx },
        'di_diff_5': { matched: diDiff > 5, value: diDiff },
        'di_diff_20': { matched: diDiff > 20, value: diDiff }
      };
    }
  },
  'tradability-score': {
    title: '可交易性综合评分逻辑',
    logic: [
      '📊 评分构成（满分100分）：',
      '• ADX维度（70分）：强度判定(30%)、DI间距方向(25%)、ADX斜率动能(25%)、背离预警(20%)',
      '• MA20维度（30分）：加速(Diff>0.001)=30分、稳健(|Diff|≤0.001)=20分、减速(Diff<-0.001)=10分、横向震荡=0分',
      '',
      '📊 评级建议：',
      '• ≥80分（A级）：极佳条件',
      '• 60-79分（B级）：良好条件',
      '• 40-59分（C级）：谨慎轻仓',
      '• <40分（D级）：系统禁止趋势交易'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - 可交易性综合评分',
    matcher: (indicator) => {
      const adx = indicator.adxSignal?.indicators?.adx || 0;
      const plusDi = indicator.adxSignal?.indicators?.plus_di || 0;
      const minusDi = indicator.adxSignal?.indicators?.minus_di || 0;
      const slopeShort = indicator.ma20Signal?.indicators?.slope_short || 0;
      const slopeLong = indicator.ma20Signal?.indicators?.slope_long || 0;
      const slopeDiff = slopeShort - slopeLong;

      const strengthScore = Math.min(adx * 0.8, 40);
      const clarityScore = (Math.abs(plusDi - minusDi) / 100) * 30;
      const stabilityScore = 15;
      const adxTotal = Math.round(strengthScore + clarityScore + stabilityScore) * 0.7;

      let ma20Score = 0;
      if (slopeDiff > 0.001) ma20Score = 30;
      else if (Math.abs(slopeDiff) <= 0.001) ma20Score = 20;
      else if (slopeDiff < -0.001) ma20Score = 10;

      const actualScore = Math.round(adxTotal + ma20Score);
      return {
        'grade_a': { matched: actualScore >= 80, value: actualScore },
        'grade_b': { matched: actualScore >= 60 && actualScore < 80, value: actualScore },
        'grade_c': { matched: actualScore >= 40 && actualScore < 60, value: actualScore },
        'grade_d': { matched: actualScore < 40, value: actualScore }
      };
    }
  },
  'bollinger-squeeze': {
    title: '布林带挤压信号判定逻辑',
    logic: [
      '📊 双重标准：',
      '• 经验法则：当前宽度 < 120日最低极值 × 1.05',
      '• 统计法则：百分位 < 20%',
      '',
      '🔍 挤压级别：',
      '• 初级挤压：满足经验法则或统计法则',
      '• 中级挤压：经验法则与统计法则同时满足',
      '• 高强度挤压：双重法则同时满足，且连续维持≥5个交易日',
      '',
      '⚠️ 否决项：',
      '30日内出现ADX或MACD背离则判定为假突破高危区'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - 高关注机会扫描',
    matcher: (indicator) => {
      const squeezeLevel = indicator.bollingerSignal?.squeeze_signal?.signal_level || 'none';
      const consecutiveDays = indicator.bollingerSignal?.squeeze_analysis?.consecutive_days || 0;
      return {
        'primary': { matched: squeezeLevel === 'LOW' || squeezeLevel === 'MEDIUM' || squeezeLevel === 'HIGH_INTENSITY', value: consecutiveDays },
        'intermediate': { matched: squeezeLevel === 'MEDIUM' || squeezeLevel === 'HIGH_INTENSITY', value: consecutiveDays },
        'high': { matched: squeezeLevel === 'HIGH_INTENSITY', value: consecutiveDays }
      };
    }
  },
  'macd-score': {
    title: 'MACD五维入场信号评分逻辑',
    logic: [
      '📊 五维评分（满分1.0）：',
      '• 交叉信号(30%)：金叉(+0.3)/死叉(-0.3)',
      '• 位置分析(20%)：零轴上方(+0.2)/零轴下方(-0.2)',
      '• 背离检测(25%)：底背离(+0.25)/顶背离(-0.25)',
      '• 动量分析(15%)：柱状图加速(+0.15)/减速(-0.15)',
      '• 量能确认(10%)：成交量显著放大(+0.10)',
      '',
      '⚡ 入场级别：',
      '• A级入场：得分≥0.7（强烈看涨）',
      '• B级入场：得分0.3~0.7（看涨）',
      '• C级入场：得分-0.3~0.3（中性）',
      '• 禁止入场：得分<-0.3（看跌/背离）'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - MACD五维入场信号评分',
    matcher: (indicator) => {
      const score = indicator.macdSignal?.comprehensive_signal?.score || 0;
      return {
        'grade_a': { matched: score >= 0.7, value: score },
        'grade_b': { matched: score >= 0.3 && score < 0.7, value: score },
        'grade_c': { matched: score >= -0.3 && score < 0.3, value: score },
        'forbidden': { matched: score < -0.3, value: score }
      };
    }
  },
  'stop-loss': {
    title: '动态防御止损设置逻辑',
    logic: [
      '📊 三层防线（取最严格值）：',
      '• 结构防线：前高/前低点位',
      '• 波动防线：跌破布林带下轨（做多）/突破布林带上轨（做空）',
      '• 趋势防线：MA20 10日主趋势斜率发生方向性反转',
      '',
      '⚡ 左侧预警条件：',
      '• ADX > 75：情绪极端，持仓减半',
      '• DI > 50：超买卖，谨慎操作',
      '• MA20斜率差 < -0.001：动能减速，收紧止损',
      '• MACD柱状图连续2日减速收缩',
      '• 30日窗口出现顶/底背离'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - 动态防御止损设置',
    matcher: (indicator) => {
      const adx = indicator.adxSignal?.indicators?.adx || 0;
      const plusDi = indicator.adxSignal?.indicators?.plus_di || 0;
      const minusDi = indicator.adxSignal?.indicators?.minus_di || 0;
      const slopeShort = indicator.ma20Signal?.indicators?.slope_short || 0;
      const slopeLong = indicator.ma20Signal?.indicators?.slope_long || 0;
      const slopeDiff = slopeShort - slopeLong;
      return {
        'adx_75': { matched: adx > 75, value: adx },
        'di_50': { matched: plusDi > 50 || minusDi > 50, value: Math.max(plusDi, minusDi) },
        'slope_decel': { matched: slopeDiff < -0.001, value: slopeDiff }
      };
    }
  },
  'position-size': {
    title: '仓位管理建议',
    logic: [
      '📊 仓位建议：',
      '• A级入场(≥0.7)：满额标准仓位',
      '• B级入场(0.3~0.7)：70%-80%标准仓位',
      '• C级入场(-0.3~0.3)：30%-50%轻仓',
      '• 禁止入场(< -0.3)：空仓观望',
      '',
      '⚡ 风险控制：',
      '• 单日开仓不超过账户总资金的20%',
      '• 总持仓不超过账户总资金的50%'
    ],
    reference: '多指标协同趋势交易监控系统完整架构.md - 最终入场动作分级',
    matcher: (indicator) => {
      const score = indicator.macdSignal?.comprehensive_signal?.score || 0;
      return {
        'full': { matched: score >= 0.7, value: score },
        'medium': { matched: score >= 0.3 && score < 0.7, value: score },
        'light': { matched: score >= -0.3 && score < 0.3, value: score },
        'empty': { matched: score < -0.3, value: score }
      };
    }
  }
};

export default function DecisionFlowPanel({ symbol, indicator, onBack, onOpenDoc }: DecisionFlowPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['s1', 's2', 's3', 's4']));
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getMA20Slope = () => {
    if (!indicator.ma20Signal) return null;
    const slopeMain = indicator.ma20Signal.indicators?.slope_main || 0;
    if (slopeMain > 0.003) return { direction: 'bullish', label: '看涨', color: 'text-green-700' };
    if (slopeMain < -0.003) return { direction: 'bearish', label: '看跌', color: 'text-red-700' };
    return { direction: 'flat', label: '走平', color: 'text-yellow-600' };
  };

  const getMA20SlopeDiff = () => {
    if (!indicator.ma20Signal) return 0;
    const slopeShort = indicator.ma20Signal.indicators?.slope_short || 0;
    const slopeLong = indicator.ma20Signal.indicators?.slope_long || 0;
    return slopeShort - slopeLong;
  };

  const getADXLevel = () => {
    const adx = indicator.adxSignal?.indicators.adx || 0;
    if (adx >= 75) return { level: 'extreme', label: '极强趋势', color: 'text-red-700' };
    if (adx >= 50) return { level: 'strong', label: '强趋势', color: 'text-orange-700' };
    if (adx >= 25) return { level: 'medium', label: '中等趋势', color: 'text-blue-700' };
    if (adx >= 20) return { level: 'forming', label: '趋势萌芽', color: 'text-green-500' };
    return { level: 'weak', label: '无趋势', color: 'text-slate-500' };
  };

  const getTradabilityScore = () => {
    const adx = indicator.adxSignal?.indicators.adx || 0;
    const plusDi = indicator.adxSignal?.indicators.plus_di || 0;
    const minusDi = indicator.adxSignal?.indicators.minus_di || 0;
    const slopeDiff = getMA20SlopeDiff();

    const strengthScore = Math.min(adx * 0.8, 40);
    const clarityScore = (Math.abs(plusDi - minusDi) / 100) * 30;
    const stabilityScore = 15;
    const adxTotal = Math.round(strengthScore + clarityScore + stabilityScore) * 0.7;

    let ma20Score = 0;
    if (slopeDiff > 0.001) ma20Score = 30;
    else if (Math.abs(slopeDiff) <= 0.001) ma20Score = 20;
    else if (slopeDiff < -0.001) ma20Score = 10;

    return Math.round(adxTotal + ma20Score * 0.3);
  };

  const getTradabilityLevel = (score: number) => {
    if (score >= 80) return { level: 'A级', desc: '极佳条件', color: 'text-green-700', bg: 'bg-green-100' };
    if (score >= 60) return { level: 'B级', desc: '良好条件', color: 'text-blue-700', bg: 'bg-blue-100' };
    if (score >= 40) return { level: 'C级', desc: '谨慎轻仓', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    return { level: 'D级', desc: '禁止交易', color: 'text-red-700', bg: 'bg-red-100' };
  };

  const getBollingerLevel = () => {
    if (!indicator.bollingerSignal) return null;
    const { squeeze_analysis, squeeze_signal } = indicator.bollingerSignal;
    const consecutiveDays = squeeze_analysis.consecutive_days;
    const level = squeeze_signal.signal_level;
    
    if (consecutiveDays >= 5 && level === 'HIGH_INTENSITY') {
      return { level: 'high', label: '高强度挤压', color: 'text-green-700' };
    }
    if (level === 'HIGH_INTENSITY' || level === 'MEDIUM') {
      return { level: 'medium', label: '中级挤压', color: 'text-blue-700' };
    }
    return { level: 'low', label: '初级挤压/无', color: 'text-slate-500' };
  };

  const getMACDScore = () => {
    if (!indicator.macdSignal) return null;
    const { comprehensive_signal } = indicator.macdSignal;
    return Math.round(comprehensive_signal.score * 100) / 100;
  };

  const getMACDLevel = (score: number) => {
    if (score >= 0.7) return { level: 'A', label: 'A级入场', color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
    if (score >= 0.3) return { level: 'B', label: 'B级入场', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
    if (score >= -0.3) return { level: 'C', label: 'C级入场', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
    return { level: 'D', label: '禁止入场', color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
  };

  const ma20Slope = getMA20Slope();
  const adxLevel = getADXLevel();
  const tradabilityScore = getTradabilityScore();
  const tradabilityLevel = getTradabilityLevel(tradabilityScore);
  const bollingerLevel = getBollingerLevel();
  const macdScore = getMACDScore();
  const macdLevel = macdScore !== null ? getMACDLevel(macdScore) : null;
  const canTrade = tradabilityScore >= 60;

  const renderStage = (
    id: string,
    title: string,
    icon: React.ReactNode,
    color: string,
    children: React.ReactNode
  ) => {
    const isExpanded = expandedNodes.has(id);
    const isActive = activeStage === id;

    return (
      <div className="mb-4">
        <motion.div
          className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
            isActive ? 'border-indigo-300 shadow-lg' : 'border-slate-200 hover:border-slate-300'
          }`}
          layout
        >
          <div
            className={`flex items-center justify-between px-4 py-3 ${color} bg-slate-50`}
            onClick={() => {
              toggleNode(id);
              setActiveStage(isActive ? null : id);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-sm">{title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {id === 's1' && (
                <span className={`text-xs font-black px-2 py-1 rounded ${tradabilityLevel.bg} ${tradabilityLevel.color}`}>
                  {tradabilityLevel.level} {tradabilityScore}分
                </span>
              )}
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-slate-100">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  const renderDecisionBox = (
    label: string,
    condition: string,
    result: string,
    status: 'pass' | 'fail' | 'pending',
    helpKey: string,
    details?: string[]
  ) => {
    const statusStyles = {
      pass: { border: 'border-green-300', bg: 'bg-green-50', icon: <Check className="w-4 h-4 text-green-600" />, text: 'text-green-700' },
      fail: { border: 'border-red-300', bg: 'bg-red-50', icon: <X className="w-4 h-4 text-red-600" />, text: 'text-red-700' },
      pending: { border: 'border-slate-300', bg: 'bg-slate-50', icon: <Minus className="w-4 h-4 text-slate-400" />, text: 'text-slate-600' }
    };
    const style = statusStyles[status];

    return (
      <div className={`border rounded-lg p-3 mb-2 ${style.border} ${style.bg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {style.icon}
              <span className={`font-bold text-xs ${style.text}`}>{label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal(helpKey);
                }}
                className="p-0.5 hover:bg-white/50 rounded transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-1">{condition}</p>
            {details && details.length > 0 && (
              <div className="mt-2 space-y-1">
                {details.map((d, i) => (
                  <p key={i} className="text-[10px] text-slate-500 flex items-start gap-1">
                    <span className="text-indigo-400">•</span>
                    {d}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold ${style.text} ${style.bg}`}>
            {result}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900">决策流程</h1>
            <p className="text-[10px] text-slate-500">{indicator.name || symbol} · 多指标协同分析</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Workflow className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">输入指标</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-[10px] text-slate-500">MA20斜率</div>
                <div className={`text-sm font-bold ${ma20Slope?.color || 'text-slate-400'}`}>
                  {ma20Slope?.label || '-'}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-[10px] text-slate-500">ADX</div>
                <div className={`text-sm font-bold ${adxLevel.color}`}>
                  {indicator.adxSignal?.indicators.adx?.toFixed(1) || '-'}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-[10px] text-slate-500">MACD得分</div>
                <div className="text-sm font-bold text-slate-700">{macdScore?.toFixed(2) || '-'}</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-[10px] text-slate-500">布林挤压</div>
                <div className={`text-sm font-bold ${bollingerLevel?.color || 'text-slate-400'}`}>
                  {bollingerLevel?.label || '-'}
                </div>
              </div>
            </div>
          </div>

          {renderStage('s1', '第一层：趋势环境评估', <TrendingUp className="w-4 h-4" />, 'text-blue-600',
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-3">
                <span className="font-bold">核心问题：</span>当前能不能做趋势交易？
              </div>

              {renderDecisionBox(
                'MA20主趋势方向',
                `MA20 10日斜率: ${indicator.ma20Signal?.indicators?.slope_main?.toFixed(4) || '0.0000'}`,
                ma20Slope?.label || '未知',
                ma20Slope?.direction === 'flat' ? 'pending' : 'pass',
                'ma20-slope',
                [
                  `判定依据: ${ma20Slope?.direction === 'bullish' ? '斜率 > 0.003' : ma20Slope?.direction === 'bearish' ? '斜率 < -0.003' : '-0.003 ≤ 斜率 ≤ 0.003'}`
                ]
              )}

              {renderDecisionBox(
                'ADX趋势强度',
                `ADX = ${indicator.adxSignal?.indicators.adx?.toFixed(1) || '0'}`,
                adxLevel.label,
                adxLevel.level === 'weak' ? 'pending' : 'pass',
                'adx-strength',
                [
                  `+DI = ${indicator.adxSignal?.indicators.plus_di?.toFixed(1) || '-'}`,
                  `-DI = ${indicator.adxSignal?.indicators.minus_di?.toFixed(1) || '-'}`
                ]
              )}

              {renderDecisionBox(
                '可交易性综合评分',
                `ADX维度得分 + MA20动能状态`,
                `${tradabilityScore}分 (${tradabilityLevel.level})`,
                tradabilityScore >= 60 ? 'pass' : 'fail',
                'tradability-score',
                [
                  tradabilityLevel.desc,
                  tradabilityScore >= 60 ? '✓ 环境良好，进入下一层' : '✗ 环境恶劣，放弃开仓'
                ]
              )}
            </div>
          )}

          {canTrade && renderStage('s2', '第二层：空间位置评估', <Target className="w-4 h-4" />, 'text-purple-600',
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-3">
                <span className="font-bold">核心问题：</span>当前位置有没有盈亏比？
              </div>

              {renderDecisionBox(
                '布林带挤压检测',
                `双重法则满足: 经验法则 + 统计法则`,
                bollingerLevel?.label || '未检测',
                bollingerLevel?.level === 'high' ? 'pass' : bollingerLevel?.level === 'medium' ? 'pending' : 'pending',
                'bollinger-squeeze',
                [
                  `连续维持: ${indicator.bollingerSignal?.squeeze_analysis.consecutive_days || 0}日`,
                  `历史分位: ${indicator.bollingerSignal?.squeeze_analysis.current_percentile ? Math.round(indicator.bollingerSignal.squeeze_analysis.current_percentile * 100) : 0}%`
                ]
              )}

              <div className={`p-3 rounded-lg border ${
                bollingerLevel?.level === 'high' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700">机会质量评估</span>
                </div>
                <p className="text-[10px] text-slate-600">
                  {bollingerLevel?.level === 'high'
                    ? '高强度挤压，濒临突破，位置极佳'
                    : bollingerLevel?.level === 'medium'
                    ? '中级挤压，蓄势中，继续观察'
                    : '波动率未达极限，盈亏比不足'}
                </p>
              </div>
            </div>
          )}

          {canTrade && renderStage('s3', '第三层：动量时机评估', <Zap className="w-4 h-4" />, 'text-amber-600',
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-3">
                <span className="font-bold">核心问题：</span>现在是不是最佳扣扳机时刻？
              </div>

              {renderDecisionBox(
                'MACD五维评分',
                `交叉(30%) + 位置(20%) + 背离(25%) + 动量(15%) + 量能(10%)`,
                macdLevel?.label || '未计算',
                macdScore !== null && macdScore >= -0.3 ? 'pass' : 'fail',
                'macd-score',
                [
                  `交叉信号: ${indicator.macdSignal?.signals.cross_signal.type === 'golden' ? '金叉' : indicator.macdSignal?.signals.cross_signal.type === 'dead' ? '死叉' : '无交叉'}`,
                  `位置: ${indicator.macdSignal?.signals.position_signal.bias === 'bullish' ? '零轴上方' : indicator.macdSignal?.signals.position_signal.bias === 'bearish' ? '零轴下方' : '中性'}`
                ]
              )}

              {macdLevel && (
                <div className={`p-3 rounded-lg border ${macdLevel.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">入场信号等级</span>
                    <span className={`text-lg font-black ${macdLevel.color}`}>{macdLevel.level}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">{macdLevel.label}</p>
                </div>
              )}
            </div>
          )}

          {canTrade && renderStage('s4', '第四层：风控与离场评估', <Shield className="w-4 h-4" />, 'text-emerald-600',
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-3">
                <span className="font-bold">核心问题：</span>做错怎么办？持仓怎么逃顶？
              </div>

              {renderDecisionBox(
                '动态止损设置',
                '结构防线(前低) + 波动防线(BOLL下轨) + 趋势防线(MA20反转)',
                '取最严格值',
                'pass',
                'stop-loss',
                [
                  `建议止损: ¥${(indicator.price * 0.97).toFixed(2)}`,
                  'MACD死叉并跌破零轴时严格止损'
                ]
              )}

              {renderDecisionBox(
                '仓位管理',
                '根据信号等级配置仓位',
                macdLevel?.level === 'A' ? '满额标准仓位' : macdLevel?.level === 'B' ? '70%-80%仓位' : macdLevel?.level === 'C' ? '30%-50%轻仓' : '空仓观望',
                'pass',
                'position-size',
                [
                  '单笔不超过账户10%',
                  '单日不超过账户20%',
                  '总持仓不超过账户50%'
                ]
              )}

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">左侧预警条件</span>
                </div>
                <div className="text-[10px] text-slate-600 space-y-1">
                  <p>• ADX &gt; 75：情绪极端，持仓减半</p>
                  <p>• DI &gt; 50：超买卖，谨慎操作</p>
                  <p>• MA20斜率差 &lt; -0.001：动能减速，收紧止损</p>
                  <p>• 30日顶背离：趋势终结，建议清仓</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">综合结论</span>
            </div>
            <div className={`p-4 rounded-lg ${
              tradabilityScore >= 60 && macdScore !== null && macdScore >= -0.3
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-black ${tradabilityScore >= 60 && macdScore !== null && macdScore >= -0.3 ? 'text-green-700' : 'text-red-700'}`}>
                  {tradabilityScore >= 60 && macdScore !== null && macdScore >= -0.3 ? '建议交易' : '建议观望'}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-bold ${tradabilityLevel.bg} ${tradabilityLevel.color}`}>
                  {tradabilityLevel.level}
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-slate-600">
                <p>• 趋势方向：{ma20Slope?.label || '未知'}</p>
                <p>• 趋势强度：{adxLevel.label}</p>
                <p>• 可交易评分：{tradabilityScore}分</p>
                <p>• 入场等级：{macdLevel?.level || '-'}</p>
                <p>• 布林挤压：{bollingerLevel?.label || '无'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && DECISION_HELP[activeModal] && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[90%] max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[80vh] overflow-hidden"
            >
              <div className="p-5 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">{DECISION_HELP[activeModal].title}</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-4.5 h-4.5 text-slate-500" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-500" />
                      判断逻辑与说明
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        const helpInfo = DECISION_HELP[activeModal];
                        const matchResults = helpInfo.matcher ? helpInfo.matcher(indicator) : null;
                        
                        const getMatchStatus = (text: string) => {
                          if (!matchResults) return null;
                          if (text.includes('斜率 > 0.003') && matchResults['bullish']?.matched) return matchResults['bullish'];
                          if (text.includes('斜率 < -0.003') && matchResults['bearish']?.matched) return matchResults['bearish'];
                          if (text.includes('斜率 ≤ 0.003') && matchResults['flat']?.matched) return matchResults['flat'];
                          if (text.includes('0 - 20') && matchResults['adx_0_20']?.matched) return matchResults['adx_0_20'];
                          if (text.includes('20 - 25') && matchResults['adx_20_25']?.matched) return matchResults['adx_20_25'];
                          if (text.includes('25 - 50') && matchResults['adx_25_50']?.matched) return matchResults['adx_25_50'];
                          if (text.includes('50 - 75') && matchResults['adx_50_75']?.matched) return matchResults['adx_50_75'];
                          if (text.includes('> 75') && matchResults['adx_75_plus']?.matched) return matchResults['adx_75_plus'];
                          if (text.includes('DI差值 > 5') && matchResults['di_diff_5']?.matched) return matchResults['di_diff_5'];
                          if (text.includes('DI差值 > 20') && matchResults['di_diff_20']?.matched) return matchResults['di_diff_20'];
                          if (text.includes('≥80分') && matchResults['grade_a']?.matched) return matchResults['grade_a'];
                          if (text.includes('60-79分') && matchResults['grade_b']?.matched) return matchResults['grade_b'];
                          if (text.includes('40-59分') && matchResults['grade_c']?.matched) return matchResults['grade_c'];
                          if (text.includes('<40分') && matchResults['grade_d']?.matched) return matchResults['grade_d'];
                          if (text.includes('初级挤压') && matchResults['primary']?.matched) return matchResults['primary'];
                          if (text.includes('中级挤压') && matchResults['intermediate']?.matched) return matchResults['intermediate'];
                          if (text.includes('高强度挤压') && matchResults['high']?.matched) return matchResults['high'];
                          if (text.includes('≥0.7') && matchResults['grade_a']?.matched) return matchResults['grade_a'];
                          if (text.includes('0.3~0.7') && matchResults['grade_b']?.matched) return matchResults['grade_b'];
                          if (text.includes('-0.3~0.3') && matchResults['grade_c']?.matched) return matchResults['grade_c'];
                          if (text.includes('<-0.3') && matchResults['forbidden']?.matched) return matchResults['forbidden'];
                          if (text.includes('ADX > 75') && matchResults['adx_75']?.matched) return matchResults['adx_75'];
                          if (text.includes('DI > 50') && matchResults['di_50']?.matched) return matchResults['di_50'];
                          if (text.includes('斜率差 < -0.001') && matchResults['slope_decel']?.matched) return matchResults['slope_decel'];
                          if (text.includes('满额标准仓位') && matchResults['full']?.matched) return matchResults['full'];
                          if (text.includes('70%-80%') && matchResults['medium']?.matched) return matchResults['medium'];
                          if (text.includes('30%-50%') && matchResults['light']?.matched) return matchResults['light'];
                          if (text.includes('空仓观望') && matchResults['empty']?.matched) return matchResults['empty'];
                          return null;
                        };

                        return helpInfo.logic.map((item, i) => {
                          if (item === '') {
                            return <div key={i} className="h-2" />;
                          }
                          const matchStatus = getMatchStatus(item);
                          return (
                            <div 
                              key={i} 
                              className={`flex items-start gap-2 text-xs ${matchStatus?.matched ? 'bg-green-50 rounded px-2 py-1 -mx-2' : 'text-slate-600'}`}
                            >
                              {matchStatus?.matched && (
                                <span className="w-4 h-4 flex items-center justify-center bg-green-500 rounded-full flex-shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-white" />
                                </span>
                              )}
                              {item.startsWith('📊') || item.startsWith('🔍') || item.startsWith('⚠️') || item.startsWith('⚡') || item.startsWith('🎯') || item.startsWith('🔢') ? (
                                <>
                                  <span className="mt-0.5">{item.substring(0, 2)}</span>
                                  <span>{item.substring(2)}</span>
                                </>
                              ) : item.startsWith('•') ? (
                                <>
                                  {!matchStatus?.matched && <span className="text-indigo-400 mt-0.5">•</span>}
                                  <span>{item.substring(2)}</span>
                                </>
                              ) : (
                                <>
                                  {!matchStatus?.matched && <span className="text-indigo-400 mt-0.5">•</span>}
                                  <span>{item}</span>
                                </>
                              )}
                              {matchStatus?.matched && matchStatus.value !== undefined && (
                                <span className="text-xs font-bold text-green-600 ml-auto">
                                  当前值: {typeof matchStatus.value === 'number' && matchStatus.value < 100 && matchStatus.value > 0.01 ? matchStatus.value.toFixed(3) : matchStatus.value}
                                </span>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        onOpenDoc();
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 w-full text-left"
                    >
                      <span className="text-indigo-400">📄</span>
                      {DECISION_HELP[activeModal].reference}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
