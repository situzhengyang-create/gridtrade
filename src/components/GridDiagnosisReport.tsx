import React, { useState } from 'react';
import { DiagnosisReport } from '../services/gridDiagnosticService';

interface Props {
  report: DiagnosisReport;
  symbol: string;
  onClose: () => void;
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
                {item.info.standards.map((s: string, idx: number) => (
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
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="font-bold text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
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

export const GridDiagnosisReport: React.FC<Props> = ({ report, symbol, onClose, onApplySuggestion }) => {
  const [showScoreLogic, setShowScoreLogic] = useState(false);
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case '非常适合': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '适合': return 'text-blue-700 bg-blue-50 border-blue-200';
      case '勉强适合': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm sm:overflow-y-auto">
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-w-2xl md:max-w-3xl rounded-none sm:rounded-3xl shadow-2xl overflow-y-auto sm:max-h-[85vh] sm:mx-auto relative flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-5 py-3.5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">网格交易诊断报告</h2>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5">
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded leading-none">{symbol}</span>
              <span className="text-[10px] text-slate-500 font-medium leading-none">基于 {report.summary.totalDays} 天日K数据 · 当前参考价 {report.summary.currentPrice.toFixed(3)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          
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
                        <li><span className="text-blue-500 font-bold">1.</span> 波动率水平 (3分) : <span className="text-slate-500">需要有适当波动</span></li>
                        <li><span className="text-blue-500 font-bold">2.</span> 趋势强度 (3分) : <span className="text-slate-500">避免单边市</span></li>
                        <li><span className="text-blue-500 font-bold">3.</span> 震荡特征 (2分) : <span className="text-slate-500">涨跌交替频繁</span></li>
                        <li><span className="text-blue-500 font-bold">4.</span> 价格分布 (2分) : <span className="text-slate-500">在通道内运行</span></li>
                        <li className="sm:col-span-2 mt-1"><span className="text-purple-500 font-bold">加分项.</span> 日内波动 (加分1分) : <span className="text-slate-500">提供操作空间</span></li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="text-[10px] text-blue-800/70 font-bold uppercase mb-2 flex items-center gap-1.5 border-b border-blue-100/50 pb-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                        详细评分规则
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-3 bg-white p-3 rounded-lg border border-slate-100/80 shadow-sm font-mono">
                        <div>
                          <div className="text-blue-600 font-bold mb-1">A. 波动率评估（3分）</div>
                          <ul className="space-y-0.5 opacity-80 pl-2">
                            <li>• 20% ≤ 年化波动率 ≤ 40%：3分</li>
                            <li>• 15% ≤ 波动 &lt; 20% 或 40% &lt; 波动 ≤ 50%：2分</li>
                            <li>• 波动率 &gt; 50%：1分</li>
                            <li>• 波动率 &lt; 15%：0分</li>
                          </ul>
                        </div>
                        <div>
                          <div className="text-blue-600 font-bold mb-1">B. 趋势评估（3分）</div>
                          <ul className="space-y-0.5 opacity-80 pl-2">
                            <li>• 累计收益率在±10%内：1分</li>
                            <li>• 最大连续涨跌≤3天：2分</li>
                            <li>• 最大连续涨跌≤5天：1分</li>
                            <li>• 否则：0分</li>
                          </ul>
                        </div>
                        <div>
                          <div className="text-blue-600 font-bold mb-1">C. 震荡特征（2分）</div>
                          <ul className="space-y-0.5 opacity-80 pl-2">
                            <li>• 涨跌交替频率≥50%：2分</li>
                            <li>• 涨跌交替频率≥40%：1分</li>
                            <li>• 否则：0分</li>
                          </ul>
                        </div>
                        <div>
                          <div className="text-blue-600 font-bold mb-1">D. 价格分布（2分）</div>
                          <ul className="space-y-0.5 opacity-80 pl-2">
                            <li>• 布林带内比例≥90%：2分</li>
                            <li>• 布林带内比例≥80%：1分</li>
                            <li>• 否则：0分</li>
                          </ul>
                        </div>
                        <div>
                          <div className="text-purple-600 font-bold mb-1">E. 日内波动（加分1分）</div>
                          <ul className="space-y-0.5 opacity-80 pl-2">
                            <li>• 0.5% ≤ 日内波动 ≤ 2.0%：1分</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-blue-100/50">
                    <div className="text-[10px] text-blue-800/70 font-bold uppercase mb-2 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      评级对应关系
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100/80 shadow-sm">
                        <span className="text-emerald-600 font-bold text-xs">8-10分：非常适合</span>
                        <span className="text-[10px] text-slate-500 font-medium">可正常开展网格交易</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100/80 shadow-sm">
                        <span className="text-blue-600 font-bold text-xs">6-7分：适合</span>
                        <span className="text-[10px] text-slate-500 font-medium">建议开展网格交易</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100/80 shadow-sm">
                        <span className="text-amber-600 font-bold text-xs">4-5分：勉强适合</span>
                        <span className="text-[10px] text-slate-500 font-medium">建议小资金测试</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100/80 shadow-sm">
                        <span className="text-rose-600 font-bold text-xs">0-3分：不适合</span>
                        <span className="text-[10px] text-slate-500 font-medium">不建议使用网格策略</span>
                      </div>
                    </div>
                  </div>
              </div>
            )}
          </div>

          {/* Detailed Performance Indicators */}
          <section>
            <h3 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest px-1">核心性能指标详析</h3>
            <div className="space-y-2">
                {[
                    { label: '收益率', items: [{label: '累计', value: `${report.details.cumulativeReturn}%`}, {label: '年化', value: `${report.details.annualizedReturn}%`}], interp: report.interpretations['收益率'], info: report.metricsInfo?.['收益率'] },
                    { label: '波动率', items: [{label: '年化', value: `${report.details.annualizedVolatility}%`}, {label: '日内均值', value: `${report.details.averageIntradayVolatility}%`}], interp: report.interpretations['波动率'], info: report.metricsInfo?.['波动率'] },
                    { label: '震荡特征', items: [{label: '交替', value: `${report.details.trendChangeFreq}%`}, {label: '连涨', value: `${report.details.maxConsecutiveUp}天`}, {label: '连跌', value: `${report.details.maxConsecutiveDown}天`}], interp: report.interpretations['震荡特征'], info: report.metricsInfo?.['震荡特征'] },
                    { label: '价格分布', items: [{label: '布林通道内占比', value: `${report.details.bollingerRatio}%`}], interp: report.interpretations['价格分布'], info: report.metricsInfo?.['价格分布'] },
                ].map(i => (
                    <MetricCard key={i.label} item={i} />
                ))}
            </div>
          </section>

          {/* Risk & Advantage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              <div className="bg-emerald-50/50 border border-emerald-100 p-4.5 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold text-emerald-800 mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 优势指标
                  </h4>
                  <ul className="text-[11px] text-emerald-900 space-y-2">
                    {report.advantages.map((a,i) => <li key={i} className="flex gap-1.5 leading-relaxed"><span className="opacity-40 text-[10px] mt-0.5">•</span> <span>{a}</span></li>)}
                  </ul>
              </div>
              <div className="bg-rose-50/50 border border-rose-100 p-4.5 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold text-rose-800 mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 风险预警
                  </h4>
                  <ul className="text-[11px] text-rose-900 space-y-2">
                    {report.risks.length > 0 
                      ? report.risks.map((r,i) => <li key={i} className="flex gap-1.5 leading-relaxed"><span className="opacity-40 text-[10px] mt-0.5">•</span> <span>{r}</span></li>) 
                      : <li className="text-slate-400 italic">暂无明显重大风险指标</li>}
                  </ul>
              </div>
          </div>

          {/* Historical Data Review */}
          <div className="bg-[#fffdf7] border border-[#ffecb3] rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(245,124,0,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-10 bg-[#fff5d6] border-b border-[#ffecb3] flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5 text-[#cc5e00] font-bold text-[11px] tracking-widest uppercase">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                历史数据回顾
              </div>
              <div className="text-[10px] text-[#cc5e00]/70 font-medium tracking-wider">更于 {new Date(report.summary.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            
            <div className="pt-10 pb-1 grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <div className="text-[10px] font-bold text-[#b3774d] mb-1">单日平均 / 中位数振幅</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-black text-[#f57c00]">{report.backtest.avgDailyAmplitude}</span><span className="text-sm font-bold text-[#f57c00]">%/</span>
                  <span className="text-sm font-bold text-[#f57c00]/70">{report.backtest.medianDailyAmplitude}%</span>
                </div>
                <div className="text-[10px] text-[#b3774d]/70">建议网格大小为 {report.backtest.recommendedGridSize}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#b3774d] mb-1">最大历史回撤 (1Y/3Y)</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-black text-[#e53935]">{report.backtest.maxDrawdown1Y === 0 ? '-' : `-${report.backtest.maxDrawdown1Y}`}</span><span className="text-sm font-bold text-[#e53935]">%/</span>
                  <span className="text-sm font-bold text-[#e53935]/70">{report.backtest.maxDrawdown3Y === 0 ? '-' : `-${report.backtest.maxDrawdown3Y}`}%</span>
                </div>
                <div className="text-[10px] text-[#b3774d]/70">近1年 / 3年最高点至最低点跌幅</div>
              </div>
              
              <div className="col-span-2">
                <div className="text-[10px] font-bold text-[#b3774d] mb-1">区间最低 / 最高</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold text-[#f57c00]">高: <span className="text-lg font-black">{report.backtest.historicalMax}</span></span>
                  <span className="text-sm font-bold text-[#f57c00]">低: <span className="text-lg font-black">{report.backtest.historicalMin}</span></span>
                </div>
                <div className="text-[10px] text-[#b3774d]/70">安全网格区间建议覆盖 [{report.backtest.safeGridMin}, {report.backtest.safeGridMax}]</div>
              </div>
            </div>
            
            {onApplySuggestion && (
              <button 
                onClick={() => {
                  onApplySuggestion(report.backtest.safeGridMin, report.backtest.safeGridMax, report.backtest.recommendedGridSize);
                  onClose();
                }}
                className="w-full mt-4 bg-gradient-to-r from-[#ff9800] to-[#f57c00] hover:from-[#f57c00] hover:to-[#e65100] text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition-all active:scale-[0.98]"
              >
                一键应用网格建议
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
