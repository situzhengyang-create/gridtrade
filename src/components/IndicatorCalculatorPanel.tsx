import React from 'react';
import { Plus, Trash2, Menu, Check, RefreshCw, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { CalculationRecord } from '../types';

interface IndicatorCalculatorPanelProps {
  symbols: string[];
  records: Record<string, CalculationRecord>;
  onAddSymbol: () => void;
  onCalculate: () => void;
  onRemoveSymbol: (symbol: string) => void;
  onOpenReport: (symbol: string) => void;
  onOpenNav: () => void;
  addPanelOpen: boolean;
  onToggleAddPanel: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onConfirmAdd: () => void;
  isCalculating: boolean;
  calculatingProgress: number;
  calculatingSymbol: string | null;
}

export default function IndicatorCalculatorPanel({
  symbols,
  records,
  onAddSymbol,
  onCalculate,
  onRemoveSymbol,
  onOpenReport,
  onOpenNav,
  addPanelOpen,
  onToggleAddPanel,
  inputValue,
  onInputChange,
  onConfirmAdd,
  isCalculating,
  calculatingProgress,
  calculatingSymbol
}: IndicatorCalculatorPanelProps) {
  const getStatusBadge = (record?: CalculationRecord) => {
    if (!record) {
      return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">待计算</span>;
    }
    switch (record.status) {
      case 'calculating':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold animate-pulse">计算中</span>;
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] font-bold">已完成</span>;
      case 'error':
        return <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">失败</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">待计算</span>;
    }
  };

  const completedCount = Object.values(records).filter(r => r.status === 'completed').length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative w-full min-w-0">
      <header className="px-4 py-3 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
        <button
          onClick={onOpenNav}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900">指标计算</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Indicators</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onAddSymbol}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {addPanelOpen && (
        <div className="px-4 py-4 bg-indigo-50 border-b border-indigo-100 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-black text-indigo-900">添加证券</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onConfirmAdd()}
                placeholder="输入证券代码，多个用逗号分隔 (如: 600519,000858)"
                className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>
            <button
              onClick={onConfirmAdd}
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleAddPanel}
              className="w-10 h-10 flex items-center justify-center hover:bg-indigo-200 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>
      )}

      {isCalculating && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 shrink-0">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-800">正在计算: {calculatingSymbol}</span>
                <span className="text-xs font-bold text-blue-600">{Math.round(calculatingProgress)}%</span>
              </div>
              <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${calculatingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{symbols.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">总证券</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-black text-green-600">{completedCount}</div>
              <div className="text-[10px] font-bold text-green-600 uppercase">已完成</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-black text-slate-500">{symbols.length - completedCount}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">待计算</div>
            </div>
          </div>
          <button
            onClick={onCalculate}
            disabled={symbols.length === 0 || isCalculating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              symbols.length === 0 || isCalculating
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? '计算中...' : '一键计算'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {symbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600 mb-2">暂无证券</p>
            <p className="text-xs text-slate-400 mb-6">点击右上角 + 按钮添加需要计算的证券</p>
            <button
              onClick={onAddSymbol}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              添加证券
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {symbols.map((symbol) => {
              const record = records[symbol];
              const isCompleted = record?.status === 'completed';

              return (
                <div
                  key={symbol}
                  className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                    isCompleted 
                      ? 'border-green-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-50' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      <FileText className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900 truncate">{record?.name || symbol}</span>
                        <span className="text-xs font-mono text-slate-400">{symbol}</span>
                        {getStatusBadge(record)}
                      </div>
                      {record?.calculatedAt && (
                        <p className="text-[10px] text-slate-400 mb-2">
                          更新时间: {record.calculatedAt} | 数据量: {record.report?.dataCount} 日
                        </p>
                      )}
                      {record?.errorMsg && (
                        <div className="flex items-center gap-1 text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                          <AlertCircle className="w-3 h-3" />
                          {record.errorMsg}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isCompleted && (
                        <button
                          onClick={() => onOpenReport(symbol)}
                          className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          报告
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveSymbol(symbol)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}