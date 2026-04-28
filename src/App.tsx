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
  Copy,
  RefreshCw,
  Search,
  Maximize2,
  Minimize2,
  FileText,
  Activity,
  History,
  Info
} from 'lucide-react';
import axios from 'axios';
import { GridStrategy, GridLevel } from './types';
import RichEditor from './components/RichEditor';
import { fetchBacktestData, fetchDiagnosticData } from './services/marketData';
import { analyzeGridSuitability, DiagnosisReport } from './services/gridDiagnosticService';
import { GridDiagnosisReport } from './components/GridDiagnosisReport';

export default function App() {
  const [strategies, setStrategies] = useState<GridStrategy[]>([]);
  const [diagnosisReport, setDiagnosisReport] = useState<{report: DiagnosisReport, symbol: string} | null>(null);
  const strategiesRef = React.useRef(strategies);
  useEffect(() => {
    strategiesRef.current = strategies;
  }, [strategies]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isNotesFullScreen, setIsNotesFullScreen] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);

  // 初始化本地存储
  useEffect(() => {
    const saved = localStorage.getItem('grid_trader_strategies');
    let loadedStrategies = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedStrategies = parsed;
        }
      } catch (e) {
        console.error('无法解析策略配置', e);
      }
    }
    
    if (loadedStrategies.length === 0) {
      const defaultStrategy: GridStrategy = {
        id: crypto.randomUUID(),
        name: '新网格策略',
        initialPrice: undefined,
        gridInterval: 3,
        initialAmount: 3000,
        stepValue: 0,
        stepType: 'percent',
        commissionRate: 0.005,
        symbol: '515980',
        securityName: '',
        currentPrice: undefined,
        lastPriceTime: undefined,
        notes: '',
        placedLevels: [],
        triggeredLevels: [],
        createdAt: Date.now()
      };
      loadedStrategies = [defaultStrategy];
    }
    
    setStrategies(loadedStrategies);
    setActiveId(loadedStrategies[0].id);
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
      name: '新网格策略',
      initialPrice: undefined,
      gridInterval: 3,
      initialAmount: 3000,
      stepValue: 0,
      stepType: 'percent',
      commissionRate: 0.005,
      symbol: '515980',
      securityName: '',
      currentPrice: undefined,
      lastPriceTime: undefined,
      notes: '',
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
    const { 
      initialPrice, 
      gridInterval = 0, 
      initialAmount = 0, 
      stepValue = 0, 
      stepType, 
      commissionRate = 0 
    } = strategy;
    
    if (initialPrice === undefined || initialPrice <= 0) return [];

    const rate = commissionRate / 100;
    
    const suggestedBottom = strategy.backtest?.suggestedBottom;

    let cumulativeAmount = 0;

    for (let i = 0; i >= -100; i--) {
      // 价格计算：采用等距 (1 + 间距 * 层数)
      const price = initialPrice * (1 + (gridInterval / 100) * i);
      const percentFromInitial = ((price / initialPrice) - 1) * 100;
      
      // Stop condition based on dynamically suggested bottom or fallback to 20 grids
      if (suggestedBottom) {
        if (i < 0 && price < suggestedBottom) break;
      } else {
        if (i < -20) break;
      }
      
      let amount = initialAmount;
      if (i !== 0) {
        const absI = Math.abs(i);
        if (stepType === 'percent') {
          amount = initialAmount * Math.pow(1 + stepValue / 100, absI);
        } else {
          amount = initialAmount + (stepValue * absI);
        }
      }

      cumulativeAmount += amount;

      let netProfit = 0;
      if (i < 0) {
        // 先买后卖逻辑：在当前层级(i)买入，在上一层级(i+1)卖出
        const buyPrice = price;
        const sellPrice = initialPrice * (1 + (gridInterval / 100) * (i + 1));
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
        type: i === 0 ? 'initial' : 'buy',
        cumulativeAmount: Math.round(cumulativeAmount),
        percentFromInitial: Number(percentFromInitial.toFixed(2))
      });
    }
    
    return levels;
  };

  const gridData = useMemo(() => activeStrategy ? calculateGrid(activeStrategy) : [], [activeStrategy]);

  // 自动刷新逻辑：在中国大陆交易期间每5分钟获取一次所有有代码的策略最新价
  useEffect(() => {
    const checkAndRefresh = async () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // A股交易时间：周一至周五 9:15-11:30, 13:00-15:00
      const isWeekday = day >= 1 && day <= 5;
      const isMorning = (hour === 9 && minute >= 15) || (hour === 10) || (hour === 11 && minute <= 30);
      const isAfternoon = (hour >= 13 && hour < 15);
      
      if (isWeekday && (isMorning || isAfternoon)) {
        // 刷新所有包含代码的策略
        for (const s of strategiesRef.current) {
          if (s.symbol) {
            await getLivePrice(s.symbol, s.id);
          }
        }
      }
    };

    // 初始执行一次
    checkAndRefresh();

    // 每 5 分钟执行一次
    const interval = setInterval(checkAndRefresh, 300000);
    return () => clearInterval(interval);
  }, [strategies.length]); // 仅在策略数量变化时重新绑定定时器，内部逻辑会循环所有策略

  const getLivePrice = async (symbol: string, targetId?: string) => {
    if (!symbol) return;
    const effectId = targetId || activeId;
    if (!effectId) return;

    setIsRefreshing(true);
    try {
      const formattedSymbol = symbol.toLowerCase().startsWith('sh') || symbol.toLowerCase().startsWith('sz') 
        ? symbol.toLowerCase() 
        : (symbol.startsWith('6') || symbol.startsWith('5') ? 'sh' + symbol : 'sz' + symbol);
      
      const response = await axios.get(`https://qt.gtimg.cn/q=s_${formattedSymbol}`);
      const text = response.data;
      
      const match = text.match(/="(.*)"/);
      if (match && match[1]) {
        const parts = match[1].split('~');
        if (parts.length > 3) {
          const name = parts[1];
          const price = parseFloat(parts[3]);
          if (!isNaN(price)) {
            setStrategies(prev => prev.map(s => {
              if (s.id !== effectId) return s;
              
              let nextName = s.name;
              if (!nextName || nextName.startsWith('新网格策略') || nextName.startsWith('新策略')) {
                nextName = name;
              }

              const shouldUpdateInitialPrice = !s.initialPrice || s.initialPrice === 0;

              return {
                ...s,
                securityName: name,
                name: nextName,
                currentPrice: price,
                initialPrice: shouldUpdateInitialPrice ? price : s.initialPrice,
                lastPriceTime: Date.now()
              };
            }));
          }
        }
      }
    } catch (error) {
      console.error('获取价格失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBacktest = async (strategy: GridStrategy) => {
    if (!strategy.symbol) {
      alert("请输入证券代码");
      return;
    }
    setIsBacktesting(true);
    const result = await fetchBacktestData(strategy.symbol);
    setIsBacktesting(false);
    if (result) {
      updateStrategy({ ...strategy, backtest: result });
      alert("回测数据获取成功！已经生成历史建议");
    } else {
      alert("未能获取到该代码的回测数据，请检查代码是否正确（例如 A 股股票 600519，或者 sz000001）");
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-bold tracking-tight">GridTrade</h1>
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
                  基准: {s.initialPrice ?? '--'} | {s.gridInterval}%
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
        {diagnosisReport && (
          <GridDiagnosisReport 
            report={diagnosisReport.report} 
            symbol={diagnosisReport.symbol} 
            onClose={() => setDiagnosisReport(null)} 
            onApplySuggestion={(min, max, step) => {
              updateStrategy({
                ...activeStrategy,
                gridInterval: step,
              });
              setIsEditing(true);
            }}
          />
        )}
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
                <div className="flex flex-col min-w-0">
                  <h2 className="text-sm font-bold text-slate-800 truncate select-none">{activeStrategy.name}</h2>
                  {activeStrategy.symbol && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{activeStrategy.symbol}</span>
                      {activeStrategy.currentPrice && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-blue-600">¥{activeStrategy.currentPrice}</span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(activeStrategy.lastPriceTime || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <button 
                        onClick={() => getLivePrice(activeStrategy.symbol || '')}
                        disabled={isRefreshing}
                        className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                        title="刷新价格"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
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
                          <InputWrapper label="股票/基金代码" sub="确认后将自动填充价格与名称">
                            <div className="flex gap-2">
                              <div className="relative group flex-1">
                                <input 
                                  type="text"
                                  placeholder="例: 515980"
                                  value={activeStrategy.symbol || ''}
                                  onChange={(e) => updateStrategy({...activeStrategy, symbol: e.target.value})}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      getLivePrice(activeStrategy.symbol || '');
                                    }
                                  }}
                                  className="input-field pr-24"
                                />
                                <div className="absolute right-0 top-0 bottom-0 flex items-center">
                                  <button 
                                    onClick={async () => {
                                      if (!activeStrategy.symbol) return;
                                      setIsDiagnosing(true);
                                      try {
                                        const today = new Date().toISOString().split('T')[0];
                                        const cacheKey = `diagnosis_cache_${activeStrategy.symbol}_${today}_v4`;
                                        const cachedData = localStorage.getItem(cacheKey);
                                        
                                        if (cachedData) {
                                          try {
                                            const parsed = JSON.parse(cachedData);
                                            if (parsed.metricsInfo && parsed.suggestion) {
                                              setDiagnosisReport({ report: parsed, symbol: activeStrategy.symbol });
                                              return;
                                            }
                                          } catch(e) {}
                                        }

                                        const data = await fetchDiagnosticData(activeStrategy.symbol);
                                        if (data) {
                                          const report = analyzeGridSuitability(data);
                                          setDiagnosisReport({ report, symbol: activeStrategy.symbol });
                                          localStorage.setItem(cacheKey, JSON.stringify(report));
                                        } else {
                                          alert("未能获取数据或数据不足");
                                        }
                                      } catch (error) {
                                        console.error(error);
                                        alert("分析过程中发生错误");
                                      } finally {
                                        setIsDiagnosing(false);
                                      }
                                    }}
                                    disabled={isDiagnosing}
                                    className="px-2 h-full text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center justify-center gap-1"
                                  >
                                    {isDiagnosing ? <RefreshCw className="w-3 h-3 animate-spin" /> : "分析"}
                                  </button>
                                  <button 
                                    onClick={() => getLivePrice(activeStrategy.symbol || '')}
                                    disabled={isRefreshing || !activeStrategy.symbol}
                                    className={`px-2.5 h-full flex items-center justify-center rounded-r-lg transition-all ${
                                      activeStrategy.symbol ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-200'
                                    }`}
                                  >
                                    {isRefreshing ? (
                                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleBacktest(activeStrategy)}
                                disabled={isBacktesting}
                                className="px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg disabled:opacity-50 flex items-center gap-1 font-bold text-xs flex-shrink-0 border border-amber-200 transition-colors"
                                title="一年数据智能回测（建议网格/最大回撤等）"
                              >
                                {isBacktesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                数据回测
                              </button>
                            </div>
                            
                            {activeStrategy.backtest && (
                              <div className="mt-3 bg-amber-50 rounded-xl shadow-sm border border-amber-200/60 overflow-hidden">
                                <div className="bg-amber-100/50 px-3 py-1.5 border-b border-amber-100 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-amber-700">
                                    <History className="w-3.5 h-3.5" />
                                    <h3 className="font-bold text-[11px]">历史数据回顾</h3>
                                  </div>
                                  <span className="text-[10px] text-amber-600/70">更于 {new Date(activeStrategy.backtest.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-amber-700/60 uppercase">单日平均 / 中位数振幅</span>
                                    <span className="text-lg font-black text-amber-600 flex items-baseline gap-1">
                                      <span>{activeStrategy.backtest.averageAmplitude}<span className="text-[10px]">%</span></span>
                                      <span className="text-sm font-bold text-amber-600/80">/ {activeStrategy.backtest.medianAmplitude || activeStrategy.backtest.averageAmplitude}<span className="text-[10px]">%</span></span>
                                    </span>
                                    <p className="text-[9px] text-amber-700/60 leading-tight">建议网格大小为 {activeStrategy.backtest.suggestedGridInterval}%</p>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-amber-700/60 uppercase">最大历史回撤 (1Y/3Y)</span>
                                    <span className="text-lg font-black text-red-500 flex items-baseline gap-0.5">
                                      {activeStrategy.backtest.maxDrawdown1Y ?? '-'}<span className="text-[10px]">%</span> / {activeStrategy.backtest.maxDrawdown3Y ?? '-'}<span className="text-[10px]">%</span>
                                    </span>
                                    <p className="text-[9px] text-amber-700/60 leading-tight">近1年 / 3年最高点至最低点跌幅</p>
                                  </div>
                                  <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                                    <span className="text-[10px] font-bold text-amber-700/60 uppercase">区间最低 / 最高</span>
                                    <span className="text-sm font-bold text-amber-700 flex gap-2 pt-0.5">
                                      <span className="text-[11px]">高: {activeStrategy.backtest.maxPrice}</span>
                                      <span className="text-[11px]">低: {activeStrategy.backtest.minPrice}</span>
                                    </span>
                                    <p className="text-[9px] text-amber-700/60 leading-tight pt-0.5">安全网格区间建议覆盖 <br/>[{activeStrategy.backtest.suggestedBottom}, {activeStrategy.backtest.suggestedTop}]</p>
                                  </div>
                                  <div className="flex flex-col justify-end col-span-2 sm:col-span-1 border-t border-amber-200/50 pt-2 sm:border-t-0 sm:pt-0">
                                    <button
                                      onClick={() => {
                                        updateStrategy({
                                          ...activeStrategy,
                                          gridInterval: activeStrategy.backtest!.suggestedGridInterval
                                        });
                                      }}
                                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold text-[11px] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
                                    >
                                      一键应用网格建议
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </InputWrapper>
                          <InputWrapper label="初始参考价 (¥)" sub={activeStrategy.currentPrice ? `实时: ${activeStrategy.currentPrice} (${new Date(activeStrategy.lastPriceTime || 0).toLocaleTimeString()})` : "当前市场价格"}>
                            <div className="relative">
                              <input 
                                type="number"
                                step="0.001"
                                inputMode="decimal"
                                value={activeStrategy.initialPrice ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                  updateStrategy({...activeStrategy, initialPrice: val});
                                }}
                                className="input-field"
                              />
                              {activeStrategy.currentPrice && (
                                <button 
                                  onClick={() => updateStrategy({...activeStrategy, initialPrice: activeStrategy.currentPrice || 0})}
                                  className="absolute right-1 top-1 bottom-1 px-2 text-[10px] text-blue-600 font-bold hover:bg-blue-50 rounded"
                                >
                                  点此同步
                                </button>
                              )}
                            </div>
                          </InputWrapper>
                          <InputWrapper label="单个网格间距 (%)" sub="每跌多少买入一笔">
                            <input 
                              type="number"
                              step="0.1"
                              inputMode="decimal"
                              value={activeStrategy.gridInterval ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                updateStrategy({...activeStrategy, gridInterval: val});
                              }}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="第一格投入金额 (¥)" sub="基础成交仓位">
                            <input 
                              type="number"
                              inputMode="numeric"
                              value={activeStrategy.initialAmount ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                updateStrategy({...activeStrategy, initialAmount: val});
                              }}
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
                              value={activeStrategy.stepValue ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                updateStrategy({...activeStrategy, stepValue: val});
                              }}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="成交佣金费率 (%)" sub="例：万分之零点五填 0.005">
                            <input 
                              type="number"
                              step="0.001"
                              inputMode="decimal"
                              value={activeStrategy.commissionRate ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                updateStrategy({...activeStrategy, commissionRate: val});
                              }}
                              className="input-field"
                            />
                          </InputWrapper>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-bold text-slate-700 text-xs">策略笔记</h3>
                          </div>
                          <button 
                            onClick={() => setIsNotesFullScreen(true)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600"
                            title="全屏编辑"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-0 h-64 sm:h-80 overflow-hidden bg-white">
                          <RichEditor 
                            value={activeStrategy.notes || ''}
                            onChange={(html) => updateStrategy({...activeStrategy, notes: html})}
                            placeholder="在此输入您的策略思路、注意事项等..."
                          />
                        </div>
                      </div>

                      <div className="sticky bottom-4 z-40 pt-2">
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            if (activeStrategy.symbol) {
                              getLivePrice(activeStrategy.symbol);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          生成交易网格
                        </button>
                      </div>
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
                              <th className="px-1 py-2 text-xs font-bold text-center">层</th>
                              <th className="px-1 py-2 text-xs font-bold">价格</th>
                              <th className="px-1 py-2 text-xs font-bold">金额</th>
                              <th className="px-1 py-2 text-xs font-bold text-blue-300">利润</th>
                              <th className="px-1 py-2 text-xs font-bold text-center">状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {gridData.map((row) => {
                              const isBelowMaxDrawdown = activeStrategy.backtest?.maxDrawdown !== undefined && 
                                                         row.level < 0 && 
                                                         row.percentFromInitial !== undefined && 
                                                         Math.abs(row.percentFromInitial) > activeStrategy.backtest.maxDrawdown;
                              return (
                              <tr 
                                key={row.level} 
                                className={`transition-colors hover:bg-slate-50 ${row.level === 0 ? 'bg-amber-50/50' : (isBelowMaxDrawdown ? 'bg-red-50/50' : '')}`}
                              >
                                <td className="px-1 py-3.5 font-mono text-slate-500 font-bold text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span>{row.level === 0 ? '0' : row.level}</span>
                                    {row.percentFromInitial !== undefined && row.level !== 0 && (
                                      <span className={`text-[10px] font-normal tracking-tighter ${isBelowMaxDrawdown ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        {row.percentFromInitial > 0 ? '+' : ''}{row.percentFromInitial}%
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={`px-1 py-3.5 font-bold ${row.level === 0 ? 'text-slate-900' : (row.level > 0 ? 'text-red-500' : 'text-green-500')}`}>
                                  <CopyableValue value={row.price.toString()} />
                                </td>
                                <td className="px-1 py-3.5 font-medium text-slate-700">
                                  <div className="flex flex-col gap-0.5">
                                    <CopyableValue value={row.amount.toString()} displayValue={row.amount.toLocaleString()} />
                                    {row.cumulativeAmount !== undefined && row.level !== 0 && (
                                      <span className="text-[10px] text-slate-400 font-normal tracking-tighter opacity-80 decoration-slate-300">
                                        累计: {row.cumulativeAmount.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={`px-1 py-3.5 font-bold ${row.level !== 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                  {row.level !== 0 ? `+${row.profit}` : '-'}
                                </td>
                                <td className="px-1 py-3.5 text-center">
                                  {row.level === 0 ? (
                                    <span className="text-xs font-bold text-slate-400">参考位</span>
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
                                        {row.level > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                            })}
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

      {/* 全屏笔记编辑器 */}
      <AnimatePresence>
        {isNotesFullScreen && activeStrategy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="flex-1 overflow-hidden bg-white">
              <RichEditor 
                value={activeStrategy.notes || ''}
                onChange={(html) => updateStrategy({...activeStrategy, notes: html})}
                placeholder="在此输入您的策略思路、注意事项等..."
                rightToolbar={
                  <button 
                    onClick={() => setIsNotesFullScreen(false)}
                    className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-slate-200/50 rounded-md transition-all text-slate-500 hover:text-slate-700 text-xs font-bold"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    退出全屏
                  </button>
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        className="w-full max-w-xs space-y-6"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Grid3X3 className="w-8 h-8 text-blue-500" />
        </div>
        <button 
          onClick={onAdd}
          className="w-[250px] mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          立即创建方案
        </button>
        <p className="mt-4 text-slate-400 text-xs text-center flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          数据存在本地浏览器，请勿清空浏览器缓存
        </p>
      </motion.div>
    </div>
  );
}


