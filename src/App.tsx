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
  Info,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Github,
  Eye,
  EyeOff,
  Filter,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { GridStrategy, GridLevel, FilterCondition, FilterPreset, FilterPeriod, FilterMetric, FilterOperator, TrendIndicator } from './types';
import RichEditor from './components/RichEditor';
import { fetchBacktestData, fetchDiagnosticData } from './services/marketData';
import { analyzeGridSuitability, DiagnosisReport } from './services/gridDiagnosticService';
import { computeTrendIndicator } from './services/trendIndicatorService';
import TrendInstructionModal from './components/TrendInstructionModal';
import { getEastMoneyUrl, getEastMoneyAppScheme, getEastMoneyWapUrl } from './lib/stockUtils';
import { GridDiagnosisReport } from './components/GridDiagnosisReport';
import { fetchTencentQuote, jsonp } from './lib/jsonp';
import TrendMonitorPanel from './components/TrendMonitorPanel';
import DecisionFlowPanel from './components/DecisionFlowPanel';
import ArchitectureDocPanel from './components/ArchitectureDocPanel';
import ApplicationGuidePanel from './components/ApplicationGuidePanel';
import SettingsPanel from './components/SettingsPanel';
import IndicatorDetailPanel from './components/IndicatorDetailPanel';
import { defaultTrendParams, TrendParams } from './types/params';

enum AppView {
  HOME = 'HOME',
  SUMMARY = 'SUMMARY',
  SETTING = 'SETTING',
  GRID = 'GRID',
  REPORT = 'REPORT',
  TREND = 'TREND',
  DECISION_FLOW = 'DECISION_FLOW',
  ARCHITECTURE_DOC = 'ARCHITECTURE_DOC',
  APPLICATION_GUIDE = 'APPLICATION_GUIDE',
  TREND_SETTINGS = 'TREND_SETTINGS',
  INDICATOR_DETAIL = 'INDICATOR_DETAIL'
}

