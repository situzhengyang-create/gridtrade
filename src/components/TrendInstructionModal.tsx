import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Activity, CheckCircle2, Navigation, Target, ShieldAlert, BarChart2, Hash, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrendInstructionModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'indicators' | 'workflow'>('indicators');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="trend-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[2000]"
        />
      )}
      {isOpen && (
        <motion.div
          key="trend-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white md:rounded-3xl shadow-2xl z-[2001] flex flex-col overflow-hidden max-h-[90dvh]"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">趋势交易方法论</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Trend Trading System Framework</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex px-6 gap-6 text-sm font-bold border-b border-white">
                <button
                  onClick={() => setActiveTab('indicators')}
                  className={`pb-3 border-b-2 transition-all ${
                    activeTab === 'indicators' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  信号与指标定义
                </button>
                <button
                  onClick={() => setActiveTab('workflow')}
                  className={`pb-3 border-b-2 transition-all ${
                    activeTab === 'workflow' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  实战操作流程
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'indicators' ? (
                  <motion.div 
                    key="indicators"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* MA20 */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-black text-slate-800">1. 20日均线 (MA20) <span className="text-slate-400 font-medium text-sm ml-2">趋势定调器</span></h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">
                        代表最近20个交易日市场参与者的平均持仓成本。系统采用<strong className="text-slate-800">多日斜率法</strong>，计算20日均线近期的线性回归斜率来决定方向，有效过滤单日噪音。
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="font-bold text-slate-800 mb-1">方向判定 (看10日)</div>
                          <ul className="space-y-1.5 text-slate-600">
                            <li><span className="text-red-500 font-bold mr-1">看涨:</span> 斜率 &gt; +0.3%</li>
                            <li><span className="text-emerald-500 font-bold mr-1">看跌:</span> 斜率 &lt; -0.3%</li>
                            <li><span className="text-slate-500 font-bold mr-1">走平:</span> 绝对斜率 ≤ 0.3%</li>
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="font-bold text-slate-800 mb-1">强度判定 (长短期对比)</div>
                          <ul className="space-y-1.5 text-slate-600">
                            <li><span className="text-amber-500 font-bold mr-1">加速:</span> 短期相比长期涨幅扩大/跌幅加深</li>
                            <li><span className="text-indigo-400 font-bold mr-1">稳健:</span> 短期与长期保持同向且无巨大偏差</li>
                            <li><span className="text-slate-400 font-bold mr-1">减速:</span> 短期相比长期斜率放缓</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* ADX */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-black text-slate-800">2. ADX 平均趋向指数 <span className="text-slate-400 font-medium text-sm ml-2">趋势强度过滤器</span></h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">
                        量化趋势的强弱，剥离方向信息。决定当前环境是适合趋势交易还是震荡网格交易。
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                          <div className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                             ADX &gt; 25
                             <span className="text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">强趋势</span>
                          </div>
                          <p className="text-indigo-700/80">趋势明确，适合执行顺势交易。(配合 +DI/-DI 判断方向)</p>
                        </div>
                        <div className="bg-slate-100/50 p-3 rounded-xl border border-slate-200/50">
                          <div className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                             ADX &lt; 20
                             <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">震荡市</span>
                          </div>
                          <p className="text-slate-500">市场无序震荡，趋势策略极易被两面打脸。建议强制观望或网格交易。</p>
                        </div>
                      </div>
                    </div>

                    {/* Bollinger + MACD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Navigation className="w-5 h-5" />
                          </div>
                          <h4 className="text-base font-black text-slate-800">3. 布林带 (BB)</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 font-medium">中轨为20日均线，评估价格相对高低位置。</p>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5" />
                            <span><strong className="text-slate-800">突破上轨：</strong>潜在超买区，提防回落</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5" />
                            <span><strong className="text-slate-800">跌破下轨：</strong>潜在超卖区，关注支撑</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                            <span><strong className="text-slate-800">双重确认挤压：</strong>当前宽度为近期(120天)最低且处于历史20%分位，确定性极高</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                            <span><strong className="text-slate-800">经验收敛挤压：</strong>当前宽度逼近近期极窄位置(5%容差)，需考察持续性</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" />
                            <span><strong className="text-slate-800">分位挤压：</strong>当前波动率低于历史80%的时间，大级别防守到位</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <BarChart2 className="w-5 h-5" />
                          </div>
                          <h4 className="text-base font-black text-slate-800">4. MACD</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 font-medium">采用行业交叉标准，结合位置与动能的多维分析。</p>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                            <span><strong className="text-slate-800">金叉 (DIF上穿DEA)：</strong>多头启动信号，零轴上方信号更强。</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                            <span><strong className="text-slate-800">死叉 (DIF下穿DEA)：</strong>空头启动信号，零轴下方信号更强。</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                            <span><strong className="text-slate-800">动能分析：</strong>通过红绿柱的变化直观判断上涨/下跌的加速与减弱。</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                            <span><strong className="text-slate-800">背离现象：</strong>价格创新高而MACD未创新高(顶背离)预示动能衰竭；反之则为底背离。</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                            <span><strong className="text-slate-800">成交量确认：</strong>交叉信号伴随成交量放大（放量），能显著提高信号的置信度。</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <motion.div 
                    key="workflow"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="relative"
                  >
                    <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-slate-100 z-0 hidden md:block" />
                    
                    <div className="space-y-8 relative z-10">
                      {/* Step 1 */}
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="flex items-center gap-4 md:flex-col md:gap-2 shrink-0">
                          <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-4 border-white">
                            1
                          </div>
                          <div className="md:hidden font-black text-lg text-slate-800">环境判别</div>
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="hidden md:block text-lg font-black text-slate-800 mb-3">环境判别 <span className="text-slate-400 text-sm ml-2 font-medium">该不该做？</span></h4>
                          <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-slate-600 font-medium">观察价格是否运行在<strong>MA20均线之上</strong>，且均线呈斜率向上的看涨状态。</p>
                            </div>
                            <div className="flex gap-3 items-start">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-slate-600 font-medium">确认 <strong>ADX &gt; 25</strong>。如果是，打开趋势交易开关；若 ADX &lt; 20，强制观望或转用震荡策略。</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="flex items-center gap-4 md:flex-col md:gap-2 shrink-0">
                          <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-4 border-white">
                            2
                          </div>
                          <div className="md:hidden font-black text-lg text-slate-800">位置选择</div>
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="hidden md:block text-lg font-black text-slate-800 mb-3">位置选择 <span className="text-slate-400 text-sm ml-2 font-medium">在哪里做？</span></h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                               <h5 className="font-bold text-rose-800 mb-2 text-sm flex items-center gap-2">
                                 <X className="w-4 h-4" /> 放弃追高
                               </h5>
                               <p className="text-xs text-rose-700/80 leading-relaxed font-medium">绝不买入已大幅远离MA20或突破布林带上轨的标的。盈亏比极差。</p>
                            </div>
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                               <h5 className="font-bold text-emerald-800 mb-2 text-sm flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4" /> 等待回调
                               </h5>
                               <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">耐心等待价格向MA20（中轨）或布林带下轨回调并缩量企稳。</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="flex items-center gap-4 md:flex-col md:gap-2 shrink-0">
                          <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-4 border-white">
                            3
                          </div>
                          <div className="md:hidden font-black text-lg text-slate-800">时机抉择</div>
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="hidden md:block text-lg font-black text-slate-800 mb-3">时机抉择 <span className="text-slate-400 text-sm ml-2 font-medium">什么时候动？</span></h4>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                            当价格退守至优势区域（如中轴支撑线区域）时，观察 <strong>MACD</strong>。<br/>
                            理想做多信号：零轴上方即将或已经发生<strong>金叉</strong>，或者MACD多头动能<strong>开始持续加速</strong>。当价格支撑与MACD动能形成共振时，果断买入。
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="flex items-center gap-4 md:flex-col md:gap-2 shrink-0">
                          <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-4 border-white">
                            4
                          </div>
                          <div className="md:hidden font-black text-lg text-slate-800">风险管理</div>
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="hidden md:block text-lg font-black text-slate-800 mb-3">风险管理 <span className="text-slate-400 text-sm ml-2 font-medium">怎么退场？</span></h4>
                          <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800 mb-1">初始止损 (生命线)</h5>
                                <p className="text-xs text-slate-500 font-medium">入场时务必设在关键支撑下方（如近期低点或下轨）。<strong>有效跌破MA20是趋势逆转的初步警告。</strong></p>
                              </div>
                            </div>
                            <div className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800 mb-1">移动止盈</h5>
                                <p className="text-xs text-slate-500 font-medium">随着价格创出新高，跟随上提止损线保护利润避免倒亏。</p>
                              </div>
                            </div>
                            <div className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800 mb-1">主动逢高逢顶减仓</h5>
                                <p className="text-xs text-slate-500 font-medium">当价格冲击布林上轨无力，或MACD出现明显的顶部背离时，不要犹豫锁定部分利润。</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white shrink-0">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 text-sm"
                >
                  我已了解，开始交易
                </button>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}

