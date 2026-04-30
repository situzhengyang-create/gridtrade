import React, { useState } from 'react';
import { DiagnosisReport } from '../services/gridDiagnosticService';
import { getEastMoneyUrl, getEastMoneyAppScheme } from '../lib/stockUtils';

interface Props {
  reports: DiagnosisReport[];
  symbol: string;
  name: string;
  onApplySuggestion?: (min: number, max: number, step: number) => void;
}

const MetricCard = ({ item }: { item: any }) => {
  const [showDef, setShowDef] = useState(false);
  
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-blue-100 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-extrabold text-slate-900">{item.label}</span>
          <button 
            onClick={() => setShowDef(!showDef)} 
            className="text-slate-400 hover:text-blue-500 transition-colors"
            title="查看定义与算法"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {item.items ? (
            item.items.map((it: any, idx: number) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-200 text-xs px-0.5">/</span>}
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-400 font-medium tracking-normal font-sans">{it.label}</span>
                  <span className="text-sm font-black text-slate-900 tabular-nums tracking-tight">{it.value}</span>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="text-sm font-black text-slate-900 tabular-nums tracking-tight">{item.val}</div>
          )}
        </div>
      </div>
      
      {showDef && item.info && (
        <div className="bg-slate-50 border border-slate-100 text-[11px] text-slate-600 p-3 mb-3 rounded-lg leading-relaxed shadow-inner">
          {item.info.definition.map((line: string, idx: number) => (
            <p key={idx} className={idx === 0 ? "font-bold text-slate-700 mb-1" : ""}>{line}</p>
          ))}
        </div>
      )}
      
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-700 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100/50">
          {item.interp}
          {item.info && (
            <span className="block mt-1.5 pt-1.5 border-t border-blue-100/50 text-[10px] text-slate-600 font-medium leading-relaxed">
              {item.info.evaluation}
            </span>
          )}
        </div>
        
        {item.info && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="font-bold text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                观测标准
              </div>
              <ul className="space-y-1 text-[10px] text-slate-600">
                {item.info.standards.map((s: string, idx: number) => {
                  const match = s.match(/(.+?) \(\+(\d+)分\) ✓/);
                  if (match) {
                    const text = match[1];
                    const score = match[2];
                    return (
                      <li key={idx} className="flex gap-1">
                        <span className="opacity-40 shrink-0">•</span>
                        <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                          <span>{text}</span>
                          <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 px-1 py-0 rounded border border-emerald-100/60 shadow-sm text-[9px]">
                            +{score}分 ✓
                          </span>
                        </div>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={idx} className="flex gap-1">
                      <span className="opacity-40 shrink-0">•</span>
                      <span>
                        {s.includes(' ✓') ? (
                          <>
                            <span>{s.replace(' ✓', '')}</span>
                            <span className="text-emerald-500 font-bold ml-1">✓</span>
                          </>
                        ) : (
                          s
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="font-bold text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                投资意义
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
                {item.info.significance}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GridDiagnosisReport: React.FC<Props> = ({ reports, symbol, name, onApplySuggestion }) => {
  const [activeTimeframe, setActiveTimeframe] = useState(-1); // -1: 对比, 0: 1Y, 1: 2Y, 2: 3Y
  
  const handleStockClick = (e: React.MouseEvent, sym: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const appScheme = getEastMoneyAppScheme(sym);
    const webUrl = getEastMoneyUrl(sym);
    
    if (isMobile) {
      window.location.href = appScheme;
      setTimeout(() => {
        if (!document.hidden) {
          window.open(webUrl, '_blank');
        }
      }, 2500);
    } else {
      window.open(webUrl, '_blank');
    }
  };

  const report = activeTimeframe === -1 ? null : reports[activeTimeframe];
  const [showScoreLogic, setShowScoreLogic] = useState(false);
  const timeframes = [
    { label: '最近1年', days: 250 },
    { label: '最近2年', days: 500 },
    { label: '最近3年', days: 750 }
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case '非常适合': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '适合': return 'text-blue-700 bg-blue-50 border-blue-200';
      case '勉强适合': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="w-full relative flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-5 py-3.5 border-b border-slate-100 flex items-center shrink-0 overflow-x-auto hide-scrollbar">
          <div className="flex gap-1.5 w-full">
            <button 
              onClick={() => setActiveTimeframe(-1)}
              className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${activeTimeframe === -1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              对比模式
            </button>
            {timeframes.map((tf, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTimeframe(idx)}
                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${activeTimeframe === idx ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
      </div>

      <div className="p-4 sm:p-5 pb-12 space-y-6 flex-1">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
              <svg className="w-12 h-12 mb-4 text-slate-200 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" className="opacity-75"></circle>
              </svg>
              <p className="text-sm font-medium">正在生成诊断报告...</p>
              <p className="text-xs mt-2 opacity-60">通常需要几秒钟，请稍候</p>
            </div>
          ) : activeTimeframe === -1 ? (
            <div className="space-y-6">
              <div className="overflow-x-hidden">
                <table className="w-full text-center table-fixed">
                    <thead>
                      <tr className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                        <th className="pb-2 text-left w-[28%]">评估维度</th>
                        {timeframes.map((tf, idx) => (
                          <th key={idx} className="pb-2 px-0.5">{tf.label.replace('最近', '')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { 
                          label: '趋势强度评估 (3分)', 
                          key: 'trend', 
                          metrics: [
                            { label: '累计收益率', key: 'cumulativeReturn', unit: '%' },
                            { label: '最大连涨天数', key: 'maxConsecutiveUp', unit: 'd' },
                            { label: '最大连跌天数', key: 'maxConsecutiveDown', unit: 'd' }
                          ] 
                        },
                        { 
                          label: '波动率水平评估 (3分)', 
                          key: 'volatility', 
                          metrics: [
                            { label: '年化波动率', key: 'annualizedVolatility', unit: '%' },
                            { label: '日内均振幅', key: 'averageIntradayVolatility', unit: '%' }
                          ] 
                        },
                        { 
                          label: '震荡特征评估 (2分)', 
                          key: 'oscillation', 
                          metrics: [
                            { label: '涨跌交替频率', key: 'trendChangeFreq', unit: '%' }
                          ] 
                        },
                        { 
                          label: '价格分布评估 (2分)', 
                          key: 'priceDistribution', 
                          metrics: [
                            { label: '布林通道占比', key: 'bollingerRatio', unit: '%' }
                          ] 
                        }
                      ].map((dim) => (
                        <tr key={dim.key}>
                          <td className="py-3 text-xs font-bold text-slate-600 text-left align-top leading-tight">
                            <div>{dim.label.split(' ')[0]}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{dim.label.split(' ')[1]}</div>
                          </td>
                          {reports.map((r, idx) => (
                            <td key={idx} className="py-3 px-0.5 align-top">
                              <div className="flex flex-col items-center">
                                <span className="inline-block w-full py-1 bg-slate-50 rounded-md text-base font-black text-slate-800">
                                  {r.detailedScores[dim.key as keyof typeof r.detailedScores]}
                                </span>
                                <div className="mt-2 space-y-1.5">
                                  {dim.metrics.map((m, mIdx) => (
                                    <div key={mIdx} className="text-[10px] text-slate-500 font-medium leading-tight flex flex-col items-center text-center">
                                      <span className="opacity-80 mb-0.5 break-words max-w-[60px]">{m.label}</span>
                                      <span className="tabular-nums font-bold text-slate-700">{r.details[m.key as keyof typeof r.details]}{m.unit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-blue-50/40">
                        <td className="py-3 text-xs font-black text-blue-700 text-left">总计 (/10)</td>
                        {reports.map((r, idx) => (
                          <td key={idx} className="py-3 px-0.5">
                            <span className="text-lg font-black text-blue-700">{r.score}</span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 text-xs font-bold text-slate-600 text-left">适合程度</td>
                        {reports.map((r, idx) => (
                          <td key={idx} className="py-3 px-0.5">
                            <span className={`text-xs font-black ${getRatingColor(r.rating).split(' ')[0]}`}>
                              {r.rating}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 text-[11px] font-bold text-slate-500 text-left leading-tight align-top">核心建议</td>
                        {reports.map((r, idx) => (
                          <td key={idx} className="py-3 px-0.5 text-[11px] text-slate-600 leading-tight align-top">
                            {r.suggestion}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
          ) : report && (
            <>
              {/* Top Section: Score */}
              <div className="flex flex-col gap-3">
                {/* Score Box */}
                <div className="bg-white border border-blue-100 rounded-xl pl-5 pr-4 py-3 flex items-center justify-between relative overflow-hidden shadow-[0_4px_20px_-8px_rgba(59,130,246,0.15)] transition-all">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400"></div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-4xl font-black tracking-tighter text-slate-800 leading-none shrink-0">{report.score}</span>
                      <span className="text-sm font-bold text-slate-300">/10</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getRatingColor(report.rating)} whitespace-nowrap flex items-center gap-1.5 shadow-sm`}>
                      <span>{report.rating}</span>
                      <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                      <span className="opacity-90">{report.suggestion}</span>
                    </div>
                    <button onClick={() => setShowScoreLogic(!showScoreLogic)} className={`p-1.5 rounded-full transition-colors ${showScoreLogic ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} title="查看评判逻辑">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
                
                {showScoreLogic && (
                  <div className="bg-blue-50/40 border border-blue-100/60 p-4 rounded-xl mt-0 space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] text-blue-800/70 font-bold uppercase mb-2 flex items-center gap-1.5 border-b border-blue-100/50 pb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            评估维度与权重（总分10分）
                          </div>
                          <ul className="text-xs text-slate-600 space-y-1.5 grid grid-cols-1 sm:grid-cols-2">
                            <li className="flex items-center gap-1.5">
                              <span className="text-blue-500 font-bold">1.</span> 
                              <span>趋势强度 (3分) : <span className="text-slate-500">避免单边市</span></span>
                              <span className="ml-auto text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm text-[10px]">{report.detailedScores.trend}分</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-blue-500 font-bold">2.</span> 
                              <span>波动率水平 (3分) : <span className="text-slate-500">需要有适当波动</span></span>
                              <span className="ml-auto text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm text-[10px]">{report.detailedScores.volatility}分</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-blue-500 font-bold">3.</span> 
                              <span>震荡特征 (2分) : <span className="text-slate-500">涨跌交替频繁</span></span>
                              <span className="ml-auto text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm text-[10px]">{report.detailedScores.oscillation}分</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-blue-500 font-bold">4.</span> 
                              <span>价格分布 (2分) : <span className="text-slate-500">在通道内运行</span></span>
                              <span className="ml-auto text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm text-[10px]">{report.detailedScores.priceDistribution}分</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <div className="text-[10px] text-blue-800/70 font-bold uppercase mb-2 flex items-center gap-1.5 border-b border-blue-100/50 pb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                            详细评分规则
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-3 bg-white p-3 rounded-lg border border-slate-100/80 shadow-sm font-mono">
                            <div>
                              <div className="text-blue-600 font-bold mb-1">A. 趋势评估（3分）</div>
                              <ul className="space-y-0.5 opacity-80 pl-2 text-[10px]">
                                <li>• 累计收益率在±10%内：1分</li>
                                <li>• 最大连续涨跌≤3天：2分</li>
                                <li>• 最大连续涨跌≤5天：1分</li>
                                <li>• 否则：0分</li>
                              </ul>
                            </div>
                            <div>
                              <div className="text-blue-600 font-bold mb-1">B. 波动率评估（3分）</div>
                              <ul className="space-y-0.5 opacity-80 pl-2 text-[10px]">
                                <li>• 20% ≤ 年化波动率 ≤ 40%：3分</li>
                                <li>• 15% ≤ 波动 &lt; 20% 或 40% &lt; 波动 ≤ 50%：2分</li>
                                <li>• 波动率 &gt; 50%：1分</li>
                                <li>• 波动率 &lt; 15%：0分</li>
                              </ul>
                            </div>
                            <div>
                              <div className="text-blue-600 font-bold mb-1">C. 震荡特征（2分）</div>
                              <ul className="space-y-0.5 opacity-80 pl-2 text-[10px]">
                                <li>• 涨跌交替频率≥50%：2分</li>
                                <li>• 涨跌交替频率≥40%：1分</li>
                                <li>• 否则：0分</li>
                              </ul>
                            </div>
                            <div>
                              <div className="text-blue-600 font-bold mb-1">D. 价格分布（2分）</div>
                              <ul className="space-y-0.5 opacity-80 pl-2 text-[10px]">
                                <li>• 布林带内比例≥90%：2分</li>
                                <li>• 布林带内比例≥80%：1分</li>
                                <li>• 否则：0分</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                )}
              </div>
  
              {/* Historical Data Review */}
              <div className="bg-[#fffdf7] border border-[#ffecb3] rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(245,124,0,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-10 bg-[#fff5d6] border-b border-[#ffecb3] flex items-center justify-between px-4">
                  <div className="flex items-center gap-1.5 text-[#cc5e00] font-bold text-[11px] tracking-widest uppercase">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                    历史数据回顾 ({timeframes[activeTimeframe].label})
                  </div>
                  <div className="text-[10px] text-[#cc5e00]/70 font-medium tracking-wider">更新于 {new Date(report.summary.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                
                <div className="pt-10 pb-2 grid grid-cols-3 gap-x-2 gap-y-5">
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-[#b3774d] mb-1 leading-tight">单日平均振幅</div>
                    <div className="flex items-baseline gap-0.5 mb-1">
                      <span className="text-xl sm:text-2xl font-black text-[#f57c00]">{report.backtest.avgDailyAmplitude}</span>
                      <span className="text-xs font-bold text-[#f57c00]">%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-[#b3774d] mb-1 leading-tight">中位数振幅</div>
                    <div className="flex items-baseline gap-0.5 mb-1">
                      <span className="text-xl sm:text-2xl font-black text-[#f57c00]">{report.backtest.medianDailyAmplitude}</span>
                      <span className="text-xs font-bold text-[#f57c00]">%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-[#b3774d] mb-1 leading-tight text-right">历史最大回撤</div>
                    <div className="flex items-baseline gap-0.5 mb-1 justify-end">
                      <span className="text-xl sm:text-2xl font-black text-[#e53935]">{report.backtest.maxDrawdown === 0 ? '-' : `-${report.backtest.maxDrawdown}`}</span>
                      {report.backtest.maxDrawdown !== 0 && <span className="text-xs font-bold text-[#e53935]">%</span>}
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-[10px] sm:text-xs text-[#b3774d]/70 -mt-2">
                     建议网格大小为 <span className="font-bold">{report.backtest.recommendedGridSize}%</span>
                  </div>
                  
                  <div className="col-span-3 bg-white/50 p-3 rounded-lg border border-[#ffecb3]/50">
                    <div className="text-[10px] sm:text-xs font-bold text-[#b3774d] mb-2 uppercase">价格运行区间</div>
                    <div className="flex items-center justify-between mb-2">
                       <div className="text-center">
                         <div className="text-[9px] text-slate-400 font-bold">历史最低</div>
                         <div className="text-sm font-black text-[#f57c00]">{report.backtest.historicalMin}</div>
                       </div>
                       <div className="h-0.5 flex-1 mx-4 bg-gradient-to-r from-[#ffd54f] to-[#ff8f00] rounded-full relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-[#f57c00] rounded-full"></div>
                       </div>
                       <div className="text-center">
                         <div className="text-[9px] text-slate-400 font-bold">历史最高</div>
                         <div className="text-sm font-black text-[#f57c00]">{report.backtest.historicalMax}</div>
                       </div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#b3774d]/80 text-center font-bold bg-[#fff5d6] py-1.5 rounded">
                      安全建议覆盖: [{report.backtest.safeGridMin}, {report.backtest.safeGridMax}]
                    </div>
                  </div>
                </div>
                
                {onApplySuggestion && (
                  <button 
                    onClick={() => {
                      onApplySuggestion(report.backtest.safeGridMin, report.backtest.safeGridMax, report.backtest.recommendedGridSize);
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-[#ff9800] to-[#f57c00] hover:from-[#f57c00] hover:to-[#e65100] text-white font-bold py-3 rounded-lg text-sm sm:text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                    一键预置网格参数
                  </button>
                )}
              </div>

              {/* Risk & Advantage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4.5 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-extrabold text-emerald-800 mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 优势指标
                      </h4>
                      <ul className="text-[11px] text-emerald-900 space-y-2">
                        {report.advantages.map((a,idx) => <li key={idx} className="flex gap-1.5 leading-relaxed"><span className="opacity-40 text-[10px] mt-0.5">•</span> <span>{a}</span></li>)}
                      </ul>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 p-4.5 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-extrabold text-rose-800 mb-3 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 风险预警
                      </h4>
                      <ul className="text-[11px] text-rose-900 space-y-2">
                        {report.risks.length > 0 
                          ? report.risks.map((r,idx) => <li key={idx} className="flex gap-1.5 leading-relaxed"><span className="opacity-40 text-[10px] mt-0.5">•</span> <span>{r}</span></li>) 
                          : <li className="text-slate-400 italic">暂无明显重大风险指标</li>}
                      </ul>
                  </div>
              </div>

              <section>
                <h3 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest px-1">核心性能指标详析</h3>
                <div className="space-y-4">
                  {[
                    { 
                      label: 'A. 趋势评估', 
                      score: report.detailedScores.trend,
                      interpretation: report.interpretations['收益率'],
                      info: report.metricsInfo?.['收益率'],
                      details: [
                        {label: '累计收益', value: `${report.details.cumulativeReturn}%`},
                        {label: '最大连涨/跌', value: `${report.details.maxConsecutiveUp}/${report.details.maxConsecutiveDown}天`}
                      ]
                    },
                    { 
                      label: 'B. 波动率评估', 
                      score: report.detailedScores.volatility,
                      interpretation: report.interpretations['波动率'],
                      info: report.metricsInfo?.['波动率'],
                      details: [
                        {label: '年化波动率', value: `${report.details.annualizedVolatility}%`},
                        {label: '日内均值', value: `${report.details.averageIntradayVolatility}%`}
                      ]
                    },
                    { 
                      label: 'C. 震荡特征', 
                      score: report.detailedScores.oscillation,
                      interpretation: report.interpretations['震荡特征'],
                      info: report.metricsInfo?.['震荡特征'],
                      details: [
                        {label: '交替频率', value: `${report.details.trendChangeFreq}%`}
                      ]
                    },
                    { 
                      label: 'D. 价格分布', 
                      score: report.detailedScores.priceDistribution,
                      interpretation: report.interpretations['价格分布'],
                      info: report.metricsInfo?.['价格分布'],
                      details: [
                        {label: '布林通道内占比', value: `${report.details.bollingerRatio}%`}
                      ]
                    },
                  ].map(i => (
                    <div key={i.label} className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                      {/* Title & Score */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-extrabold text-slate-900">{i.label}</h4>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">得分: {i.score}</span>
                      </div>
                      
                      {/* Statistics */}
                      <div className="flex items-center gap-4 mb-3 flex-wrap bg-slate-50 p-2 rounded-lg">
                        {i.details.map((it, idx) => (
                          <div key={idx} className="flex items-baseline gap-1">
                            <span className="text-[10px] text-slate-500 font-medium">{it.label}</span>
                            <span className="text-sm font-black text-slate-900 tabular-nums">{it.value}</span>
                          </div>
                        ))}
                      </div>
    
                      {/* Interpretation & Details */}
                      <div className="text-xs font-bold text-slate-700 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100/50 mb-3">
                        {i.interpretation}
                        {i.info && (
                          <span className="block mt-1.5 pt-1.5 border-t border-blue-100/50 text-[10px] text-slate-600 font-medium leading-relaxed">
                            {i.info.evaluation}
                          </span>
                        )}
                      </div>
    
                      {/* Standard & Significance */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="font-bold text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                            观测标准
                          </div>
                          <ul className="space-y-1 text-[10px] text-slate-600">
                            {i.info?.standards.map((s: string, idx: number) => {
                              const match = s.match(/(.+?) \(\+(\d+)分\) ✓/);
                              if (match) {
                                return (
                                  <li key={idx} className="flex gap-1">
                                    <span className="opacity-40 shrink-0">•</span>
                                    <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                                      <span>{match[1]}</span>
                                      <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 px-1 py-0 rounded border border-emerald-100/60 shadow-sm text-[9px]">
                                        +{match[2]}分 ✓
                                      </span>
                                    </div>
                                  </li>
                                );
                              }
                              return (
                                <li key={idx} className="flex gap-1">
                                  <span className="opacity-40 shrink-0">•</span>
                                  <span>{s.includes(' ✓') ? (
                                    <>
                                      <span>{s.replace(' ✓', '')}</span>
                                      <span className="text-emerald-500 font-bold ml-1">✓</span>
                                    </>
                                  ) : s}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="font-bold text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                            投资意义
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
                            {i.info?.significance}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
    </div>
  );
};
