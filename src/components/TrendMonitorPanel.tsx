import React, { useState } from 'react';
import { Plus, RefreshCw, Trash2, Menu, Check, GitBranch, Settings, BarChart3 } from 'lucide-react';
import { TrendIndicator } from '../types';

interface TrendMonitorPanelProps {
  symbols: string[];
  indicators: TrendIndicator[];
  loadingSymbols: Record<string, boolean>;
  onAddSymbol: () => void;
  onRefreshAll: () => void;
  onRemoveSymbol: (symbol: string) => void;
  onRefreshSymbol: (symbol: string) => void;
  addPanelOpen: boolean;
  onToggleAddPanel: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onConfirmAdd: () => void;
  onOpenNav: () => void;
  onOpenDecisionFlow?: (symbol: string) => void;
  onOpenSettings?: () => void;
  onOpenIndicatorDetail?: (symbol: string) => void;
}

export default function TrendMonitorPanel({
  symbols,
  indicators,
  loadingSymbols,
  onAddSymbol,
  onRefreshAll,
  onRemoveSymbol,
  onRefreshSymbol,
  addPanelOpen,
  onToggleAddPanel,
  inputValue,
  onInputChange,
  onConfirmAdd,
  onOpenNav,
  onOpenDecisionFlow,
  onOpenSettings,
  onOpenIndicatorDetail
}: TrendMonitorPanelProps) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const getIndicator = (symbol: string) => indicators.find(ti => ti.symbol === symbol);

  const toggleSelection = (symbol: string) => {
    const canonical = symbol.toLowerCase();
    setSelectedSymbols(prev =>
      prev.includes(canonical)
        ? prev.filter(s => s !== canonical)
        : [...prev, canonical]
    );
  };

  const handleBatchDelete = () => {
    selectedSymbols.forEach(symbol => {
      const originalSymbol = symbols.find(s => s.toLowerCase() === symbol);
      if (originalSymbol) {
        onRemoveSymbol(originalSymbol);
      }
    });
    setIsDeleteMode(false);
    setSelectedSymbols([]);
  };

  const handleSelectAll = () => {
    if (selectedSymbols.length === symbols.length) {
      setSelectedSymbols([]);
    } else {
      setSelectedSymbols(symbols.map(s => s.toLowerCase()));
    }
  };

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

  const getSignalIcon = (signal: string | undefined) => {
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
  };

  const getBollingerColor = (level: string | undefined) => {
    if (!level) return 'text-slate-400';
    switch (level) {
      case 'HIGH_INTENSITY': return 'text-red-700';
      case 'MEDIUM': return 'text-orange-600';
      case 'LOW': return 'text-yellow-600';
      default: return 'text-slate-400';
    }
  };

  const getBollingerIcon = (level: string | undefined) => {
    if (!level) return '○';
    switch (level) {
      case 'HIGH_INTENSITY': return '◉';
      case 'MEDIUM': return '◎';
      case 'LOW': return '○';
      default: return '○';
    }
  };

  const getMACDColor = (level: string | undefined) => {
    if (!level) return 'text-slate-400';
    switch (level) {
      case 'strong_bullish': return 'text-green-700';
      case 'bullish': return 'text-green-500';
      case 'neutral': return 'text-yellow-600';
      case 'bearish': return 'text-orange-600';
      case 'strong_bearish': return 'text-red-700';
      default: return 'text-slate-400';
    }
  };

  const getMACDIcon = (level: string | undefined) => {
    if (!level) return '—';
    switch (level) {
      case 'strong_bullish': return '▲▲';
      case 'bullish': return '▲';
      case 'neutral': return '◆';
      case 'bearish': return '▼';
      case 'strong_bearish': return '▼▼';
      default: return '—';
    }
  };

  const getADXColor = (level: string | undefined) => {
    if (!level) return 'text-slate-400';
    switch (level) {
      case 'strong_bullish': return 'text-green-700';
      case 'bullish': return 'text-green-500';
      case 'neutral': return 'text-yellow-600';
      case 'bearish': return 'text-orange-600';
      case 'strong_bearish': return 'text-red-700';
      default: return 'text-slate-400';
    }
  };

  const getADXIcon = (level: string | undefined) => {
    if (!level) return '◌';
    switch (level) {
      case 'strong_bullish': return '◆';
      case 'bullish': return '◇';
      case 'neutral': return '◌';
      case 'bearish': return '◇';
      case 'strong_bearish': return '◆';
      default: return '◌';
    }
  };

  const getADXStrengthColor = (level: string | undefined) => {
    if (!level) return 'text-slate-400';
    switch (level) {
      case 'extreme_trend': return 'text-red-900';
      case 'strong_trend': return 'text-red-600';
      case 'medium_trend': return 'text-green-600';
      case 'trend_forming': return 'text-yellow-600';
      case 'no_trend': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0">
        <div className="flex items-center gap-3">
          {isDeleteMode ? (
            <button
              onClick={() => {
                setIsDeleteMode(false);
                setSelectedSymbols([]);
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onOpenNav}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
          )}
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {isDeleteMode ? `已选择 ${selectedSymbols.length} 个标的` : 'TRENDTRADE'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isDeleteMode ? (
            <>
              <button
                onClick={onToggleAddPanel}
                className={`p-2 rounded-full transition-colors ${addPanelOpen ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="添加标的"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={onRefreshAll}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                title="刷新全部"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsDeleteMode(true)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-full transition-colors"
                title="进入删除模式"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                title="参数设置"
              >
                <Settings className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedSymbols([]);
                }}
                className="px-4 py-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
              >
                取消
              </button>
              <button
                disabled={selectedSymbols.length === 0}
                onClick={handleBatchDelete}
                className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-[0.98] disabled:opacity-30 disabled:shadow-none"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </header>

      {addPanelOpen && (
        <div className="bg-slate-50 border-b border-slate-100 p-4">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="输入证券代码，多个代码以空格分隔..."
            className="w-full h-32 p-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none font-mono text-sm resize-none"
          />
          <button
            onClick={onConfirmAdd}
            className="mt-3 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加证券
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0 min-w-0 w-full relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 z-30 bg-white">
              <tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[160px] sticky left-0 z-40 bg-white border-r border-slate-100">
                  <div className="flex items-center gap-2">
                    {isDeleteMode && (
                      <div
                        onClick={handleSelectAll}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          selectedSymbols.length === symbols.length ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'
                        }`}
                      >
                        {selectedSymbols.length === symbols.length && <Check className="w-2 h-2 stroke-[4]" />}
                      </div>
                    )}
                    证券
                  </div>
                </th>
                <th className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[220px]">MA20</th>
                <th className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[220px]">MACD</th>
                <th className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[220px]">ADX</th>
                <th className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[220px]">布林带</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...symbols].reverse().map((symbol) => {
                const indicator = getIndicator(symbol);
                const isLoading = loadingSymbols[symbol];
                const isSelected = selectedSymbols.includes(symbol.toLowerCase());

                return (
                  <tr
                    key={symbol}
                    onClick={() => isDeleteMode && toggleSelection(symbol)}
                    className={`group transition-colors ${
                      isDeleteMode ? 'cursor-pointer' : 'hover:bg-slate-50'
                    } ${isSelected ? 'bg-rose-50' : 'bg-white'}`}
                  >
                    <td className={`px-3 py-4 overflow-hidden sticky left-0 z-10 border-r border-slate-50 transition-colors ${isSelected ? 'bg-rose-50' : 'bg-white group-hover:bg-slate-50'}`}>
                      <div className="flex items-start gap-2 min-w-0">
                        {isDeleteMode && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(symbol);
                            }}
                            className={`w-3 h-3 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                              isSelected ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-2 h-2 text-white stroke-[4]" />}
                          </div>
                        )}
                        <div className="flex flex-col gap-1 min-w-0">
                          {isLoading ? (
                            <>
                              <div className="w-20 h-3 bg-slate-100 animate-pulse rounded" />
                              <div className="w-12 h-2 bg-slate-100 animate-pulse rounded" />
                            </>
                          ) : (
                            <>
                              <div className="text-[12px] font-black text-slate-900 leading-tight">
                                {indicator?.name || symbol}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                                {symbol.replace(/sh|sz|hk|us/i, '')} · {new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                              </div>
                            </>
                          )}

                          {!isLoading && !isDeleteMode && (
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRefreshSymbol(symbol);
                                }}
                                className="p-1 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="刷新"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                              </button>
                              {onOpenIndicatorDetail && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenIndicatorDetail(symbol);
                                  }}
                                  className="p-1 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                  title="指标详情"
                                >
                                  <BarChart3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onOpenDecisionFlow && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDecisionFlow(symbol);
                                  }}
                                  className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="决策流程"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      {isLoading ? (
                        <div className="flex flex-col gap-2">
                          <div className="w-24 h-4 bg-slate-100 animate-pulse rounded" />
                          <div className="w-32 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-40 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-20 h-3 bg-slate-100 animate-pulse rounded" />
                        </div>
                      ) : indicator?.ma20Signal ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getSignalColor(indicator.ma20Signal.signal)}`}>
                              {getSignalIcon(indicator.ma20Signal.signal)}
                            </span>
                            <span className={`text-sm font-bold ${getSignalColor(indicator.ma20Signal.signal)}`}>
                              {indicator.ma20Signal.display_text.zh}
                            </span>
                            <span className="text-[12px] font-black tabular-nums text-slate-700 ml-2">
                              MA20: {indicator.ma20.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[10px] font-medium text-slate-700">
                            {indicator.ma20Signal.market_status}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-snug">
                            {indicator.ma20Signal.meaning}
                          </div>
                          <div className={`text-[10px] font-bold ${
                            indicator.ma20Signal.signal.includes('Bullish') ? 'text-green-700' :
                            indicator.ma20Signal.signal.includes('Bearish') ? 'text-red-700' :
                            'text-slate-700'
                          }`}>
                            {indicator.ma20Signal.suggestion}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {isLoading ? (
                        <div className="flex flex-col gap-2">
                          <div className="w-24 h-4 bg-slate-100 animate-pulse rounded" />
                          <div className="w-32 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-40 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-20 h-3 bg-slate-100 animate-pulse rounded" />
                        </div>
                      ) : indicator?.macdSignal ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getMACDColor(indicator.macdSignal?.comprehensive_signal?.level)}`}>
                              {getMACDIcon(indicator.macdSignal?.comprehensive_signal?.level)}
                            </span>
                            <span className={`text-sm font-bold ${getMACDColor(indicator.macdSignal?.comprehensive_signal?.level)}`}>
                              {indicator.macdSignal?.comprehensive_signal?.action || '暂无信号'}
                            </span>
                            <span className="text-[12px] font-black tabular-nums text-slate-700 ml-2">
                              {((indicator.macdSignal?.comprehensive_signal?.score || 0) * 100).toFixed(0)}分
                            </span>
                          </div>
                          <div className="text-[10px] font-medium text-slate-700">
                            {indicator.macdSignal?.signals?.cross_signal?.description}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-snug">
                            {indicator.macdSignal?.signals?.position_signal?.description}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-snug">
                            {indicator.macdSignal?.signals?.momentum_signal?.description}
                          </div>
                          <div className={`text-[10px] font-bold ${
                            indicator.macdSignal?.comprehensive_signal?.level?.includes('bullish') ? 'text-green-700' :
                            indicator.macdSignal?.comprehensive_signal?.level?.includes('bearish') ? 'text-red-700' :
                            'text-slate-700'
                          }`}>
                            置信度：{indicator.macdSignal?.comprehensive_signal?.confidence === 'high' ? '高' : indicator.macdSignal?.comprehensive_signal?.confidence === 'medium' ? '中' : '低'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {isLoading ? (
                        <div className="flex flex-col gap-2">
                          <div className="w-24 h-4 bg-slate-100 animate-pulse rounded" />
                          <div className="w-32 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-40 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-20 h-3 bg-slate-100 animate-pulse rounded" />
                        </div>
                      ) : indicator?.adxSignal ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getADXColor(indicator.adxSignal?.comprehensive_assessment?.level)}`}>
                              {getADXIcon(indicator.adxSignal?.comprehensive_assessment?.level)}
                            </span>
                            <span className={`text-sm font-bold ${getADXColor(indicator.adxSignal?.comprehensive_assessment?.level)}`}>
                              {indicator.adxSignal?.comprehensive_assessment?.action || '暂无信号'}
                            </span>
                            <span className="text-[12px] font-black tabular-nums text-slate-700 ml-2">
                              ADX: {indicator.adxSignal?.indicators?.adx?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <div className={`text-[10px] font-medium ${getADXStrengthColor(indicator.adxSignal?.strength_analysis?.level)}`}>
                            {indicator.adxSignal?.strength_analysis?.description}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-snug">
                            {indicator.adxSignal?.direction_analysis?.description}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-snug">
                            {indicator.adxSignal?.momentum_analysis?.description}
                          </div>
                          <div className={`text-[10px] font-bold ${
                            indicator.adxSignal?.comprehensive_assessment?.level?.includes('bullish') ? 'text-green-700' :
                            indicator.adxSignal?.comprehensive_assessment?.level?.includes('bearish') ? 'text-red-700' :
                            'text-slate-700'
                          }`}>
                            置信度：{indicator.adxSignal?.comprehensive_assessment?.confidence === 'high' ? '高' : indicator.adxSignal?.comprehensive_assessment?.confidence === 'medium' ? '中' : '低'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {isLoading ? (
                        <div className="flex flex-col gap-2">
                          <div className="w-24 h-4 bg-slate-100 animate-pulse rounded" />
                          <div className="w-32 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-40 h-3 bg-slate-100 animate-pulse rounded" />
                          <div className="w-20 h-3 bg-slate-100 animate-pulse rounded" />
                        </div>
                      ) : indicator?.bollingerSignal ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getBollingerColor(indicator.bollingerSignal?.squeeze_signal?.signal_level)}`}>
                              {getBollingerIcon(indicator.bollingerSignal?.squeeze_signal?.signal_level)}
                            </span>
                            <span className={`text-sm font-bold ${getBollingerColor(indicator.bollingerSignal?.squeeze_signal?.signal_level)}`}>
                              {indicator.bollingerSignal?.squeeze_signal?.signal_name}
                            </span>
                            <span className="text-[12px] font-black tabular-nums text-slate-700 ml-2">
                              宽度: {indicator.bollingerSignal?.bollinger_data?.width_percent?.toFixed(1) || '0.0'}%
                            </span>
                          </div>
                          <div className="text-[10px] font-medium text-slate-700">
                            历史分位: {Math.round((indicator.bollingerSignal?.squeeze_analysis?.current_percentile || 0) * 100)}%
                          </div>
                          <div className="text-[10px] text-slate-600 leading-snug">
                            {indicator.bollingerSignal?.squeeze_signal?.description}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            连续{indicator.bollingerSignal?.squeeze_analysis?.consecutive_days || 0}日满足双重标准
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
