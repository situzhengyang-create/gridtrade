import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, ChevronRight, BookOpen, Layers, Target, Zap, Shield, ArrowRight, Circle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ArchitectureDocPanel({ onBack, onOpenGuide }: { onBack: () => void; onOpenGuide: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['section1', 'section2', 'section3', 'section4', 'section5']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">系统架构文档</h1>
            <p className="text-xs text-slate-500">多指标协同趋势交易监控系统完整架构</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          >
            <span>本交易系统的优劣势说明</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <BookOpen className="w-4 h-4 text-indigo-600" />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-2">系统核心设计理念</h2>
            <p className="text-sm text-slate-600">
              本系统采用四层漏斗式过滤架构，各层级严格遵循独立指标的量化输出，通过降维共振提升交易确定性。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-700">层次化决策金字塔</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <th className="text-left font-bold py-2 px-3">层级</th>
                    <th className="text-left font-bold py-2 px-3">解决核心问题</th>
                    <th className="text-left font-bold py-2 px-3">核心指标组合</th>
                    <th className="text-left font-bold py-2 px-3">核心判定逻辑</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t border-indigo-100">
                    <td className="py-2 px-3 font-bold text-blue-600">第一层</td>
                    <td className="py-2 px-3">环境诊断（能否交易）</td>
                    <td className="py-2 px-3">MA20 + ADX</td>
                    <td className="py-2 px-3">线性回归斜率定方向 + 四维框架定强度</td>
                  </tr>
                  <tr className="border-t border-indigo-100">
                    <td className="py-2 px-3 font-bold text-purple-600">第二层</td>
                    <td className="py-2 px-3">位置扫描（何处交易）</td>
                    <td className="py-2 px-3">布林带 (BOLL)</td>
                    <td className="py-2 px-3">双重标准与持续时间定挤压级别</td>
                  </tr>
                  <tr className="border-t border-indigo-100">
                    <td className="py-2 px-3 font-bold text-amber-600">第三层</td>
                    <td className="py-2 px-3">时机捕捉（何时交易）</td>
                    <td className="py-2 px-3">MACD</td>
                    <td className="py-2 px-3">五维动量评分定精确买卖点</td>
                  </tr>
                  <tr className="border-t border-indigo-100">
                    <td className="py-2 px-3 font-bold text-emerald-600">第四层</td>
                    <td className="py-2 px-3">风控管理（如何交易）</td>
                    <td className="py-2 px-3">ATR + 价格</td>
                    <td className="py-2 px-3">动态结构与指标防线定盈亏比</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => toggleSection('section1')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Layers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-blue-700">阶段一：市场环境诊断</h3>
                  <p className="text-xs text-blue-600">决定是否开仓</p>
                </div>
              </div>
              {expandedSections.has('section1') ? (
                <ChevronDown className="w-5 h-5 text-blue-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-blue-500" />
              )}
            </div>
            {expandedSections.has('section1') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-blue-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">趋势底色判定（二维状态矩阵）</h4>
                      <div className="text-xs text-slate-600 space-y-2">
                        <p><span className="font-bold">主方向判定（MA20 10日斜率）：</span></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>斜率 &gt; 0.003：看涨 (Bullish)</li>
                          <li>斜率 &lt; -0.003：看跌 (Bearish)</li>
                          <li>-0.003 ≤ 斜率 ≤ 0.003：走平 (Flat)</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">趋势强度（ADX区间）</h4>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>• 0 - 20：无趋势（震荡）</p>
                        <p>• 20 - 25：趋势萌芽（预警）</p>
                        <p>• 25 - 50：中等趋势（<span className="font-bold text-green-600">顺势最佳交易区</span>）</p>
                        <p>• 50 - 75：强趋势（防范过热）</p>
                        <p>• &gt; 75：极强趋势（衰竭高危区）</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">可交易性综合评分（满分100分）</h4>
                      <div className="text-xs text-slate-600 space-y-2">
                        <p><span className="font-bold">一、ADX维度（70分）：</span></p>
                        <div className="ml-4 space-y-2 bg-blue-50 rounded-lg p-3">
                          <div>
                            <p className="font-bold text-blue-700">1. 强度判定（21分，占ADX维度30%）</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>ADX ≥ 50：21分（极强趋势）</li>
                              <li>25 ≤ ADX &lt; 50：18分（中等趋势，最佳交易区）</li>
                              <li>20 ≤ ADX &lt; 25：12分（趋势萌芽）</li>
                              <li>ADX &lt; 20：3分（无趋势/震荡）</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-bold text-blue-700">2. DI间距方向（17.5分，占ADX维度25%）</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>多头占优：+DI &gt; -DI 且差值 &gt; 10 → 17.5分</li>
                              <li>多头略占优：+DI &gt; -DI 且差值 ≤ 10 → 14分</li>
                              <li>空头略占优：-DI &gt; +DI 且差值 ≤ 10 → 7分</li>
                              <li>空头占优：-DI &gt; +DI 且差值 &gt; 10 → 0分</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-bold text-blue-700">3. ADX斜率动能（17.5分，占ADX维度25%）</p>
                            <p className="text-xs text-blue-600 mt-1">💡 注："5日斜率"是对最近5日ADX值做线性回归计算得出的斜率。</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>ADX 5日斜率 &gt; 0.5：17.5分（趋势加速）</li>
                              <li>ADX 5日斜率 &gt; 0：14分（趋势稳步）</li>
                              <li>-0.5 ≤ ADX 5日斜率 ≤ 0：8分（趋势平）</li>
                              <li>ADX 5日斜率 &lt; -0.5：0分（趋势衰减）</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-bold text-blue-700">4. 背离预警（14分，占ADX维度20%）</p>
                            <p className="text-xs text-blue-600 mt-1">📊 <strong>什么是背离？</strong> 当价格创出新高/新低，但对应的指标（如ADX或MACD）没有同步创出新高/新低，表明趋势可能即将反转。</p>
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                              <strong>顶背离（看空信号）：</strong><br/>
                              价格创出新高位，但ADX/MACD指标未能同步创新高 → 上涨动能减弱，可能见顶。<br/>
                              <strong>底背离（看多信号）：</strong><br/>
                              价格创出新低位，但ADX/MACD指标未能同步创新低 → 下跌动能减弱，可能见底。
                            </div>
                            <ul className="list-disc list-inside mt-2 space-y-2">
                              <li><span className="font-bold">无背离：14分</span>
                                <ul className="list-circle list-inside ml-2 text-xs text-blue-600">
                                  <li>价格与指标同步创新高/新低</li>
                                  <li>趋势方向与指标方向一致</li>
                                  <li>动能健康，无反转迹象</li>
                                </ul>
                              </li>
                              <li><span className="font-bold">轻微背离：7分</span>
                                <ul className="list-circle list-inside ml-2 text-xs text-blue-600">
                                  <li>价格创出新极值，但指标略低于前极值</li>
                                  <li>差值在10%以内</li>
                                  <li>动能略有减弱，需警惕</li>
                                </ul>
                              </li>
                              <li><span className="font-bold">明显背离：0分</span>
                                <ul className="list-circle list-inside ml-2 text-xs text-blue-600">
                                  <li>价格创出新极值，指标明显低于前极值</li>
                                  <li>差值超过10%</li>
                                  <li>动能严重衰竭，反转概率高</li>
                                </ul>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <p className="mt-2"><span className="font-bold">二、MA20维度（30分）：</span></p>
                        <div className="ml-4 space-y-2 bg-green-50 rounded-lg p-3">
                          <p className="font-bold text-green-700">计算公式：Diff = 短期斜率(5日) - 长期斜率(20日)</p>
                          <p className="text-xs text-green-600">💡 这个公式用来判断MA20均线的加速度状态。通过比较短期（5日）和长期（20日）的斜率差异，来判断当前趋势是在加速、稳健还是减速。</p>
                          <ul className="list-disc list-inside mt-2 space-y-2">
                            <li><span className="font-bold">加速状态：Diff &gt; 0.001 → 30分（趋势爆发期）</span>
                              <p className="text-xs text-green-600 ml-4">短期上涨速度超过长期上涨速度，说明上涨越来越快，趋势处于爆发阶段。</p>
                            </li>
                            <li><span className="font-bold">稳健状态：|Diff| ≤ 0.001 → 20分（趋势健康期）</span>
                              <p className="text-xs text-green-600 ml-4">短期和长期上涨速度相当，说明趋势稳定健康，没有明显的加速或减速迹象。</p>
                            </li>
                            <li><span className="font-bold">减速状态：Diff &lt; -0.001 → 10分（趋势衰退期）</span>
                              <p className="text-xs text-green-600 ml-4">短期上涨速度慢于长期上涨速度，说明上涨动力在减弱，趋势可能即将进入调整。</p>
                            </li>
                            <li><span className="font-bold">横向震荡：MA20斜率接近0 → 0分</span>
                              <p className="text-xs text-green-600 ml-4">MA20均线走平，没有明显的上升或下降趋势，市场处于震荡整理状态。</p>
                            </li>
                          </ul>
                        </div>
                        <p className="mt-2"><span className="font-bold">三、最终评级：</span></p>
                        <div className="ml-4 space-y-1">
                          <p>• ≥80分（A级）：极佳条件，适合开仓</p>
                          <p>• 60-79分（B级）：良好条件，可以开仓</p>
                          <p>• 40-59分（C级）：谨慎轻仓</p>
                          <p>• &lt;40分（D级）：系统禁止趋势交易</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => toggleSection('section2')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-purple-700">阶段二：交易机会识别</h3>
                  <p className="text-xs text-purple-600">寻找具体标的与发车位</p>
                </div>
              </div>
              {expandedSections.has('section2') ? (
                <ChevronDown className="w-5 h-5 text-purple-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-purple-500" />
              )}
            </div>
            {expandedSections.has('section2') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-purple-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">高关注机会扫描（必要条件）</h4>
                      <div className="text-xs text-slate-600 space-y-3">
                        <div>
                          <p><span className="font-bold">• 市场环境可交易性评分 ≥ 60分：</span></p>
                          <p className="ml-4">这是阶段一计算得出的综合评分（满分100分），代表当前市场环境的可交易程度。评分越高，说明趋势越明确，交易成功概率越高。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 出现挤压信号：初级挤压、中级挤压、高强度挤压</span></p>
                          <p className="ml-4">布林带挤压是指价格波动收窄，通常预示着即将出现大的价格波动。挤压级别越高，后续爆发的概率和力度越大。</p>
                          <ul className="list-disc list-inside ml-6 space-y-1">
                            <li><span className="font-bold">初级挤压：</span>满足单一法则（经验法则或统计法则）</li>
                            <li><span className="font-bold">中级挤压：</span>双重法则同时满足，但持续时间不足</li>
                            <li><span className="font-bold">高强度挤压：</span>双重法则同时满足，且连续维持≥5个交易日</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">布林带挤压双重标准</h4>
                      <div className="text-xs text-slate-600 space-y-3">
                        <div>
                          <p><span className="font-bold">• 经验法则：当前宽度 &lt; 120日最低极值 × 1.05</span></p>
                          <p className="ml-4">布林带宽度 = 上轨价格 - 下轨价格。将当前宽度与过去120个交易日的最小宽度进行比较，如果当前宽度小于历史最小宽度的1.05倍，说明当前处于极度压缩状态。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 统计法则：百分位 &lt; 20%</span></p>
                          <p className="ml-4">计算当前布林带宽度在过去120个交易日中的百分位排名。如果百分位低于20%，说明当前宽度处于历史上较窄的20%区间内，属于压缩状态。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 高强度挤压：双重法则同时满足，且连续维持 ≥ 5个交易日</span></p>
                          <p className="ml-4">只有当经验法则和统计法则同时满足，并且这种压缩状态持续至少5个交易日时，才认定为高强度挤压。持续时间越长，积蓄的能量越大，后续爆发力度通常越强。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => toggleSection('section3')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-700">阶段三：精确入场时机</h3>
                  <p className="text-xs text-amber-600">MACD多维时机捕捉</p>
                </div>
              </div>
              {expandedSections.has('section3') ? (
                <ChevronDown className="w-5 h-5 text-amber-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-amber-500" />
              )}
            </div>
            {expandedSections.has('section3') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-amber-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">MACD五维入场信号评分（满分1.0）</h4>
                      <div className="text-xs text-blue-600 mb-3 p-2 bg-blue-50 rounded">
                        <p><span className="font-bold">📌 术语说明：</span></p>
                        <p><span className="font-bold">DIF线（差离值）：</span>12日指数移动平均线 - 26日指数移动平均线，是MACD的核心指标。</p>
                        <p><span className="font-bold">DEA线（信号线）：</span>DIF线的9日指数移动平均线，用于平滑DIF线并产生交叉信号。</p>
                        <p><span className="font-bold">柱状图：</span>DIF - DEA，直观展示两条线的差值和动量变化。</p>
                      </div>
                      <div className="text-xs text-slate-600 space-y-4">
                        <div>
                          <p><span className="font-bold">• 交叉信号(30%)：金叉(+0.3)/死叉(-0.3)</span></p>
                          <div className="ml-4 p-2 bg-amber-50 rounded">
                            <p className="font-bold text-amber-700">判定逻辑：</p>
                            <p><span className="font-bold">金叉：</span>当DIF线（快线）从下方穿越DEA线（慢线）时触发。条件：昨日DIF &lt;= 昨日DEA 且 今日DIF &gt; 今日DEA。表示上涨动量启动，得+0.3分。</p>
                            <p><span className="font-bold">死叉：</span>当DIF线从上方穿越DEA线时触发。条件：昨日DIF &gt;= 昨日DEA 且 今日DIF &lt; 今日DEA。表示下跌动量启动，得-0.3分。</p>
                          </div>
                        </div>
                        <div>
                          <p><span className="font-bold">• 位置分析(20%)：零轴上方(+0.2)/零轴下方(-0.2)</span></p>
                          <div className="ml-4 p-2 bg-amber-50 rounded">
                            <p className="font-bold text-amber-700">判定逻辑：</p>
                            <p><span className="font-bold">零轴上方：</span>DIF &gt; 0 且 DEA &gt; 0，处于多头区域。金叉信号在此区域更强，得+0.2分。</p>
                            <p><span className="font-bold">零轴下方：</span>DIF &lt; 0 且 DEA &lt; 0，处于空头区域。死叉信号在此区域更强，得-0.2分。</p>
                          </div>
                        </div>
                        <div>
                          <p><span className="font-bold">• 背离检测(25%)：底背离(+0.25)/顶背离(-0.25)</span></p>
                          <div className="ml-4 p-2 bg-amber-50 rounded">
                            <p className="font-bold text-amber-700">判定逻辑：</p>
                            <p><span className="font-bold">底背离：</span>价格创最近30个交易日新低，但DIF线（或柱状图谷值）未创新低。表示下跌动能衰竭，可能见底回升，得+0.25分。</p>
                            <p><span className="font-bold">顶背离：</span>价格创最近30个交易日新高，但DIF线（或柱状图峰值）未创新高。表示上涨动能衰竭，可能见顶回落，得-0.25分。</p>
                          </div>
                        </div>
                        <div>
                          <p><span className="font-bold">• 动量分析(15%)：柱状图加速(+0.15)/减速(-0.15)</span></p>
                          <div className="ml-4 p-2 bg-amber-50 rounded">
                            <p className="font-bold text-amber-700">判定逻辑：</p>
                            <p><span className="font-bold">加速：</span>今日柱状图绝对值 &gt; 昨日柱状图绝对值，且符号相同。表示当前趋势动量在增强，得+0.15分。</p>
                            <p><span className="font-bold">减速：</span>今日柱状图绝对值 &lt; 昨日柱状图绝对值，且符号相同。表示当前趋势动量在减弱，得-0.15分。</p>
                            <p className="text-xs text-amber-600 mt-1">柱状图 = DIF - DEA</p>
                          </div>
                        </div>
                        <div>
                          <p><span className="font-bold">• 量能确认(10%)：成交量显著放大(+0.10)</span></p>
                          <div className="ml-4 p-2 bg-amber-50 rounded">
                            <p className="font-bold text-amber-700">判定逻辑：</p>
                            <p><span className="font-bold">显著放量：</span>当日成交量较5日均量增加≥30%。金叉时放量上涨确认上涨动能，死叉时放量下跌确认下跌动能，得+0.1分。</p>
                            <p><span className="font-bold">缩量/持平：</span>当日成交量较5日均量增加&lt;30%或减少，信号可靠性降低，得0分。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">入场级别与仓位建议</h4>
                      <div className="text-xs text-slate-600 space-y-2">
                        <div>
                          <p><span className="font-bold">• A级入场(≥0.7)：满额标准仓位</span></p>
                          <p className="ml-4">所有维度信号一致，入场条件极佳，可按标准仓位全仓进场。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• B级入场(0.3~0.7)：70%-80%标准仓位</span></p>
                          <p className="ml-4">大部分信号支持入场，但存在一定不确定性，建议适当减仓。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• C级入场(-0.3~0.3)：30%-50%轻仓</span></p>
                          <p className="ml-4">信号模糊或矛盾，风险较高，仅适合小仓位试错。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 禁止入场(&lt;-0.3)：空仓观望</span></p>
                          <p className="ml-4">信号明显不支持入场，市场条件恶劣，应保持空仓等待机会。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={() => toggleSection('section4')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-emerald-700">阶段四：风险管理体系</h3>
                  <p className="text-xs text-emerald-600">多指标协同风控</p>
                </div>
              </div>
              {expandedSections.has('section4') ? (
                <ChevronDown className="w-5 h-5 text-emerald-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            {expandedSections.has('section4') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-emerald-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">动态防御止损设置（取最严格值）</h4>
                      <div className="text-xs text-slate-600 space-y-3">
                        <div>
                          <p><span className="font-bold">• 结构防线：前高/前低点位</span></p>
                          <p className="ml-4">以前期重要支撑位或压力位作为止损点。如果股价跌破前期低点（做多时）或突破前期高点（做空时），说明原有结构被破坏，应止损离场。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 波动防线：跌破布林带下轨（做多）/突破布林带上轨（做空）</span></p>
                          <p className="ml-4">布林带是衡量价格波动范围的指标。当股价跌破下轨时（做多），说明下跌力度超出正常波动范围，风险加大；突破上轨时（做空）同理。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 趋势防线：MA20 10日主趋势斜率发生方向性反转</span></p>
                          <p className="ml-4">当MA20均线的10日斜率由正变负（做多）或由负变正（做空），说明主趋势方向发生改变，应及时止损。</p>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2">💡 系统会同时监控以上三条防线，只要触发任意一条，就会在报告中发出止损预警提醒（取最严格的条件）。</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">左侧预警与止盈机制</h4>
                      <div className="text-xs text-slate-600 space-y-3">
                        <div>
                          <p><span className="font-bold">• ADX &gt; 75：情绪极端，持仓减半</span></p>
                          <p className="ml-4">ADX是衡量趋势强度的指标，数值超过75表示趋势极强，但也意味着可能进入超买/超卖极端状态，建议减半持仓锁定部分利润。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• DI &gt; 50：超买卖，谨慎操作</span></p>
                          <p className="ml-4">DI（方向指标）超过50表示当前方向的力量非常强，但也可能预示反转风险，应谨慎操作，不宜追高/杀跌。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• MA20斜率差 &lt; -0.001：动能减速，收紧止损</span></p>
                          <p className="ml-4">当MA20的短期斜率减去长期斜率为负值且小于-0.001时，说明上涨/下跌动能正在减速，应将止损位向当前价格靠近，保护已有利润。</p>
                        </div>
                        <div>
                          <p><span className="font-bold">• 30日顶背离：趋势终结，建议清仓</span></p>
                          <p className="ml-4">在最近30个交易日内出现顶背离（价格新高但指标未新高），表明上涨动能衰竭，趋势可能即将反转，建议清仓离场。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mb-6">
            <div
              className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => toggleSection('section5')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-200">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-700">全局固定参数集</h3>
                  <p className="text-xs text-slate-500">所有参数严格遵循需求文档设定</p>
                </div>
              </div>
              {expandedSections.has('section5') ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </div>
            {expandedSections.has('section5') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">MA20参数</h4>
                      <div className="text-xs text-slate-600">
                        主趋势窗口10日，短期5日，长期20日。主趋势斜率判定阈值0.003，加速/减速差异阈值0.001。
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">ADX参数</h4>
                      <div className="text-xs text-slate-600">
                        计算周期14，5日斜率判定动能变化，30日检测背离，DI极端值预警线40/强烈预警线50，中等趋势最佳交易区25-50。
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">布林带参数</h4>
                      <div className="text-xs text-slate-600">
                        计算周期20，标准差2倍，历史极值参照窗口120个交易日。经验法则容错系数1.05，统计低位分位20%，最小持续时间5日。
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">MACD参数</h4>
                      <div className="text-xs text-slate-600">
                        计算周期12/26/9，动量变化判定阈值5%(0.05)，背离检测窗口30日，结合5日均量确认信号有效性。
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 mb-3">📊 完整决策流程图</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full">
                  <span className="text-xs font-bold text-indigo-600">输入</span>
                </div>
                <div className="flex-1 h-0.5 bg-indigo-200"></div>
                <div className="px-3 py-1.5 bg-indigo-500 text-white text-xs rounded-lg font-medium">
                  量价数据 OHLCV
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full">
                  <span className="text-xs font-bold text-indigo-600">计算</span>
                </div>
                <div className="flex-1 h-0.5 bg-indigo-200"></div>
                <div className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs rounded-lg">
                  MA20 + ADX + BOLL + MACD
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold">1</span>
                  <span className="font-bold text-blue-700 text-sm">第一层：趋势环境评估</span>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-600">MA20 10日斜率 &gt; 0.003？</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-600">ADX 在 25-50 区间？</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-blue-600">综合评分 ≥ 60分 → 进入下一层</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-blue-600">评分 &lt; 60分 → 放弃开仓</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-bold">2</span>
                  <span className="font-bold text-purple-700 text-sm">第二层：空间位置评估</span>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-600">布林带宽度 &lt; 120日最低×1.05？</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-600">宽度百分位 &lt; 20%？</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-600">双重挤压持续 ≥ 5日？</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-purple-600">满足 → 进入下一层</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-purple-600">不满足或有背离 → 加入自选观察</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full text-xs font-bold">3</span>
                  <span className="font-bold text-amber-700 text-sm">第三层：动量时机评估</span>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-600">计算MACD五维得分</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-amber-600">得分 ≥ 0.7 → A级信号（满仓）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-amber-600">0.3~0.7 → B级信号（70-80%仓位）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-600">-0.3~0.3 → C级信号（30-50%仓位）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-amber-600">得分 &lt; -0.3 → 禁止入场</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white rounded-full text-xs font-bold">4</span>
                  <span className="font-bold text-emerald-700 text-sm">第四层：风险管理评估</span>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-600">设置止损：结构防线/波动防线/趋势防线</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-emerald-600">ADX &gt; 75 或 DI &gt; 50 → 持仓减半</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-emerald-600">MA20斜率减速或背离 → 收紧止损</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-emerald-600">无预警 → 按信号等级执行标准仓位</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-slate-200"></div>
                <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-lg font-bold">
                  输出：交易信号报告
                </div>
                <div className="flex-1 h-0.5 bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
