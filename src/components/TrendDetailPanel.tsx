import React from 'react';
import { TrendIndicator } from '../types';

interface TrendDetailPanelProps {
  indicator: TrendIndicator;
}

function getSignalIcon(signal: string | undefined) {
  if (!signal) return '→';
  if (signal.includes('Bullish')) {
    if (signal.includes('Accelerating')) return '↑↑';
    if (signal.includes('Decelerating')) return '↗';
    return '↑';
  }
  if (signal.includes('Bearish')) {
    if (signal.includes('Accelerating')) return '↓↓';
    if (signal.includes('Decelerating')) return '↘';
    return '↓';
  }
  return '→';
}

export default function TrendDetailPanel({ indicator }: TrendDetailPanelProps) {
  const { ma20Signal, ma20, price, symbol, name } = indicator;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">MA20 趋势信号</div>
              <div className="text-2xl font-bold text-slate-800">{name || symbol}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-500 mb-1">当前价格</div>
              <div className="text-lg font-bold text-slate-800">{price.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-500 mb-1">20日均线(MA20)</div>
              <div className="text-lg font-bold text-slate-800">{ma20.toFixed(2)}</div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            ma20Signal.signal.includes('Bullish') ? 'bg-green-50 border border-green-200' :
            ma20Signal.signal.includes('Bearish') ? 'bg-red-50 border border-red-200' :
            'bg-slate-50 border border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getSignalIcon(ma20Signal.signal)}</span>
              <span className={`text-lg font-bold ${
                ma20Signal.signal.includes('Bullish') ? 'text-green-700' :
                ma20Signal.signal.includes('Bearish') ? 'text-red-700' :
                'text-slate-700'
              }`}>
                {ma20Signal.display_text.zh}
              </span>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              <span className="font-semibold">市场状态：</span>{ma20Signal.market_status}
            </div>
            <div className="text-sm text-slate-600 mb-2">
              <span className="font-semibold">含义：</span>{ma20Signal.meaning}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-slate-600">建议：</span>
              <span className={
                ma20Signal.signal.includes('Bullish') ? 'text-green-700 font-semibold' :
                ma20Signal.signal.includes('Bearish') ? 'text-red-700 font-semibold' :
                'text-slate-700'
              }>
                {ma20Signal.suggestion}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <div className="text-xs font-semibold text-indigo-600 uppercase">指标详情</div>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">主趋势</div>
                <div className={`text-lg font-bold ${
                  ma20Signal.main_trend === 'Bullish' ? 'text-green-600' :
                  ma20Signal.main_trend === 'Bearish' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {ma20Signal.display_text.zh}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">强度状态</div>
                <div className="text-lg font-bold text-slate-800">
                  {ma20Signal.strength === 'None' ? '-' : 
                   ma20Signal.strength === 'Accelerating' ? '加速' :
                   ma20Signal.strength === 'Decelerating' ? '减速' : '稳健'}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">斜率指标</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-400 mb-1">主趋势斜率 (10日)</div>
                  <div className={`text-sm font-bold ${
                    ma20Signal.indicators.slope_main > 0.003 ? 'text-green-600' :
                    ma20Signal.indicators.slope_main < -0.003 ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {(ma20Signal.indicators.slope_main * 100).toFixed(3)}%
                  </div>
                  <div className="text-[8px] text-slate-400 mt-1">
                    {ma20Signal.indicators.slope_main > 0.003 ? '> 0.3% 看涨' :
                     ma20Signal.indicators.slope_main < -0.003 ? '< -0.3% 看跌' :
                     '±0.3% 震荡'}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-400 mb-1">短期斜率 (5日)</div>
                  <div className={`text-sm font-bold ${
                    ma20Signal.indicators.slope_short > 0 ? 'text-green-600' :
                    ma20Signal.indicators.slope_short < 0 ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {(ma20Signal.indicators.slope_short * 100).toFixed(3)}%
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-400 mb-1">长期斜率 (20日)</div>
                  <div className={`text-sm font-bold ${
                    ma20Signal.indicators.slope_long > 0 ? 'text-green-600' :
                    ma20Signal.indicators.slope_long < 0 ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {(ma20Signal.indicators.slope_long * 100).toFixed(3)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              计算时间：{ma20Signal.calculation_time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}