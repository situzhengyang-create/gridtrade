import React from 'react';
import { TrendIndicator } from '../types';

interface SignalTracePanelProps {
  indicator: TrendIndicator;
}

export default function SignalTracePanel({ indicator }: SignalTracePanelProps) {
  const { ma20Signal, symbol, name } = indicator;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-600 uppercase">MA20 信号追溯</div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">信号判定过程</div>
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-400 mb-1">步骤1：主趋势判定</div>
                  <div className="text-sm text-slate-700">
                    主趋势斜率 = {(ma20Signal.indicators.slope_main * 100).toFixed(3)}%
                    {ma20Signal.indicators.slope_main > 0.003 && ' > 0.3% → 看涨'}
                    {ma20Signal.indicators.slope_main < -0.003 && ' < -0.3% → 看跌'}
                    {ma20Signal.indicators.slope_main >= -0.003 && ma20Signal.indicators.slope_main <= 0.003 && ' 在 ±0.3% 范围内 → 走平'}
                  </div>
                </div>
                
                {ma20Signal.main_trend !== 'Flat' && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 mb-1">步骤2：强度状态判定</div>
                    <div className="text-sm text-slate-700">
                      短期斜率 - 长期斜率 = {(ma20Signal.indicators.slope_short * 100).toFixed(3)}% - {(ma20Signal.indicators.slope_long * 100).toFixed(3)}% = {((ma20Signal.indicators.slope_short - ma20Signal.indicators.slope_long) * 100).toFixed(3)}%
                      <br />
                      {ma20Signal.indicators.slope_short - ma20Signal.indicators.slope_long > 0.001 && ' > 0.1% → 加速'}
                      {ma20Signal.indicators.slope_short - ma20Signal.indicators.slope_long < -0.001 && ' < -0.1% → 减速'}
                      {ma20Signal.indicators.slope_short - ma20Signal.indicators.slope_long >= -0.001 && ma20Signal.indicators.slope_short - ma20Signal.indicators.slope_long <= 0.001 && ' 在 ±0.1% 范围内 → 稳健'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">最终信号</div>
              <div className={`text-lg font-bold ${
                ma20Signal.signal.includes('Bullish') ? 'text-green-600' :
                ma20Signal.signal.includes('Bearish') ? 'text-red-600' :
                'text-slate-600'
              }`}>
                {ma20Signal.display_text.zh} ({ma20Signal.display_text.en})
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