export default function App() {
  const [analyzedSymbols, setAnalyzedSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('grid_analyzed_symbols');
    return saved ? Array.from(new Set(JSON.parse(saved) as string[])) : [];
  });
  
  const [view, setView] = useState<AppView>(() => {
    const saved = localStorage.getItem('grid_app_view');
    if (saved) return saved as AppView;
    return AppView.SUMMARY;
  });
  
  const [symbolsInput, setSymbolsInput] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [trendSymbolsInput, setTrendSymbolsInput] = useState('');
  const [showTrendAddPanel, setShowTrendAddPanel] = useState(false);
  const [analysisMap, setAnalysisMap] = useState<Record<string, { reports: DiagnosisReport[], name: string, statusText: string, updatedAt?: string }>>(() => {
    const saved = localStorage.getItem('grid_analysis_map');
    return saved ? JSON.parse(saved) : {};
  });
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  
  const [strategies, setStrategies] = useState<GridStrategy[]>(() => {
    const saved = localStorage.getItem('grid_trader_strategies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const uniqueMap = new Map<string, GridStrategy>();
          for (const item of parsed) {
            if (item && item.id) {
              uniqueMap.set(item.id, item);
            }
          }
          return Array.from(uniqueMap.values());
        }
      } catch (e) {}
    }
    return [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copiedSymbols, setCopiedSymbols] = useState(false);
  const [summarySortMode, setSummarySortMode] = useState<'DEFAULT' | 'CONCLUSION'>('DEFAULT');
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [showTrendHelpModal, setShowTrendHelpModal] = useState(false);
  const [trendSymbols, setTrendSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('grid_trend_symbols');
    return saved ? Array.from(new Set(JSON.parse(saved) as string[])) : [];
  });
  const [trendIndicators, setTrendIndicators] = useState<TrendIndicator[]>(() => {
    const saved = localStorage.getItem('grid_trend_indicators');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as TrendIndicator[];
      const uniqueMap = new Map<string, TrendIndicator>();
      for (const item of parsed) {
        if (item && item.symbol) {
          uniqueMap.set(item.symbol, item);
        }
      }
      return Array.from(uniqueMap.values());
    } catch {
      return [];
    }
  });
  const [trendLoading, setTrendLoading] = useState<Record<string, boolean>>({});
  const [decisionFlowSymbol, setDecisionFlowSymbol] = useState<string | null>(null);
  const [indicatorDetailSymbol, setIndicatorDetailSymbol] = useState<string | null>(null);
  const [trendParams, setTrendParams] = useState<TrendParams>(() => {
    const saved = localStorage.getItem('grid_trend_params');
    if (saved) {
      try {
        return { ...defaultTrendParams, ...JSON.parse(saved) };
      } catch {
        return defaultTrendParams;
      }
    }
    return defaultTrendParams;
  });
  
  const updateStrategy = (updated: GridStrategy) => {
    setStrategies(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const toggleSelection = (symbol: string) => {
    const canonical = symbol.toLowerCase();
    setSelectedSymbols(prev => 
      prev.includes(canonical) 
        ? prev.filter(s => s !== canonical) 
        : [...prev, canonical]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedSymbols.length === 0) return;
    
    // Remove from all relevant states
    setAnalyzedSymbols(prev => prev.filter(s => !selectedSymbols.includes(s.toLowerCase())));
    setStrategies(prev => prev.filter(s => !s.symbol || !selectedSymbols.includes(s.symbol.toLowerCase())));
    setAnalysisMap(prev => {
      const next = { ...prev };
      selectedSymbols.forEach(s => delete next[s]);
      return next;
    });
    setLoadingMap(prev => {
      const next = { ...prev };
      selectedSymbols.forEach(s => delete next[s]);
      return next;
    });

    // Reset states
    setSelectedSymbols([]);
    setIsDeleteMode(false);
    setShowConfirmDelete(false);
  };
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  
  const [selectedSymbolFilters, setSelectedSymbolFilters] = useState<string[]>(() => {
    const saved = localStorage.getItem('grid_selected_symbol_filters');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(() => {
    const saved = localStorage.getItem('grid_filter_conditions');
    return saved ? JSON.parse(saved) : [];
  });
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('grid_filter_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // New delete mode states
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const addFilterCondition = () => {
    setFilterConditions([...filterConditions, {
      id: Math.random().toString(36).substring(2),
      metric: 'medAmp',
      period: 2, // 3Y
      operator: '>',
      value: 1
    }]);
  };

  const updateFilterCondition = (id: string, updates: Partial<FilterCondition>) => {
    setFilterConditions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeFilterCondition = (id: string) => {
    setFilterConditions(prev => prev.filter(c => c.id !== id));
  };

  const savePreset = () => {
    if (!newPresetName.trim()) return;
    setFilterPresets([...filterPresets, { id: Math.random().toString(36).substring(2), name: newPresetName.trim(), conditions: [...filterConditions] }]);
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  const loadPreset = (preset: FilterPreset) => {
    setFilterConditions(preset.conditions.map(c => ({...c, id: Math.random().toString(36).substring(2)})));
  };
  const removePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterPresets(prev => prev.filter(p => p.id !== id));
  };

  // Initialize from local storage
  useEffect(() => {
    // Check if any analyzed symbols are missing strategies (repair)
    const missingSymbols = analyzedSymbols.filter(sym => 
      !strategies.find(s => s.symbol?.toLowerCase() === sym.toLowerCase())
    );
    
    if (missingSymbols.length > 0) {
      setStrategies(prev => {
        const next = [...prev];
        missingSymbols.forEach(cs => {
          if (!next.find(s => s.symbol?.toLowerCase() === cs.toLowerCase())) {
            next.push({
              id: crypto.randomUUID(),
              name: cs.toUpperCase(),
              symbol: cs.toLowerCase(),
              gridInterval: 3,
              initialAmount: 3000,
              stepValue: 0,
              stepType: 'percent',
              commissionRate: 0.005,
              createdAt: Date.now(),
              notes: '',
              placedLevels: [],
              triggeredLevels: []
            });
          }
        });
        return next;
      });
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('grid_trader_strategies', JSON.stringify(strategies));
  }, [strategies]);

  // Persist App View
  useEffect(() => {
    localStorage.setItem('grid_app_view', view);
  }, [view]);

  // Persist analysis state
  useEffect(() => {
    localStorage.setItem('grid_analysis_map', JSON.stringify(analysisMap));
  }, [analysisMap]);

  useEffect(() => {
    localStorage.setItem('grid_analyzed_symbols', JSON.stringify(analyzedSymbols));
  }, [analyzedSymbols]);

  useEffect(() => {
    localStorage.setItem('grid_filter_conditions', JSON.stringify(filterConditions));
  }, [filterConditions]);

  useEffect(() => {
    localStorage.setItem('grid_filter_presets', JSON.stringify(filterPresets));
  }, [filterPresets]);

  useEffect(() => {
    localStorage.setItem('grid_selected_symbol_filters', JSON.stringify(selectedSymbolFilters));
  }, [selectedSymbolFilters]);

  useEffect(() => {
    localStorage.setItem('grid_trend_symbols', JSON.stringify(trendSymbols));
  }, [trendSymbols]);

  useEffect(() => {
    localStorage.setItem('grid_trend_indicators', JSON.stringify(trendIndicators));
  }, [trendIndicators]);

  // 切换到设置视图或切换策略时自动刷新价格
  useEffect(() => {
    if (view === AppView.SETTING && activeStrategy?.symbol) {
      getLivePrice(activeStrategy.symbol, activeStrategy.id);
    }
  }, [view, activeId]);

  const activeStrategy = useMemo(() => 
    strategies.find(s => s.id === activeId) || null
  , [strategies, activeId]);

  const drawdownMarkers = useMemo(() => {
    if (!activeStrategy?.symbol) return [];
    const cs = activeStrategy.symbol.toLowerCase();
    const reportData = analysisMap[cs];
    if (!reportData || !reportData.reports) return [];
    
    return reportData.reports.map((r, i) => ({
      label: i === 0 ? '1年最大回撤' : (i === 1 ? '2年最大回撤' : '3年最大回撤'),
      percent: r.backtest.maxDrawdown,
      color: i === 0 ? 'border-amber-400 bg-amber-50 text-amber-700' : (i === 1 ? 'border-red-400 bg-red-50 text-red-700' : 'border-purple-400 bg-purple-50 text-purple-700')
    })).filter(m => m.percent > 0).sort((a, b) => a.percent - b.percent);
  }, [activeStrategy, analysisMap]);

  const sortedStrategies = useMemo(() => {
    const getSortVal = (symbol: string) => {
      const result = analysisMap[symbol.toLowerCase()];
      if (!result || !result.reports || result.reports.length === 0) return 0;
      return result.reports.reduce((sum, r) => sum + (r.score || 0), 0) / result.reports.length;
    };
    
    let displaySymbols = [...analyzedSymbols].reverse();

    if (selectedSymbolFilters.length > 0) {
      displaySymbols = displaySymbols.filter(sym => selectedSymbolFilters.includes(sym.toLowerCase()));
    }

    if (isFiltered) {
      displaySymbols = displaySymbols.filter(sym => {
        const result = analysisMap[sym.toLowerCase()];
        if (!result) return false;
        // Hide unsuccessful statuses and those not suitable for grid
        const unacceptableStatuses = ['获取失败', '数据不足', '不适合'];
        if (unacceptableStatuses.includes(result.statusText)) return false;
        return true;
      });
    }

    if (filterConditions.length > 0) {
      displaySymbols = displaySymbols.filter(sym => {
        const result = analysisMap[sym.toLowerCase()];
        if (!result || !result.reports) return false;
        
        return filterConditions.every(cond => {
          const report = result.reports[cond.period];
          if (!report || !report.backtest) return false;
          
          let val = 0;
          switch (cond.metric) {
            case 'score': val = report.score || 0; break;
            case 'avgAmp': val = report.backtest.avgDailyAmplitude || 0; break;
            case 'medAmp': val = report.backtest.medianDailyAmplitude || 0; break;
            case 'maxDrawdown': val = report.backtest.maxDrawdown || 0; break;
            case 'totalReturn': val = report.details?.cumulativeReturn || 0; break;
            case 'suggestedGrid': val = report.backtest.recommendedGridSize || 0; break;
          }
          
          switch (cond.operator) {
            case '>': return val > cond.value;
            case '<': return val < cond.value;
            case '>=': return val >= cond.value;
            case '<=': return val <= cond.value;
            default: return true;
          }
        });
      });
    }

    if (summarySortMode === 'CONCLUSION') {
      displaySymbols.sort((a, b) => {
         const valA = analysisMap[a.toLowerCase()]?.reports.reduce((sum, r) => sum + (r.score || 0), 0) || 0;
         const valB = analysisMap[b.toLowerCase()]?.reports.reduce((sum, r) => sum + (r.score || 0), 0) || 0;
         return valB - valA;
      });
    }
    
    return displaySymbols.map(sym => 
      strategies.find(s => s.symbol?.toLowerCase() === sym.toLowerCase())
    ).filter(Boolean) as GridStrategy[];
  }, [analyzedSymbols, summarySortMode, analysisMap, strategies, isFiltered, filterConditions, selectedSymbolFilters]);

  const activeIndex = useMemo(() => {
    if (!activeId || sortedStrategies.length === 0) return -1;
    return sortedStrategies.findIndex(s => s.id === activeId);
  }, [activeId, sortedStrategies]);

  const navigateSecurity = (direction: 'prev' | 'next') => {
    if (sortedStrategies.length <= 1) return;
    
    let nextIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
    if (nextIndex < 0) nextIndex = sortedStrategies.length - 1;
    if (nextIndex >= sortedStrategies.length) nextIndex = 0;
    
    const nextStrategy = sortedStrategies[nextIndex];
    
    if (nextStrategy) {
      setActiveId(nextStrategy.id);
      // Ensure we have price for the next one
      getLivePrice(nextStrategy.symbol!, nextStrategy.id);
    }
  };

  const swipeState = React.useRef({ startX: 0, startY: 0, isHorizontal: false, startTime: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeState.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      isHorizontal: false,
      startTime: Date.now()
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.current.startX) return;
    
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const dx = Math.abs(x - swipeState.current.startX);
    const dy = Math.abs(y - swipeState.current.startY);
    
    // Once identified as horizontal, stick with it
    if (!swipeState.current.isHorizontal && dx > dy && dx > 8) {
      swipeState.current.isHorizontal = true;
    }

    if (swipeState.current.isHorizontal) {
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const duration = Date.now() - swipeState.current.startTime;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - swipeState.current.startX;
    const dy = endY - swipeState.current.startY;
    
    // Reset startX to prevent accidental triggers
    const wasHorizontal = swipeState.current.isHorizontal;
    swipeState.current.startX = 0;

    if (!wasHorizontal) return;
    
    // Horizontal swipe threshold: 40px and within reasonable time/angle
    if (Math.abs(dx) > 40 && Math.abs(dy) < 100 && duration < 500) {
      if (dx > 0) navigateSecurity('prev');
      else navigateSecurity('next');
    }
  };

  const refreshingRef = React.useRef<Set<string>>(new Set());
  
  const handleStockClick = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const appScheme = getEastMoneyAppScheme(symbol);
    const webUrl = getEastMoneyUrl(symbol);
    const wapUrl = getEastMoneyWapUrl(symbol);
    
    if (isMobile) {
      // 在手机端，尝试唤起 App
      window.location.href = appScheme;
      // 作为一个兜底，如果几秒后还没跳走（说明没装 App），开启 WAP 版
      setTimeout(() => {
        if (!document.hidden) {
          window.open(wapUrl, '_blank');
        }
      }, 2500);
    } else {
      // PC 端直接打开 Web 版
      window.open(webUrl, '_blank');
    }
  };

  // 自动无感刷新历史报告
  useEffect(() => {
    if (view === AppView.REPORT && activeStrategy?.symbol) {
      const cs = activeStrategy.symbol.toLowerCase();
      const reportData = analysisMap[cs];
      if (reportData && reportData.reports && reportData.reports.length > 0) {
        const isOldData = reportData.reports[0].backtest?.maxDrawdown === undefined;
        if (isOldData && !loadingMap[cs] && !refreshingRef.current.has(cs)) {
          refreshingRef.current.add(cs);
          handleStartAnalysis([cs], true).finally(() => {
            refreshingRef.current.delete(cs);
          });
        }
      }
    }
  }, [view, activeStrategy?.symbol, analysisMap, loadingMap]);

  const cleanSymbols = (input: string): string[] => {
    // Regex to match stock codes: 1-6 digits, or letters/digits (US/HK/A-shares)
    // Matches: 600000, 00700, AAPL, sh600000, etc.
    const regex = /(?:sh|sz|hk|us)?(?:\d{1,6}|[a-z]{1,10})/gi;
    const matches = input.match(regex) || [];
    // Filter out very short purely numeric codes that are likely noise, but keep 1-digit for HK
    return Array.from(new Set(matches.map(s => s.toLowerCase()).filter(s => s.length >= 1)));
  };

  const handleStartAnalysis = async (customSymbols?: string[] | any, forceRefresh = false) => {
    const isCustomArray = Array.isArray(customSymbols);
    const symbols = isCustomArray ? customSymbols : cleanSymbols(symbolsInput);
    if (symbols.length === 0) {
      if (!isCustomArray) alert('请在输入框中输入证券代码');
      return;
    }

    if (!isCustomArray) {
      setSymbolsInput('');
    }

    if (!forceRefresh) {
      setView(AppView.SUMMARY);
    }
    
    // Move analyzed symbols to the front (end of array before reverse)
    setAnalyzedSymbols(prev => {
      const filtered = prev.filter(s => !symbols.some(newSym => newSym.toLowerCase() === s.toLowerCase()));
      return [...filtered, ...symbols];
    });
    
    const canonicalSymbols = symbols.map(s => s.toLowerCase());
    
    // Create strategies immediately if they don't exist
    setStrategies(prev => {
      let next = [...prev];
      let changed = false;
      for (const cs of canonicalSymbols) {
        if (!next.find(s => s.symbol?.toLowerCase() === cs)) {
          next.push({
            id: crypto.randomUUID(),
            name: cs.toUpperCase(),
            symbol: cs,
            gridInterval: 3,
            initialAmount: 3000,
            stepValue: 0,
            stepType: 'percent',
            commissionRate: 0.005,
            createdAt: Date.now(),
            notes: '',
            placedLevels: [],
            triggeredLevels: []
          });
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    const symbolsToRefresh = forceRefresh ? canonicalSymbols : canonicalSymbols.filter(s => !analysisMap[s]);
    
    // Set all pending symbols to loading right away
    setLoadingMap(prev => {
      const next = { ...prev };
      for (const cs of symbolsToRefresh) {
        next[cs] = true;
      }
      return next;
    });
    
    // Process each symbol
    let isFirstFetch = true;
    for (const symbol of symbols) {
      const canonicalSymbol = symbol.toLowerCase();
      if (!forceRefresh && analysisMap[canonicalSymbol]) continue;

      if (!isFirstFetch) {
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
      }
      isFirstFetch = false;
      
      try {
        const data = await fetchDiagnosticData(canonicalSymbol);
        
        // Always try to fetch descriptive name regardless of data length
        let name = canonicalSymbol.toUpperCase();
        try {
          const possibleSymbols = [
            canonicalSymbol.startsWith('sh') || canonicalSymbol.startsWith('sz') ? canonicalSymbol : 
              (canonicalSymbol.startsWith('6') || canonicalSymbol.startsWith('5') ? 'sh' + canonicalSymbol : 'sz' + canonicalSymbol),
            'sh' + canonicalSymbol.replace(/sh|sz/i, ''),
            'sz' + canonicalSymbol.replace(/sh|sz/i, ''),
            'hk' + canonicalSymbol.replace(/hk/i, ''),
            'us' + canonicalSymbol.replace(/us/i, '')
          ];
          
          for (const sym of possibleSymbols) {
            try {
              const text = await fetchTencentQuote(`s_${sym}`);
              if (text && text.split('~').length > 1) {
                const fetchedName = text.split('~')[1];
                if (fetchedName && fetchedName !== 'N/A') {
                  name = fetchedName;
                  break;
                }
              }
            } catch(e) {}
          };
        } catch(e) {}

        // Update strategy name if we found a better one
        setStrategies(prev => prev.map(s => s.symbol?.toLowerCase() === canonicalSymbol ? { ...s, name } : s));

        if (data && data.length >= 60) {
          const report1Y = analyzeGridSuitability(data.slice(-250));
          const report2Y = analyzeGridSuitability(data.slice(-500));
          const report3Y = analyzeGridSuitability(data);
          const reports = [report1Y, report2Y, report3Y];
          
          setAnalysisMap(prev => ({
            ...prev,
            [canonicalSymbol]: { reports, name, statusText: report3Y.rating, updatedAt: new Date().toISOString() }
          }));

          // Update strategy with recommended grid size if it was a fresh creation
          setStrategies(prev => prev.map(s => {
            if (s.symbol?.toLowerCase() === canonicalSymbol) {
              return { 
                ...s, 
                gridInterval: s.gridInterval === 3 ? (report3Y.backtest.recommendedGridSize || 3) : s.gridInterval 
              };
            }
            return s;
          }));
        } else if (data) {
           // Not enough data but we have some results
           setAnalysisMap(prev => ({
            ...prev,
            [canonicalSymbol]: { reports: [], name, statusText: '数据不足', updatedAt: new Date().toISOString() }
          }));
        }
      } catch (e) {
        console.error(`Analysis failed for ${canonicalSymbol}`, e);
        setAnalysisMap(prev => ({
          ...prev,
          [canonicalSymbol]: { reports: [], name: canonicalSymbol.toUpperCase(), statusText: '获取失败', updatedAt: new Date().toISOString() }
        }));
      } finally {
        setLoadingMap(prev => ({ ...prev, [canonicalSymbol]: false }));
      }
    }
  };

  const handleTrendRefresh = async (symbol: string) => {
    const canonical = symbol.toLowerCase();
    setTrendLoading(prev => ({ ...prev, [canonical]: true }));
    try {
      const data = await fetchDiagnosticData(canonical);
      if (data && data.length > 40) {
        // Fetch name
        let name = canonical.toUpperCase();
        try {
          const possibleSymbols = [
            canonical.startsWith('sh') || canonical.startsWith('sz') ? canonical : 
              (canonical.startsWith('6') || canonical.startsWith('5') ? 'sh' + canonical : 'sz' + canonical),
            'sh' + canonical.replace(/sh|sz/i, ''),
            'sz' + canonical.replace(/sh|sz/i, ''),
            'hk' + canonical.replace(/hk/i, ''),
            'us' + canonical.replace(/us/i, '')
          ];
          for (const sym of possibleSymbols) {
            const text = await fetchTencentQuote(`s_${sym}`);
            if (text && text.split('~').length > 1) {
              name = text.split('~')[1];
              if (name && name !== 'N/A') break;
            }
          }
        } catch(e) {}

        const indicator = computeTrendIndicator(canonical, name, data, trendParams);
        setTrendIndicators(prev => {
          const filtered = prev.filter(ti => ti.symbol !== canonical);
          return [...filtered, indicator];
        });
      }
    } catch (e) {
      console.error(`Trend check failed for ${canonical}`, e);
    } finally {
      setTrendLoading(prev => ({ ...prev, [canonical]: false }));
    }
  };

  const handleBatchAddTrend = async (input: string) => {
    let symbols = cleanSymbols(input);
    if (symbols.length === 0) return;
    
    symbols = Array.from(new Set(symbols.map(s => s.toLowerCase())));
    
    setTrendSymbols(prev => {
      const filtered = prev.filter(s => !symbols.includes(s));
      return [...filtered, ...symbols];
    });

    for (const sym of symbols) {
      await handleTrendRefresh(sym);
    }
  };

  const handleRemoveTrend = (symbol: string) => {
    const canonical = symbol.toLowerCase();
    setTrendSymbols(prev => prev.filter(s => s !== canonical));
    setTrendIndicators(prev => prev.filter(ti => ti.symbol !== canonical));
  };

  const getLivePrice = async (symbol: string, targetId: string) => {
    setIsRefreshing(true);
    setError(null);
    try {
      const canonicalSymbol = symbol.toLowerCase();
      const possibleSymbols = [
        canonicalSymbol.startsWith('sh') || canonicalSymbol.startsWith('sz') ? canonicalSymbol : 
          (canonicalSymbol.startsWith('6') || canonicalSymbol.startsWith('5') ? 'sh' + canonicalSymbol : 'sz' + canonicalSymbol),
        'sh' + canonicalSymbol.replace(/sh|sz/i, ''),
        'sz' + canonicalSymbol.replace(/sh|sz/i, ''),
        'hk' + canonicalSymbol.replace(/hk/i, ''),
        'us' + canonicalSymbol.replace(/us/i, '')
      ];
      
      for (const sym of possibleSymbols) {
        try {
          // Try simple quote first
          let text = await fetchTencentQuote(`s_${sym}`);
          
          // If simple fails or has no price, try full quote
          if (!text || text.split('~').length < 4 || parseFloat(text.split('~')[3]) <= 0) {
            text = await fetchTencentQuote(sym);
          }
          
          if (text) {
            const parts = text.split('~');
            if (parts.length > 3) {
              const name = parts[1];
              const price = parseFloat(parts[3]);
              if (!isNaN(price) && price > 0) {
                setStrategies(prev => prev.map(s => s.id === targetId ? {
                  ...s,
                  securityName: name, 
                  currentPrice: price,
                  initialPrice: s.initialPrice || price,
                  lastPriceTime: Date.now()
                } : s));
                return;
              }
            }
          }
        } catch(e) {}
      }

      // Final fallback: Try East Money API directly
      try {
        const formatted = symbol.replace(/sh|sz|hk|us/i, '').toUpperCase();
        const preferredPrefix = (formatted.startsWith('6') || formatted.startsWith('5')) ? '1' : '0';
        for (const p of [preferredPrefix, preferredPrefix === '1' ? '0' : '1', '116', '105', '106']) {
          try {
            const emUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${p}.${formatted}&ut=fa5fd1943c41bc19e5917409249e37&fields=f43,f44,f45,f57,f58`;
            const res: any = await jsonp(emUrl, 'cb');
            if (res && res.data && res.data.f43 && res.data.f43 !== '-') {
              const price = res.data.f43 / 100; // f43 is usually price * 100 in some EM APIs, but let's check
              // Actually, f43 might be the real price if it's from push2.
              // For A-shares, f43 is price.
              const realPrice = res.data.f43;
              if (realPrice > 0) {
                 setStrategies(prev => prev.map(s => s.id === targetId ? {
                  ...s,
                  securityName: res.data.f58 || s.securityName, 
                  currentPrice: realPrice,
                  initialPrice: s.initialPrice || realPrice,
                  lastPriceTime: Date.now()
                } : s));
                return;
              }
            }
          } catch(err) {}
        }
      } catch(e) {}

      throw new Error('未获取到有效的价格数据');
    } catch (e: any) {
      console.error(e);
      setError(`刷新价格失败: ${e.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateGrid = (strategy: GridStrategy): GridLevel[] => {
    const levels: GridLevel[] = [];
    const { initialPrice, gridInterval = 0, initialAmount = 0, stepValue = 0, stepType, commissionRate = 0 } = strategy;
    if (!initialPrice || initialPrice <= 0) return [];

    const rate = commissionRate / 100;
    const suggestedBottom = strategy.backtest?.suggestedBottom;
    let cumulativeAmount = 0;

    for (let i = 0; i >= -100; i--) {
      const price = initialPrice * (1 + (gridInterval / 100) * i);
      const percentFromInitial = ((price / initialPrice) - 1) * 100;
      if (suggestedBottom ? (i < 0 && price < suggestedBottom) : (i < -20)) break;
      
      let amount = initialAmount;
      if (i !== 0) {
        const absI = Math.abs(i);
        amount = stepType === 'percent' ? initialAmount * Math.pow(1 + stepValue / 100, absI) : initialAmount + (stepValue * absI);
      }
      cumulativeAmount += amount;

      let netProfit = 0;
      if (i < 0) {
        const buyPrice = price;
        const sellPrice = initialPrice * (1 + (gridInterval / 100) * (i + 1));
        const qty = amount / buyPrice;
        const buyFee = amount * rate;
        const sellRev = qty * sellPrice;
        const sellFee = sellRev * rate;
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

  const renderNavDrawer = () => {
    return (
      <AnimatePresence>
        {showNavDrawer && (
          <motion.div 
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNavDrawer(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[1000]"
          />
        )}
        {showNavDrawer && (
          <motion.div 
            key="nav-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-full max-w-[280px] bg-white shadow-2xl z-[1001] flex flex-col"
          >
            <div className="px-6 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Q-Trade</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trading Systems</p>
                  </div>
                </div>
                <button onClick={() => setShowNavDrawer(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                 <button 
                  onClick={() => {
                    setView(AppView.SUMMARY);
                    setShowNavDrawer(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${view === AppView.SUMMARY || view === AppView.HOME || view === AppView.GRID || view === AppView.REPORT || view === AppView.SETTING ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
                 >
                   <div className={`p-2 rounded-xl flex-shrink-0 ${view === AppView.SUMMARY || view === AppView.HOME || view === AppView.GRID || view === AppView.REPORT || view === AppView.SETTING ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                     <Activity className="w-5 h-5" />
                   </div>
                   <div className="text-left flex-1">
                     <div className="text-sm">网格交易系统</div>
                     <div className="text-[10px] uppercase tracking-widest opacity-60">Grid Trade</div>
                   </div>
                 </button>

                 <button 
                  onClick={() => {
                    setView(AppView.TREND);
                    setShowNavDrawer(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${view === AppView.TREND ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
                 >
                   <div className={`p-2 rounded-xl flex-shrink-0 ${view === AppView.TREND ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                     <TrendingUp className="w-5 h-5" />
                   </div>
                   <div className="text-left flex-1">
                     <div className="text-sm">趋势交易系统</div>
                     <div className="text-[10px] uppercase tracking-widest opacity-60">Trend Trade</div>
                   </div>
                 </button>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    );
  };
  const renderTrend = () => {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative w-full min-w-0">
        <TrendMonitorPanel
          symbols={trendSymbols}
          indicators={trendIndicators}
          loadingSymbols={trendLoading}
          onAddSymbol={() => setShowTrendAddPanel(true)}
          onRefreshAll={async () => {
            for (const sym of trendSymbols) {
              await handleTrendRefresh(sym);
            }
          }}
          onRemoveSymbol={(symbol) => handleRemoveTrend(symbol)}
          onRefreshSymbol={(symbol) => handleTrendRefresh(symbol)}
          addPanelOpen={showTrendAddPanel}
          onToggleAddPanel={() => setShowTrendAddPanel(!showTrendAddPanel)}
          inputValue={trendSymbolsInput}
          onInputChange={(value) => setTrendSymbolsInput(value)}
          onConfirmAdd={() => {
            if (trendSymbolsInput.trim()) {
              handleBatchAddTrend(trendSymbolsInput);
              setTrendSymbolsInput('');
              setShowTrendAddPanel(false);
            }
          }}
          onOpenNav={() => setShowNavDrawer(true)}
          onOpenIndicatorDetail={(symbol) => {
            setIndicatorDetailSymbol(symbol);
            setView(AppView.INDICATOR_DETAIL);
          }}
          onOpenDecisionFlow={(symbol) => {
            setDecisionFlowSymbol(symbol);
            setView(AppView.DECISION_FLOW);
          }}
          onOpenSettings={() => setView(AppView.TREND_SETTINGS)}
        />
      </div>
    );
  };

  const renderIndicatorDetail = () => {
    const indicator = trendIndicators.find(ti => ti.symbol === indicatorDetailSymbol);
    if (!indicator) {
      return (
        <div className="flex-1 flex flex-col bg-white">
          <header className="px-4 py-3 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
            <button
              onClick={() => setView(AppView.TREND)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">指标详情</h1>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">未找到指标数据</p>
          </div>
        </div>
      );
    }

    const currentIndex = trendIndicators.findIndex(ti => ti.symbol === indicatorDetailSymbol);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < trendIndicators.length - 1;

    const handlePrev = () => {
      if (hasPrev) {
        const prevIndicator = trendIndicators[currentIndex - 1];
        setIndicatorDetailSymbol(prevIndicator.symbol);
      }
    };

    const handleNext = () => {
      if (hasNext) {
        const nextIndicator = trendIndicators[currentIndex + 1];
        setIndicatorDetailSymbol(nextIndicator.symbol);
      }
    };

    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <IndicatorDetailPanel
          indicator={indicator}
          onBack={() => setView(AppView.TREND)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
          currentIndex={currentIndex}
          totalCount={trendIndicators.length}
        />
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl space-y-12"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
             <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 
              onClick={() => setShowNavDrawer(true)}
              className="text-4xl font-black text-slate-900 tracking-tighter uppercase cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-3"
            >
              <Menu className="w-8 h-8 text-slate-400" />
              GRIDTRADE
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <textarea 
              value={symbolsInput}
              onChange={(e) => setSymbolsInput(e.target.value)}
              placeholder="输入证券代码，多个代码以空格分隔..."
              className="w-full h-40 p-8 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all text-2xl font-mono text-center placeholder:text-slate-300 placeholder:font-sans resize-none"
            />
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleStartAnalysis}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
            >
              网格交易诊断
            </button>
            <div className="flex justify-center">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <History className="w-3 h-3" />
                所有诊断结果与参数仅保存于本地浏览器缓存
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-medium">支持 A股、港股、美股标的识别与清洗</p>
      </motion.div>
    </div>
  );

  const renderFilterPanel = () => {
    return (
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div 
            key="filter-panel"
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden bg-indigo-50/30 border-b border-indigo-100 shrink-0"
          >
            <div className="p-4 space-y-4 max-w-full overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest min-w-max">筛选条件</span>
                  
                  {filterPresets.length > 0 && (
                    <div className="flex items-center border border-slate-200 rounded overflow-hidden bg-slate-50 ml-0 sm:ml-2 w-full sm:w-auto">
                      <select
                        className="text-[11px] font-bold text-slate-600 bg-transparent p-1.5 w-full sm:w-32 outline-none border-none cursor-pointer"
                        value={filterPresets.find(p => p.conditions.length === filterConditions.length && p.conditions.every((c, i) => c.metric === filterConditions[i]?.metric && c.period === filterConditions[i]?.period && c.operator === filterConditions[i]?.operator && c.value === filterConditions[i]?.value))?.id || ''}
                        onChange={(e) => {
                          const preset = filterPresets.find(p => p.id === e.target.value);
                          if (preset) loadPreset(preset);
                        }}
                      >
                        <option value="">-- 选择已存组合 --</option>
                        {filterPresets.map(preset => (
                          <option key={preset.id} value={preset.id}>{preset.name}</option>
                        ))}
                      </select>
                      {filterPresets.length > 0 && filterPresets.some(p => p.id === filterPresets.find(p => p.conditions.length === filterConditions.length && p.conditions.every((c, i) => c.metric === filterConditions[i]?.metric && c.period === filterConditions[i]?.period && c.operator === filterConditions[i]?.operator && c.value === filterConditions[i]?.value))?.id) && (
                        <button 
                          onClick={(e) => {
                            const activeId = filterPresets.find(p => p.conditions.length === filterConditions.length && p.conditions.every((c, i) => c.metric === filterConditions[i]?.metric && c.period === filterConditions[i]?.period && c.operator === filterConditions[i]?.operator && c.value === filterConditions[i]?.value))?.id;
                            if (activeId) removePreset(activeId, e);
                          }}
                          className="px-2 py-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border-l border-slate-200 min-w-max"
                          title="删除当前预设"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={addFilterCondition} className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded transition-colors shrink-0">
                    <Plus className="w-3.5 h-3.5" /> 添加条件
                  </button>
                  
                  {filterConditions.length > 0 && !isSavingPreset && (
                    <button onClick={() => setIsSavingPreset(true)} className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded transition-colors border border-emerald-200 shrink-0">
                      <Save className="w-3.5 h-3.5" /> 保存此组合
                    </button>
                  )}
                  
                  {filterConditions.length > 0 && isSavingPreset && (
                    <div className="flex items-center gap-1 shrink-0">
                      <input 
                        type="text" 
                        value={newPresetName} 
                        onChange={(e) => setNewPresetName(e.target.value)} 
                        placeholder="组合名称" 
                        className="text-[11px] w-24 sm:w-32 px-2 py-1.5 bg-white border border-slate-200 rounded outline-none focus:border-indigo-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                      />
                      <button onClick={savePreset} disabled={!newPresetName.trim()} className="text-[11px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                        确定
                      </button>
                      <button onClick={() => setIsSavingPreset(false)} className="text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors">
                        取消
                      </button>
                    </div>
                  )}
                  
                  {filterConditions.length > 0 && (
                    <button onClick={() => setFilterConditions([])} className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded transition-colors border border-rose-200 shrink-0">
                      清空
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-indigo-100/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest min-w-max">筛选标的</span>
                    {selectedSymbolFilters.length > 0 && (
                      <button 
                        onClick={() => setSelectedSymbolFilters([])}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold px-1"
                      >
                        清空
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analyzedSymbols.map(sym => (
                      <button
                        key={sym}
                        onClick={() => setSelectedSymbolFilters(prev => 
                          prev.includes(sym.toLowerCase()) ? prev.filter(s => s !== sym.toLowerCase()) : [...prev, sym.toLowerCase()]
                        )}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors border ${
                          selectedSymbolFilters.includes(sym.toLowerCase()) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {analysisMap[sym.toLowerCase()]?.name || sym.toUpperCase()}
                      </button>
                    ))}
                  </div>
              </div>
              
              {filterConditions.length > 0 ? (
                <div className="space-y-2">
                  {filterConditions.map((cond, index) => (
                    <div key={cond.id} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg shadow-sm w-max transition-colors hover:border-indigo-300">
                      <select 
                        value={cond.period} 
                        onChange={(e) => updateFilterCondition(cond.id, { period: Number(e.target.value) as FilterPeriod })}
                        className="text-[11px] font-semibold text-slate-700 bg-transparent outline-none focus:ring-0 border-none p-0 cursor-pointer"
                      >
                        <option value={0}>1年</option>
                        <option value={1}>2年</option>
                        <option value={2}>3年</option>
                      </select>
                      <select 
                        value={cond.metric} 
                        onChange={(e) => updateFilterCondition(cond.id, { metric: e.target.value as FilterMetric })}
                        className="text-[11px] font-semibold text-slate-700 bg-transparent outline-none focus:ring-0 border-none p-0 cursor-pointer"
                      >
                        <option value="score">综合评分(分)</option>
                        <option value="avgAmp">平均振幅(%)</option>
                        <option value="medAmp">中位振幅(%)</option>
                        <option value="maxDrawdown">最大回撤(%)</option>
                        <option value="totalReturn">累计涨跌(%)</option>
                        <option value="suggestedGrid">建议网格(%)</option>
                      </select>
                      <select 
                        value={cond.operator} 
                        onChange={(e) => updateFilterCondition(cond.id, { operator: e.target.value as FilterOperator })}
                        className="text-[12px] font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded outline-none focus:ring-0 border-none cursor-pointer"
                      >
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value=">=">&ge;</option>
                        <option value="<=">&le;</option>
                      </select>
                      <input 
                        type="number" 
                        value={cond.value}
                        onChange={(e) => updateFilterCondition(cond.id, { value: Number(e.target.value) })}
                        placeholder="值"
                        className="w-16 text-[12px] font-mono tabular-nums text-slate-700 bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none p-0 mx-1 text-center"
                      />
                      <button onClick={() => removeFilterCondition(cond.id)} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0 ml-1 z-10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 py-2">暂无筛选条件。</div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderAddPanel = () => {
    return (
      <AnimatePresence>
        {showAddPanel && (
          <motion.div 
            key="add-panel"
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden bg-slate-50 border-b border-slate-100 shrink-0"
          >
            <div className="p-4 space-y-3">
              <textarea 
                value={symbolsInput}
                onChange={(e) => setSymbolsInput(e.target.value)}
                placeholder="在此输入证券代码，多个代码以空格分隔..."
                className="w-full h-20 p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all font-mono placeholder:text-slate-400 placeholder:font-sans resize-none text-[11px]"
              />
              <button 
                onClick={() => {
                  const newSymbols = cleanSymbols(symbolsInput);
                  if (newSymbols.length > 0) {
                    setSymbolsInput('');
                    const nonDuplicateSymbols = newSymbols.filter(s => !analyzedSymbols.includes(s));
                    if (nonDuplicateSymbols.length > 0) {
                      setAnalyzedSymbols(prev => {
                        const newArray = [...prev, ...nonDuplicateSymbols];
                        return Array.from(new Set(newArray));
                      });
                      handleStartAnalysis(nonDuplicateSymbols);
                    }
                    setShowAddPanel(false);
                  }
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm shadow-blue-600/10 transition-all flex items-center justify-center gap-2 text-[11px]"
              >
                <Search className="w-3.5 h-3.5" />
                添加并诊断
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderSummary = () => {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative w-full min-w-0">
        <header className="px-3 py-4 flex items-center justify-between bg-white border-b border-slate-100 z-50 shrink-0 min-w-0">
          <div className="flex items-center gap-4">
            {isDeleteMode && (
              <button 
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedSymbols([]);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <h2 
              onClick={() => !isDeleteMode && setShowNavDrawer(true)}
              className={`text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 ${!isDeleteMode ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
            >
              {!isDeleteMode && <Menu className="w-5 h-5 text-slate-400" />}
              {isDeleteMode ? `已选择 ${selectedSymbols.length} 个标的` : 'GridTrade'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex relative">
               <button 
                 onClick={() => setShowAddPanel(!showAddPanel)}
                 className={`p-2 rounded-full transition-colors ${showAddPanel ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 title="添加标的"
               >
                 <Plus className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                 className={`p-2 rounded-full transition-colors relative ${filterConditions.length > 0 || isFilterPanelOpen ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                 title="高级筛选"
               >
                 <Filter className="w-4 h-4" />
                 {filterConditions.length > 0 && (
                   <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                 )}
               </button>
             </div>
             <button 
                onClick={() => setIsFiltered(!isFiltered)}
                className={`p-2 rounded-full transition-colors ${isFiltered ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="隐藏异常标的"
              >
                {isFiltered ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
             {!isDeleteMode ? (
               <>
                 <button 
                   onClick={() => setIsDeleteMode(true)}
                   className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                   title="进入删除模式"
                 >
                   <Trash2 className="w-4 h-4" />
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
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
                  >
                    删除
                  </button>
               </div>
             )}
          </div>
        </header>

        {renderFilterPanel()}
        {renderAddPanel()}

        <div className="px-2 py-2 text-[10px] text-slate-400/80 font-medium bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
             <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             各指标自上而下代表近 1、2、3 年表现
           </div>
           {!isDeleteMode && (
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-300">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="tabular-nums">{analyzedSymbols.length} 标的</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const codes = sortedStrategies.map(s => s.symbol).filter(Boolean).join(' ');
                    navigator.clipboard.writeText(codes).then(() => {
                      setCopiedSymbols(true);
                      setTimeout(() => setCopiedSymbols(false), 2000);
                    });
                  }}
                  className={`transition-colors ${copiedSymbols ? 'text-green-500' : 'text-slate-400 hover:text-blue-500'}`}
                  title={copiedSymbols ? "复制成功" : "复制筛选后的证券代码"}
                >
                  {copiedSymbols ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
             </div>
           )}
        </div>

        <div className="flex-1 overflow-auto min-h-0 min-w-0 w-full relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-[max-content]">
            <thead className="sticky top-0 z-30 shadow-sm bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="px-2 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[100px] sticky left-0 z-40 bg-slate-50 border-r border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {isDeleteMode && (
                      <div 
                        onClick={() => {
                          if (selectedSymbols.length === analyzedSymbols.length) setSelectedSymbols([]);
                          else setSelectedSymbols(analyzedSymbols.map(s => s.toLowerCase()));
                        }}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          selectedSymbols.length === analyzedSymbols.length ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                        }`}
                      >
                        {selectedSymbols.length === analyzedSymbols.length && <Check className="w-2 h-2 text-white stroke-[4]" />}
                      </div>
                    )}
                    <span>证券</span>
                  </div>
                </th>
                <th 
                  className="px-2 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center min-w-[60px] cursor-pointer hover:text-slate-600 select-none group"
                  onClick={() => setSummarySortMode(prev => prev === 'DEFAULT' ? 'CONCLUSION' : 'DEFAULT')}
                >
                  <div className="flex items-center justify-center gap-1">
                    结论
                    <svg className={`w-2.5 h-2.5 transition-transform ${summarySortMode === 'CONCLUSION' ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                </th>
                <th className="px-1.5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center min-w-[40px]">评分</th>
                
                <th className="px-1.5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tight text-center min-w-[60px]">平均振幅</th>
                <th className="px-1.5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tight text-center min-w-[60px]">中位振幅</th>
                <th className="px-1.5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tight text-center min-w-[60px]">最大回撤</th>
                <th className="px-1.5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tight text-center min-w-[60px]">累计涨跌</th>
                <th className="px-1.5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tight text-center min-w-[60px]">建议网格</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedStrategies.map(strategy => {
                const symbol = strategy.symbol!;
                const canonicalSymbol = symbol.toLowerCase();
                const result = analysisMap[canonicalSymbol];
                const isLoading = loadingMap[canonicalSymbol];
                const isSelected = selectedSymbols.includes(canonicalSymbol);
                
                return (
                  <tr 
                    key={strategy.id} 
                    onClick={() => isDeleteMode && toggleSelection(symbol)}
                    className={`group transition-colors ${
                      isDeleteMode ? 'cursor-pointer' : 'hover:bg-slate-50'
                    } ${isSelected ? 'bg-rose-50' : 'bg-white'}`}
                  >
                    <td className={`px-2 py-4 overflow-hidden sticky left-0 z-10 border-r border-slate-50 transition-colors ${isSelected ? 'bg-rose-50' : 'bg-white group-hover:bg-slate-50'}`}>
                      <div className="flex items-start gap-1 min-w-0">
                        {isDeleteMode && (
                           <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                             isSelected ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-300'
                           }`}>
                             {isSelected && <Check className="w-2 h-2 text-white stroke-[4]" />}
                           </div>
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0">
                           <div className="text-[12px] font-black text-slate-900 leading-tight">
                              {isLoading ? (
                                <div className="w-16 h-3 bg-slate-100 animate-pulse rounded" />
                              ) : (
                                <a 
                                  href={getEastMoneyUrl(symbol)}
                                  onClick={(e) => handleStockClick(e, symbol)}
                                  className="hover:text-blue-600 transition-colors break-words"
                                >
                                  {result?.name || symbol}
                                </a>
                              )}
                           </div>
                           {!isLoading && result?.name && (
                             <div className="flex items-center gap-1.5 flex-wrap mt-[2px]">
                               <a 
                                 href={getEastMoneyUrl(symbol)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 onClick={(e) => handleStockClick(e, symbol)}
                                 className="text-[9px] font-bold text-slate-400 font-mono tabular-nums leading-none hover:text-blue-500 transition-all opacity-80"
                               >
                                 {symbol.replace(/sh|sz|hk|us/i, '')}
                               </a>
                               {result.updatedAt && (() => {
                                 const uDate = new Date(result.updatedAt);
                                 const formattedDate = `${String(uDate.getMonth() + 1).padStart(2, '0')}-${String(uDate.getDate()).padStart(2, '0')}`;
                                 return (
                                   <span className="text-[9px] text-slate-400 font-medium leading-none tabular-nums opacity-60 ml-1" title="历史数据最后抓取时间">
                                     {formattedDate}更新
                                   </span>
                                 );
                               })()}
                             </div>
                           )}
                           
                           {!isLoading && strategy && !isDeleteMode && (
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                {[
                                  { icon: FileText, onClick: () => { setActiveId(strategy.id); setView(AppView.REPORT); }, title: '报告' },
                                  { icon: Settings2, onClick: () => { setActiveId(strategy.id); setView(AppView.SETTING); }, title: '设置' },
                                  { icon: Grid3X3, onClick: () => { setActiveId(strategy.id); setView(AppView.GRID); if (!strategy.currentPrice) getLivePrice(strategy.symbol!, strategy.id); }, title: '网格' },
                                  { icon: TrendingUp, onClick: () => { handleBatchAddTrend(symbol); setView(AppView.TREND); }, title: '趋势分析' },
                                ].map((btn, i) => (
                                  <button 
                                    key={`btn-${strategy.id}-${i}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      btn.onClick();
                                    }}
                                    className="p-1 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-all"
                                    title={btn.title}
                                  >
                                    <btn.icon className="w-3.5 h-3.5" />
                                  </button>
                                ))}
                                <button
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     handleStartAnalysis([symbol], true);
                                  }}
                                  className="p-1 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-all ml-0.5"
                                  title="重新抓取"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                           )}
                        </div>
                      </div>
                    </td>
                    <td 
                      className={`px-1 py-4 text-center ${!isDeleteMode ? 'cursor-pointer' : ''}`}
                      onClick={(e) => {
                        if (!isDeleteMode) {
                          e.stopPropagation();
                          setActiveId(strategy.id);
                          setView(AppView.REPORT);
                        }
                      }}
                    >
                       {isLoading ? (
                         <div className="w-10 h-2.5 bg-slate-50 animate-pulse rounded mx-auto" />
                       ) : result ? (
                         (() => {
                           const status = result.statusText
                             .replace('历史数据不足', '数据不足')
                             .replace('结论：', '')
                             .replace('适合网格交易', '适合')
                             .replace('勉强适合网格交易', '勉强适合')
                             .replace('不适合网格交易', '不适合');
                           
                           const color = status.includes('适合') ? 'text-blue-600' : 
                                         status.includes('勉强适合') ? 'text-amber-500' :
                                         status.includes('不适合') ? 'text-rose-500' :
                                         'text-slate-400';
                           
                           return (
                             <span className={`text-[10px] font-black whitespace-nowrap transition-colors ${color}`}>
                               {status}
                             </span>
                           );
                         })()
                       ) : (
                         <span className="text-[10px] font-black text-slate-300">
                           获取失败
                         </span>
                       )}
                    </td>
                    
                    <td 
                      className={`px-0.5 py-4 ${!isDeleteMode ? 'cursor-pointer' : ''}`}
                      onClick={(e) => {
                        if (!isDeleteMode) {
                          e.stopPropagation();
                          setActiveId(strategy.id);
                          setView(AppView.REPORT);
                        }
                      }}
                    >
                      {isLoading || result ? (
                        <div className="flex flex-col gap-0.5">
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-slate-100 border-t-blue-500 rounded-full animate-spin mx-auto" />
                          ) : result?.reports ? [0, 1, 2].map(idx => {
                            const r = result.reports[idx];
                            return (
                              <div key={`score-${strategy.id}-${idx}`} className="flex items-center justify-center gap-1 leading-none h-3">
                                {r ? (
                                  <span className={`text-[12px] font-black tabular-nums transition-colors ${
                                    r.score >= 7 ? 'text-blue-600' : 
                                    r.score >= 5 ? 'text-blue-500' : 
                                    'text-slate-300'
                                  }`}>
                                     {r.score}
                                  </span>
                                ) : (
                                  <span className="text-slate-200 text-[10px]">-</span>
                                )}
                              </div>
                            );
                          }) : (
                            <div className="text-center text-slate-200">-</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          {!isDeleteMode && (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleStartAnalysis([symbol]);
                               }}
                               className="mx-auto p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all flex items-center gap-1 justify-center"
                               title="重试诊断"
                             >
                               <RefreshCw className="w-3 h-3" />
                               <span className="text-[11px] font-bold leading-none tracking-tight whitespace-nowrap">重试</span>
                             </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Comparison Columns */}
                    <td className="px-0.5 py-4">
                      {result?.reports ? (
                        <div className="flex flex-col gap-0.5">
                          {[0, 1, 2].map(idx => {
                            const val = result.reports[idx]?.backtest?.avgDailyAmplitude;
                            return (
                              <div key={`avgAmp-${strategy.id}-${idx}`} className="flex items-center justify-center gap-1 leading-none h-3">
                                <span className="text-[10px] font-black tabular-nums text-slate-600">
                                  {val ? val.toFixed(2) + '%' : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="text-center text-slate-200">-</div>}
                    </td>

                    <td className="px-0.5 py-4">
                      {result?.reports ? (
                        <div className="flex flex-col gap-0.5">
                          {[0, 1, 2].map(idx => {
                            const val = result.reports[idx]?.backtest?.medianDailyAmplitude;
                            return (
                              <div key={`medAmp-${strategy.id}-${idx}`} className="flex items-center justify-center gap-1 leading-none h-3">
                                <span className="text-[10px] font-black tabular-nums text-slate-600">
                                  {val ? val.toFixed(2) + '%' : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="text-center text-slate-200">-</div>}
                    </td>

                    <td className="px-0.5 py-4">
                      {result?.reports ? (
                        <div className="flex flex-col gap-0.5">
                          {[0, 1, 2].map(idx => {
                            const val = result.reports[idx]?.backtest?.maxDrawdown;
                            return (
                              <div key={`maxDr-${strategy.id}-${idx}`} className="flex items-center justify-center gap-1 leading-none h-3">
                                <span className="text-[10px] font-black tabular-nums text-emerald-500">
                                  {val ? '-' + val.toFixed(1) + '%' : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="text-center text-slate-200">-</div>}
                    </td>

                    <td className="px-0.5 py-4">
                      {result?.reports ? (
                        <div className="flex flex-col gap-0.5">
                          {[0, 1, 2].map(idx => {
                            const val = result.reports[idx]?.details?.cumulativeReturn;
                            return (
                              <div key={`cumRet-${strategy.id}-${idx}`} className="flex items-center justify-center gap-1 leading-none h-3">
                                <span className={`text-[10px] font-black tabular-nums ${val > 0 ? 'text-red-500' : val < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                  {val !== undefined ? (val > 0 ? '+' : '') + val.toFixed(1) + '%' : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="text-center text-slate-200">-</div>}
                    </td>

                    <td className="px-0.5 py-4">
                      {result?.reports ? (
                        <div className="flex flex-col gap-0.5">
                          {[0, 1, 2].map(idx => {
                            const val = result.reports[idx]?.backtest?.recommendedGridSize;
                            return (
                              <div key={`recGrid-${strategy.id}-${idx}`} className="flex items-center justify-center gap-1 leading-none h-3">
                                <span className="text-[10px] font-black tabular-nums text-blue-600">
                                  {val ? val.toFixed(2) + '%' : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="text-center text-slate-200">-</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div 
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100 max-w-xs w-full text-center space-y-6"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                   <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">确认删除</h3>
                  <p className="text-xs font-medium text-slate-400">确定要从诊断清单中移除选中的 {selectedSymbols.length} 个标的吗？此操作不可撤销。</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-3 text-[10px] font-black text-slate-400 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
                    className="flex-1 py-3 bg-rose-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95"
                  >
                    立即删除
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderDetailHeader = () => (
    <header className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => setView(AppView.SUMMARY)}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-slate-900 border border-slate-200 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-bold text-slate-800 truncate select-none leading-tight">
            <a 
              href={getEastMoneyUrl(activeStrategy?.symbol || '')}
              onClick={(e) => handleStockClick(e, activeStrategy?.symbol || '')}
              className="hover:text-blue-600 transition-colors"
            >
              {activeStrategy?.name}
            </a>
          </h2>
          {activeStrategy?.symbol && (
            <div className="flex items-center gap-2 mt-0.5">
              <a 
                href={getEastMoneyUrl(activeStrategy.symbol)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleStockClick(e, activeStrategy.symbol!)}
                className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hover:text-blue-500 hover:underline transition-all"
              >
                {activeStrategy.symbol}
              </a>
              {activeStrategy.currentPrice && (
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  <span className="text-[10px] font-bold text-blue-600 tabular-nums">¥{activeStrategy.currentPrice}</span>
                  <span className="text-[9px] text-slate-400 tabular-nums">
                    {new Date(activeStrategy.lastPriceTime || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )}
              <button 
                onClick={() => getLivePrice(activeStrategy.symbol || '', activeStrategy.id)}
                disabled={isRefreshing}
                className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                title="刷新价格"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 shrink-0 ml-2">
        {[
          { v: AppView.REPORT, label: '报告', icon: FileText, title: '诊断报告' },
          { v: AppView.SETTING, label: '设置', icon: Settings2, title: '策略设置' },
          { v: AppView.GRID, label: '网格', icon: TableIcon, title: '预览网格' },
        ].map(item => (
          <button 
            key={item.v}
            onClick={() => setView(item.v)}
            title={item.title}
            className={`p-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              view === item.v 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );

  return (
    <div className="h-[100dvh] bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col antialiased">
      {renderNavDrawer()}
      <TrendInstructionModal isOpen={showTrendHelpModal} onClose={() => setShowTrendHelpModal(false)} />
      <AnimatePresence mode="wait">
        {view === AppView.HOME && (
          <motion.div key="home" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderHome()}
          </motion.div>
        )}
        {view === AppView.SUMMARY && (
          <motion.div key="summary" className="flex-1 flex flex-col overflow-hidden min-w-0 w-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderSummary()}
          </motion.div>
        )}
        {view === AppView.TREND && (
          <motion.div key="trend" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderTrend()}
          </motion.div>
        )}
        {view === AppView.DECISION_FLOW && decisionFlowSymbol && (
          <motion.div key="decision-flow" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {(() => {
              const indicator = trendIndicators.find(ti => ti.symbol === decisionFlowSymbol);
              if (!indicator) {
                return (
                  <div className="flex-1 flex items-center justify-center bg-slate-100">
                    <div className="text-center">
                      <p className="text-slate-500 mb-2">未找到指标数据</p>
                      <button
                        onClick={() => {
                          setView(AppView.TREND);
                          setDecisionFlowSymbol(null);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
                      >
                        返回列表
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <DecisionFlowPanel
                  symbol={decisionFlowSymbol}
                  indicator={indicator}
                  onBack={() => {
                    setView(AppView.TREND);
                    setDecisionFlowSymbol(null);
                  }}
                  onOpenDoc={() => setView(AppView.ARCHITECTURE_DOC)}
                />
              );
            })()}
          </motion.div>
        )}
        {view === AppView.ARCHITECTURE_DOC && (
          <motion.div key="architecture-doc" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ArchitectureDocPanel
              onBack={() => {
                if (decisionFlowSymbol) {
                  setView(AppView.DECISION_FLOW);
                } else {
                  setView(AppView.TREND);
                }
              }}
              onOpenGuide={() => setView(AppView.APPLICATION_GUIDE)}
            />
          </motion.div>
        )}
        {view === AppView.APPLICATION_GUIDE && (
          <motion.div key="application-guide" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ApplicationGuidePanel
              onBack={() => setView(AppView.ARCHITECTURE_DOC)}
            />
          </motion.div>
        )}
        {view === AppView.TREND_SETTINGS && (
          <motion.div key="trend-settings" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <SettingsPanel
              params={trendParams}
              onParamsChange={(newParams) => {
                setTrendParams(newParams);
                localStorage.setItem('grid_trend_params', JSON.stringify(newParams));
              }}
              onBack={() => setView(AppView.TREND)}
              onRefresh={() => {
                for (const sym of trendSymbols) {
                  handleTrendRefresh(sym);
                }
                setView(AppView.TREND);
              }}
            />
          </motion.div>
        )}
        {view === AppView.INDICATOR_DETAIL && (
          <motion.div key="indicator-detail" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderIndicatorDetail()}
          </motion.div>
        )}
        {(view === AppView.SETTING || view === AppView.GRID || view === AppView.REPORT) && (
          <motion.div 
            key="detail-container"
            className="flex-1 flex flex-col overflow-hidden relative touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 50 }}
          >
            {renderDetailHeader()}
            <div className="flex-1 overflow-y-auto bg-white">
              {activeStrategy && (
                <div className="pb-32 w-full">
                  {view === AppView.SETTING && (
                    <motion.div 
                      key="editor"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="space-y-2"
                    >
                      <div className="bg-white border-b border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-blue-500" />
                          <h3 className="font-bold text-slate-700 text-xs">策略核心参数</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <InputWrapper label="初始参考价 (¥)" sub={activeStrategy.currentPrice ? `当前市价: ${activeStrategy.currentPrice}` : "网格计算的基准点位"}>
                            <div className="relative">
                              <input 
                                type="number"
                                step="0.001"
                                placeholder={activeStrategy.currentPrice?.toString() || "请输入基准价"}
                                value={activeStrategy.initialPrice ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                  updateStrategy({...activeStrategy, initialPrice: val});
                                }}
                                className="input-field pr-20"
                              />
                              {activeStrategy.currentPrice && (
                                <button 
                                  onClick={() => updateStrategy({...activeStrategy, initialPrice: activeStrategy.currentPrice || 0})}
                                  className="absolute right-1 top-1 bottom-1 px-3 text-[10px] text-blue-600 font-bold hover:bg-blue-100/50 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  <span>点击同步</span>
                                </button>
                              )}
                            </div>
                          </InputWrapper>
                          <InputWrapper label="单个网格间距 (%)" sub="相邻买入点之间的价格跳动">
                            <input 
                              type="number"
                              step="0.1"
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

                      <div className="bg-white border-b border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-orange-500" />
                          <h3 className="font-bold text-slate-700 text-xs">动态仓位 & 费率</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <InputWrapper label="仓位递增类型" sub="越跌越买的加仓逻辑">
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
                              value={activeStrategy.stepValue ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                updateStrategy({...activeStrategy, stepValue: val});
                              }}
                              className="input-field"
                            />
                          </InputWrapper>
                          <InputWrapper label="成交佣金费率 (%)" sub="用于计算净利润（参考值）">
                            <input 
                              type="number"
                              step="0.001"
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

                      <div className="bg-white border-b border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-bold text-slate-700 text-xs">策略详细笔记</h3>
                          </div>
                        </div>
                        <div className="h-64 sm:h-80">
                          <RichEditor 
                            value={activeStrategy.notes || ''} 
                            onChange={(html) => updateStrategy({...activeStrategy, notes: html})}
                            placeholder="在此输入您的网格策略备忘录、交易记录或心得..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {view === AppView.GRID && (
                    <motion.div 
                      key="table"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white overflow-hidden"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[280px]">
                          <thead>
                            <tr className="bg-blue-600 border-b border-blue-700 text-white whitespace-nowrap">
                              <th className="px-1 py-2 text-[11px] font-bold text-center tracking-wider opacity-90">层</th>
                              <th className="px-1 py-2 text-[11px] font-bold tracking-wider opacity-90">价格</th>
                              <th className="px-1 py-2 text-[11px] font-bold tracking-wider opacity-90">金额</th>
                              <th className="px-1 py-2 text-[11px] font-bold tracking-wider text-blue-200">利润</th>
                              <th className="px-1 py-2 text-[11px] font-bold text-center tracking-wider opacity-90">状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {gridData.map((row, idx) => {
                              const isBelowMaxDrawdown = activeStrategy.backtest?.maxDrawdown !== undefined && 
                                                         row.level < 0 && 
                                                         row.percentFromInitial !== undefined && 
                                                         Math.abs(row.percentFromInitial) > activeStrategy.backtest.maxDrawdown;
                              
                              const nextRow = gridData[idx + 1];
                              const currentAbs = Math.abs(row.percentFromInitial || 0);
                              const nextAbs = nextRow ? Math.abs(nextRow.percentFromInitial || 0) : 1000;
                              
                              const matchingMarkers = drawdownMarkers.filter(m => 
                                m.percent >= currentAbs && m.percent < nextAbs
                              );

                              return (
                                <React.Fragment key={`${row.level}-${idx}`}>
                                  <tr 
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
                                  
                                  {matchingMarkers.map((m, mIdx) => (
                                    <tr key={`${m.label}-${row.level}-${mIdx}`} className="bg-white">
                                      <td colSpan={5} className="py-2.5 px-0 relative">
                                        <div className={`mx-2 border-t-2 border-dashed ${m.color.split(' ')[0]} opacity-60`}></div>
                                        <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full border text-[9px] font-black ${m.color} shadow-sm whitespace-nowrap z-10 flex items-center gap-1`}>
                                          <AlertTriangle className="w-2.5 h-2.5" />
                                          {m.label}: -{m.percent}%
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </React.Fragment>
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

                  {view === AppView.REPORT && (
                    <motion.div 
                      key="report"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="bg-white overflow-hidden"
                    >
                      <GridDiagnosisReport 
                        reports={analysisMap[activeStrategy.symbol!.toLowerCase()]?.reports || []}
                        symbol={activeStrategy.symbol!}
                        name={activeStrategy.name!}
                        isLoading={loadingMap[activeStrategy.symbol!.toLowerCase()]}
                        onApplySuggestion={(min, max, step) => {
                          updateStrategy({ ...activeStrategy, gridInterval: step });
                          setView(AppView.GRID);
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            
            {view === AppView.SETTING && activeStrategy && (
              <div className="shrink-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.05)]">
                <div className="max-w-6xl mx-auto">
                  <button 
                    onClick={() => {
                      // 如果用户没有填初始参考价，且有当前市价，则默认应用当前市价
                      if (!activeStrategy.initialPrice && activeStrategy.currentPrice) {
                        updateStrategy({
                          ...activeStrategy,
                          initialPrice: activeStrategy.currentPrice
                        });
                      }
                      setView(AppView.GRID);
                      if (activeStrategy.symbol) {
                        getLivePrice(activeStrategy.symbol, activeStrategy.id);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>生成交易网格方案</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="text-red-800 font-bold">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-red-900 line-clamp-1">{error}</p>
              <p className="text-[10px] text-red-500 mt-0.5">请检查证券代码或稍后重试</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
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
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.5, x: 5 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -right-5 flex items-center"
          >
            <Check className="w-3 h-3 text-green-500" />
          </motion.span>
        ) : (
          <motion.span 
            key="copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 transition-opacity" />
          </motion.span>
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
