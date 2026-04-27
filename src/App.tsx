/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Table as TableIcon, 
  TrendingUp, 
  TrendingDown,
  Save,
  Grid3X3,
  Calculator,
  Menu,
  X,
  Check,
  Copy
} from 'lucide-react';
import { GridStrategy, GridLevel } from './types';

export default function App() {
  const [strategies, setStrategies] = useState<GridStrategy[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 初始化本地存储
  useEffect(() => {
    const saved = localStorage.getItem('grid_trader_strategies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStrategies(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } catch (e) {
        console.error('无法解析策略配置', e);
      }
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('grid_trader_strategies', JSON.stringify(strategies));
  }, [strategies]);

  const activeStrategy = useMemo(() => 
    strategies.find(s => s.id === activeId) || null
  , [strategies, activeId]);

  const addStrategy = () => {
    const newStrategy: GridStrategy = {
      id: crypto.randomUUID(),
      name: '新策略 ' + (strategies.length + 1),
      initialPrice: 1.0,
      gridInterval: 3,
      initialAmount: 3000,
      stepValue: 0,
      stepType: 'percent',
      commissionRate: 0.005,
      placedLevels: [],
      triggeredLevels: [],
      createdAt: Date.now()
    };
    setStrategies([...strategies, newStrategy]);
    setActiveId(newStrategy.id);
    setIsEditing(true);
    setIsSidebarOpen(false);
  };

  const deleteStrategy = (id: string) => {
    if (!confirm('确定要删除这个策略吗？')) return;
    const nextArr = strategies.filter(s => s.id !== id);
    setStrategies(nextArr);
    if (activeId === id) {
      setActiveId(nextArr.length > 0 ? nextArr[0].id : null);
    }
  };

  const updateStrategy = (updated: GridStrategy) => {
    setStrategies(strategies.map(s => s.id === updated.id ? updated : s));
  };

  const calculateGrid = (strategy: GridStrategy): GridLevel[] => {
    const levels: GridLevel[] = [];
    const { initialPrice, gridInterval, initialAmount, stepValue, stepType, commissionRate } = strategy;
    const rate = commissionRate / 100;
    
    for (let i = 0; i >= -20; i--) {
      // 价格计算：采用几何间距
      const price = initialPrice * Math.pow(1 + gridInterval / 100, i);
      
      let amount = initialAmount;
      if (i !== 0) {
        const absI = Math.abs(i);
        if (stepType === 'percent') {
          amount = initialAmount * Math.pow(1 + stepValue / 100, absI);
        } else {
          amount = initialAmount + (stepValue * absI);
        }
      }

      let netProfit = 0;
      if (i < 0) {
        // 先买后卖逻辑：在当前层级(i)买入，在上一层级(i+1)卖出
        const buyPrice = price;
        const sellPrice = initialPrice * Math.pow(1 + gridInterval / 100, i + 1);
        const qty = amount / buyPrice; // 买入数量
        
        const buyFee = amount * rate; // 买入手续费
        const sellRev = qty * sellPrice; // 卖出销售额
        const sellFee = sellRev * rate; // 卖出手续费
        
        netProfit = (sellRev - amount) - (buyFee + sellFee);
      }

      levels.push({
        level: i,
        price: Number(price.toFixed(4)),
        amount: Math.round(amount),
        profit: Number(netProfit.toFixed(2)),
        type: i === 0 ? 'initial' : 'buy'
      });
    }
    return levels;
  };

  const gridData = useMemo(() => activeStrategy ? calculateGrid(activeStrategy) : [], [activeStrategy]);

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-bold tracking-tight">网格易</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="p-1.5 md:hidden hover:bg-slate-800 rounded-lg transition-colors text-white/50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {strategies.length === 0 && (
          <div className="text-center py-10">
            <Calculator className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-xs text-balance">暂无策略，请点击下方进行新增</p>
          </div>
        )}
        {strategies.map(s => (
          <div 
            key={s.id}
            onClick={() => {
              setActiveId(s.id);
              setIsSidebarOpen(false);
            }}
            className={`
              group p-3 rounded-lg cursor-pointer transition-all border
              ${activeId === s.id 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-slate-200'}
            `}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold truncate ${activeId === s.id ? 'text-blue-700' : 'text-slate-700'}`}>
                  {s.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  基准: {s.initialPrice} | {s.gridInterval}%
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteStrategy(s.id); }}
                className="p-1 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <button 
          onClick={addStrategy}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95"
          title="添加策略"
        >
          <Plus className="w-4 h-4" />
          <span>添加新策略</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block w-64 border-r border-slate-200 shrink-0 shadow-sm h-full">
        <Sidebar />
      </div>

      {/* 移动端侧边栏抽屉 */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs z-50 md:hidden shadow-2xl"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 主界面 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeStrategy ? (
          <>
            {/* 紧凑顶栏 */}
            <div className="bg-white border-b border-slate-200 p-2 md:p-2.5 px-3 md:px-5 flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-800 truncate select-none">{activeStrategy.name}</h2>
              </div>
              
              <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
                <button 
                  onClick={() => setIsEditing(false)}
                  className={`p-1.5 px-2 rounded-md transition-all flex items-center justify-center ${!isEditing ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  title="预览网格"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`p-1.5 px-2 rounded-md transition-all flex items-center justify-center ${isEditing ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  title="策略设置"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50">
              <div className="p-1 md:p-4 max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div 
                      key="editor"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="space-y-4"
                    >
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-blue-500" />
                          <h3 className="font-bold text-slate-700 text-xs">策略核心参数</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <InputWrapper label="策略名称" sub="起个好记的名字">
                            <input 
                              type="text"
                              value={activeStrategy.name}
                              onChange={(e) => updateStrategy({...activeStrategy, name: e.target.value})}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="初始参考价 (¥)" sub="当前市场价格">
                            <input 
                              type="number"
                              step="0.001"
                              inputMode="decimal"
                              value={activeStrategy.initialPrice}
                              onChange={(e) => updateStrategy({...activeStrategy, initialPrice: parseFloat(e.target.value) || 0})}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="单个网格间距 (%)" sub="每跌多少买入一笔">
                            <input 
                              type="number"
                              step="0.1"
                              inputMode="decimal"
                              value={activeStrategy.gridInterval}
                              onChange={(e) => updateStrategy({...activeStrategy, gridInterval: parseFloat(e.target.value) || 0})}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="第一格投入金额 (¥)" sub="基础成交仓位">
                            <input 
                              type="number"
                              inputMode="numeric"
                              value={activeStrategy.initialAmount}
                              onChange={(e) => updateStrategy({...activeStrategy, initialAmount: parseInt(e.target.value) || 0})}
                              className="input-field"
                            />
                          </InputWrapper>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-orange-500" />
                          <h3 className="font-bold text-slate-700 text-xs">动态仓位 & 费率</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <InputWrapper label="仓位递增类型" sub="越跌越买的策略">
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                              <button 
                                onClick={() => updateStrategy({...activeStrategy, stepType: 'percent'})}
                                className={`flex-1 py-1.5 text-xs rounded-md transition-all ${activeStrategy.stepType === 'percent' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500'}`}
                              >
                                百分比
                              </button>
                              <button 
                                onClick={() => updateStrategy({...activeStrategy, stepType: 'amount'})}
                                className={`flex-1 py-1.5 text-xs rounded-md transition-all ${activeStrategy.stepType === 'amount' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500'}`}
                              >
                                固定金额
                              </button>
                            </div>
                          </InputWrapper>
                          <InputWrapper label={`每格递增量 ${activeStrategy.stepType === 'percent' ? '(%)' : '(¥)'}`}>
                            <input 
                              type="number"
                              step="0.1"
                              inputMode="decimal"
                              value={activeStrategy.stepValue}
                              onChange={(e) => updateStrategy({...activeStrategy, stepValue: parseFloat(e.target.value) || 0})}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="成交佣金费率 (%)" sub="例：万分之零点五填 0.005">
                            <input 
                              type="number"
                              step="0.001"
                              inputMode="decimal"
                              value={activeStrategy.commissionRate}
                              onChange={(e) => updateStrategy({...activeStrategy, commissionRate: parseFloat(e.target.value) || 0})}
                              className="input-field"
                            />
                          </InputWrapper>
                        </div>
                      </div>

                      <button 
                        onClick={() => setIsEditing(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        生成交易网格
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="table"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[280px]">
                          <thead>
                            <tr className="bg-slate-900 text-white whitespace-nowrap">
                              <th className="px-1 py-2 text-[10px] font-bold text-center">层</th>
                              <th className="px-1 py-2 text-[10px] font-bold">价格</th>
                              <th className="px-1 py-2 text-[10px] font-bold">金额</th>
                              <th className="px-1 py-2 text-[10px] font-bold text-blue-300">利润</th>
                              <th className="px-1 py-2 text-[10px] font-bold text-center">状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {gridData.map((row) => (
                              <tr 
                                key={row.level} 
                                className={`transition-colors hover:bg-slate-50 ${row.level === 0 ? 'bg-amber-50/50' : ''}`}
                              >
                                <td className="px-1 py-3.5 font-mono text-slate-500 font-bold text-center">
                                  {row.level === 0 ? '0' : row.level}
                                </td>
                                <td className={`px-1 py-3.5 font-bold ${row.level === 0 ? 'text-slate-900' : 'text-red-500'}`}>
                                  <CopyableValue value={row.price.toString()} />
                                </td>
                                <td className="px-1 py-3.5 font-medium text-slate-700">
                                  <CopyableValue value={row.amount.toString()} displayValue={row.amount.toLocaleString()} />
                                </td>
                                <td className={`px-1 py-3.5 font-bold ${row.level !== 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                  {row.level !== 0 ? `+${row.profit}` : '-'}
                                </td>
                                <td className="px-1 py-3.5 text-center">
                                  {row.level === 0 ? (
                                    <span className="text-[10px] font-bold text-slate-400">参考位</span>
                                  ) : (
                                    <div className="flex items-center justify-center gap-3">
                                      <button 
                                        onClick={() => {
                                          const placed = activeStrategy.placedLevels || [];
                                          const isPlaced = placed.includes(row.level);
                                          const nextPlaced = isPlaced ? placed.filter(l => l !== row.level) : [...placed, row.level];
                                          // 如果取消设置，同时也取消触发
                                          let nextTriggered = activeStrategy.triggeredLevels || [];
                                          if (isPlaced) {
                                            nextTriggered = nextTriggered.filter(l => l !== row.level);
                                          }
                                          updateStrategy({ ...activeStrategy, placedLevels: nextPlaced, triggeredLevels: nextTriggered });
                                        }}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                          (activeStrategy.placedLevels || []).includes(row.level)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-blue-400 grayscale'
                                        }`}
                                        title={ (activeStrategy.placedLevels || []).includes(row.level) ? "取消设置" : "标记已设置" }
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const triggered = activeStrategy.triggeredLevels || [];
                                          const isTriggered = triggered.includes(row.level);
                                          const nextTriggered = isTriggered ? triggered.filter(l => l !== row.level) : [...triggered, row.level];
                                          // 如果触发，则必须是已设置
                                          let nextPlaced = activeStrategy.placedLevels || [];
                                          if (!isTriggered && !nextPlaced.includes(row.level)) {
                                            nextPlaced = [...nextPlaced, row.level];
                                          }
                                          updateStrategy({ ...activeStrategy, triggeredLevels: nextTriggered, placedLevels: nextPlaced });
                                        }}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                          (activeStrategy.triggeredLevels || []).includes(row.level)
                                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                            : 'border-slate-300 bg-white hover:border-green-400 grayscale opacity-40 hover:opacity-100'
                                        }`}
                                        title={ (activeStrategy.triggeredLevels || []).includes(row.level) ? "取消触发" : "标记已触发" }
                                      >
                                        <TrendingDown className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-0.5 text-[9px] text-slate-400">
                        <p>* 利润已扣两次佣金 (买入+卖出)。</p>
                        <p>* 逻辑：跌买涨卖，循环获利。</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <EmptyState onAdd={addStrategy} />
        )}
      </div>
    </div>
  );
}

function CopyableValue({ value, displayValue }: { value: string, displayValue?: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback or silent fail
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div 
      onClick={handleCopy}
      className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors group relative active:scale-95 transform"
    >
      <span className="tabular-nums">{displayValue || value}</span>
      <AnimatePresence>
        {copied ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.5, x: 5 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -right-5 flex items-center"
          >
            <Check className="w-3 h-3 text-green-500" />
          </motion.span>
        ) : (
          <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </AnimatePresence>
    </div>
  );
}

function InputWrapper({ label, sub, children }: { label: string, sub?: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2 overflow-hidden">
        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight whitespace-nowrap">{label}</label>
        {sub && <span className="text-[10px] text-slate-400 leading-none truncate">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xs space-y-4"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Grid3X3 className="w-8 h-8 text-blue-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">开始量化交易</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            为您计算精确的买入点与利润预期，让每一次回调都成为增持机会。
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          立即创建方案
        </button>
      </motion.div>
    </div>
  );
}


