import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrendIndicator } from '../types';

interface IndicatorDetailPanelProps {
  indicator: TrendIndicator;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
}

export default function IndicatorDetailPanel({ indicator, onBack, onPrev, onNext, hasPrev, hasNext, currentIndex, totalCount }: IndicatorDetailPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showNavHint, setShowNavHint] = useState(true);

  const getSignalColor = (signal: string | undefined) => {
    if (!signal) return 'text-slate-600';
    if (signal.includes('Bullish')) {
      if (signal.includes('Accelerating')) return 'text-green-700';
      if (signal.includes('Decelerating')) return 'text-green-500';
      return 'text-green-600';
    }
    if (signal.includes('Bearish')) {
      if (signal.includes('Accelerating')) return 'text-red-700';
      if (signal.includes('Decelerating')) return 'text-red-500';
      return 'text-red-600';
    }
    return 'text-slate-600';
  };

  const getStatusColor = (level: string | undefined) => {
    if (!level) return 'bg-slate-100 text-slate-600';
    if (level.includes('bullish') || level.includes('Bullish')) {
      if (level.includes('strong')) return 'bg-green-100 text-green-700';
      return 'bg-green-50 text-green-600';
    }
    if (level.includes('bearish') || level.includes('Bearish')) {
      if (level.includes('strong')) return 'bg-red-100 text-red-700';
      return 'bg-red-50 text-red-600';
    }
    return 'bg-yellow-50 text-yellow-700';
  };

  const getTrendIcon = (signal: string | undefined) => {
    if (!signal) return <Minus className="w-5 h-5" />;
    if (signal.includes('Bullish')) {
      if (signal.includes('Accelerating')) return <TrendingUp className="w-5 h-5" />;
      if (signal.includes('Decelerating')) return <TrendingUp className="w-5 h-5" />;
      return <TrendingUp className="w-5 h-5" />;
    }
    if (signal.includes('Bearish')) {
      if (signal.includes('Accelerating')) return <TrendingDown className="w-5 h-5" />;
      if (signal.includes('Decelerating')) return <TrendingDown className="w-5 h-5" />;
      return <TrendingDown className="w-5 h-5" />;
    }
    return <Minus className="w-5 h-5" />;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setShowNavHint(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasNext) {
      onNext();
    } else if (isRightSwipe && hasPrev) {
      onPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col bg-white overflow-hidden touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <header className="px-4 py-3 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-900">{indicator.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-slate-500">{indicator.symbol}</p>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[10px] text-slate-400">{currentIndex + 1}/{totalCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-900">¥{indicator.price.toFixed(2)}</span>
        </div>
      </header>

      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
            hasPrev 
              ? 'text-indigo-600 hover:bg-indigo-100' 
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs font-bold">上一个</span>
        </button>
        {showNavHint && (
          <span className="text-[10px] text-slate-400 font-medium animate-pulse">← 滑动切换 →</span>
        )}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
            hasNext 
              ? 'text-indigo-600 hover:bg-indigo-100' 
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <span className="text-xs font-bold">下一个</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-green-800">MA20 趋势指标</h2>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Moving Average 20</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">MA20 数值</div>
              <div className="text-xl font-black text-slate-900">{indicator.ma20.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">主趋势斜率</div>
              <div className={`text-xl font-black ${indicator.ma20Signal.indicators.slope_main > 0.003 ? 'text-green-600' : indicator.ma20Signal.indicators.slope_main < -0.003 ? 'text-red-600' : 'text-slate-600'}`}>
                {(indicator.ma20Signal.indicators.slope_main * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">短期斜率</div>
              <div className={`text-xl font-black ${indicator.ma20Signal.indicators.slope_short > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(indicator.ma20Signal.indicators.slope_short * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`${getSignalColor(indicator.ma20Signal.signal)}`}>
                {getTrendIcon(indicator.ma20Signal.signal)}
              </span>
              <span className={`font-black ${getSignalColor(indicator.ma20Signal.signal)}`}>
                {indicator.ma20Signal.display_text.zh}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(indicator.ma20Signal.signal)}`}>
                {indicator.ma20Signal.market_status}
              </span>
            </div>
            <p className="text-sm text-slate-600">{indicator.ma20Signal.meaning}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-slate-500">动能状态</span>
              <span className={`text-xs font-bold ${indicator.ma20Signal.strength === 'Accelerating' ? 'text-green-600' : indicator.ma20Signal.strength === 'Decelerating' ? 'text-yellow-600' : 'text-slate-600'}`}>
                {indicator.ma20Signal.strength === 'Accelerating' ? '加速' : indicator.ma20Signal.strength === 'Decelerating' ? '减速' : indicator.ma20Signal.strength === 'Steady' ? '稳健' : '无'}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-slate-500">长短期斜率差</span>
              <span className={`text-xs font-bold ${(indicator.ma20Signal.indicators.slope_short - indicator.ma20Signal.indicators.slope_long) > 0.001 ? 'text-green-600' : (indicator.ma20Signal.indicators.slope_short - indicator.ma20Signal.indicators.slope_long) < -0.001 ? 'text-red-600' : 'text-slate-600'}`}>
                {((indicator.ma20Signal.indicators.slope_short - indicator.ma20Signal.indicators.slope_long) * 100).toFixed(3)}%
              </span>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-slate-500">操作建议</span>
              <span className={`text-xs font-bold ${indicator.ma20Signal.signal.includes('Bullish') ? 'text-green-600' : indicator.ma20Signal.signal.includes('Bearish') ? 'text-red-600' : 'text-slate-600'}`}>
                {indicator.ma20Signal.suggestion}
              </span>
            </div>
          </div>

          {indicator.ma20Signal.risk_warnings.description !== '无预警' && (
            <div className="mt-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-700">{indicator.ma20Signal.risk_warnings.description}</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-blue-800">MACD 动量指标</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Moving Average Convergence Divergence</p>
            </div>
          </div>

          {indicator.macdSignal && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">DIF</div>
                  <div className={`text-xl font-black ${indicator.macdSignal.macd_values.dif > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {indicator.macdSignal.macd_values.dif.toFixed(4)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">DEA</div>
                  <div className={`text-xl font-black ${indicator.macdSignal.macd_values.dea > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {indicator.macdSignal.macd_values.dea.toFixed(4)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">柱状图</div>
                  <div className={`text-xl font-black ${indicator.macdSignal.macd_values.histogram > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {indicator.macdSignal.macd_values.histogram.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-black ${getStatusColor(indicator.macdSignal.comprehensive_signal.level)}`}>
                    {indicator.macdSignal.comprehensive_signal.action}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(indicator.macdSignal.comprehensive_signal.level)}`}>
                    {((indicator.macdSignal.comprehensive_signal.score) * 100).toFixed(0)}分
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    置信度: {indicator.macdSignal.comprehensive_signal.confidence === 'high' ? '高' : indicator.macdSignal.comprehensive_signal.confidence === 'medium' ? '中' : '低'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {indicator.macdSignal.comprehensive_signal.reasoning.map((reason, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500">交叉信号</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.macdSignal.signals.cross_signal.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">强度: {indicator.macdSignal.signals.cross_signal.strength.toFixed(4)}</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500">位置信号</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.macdSignal.signals.position_signal.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">方向: {indicator.macdSignal.signals.position_signal.bias}</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500">背离信号</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.macdSignal.signals.divergence_signal.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">置信度: {(indicator.macdSignal.signals.divergence_signal.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500">动量信号</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.macdSignal.signals.momentum_signal.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">变化: {(indicator.macdSignal.signals.momentum_signal.histogram_change * 100).toFixed(2)}%</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-purple-800">ADX 趋势强度指标</h2>
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Average Directional Index</p>
            </div>
          </div>

          {indicator.adxSignal && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">ADX</div>
                  <div className={`text-xl font-black ${indicator.adxSignal.indicators.adx > 50 ? 'text-red-600' : indicator.adxSignal.indicators.adx > 25 ? 'text-green-600' : 'text-slate-600'}`}>
                    {indicator.adxSignal.indicators.adx.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">+DI</div>
                  <div className={`text-xl font-black ${indicator.adxSignal.indicators.plus_di > 40 ? 'text-orange-600' : 'text-green-600'}`}>
                    {indicator.adxSignal.indicators.plus_di.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">-DI</div>
                  <div className={`text-xl font-black ${indicator.adxSignal.indicators.minus_di > 40 ? 'text-orange-600' : 'text-red-600'}`}>
                    {indicator.adxSignal.indicators.minus_di.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">DI差值</div>
                  <div className={`text-xl font-black ${(indicator.adxSignal.indicators.plus_di - indicator.adxSignal.indicators.minus_di) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(indicator.adxSignal.indicators.plus_di - indicator.adxSignal.indicators.minus_di).toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-black ${getStatusColor(indicator.adxSignal.comprehensive_assessment.level)}`}>
                    {indicator.adxSignal.comprehensive_assessment.action}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(indicator.adxSignal.comprehensive_assessment.level)}`}>
                    {(indicator.adxSignal.comprehensive_assessment.score * 100).toFixed(0)}分
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {indicator.adxSignal.strength_analysis.description}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {indicator.adxSignal.comprehensive_assessment.reasoning.map((reason, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px] font-bold text-slate-500">趋势强度</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.adxSignal.strength_analysis.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">区间: {indicator.adxSignal.strength_analysis.range}</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px] font-bold text-slate-500">方向判断</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.adxSignal.direction_analysis.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">DI价差: {indicator.adxSignal.direction_analysis.di_spread.toFixed(1)}</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px] font-bold text-slate-500">ADX动量</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.adxSignal.momentum_analysis.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">5日斜率: {(indicator.adxSignal.momentum_analysis.slope_value * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px] font-bold text-slate-500">背离分析</span>
                  </div>
                  <p className="text-xs text-slate-700">{indicator.adxSignal.exhaustion_analysis.divergence.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">置信度: {(indicator.adxSignal.exhaustion_analysis.divergence.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              {indicator.adxSignal.risk_warnings.description !== '无预警' && (
                <div className="mt-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-700">{indicator.adxSignal.risk_warnings.description}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-orange-800">布林带波动率指标</h2>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Bollinger Bands</p>
            </div>
          </div>

          {indicator.bollingerSignal && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">上轨</div>
                  <div className="text-lg font-black text-slate-900">
                    {indicator.bollingerSignal.bollinger_data.upper_band.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">中轨</div>
                  <div className="text-lg font-black text-slate-900">
                    {indicator.bollingerSignal.bollinger_data.middle_band.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">下轨</div>
                  <div className="text-lg font-black text-slate-900">
                    {indicator.bollingerSignal.bollinger_data.lower_band.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">带宽%</div>
                  <div className={`text-lg font-black ${indicator.bollingerSignal.bollinger_data.width_percent < 5 ? 'text-red-600' : indicator.bollingerSignal.bollinger_data.width_percent < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {indicator.bollingerSignal.bollinger_data.width_percent.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-black ${indicator.bollingerSignal.squeeze_signal.signal_level === 'HIGH_INTENSITY' ? 'text-red-700' : indicator.bollingerSignal.squeeze_signal.signal_level === 'MEDIUM' ? 'text-orange-600' : indicator.bollingerSignal.squeeze_signal.signal_level === 'LOW' ? 'text-yellow-600' : 'text-slate-600'}`}>
                    {indicator.bollingerSignal.squeeze_signal.signal_name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${indicator.bollingerSignal.squeeze_signal.signal_level === 'HIGH_INTENSITY' ? 'bg-red-100 text-red-700' : indicator.bollingerSignal.squeeze_signal.signal_level === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : indicator.bollingerSignal.squeeze_signal.signal_level === 'LOW' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                    历史分位: {Math.round(indicator.bollingerSignal.squeeze_analysis.current_percentile * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">{indicator.bollingerSignal.squeeze_signal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-slate-500">挤压分析</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${indicator.bollingerSignal.squeeze_analysis.dual_criteria_met ? 'text-green-600' : 'text-slate-500'}`}>
                      {indicator.bollingerSignal.squeeze_analysis.dual_criteria_met ? <CheckCircle className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      双重标准
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">连续满足: {indicator.bollingerSignal.squeeze_analysis.consecutive_days} 日</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-slate-500">经验法则</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${indicator.bollingerSignal.squeeze_analysis.experience_rule_met ? 'text-green-600' : 'text-slate-500'}`}>
                      {indicator.bollingerSignal.squeeze_analysis.experience_rule_met ? <CheckCircle className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      当前宽度 &lt; 历史最小 * 1.05
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">统计法则: {indicator.bollingerSignal.squeeze_analysis.percentile_rule_met ? '满足' : '未满足'}</p>
                </div>
              </div>

              {indicator.bollingerSignal.risk_warnings.description !== '无预警' && (
                <div className="mt-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-700">{indicator.bollingerSignal.risk_warnings.description}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center py-4">
          <p className="text-[10px] text-slate-400 font-medium">
            更新时间: {new Date(indicator.updatedAt).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
}