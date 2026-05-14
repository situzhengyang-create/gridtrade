import React from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { ComprehensiveIndicatorReport } from '../types';

interface IndicatorReportPanelProps {
  report: ComprehensiveIndicatorReport;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

const formatNumber = (num: number, decimals: number = 4) => {
  if (num === 0) return '0';
  return num.toFixed(decimals);
};

const formatLargeNumber = (num: number) => {
  if (Math.abs(num) >= 1e8) return (num / 1e8).toFixed(2) + '亿';
  if (Math.abs(num) >= 1e4) return (num / 1e4).toFixed(2) + '万';
  return num.toFixed(2);
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="bg-slate-50 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <span>📖</span>
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default function IndicatorReportPanel({ report, onBack, onPrev, onNext, hasPrev, hasNext, currentIndex, totalCount }: IndicatorReportPanelProps) {
  const { trend, oscillator, volume } = report;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="px-4 py-3 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-900">{report.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-slate-500">{report.symbol}</p>
            <span className="text-[10px] text-slate-400">|</span>
            <span className="text-[10px] text-slate-400">
              {currentIndex !== undefined && totalCount !== undefined 
                ? `${currentIndex + 1}/${totalCount}` 
                : `数据量: ${report.dataCount} 日`
              }
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-black text-slate-900">¥{report.latestPrice.toFixed(2)}</span>
        </div>
      </header>

      {(onPrev || onNext) && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              hasPrev 
                ? 'text-indigo-600 hover:bg-indigo-100' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-bold">上一个</span>
          </button>
          <span className="text-[10px] text-slate-400 font-medium">
            最新日期: {report.latestDate} | 计算时间: {report.calculatedAt}
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              hasNext 
                ? 'text-indigo-600 hover:bg-indigo-100' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <span className="text-xs font-bold">下一个</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-4">一、报告概览</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">最新收盘价</span>
                <div className="text-xl font-black text-slate-900 mt-1">¥{report.latestPrice.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">数据条数</span>
                <div className="text-xl font-black text-slate-900 mt-1">{report.dataCount} 日</div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">最新日期</span>
                <div className="text-lg font-black text-slate-900 mt-1">{report.latestDate}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">计算时间</span>
                <div className="text-lg font-black text-slate-900 mt-1 text-sm">{report.calculatedAt}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 mb-6">二、趋势类指标分析</h2>
            
            {trend.macd && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">1. MACD（指数平滑异同移动平均线）</h3>
                <p className="text-xs text-slate-500 mb-3">Moving Average Convergence Divergence | 参数: (12, 26, 9)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">DIF</span>
                      <div className={`text-xl font-black mt-1 ${trend.macd.dif > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(trend.macd.dif)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">DEA</span>
                      <div className={`text-xl font-black mt-1 ${trend.macd.dea > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(trend.macd.dea)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">柱状图</span>
                      <div className={`text-xl font-black mt-1 ${trend.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(trend.macd.histogram)}
                      </div>
                    </div>
                  </div>
                </div>
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>通过短期与长期均线的离差值，捕捉股价趋势的转变、强度以及潜在的买卖信号。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(12, 26, 9)，即短期EMA周期12，长期EMA周期26，信号线（DEA）周期9。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">a. 计算快速EMA与慢速EMA：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ 快速线（EMA12）：EMA12 = 前一日EMA12 × 11/13 + 今日收盘价 × 2/13</div>
                            <div>▫ 慢速线（EMA26）：EMA26 = 前一日EMA26 × 25/27 + 今日收盘价 × 2/27</div>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">b. 计算离差值（DIF）：</span>
                          <span>DIF = EMA12 - EMA26</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">c. 计算信号线（DEA）：</span>
                          <span>对DIF进行9日指数平滑移动平均。DEA = 前一日DEA × 8/10 + 今日DIF × 2/10</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">d. 计算MACD柱状图（Histogram）：</span>
                          <span>MACD = (DIF - DEA) × 2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {trend.macd.dif > trend.macd.dea 
                        ? (trend.macd.dif > 0 ? '多头市场，金叉确认，建议持有或加仓。' : '空头市场，金叉反弹，谨慎对待。')
                        : (trend.macd.dif > 0 ? '多头市场，死叉回调，减仓观望。' : '空头市场，死叉确认，建议离场。')
                      }
                      {trend.macd.histogram > 0 ? '红柱放大表明上涨动能增强，' : '绿柱放大表明下跌动能增强，'}
                      DIF {'>'} 0 表示多头强势，DIF {'<'} 0 表示空头强势。
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>紧盯分时或日线级别的价格与MACD的顶背离（价格新高，MACD红柱未新高）或底背离，以及DIFF快线在零轴附近的反复穿越（金叉/死叉）作为短线高抛低吸的核心依据。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif > trend.macd.dea 
                        ? '当前DIF(' + formatNumber(trend.macd.dif) + ')在零轴上方且上穿DEA(' + formatNumber(trend.macd.dea) + ')，形成金叉，短线可积极做多。'
                        : trend.macd.dif < 0 && trend.macd.dea < 0 && trend.macd.dif < trend.macd.dea
                          ? '当前DIF在零轴下方且下穿DEA，形成死叉，短线应回避。'
                          : trend.macd.histogram > 0 && trend.macd.histogram > 0.01
                            ? '当前MACD红柱持续放大，上涨动能增强，短线可持有。'
                            : '当前MACD处于震荡状态，短线宜观望或高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>观察MACD柱状体（能量柱）的长度变化。红柱持续放大代表多头动能强劲；红柱开始缩短（顶背离预警），即使价格仍在上涨，也提示风险。关注"空中加油"形态：股价拉升后回调，MACD在零轴上方形成二次金叉，视为洗盘结束，开启第二波波段行情。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0
                        ? 'MACD双线均在零轴上方，中期多头格局确立。' + (trend.macd.histogram > 0 ? '能量柱持续放大，多头动能充足，可继续持有。' : '能量柱萎缩，需警惕回调风险。')
                        : trend.macd.dif < 0 && trend.macd.dea < 0
                          ? 'MACD双线均在零轴下方，中期空头格局。建议保持轻仓或空仓观望，等待有效金叉信号。'
                          : 'MACD指标处于零轴附近，方向不明朗，建议等待明确的突破信号再行动。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>要求日线、周线级别的MACD均在零轴上方运行（多头市场）。只要DIFF线和DEA线不死叉，就长期持有，忽略中间的微小波动。只有当DIFF线从下向上放量突破DEA线，且两者均在零轴之上时，才视为长线建仓的确认信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif > trend.macd.dea
                        ? '当前MACD处于多头排列且双线均在零轴上方，符合长线持仓条件。DIF(' + formatNumber(trend.macd.dif) + ')持续在DEA(' + formatNumber(trend.macd.dea) + ')之上运行，可坚定持有。'
                        : trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif < trend.macd.dea
                          ? 'MACD双线仍在零轴上方但出现死叉，建议减仓观望，等待重新金叉信号。'
                          : '当前MACD状态不符合长线建仓条件，建议继续观察，等待明确的多头信号。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.dmi && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">2. DMI（动向指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Directional Movement Index | 参数: (14, 6)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">ADX</span>
                      <div className={`text-lg font-black mt-1 ${trend.dmi.adx > 50 ? 'text-red-600' : trend.dmi.adx > 25 ? 'text-green-600' : 'text-slate-600'}`}>
                        {formatNumber(trend.dmi.adx, 2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">+DI</span>
                      <div className="text-lg font-black mt-1 text-green-600">{formatNumber(trend.dmi.plus_di, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">-DI</span>
                      <div className="text-lg font-black mt-1 text-red-600">{formatNumber(trend.dmi.minus_di, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">DX</span>
                      <div className="text-lg font-black mt-1 text-slate-900">{formatNumber(trend.dmi.dx, 2)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {trend.dmi.plus_di > trend.dmi.minus_di ? '多头力量占优' : '空头力量占优'}。
                      ADX 当前值为 {formatNumber(trend.dmi.adx, 1)}，{trend.dmi.adx > 50 ? '趋势极强，' : trend.dmi.adx > 25 ? '趋势明显，' : '趋势较弱，'}
                      当 ADX {'>'} 25 时可顺势交易，ADX {'<'} 20 时市场处于盘整状态。
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注ADX极值反转——当ADX（白线）数值低于20且极度走平时，预示市场处于无趋势的震荡期，此时应停止趋势交易，转而进行高抛低吸。同时关注+DI（PDI）上穿-DI（MDI）形成金叉，且ADX随后抬头，作为短线进场的触发条件。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx < 20
                        ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')低于20，市场处于无趋势震荡期，短线宜高抛低吸，不宜追涨杀跌。'
                        : trend.dmi.plus_di > trend.dmi.minus_di && trend.dmi.adx > 20
                          ? '+DI(' + formatNumber(trend.dmi.plus_di, 1) + ')上穿-DI(' + formatNumber(trend.dmi.minus_di, 1) + ')，形成金叉，短线可积极做多。'
                          : trend.dmi.minus_di > trend.dmi.plus_di && trend.dmi.adx > 20
                            ? '-DI上穿+DI，形成死叉，短线应卖出回避。'
                            : 'DMI指标尚无明确信号，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段要求ADX大于25，表明趋势已经形成。若ADX从高位回落至50以下，提示波段行情可能进入尾声。在上涨波段中，-DI（绿线）往往在价格回踩时提供支撑；若-DI拐头向上且下穿+DI，波段结束。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx > 25
                        ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')大于25，中期趋势明确。' + (trend.dmi.plus_di > trend.dmi.minus_di ? '+DI在-DI之上，多头趋势确立，可持仓。' : '-DI在+DI之上，空头趋势确立，应减仓。')
                        : 'ADX低于25，中期趋势不明朗，建议等待趋势明确后再进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者只在ADX持续大于25的市场环境中操作。若ADX突破40后开始掉头向下，意味着长达数月的单边趋势可能面临终结，需考虑战略性减仓。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx > 25 && trend.dmi.adx < 40
                        ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')在25-40区间，长期趋势健康。只要+DI持续在-DI之上，可坚定持有。'
                        : trend.dmi.adx > 40
                          ? 'ADX超过40，趋势强度达到极值，需密切关注是否出现拐头向下迹象，警惕趋势终结风险。'
                          : 'ADX低于25，市场缺乏明确趋势，不适合长线建仓。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.boll && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">3. BOLL（布林带）</h3>
                <p className="text-xs text-slate-500 mb-3">Bollinger Bands | 参数: (20, 2)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <span className="text-xs font-bold text-red-600">上轨</span>
                      <div className="text-lg font-black mt-1 text-red-600">{formatNumber(trend.boll.upper_band, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">中轨</span>
                      <div className="text-lg font-black mt-1 text-slate-900">{formatNumber(trend.boll.middle_band, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-green-600">下轨</span>
                      <div className="text-lg font-black mt-1 text-green-600">{formatNumber(trend.boll.lower_band, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">带宽%</span>
                      <div className={`text-lg font-black mt-1 ${trend.boll.width < 10 ? 'text-orange-600' : 'text-slate-600'}`}>
                        {formatNumber(trend.boll.width, 2)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      当前价格 ¥{report.latestPrice.toFixed(2)}，
                      {report.latestPrice > trend.boll.upper_band 
                        ? '已突破上轨 ¥' + formatNumber(trend.boll.upper_band, 2) + '，注意回落风险，不宜追高。'
                        : report.latestPrice < trend.boll.lower_band
                          ? '已跌破下轨 ¥' + formatNumber(trend.boll.lower_band, 2) + '，短期超卖，关注反弹机会。'
                          : report.latestPrice > trend.boll.middle_band
                            ? '位于中轨上方，偏强走势。'
                            : '位于中轨下方，偏弱走势。'
                      }
                      布林带宽 {formatNumber(trend.boll.width, 1)}%，{trend.boll.width < 10 ? '处于窄幅盘整，即将选择方向。' : '波动正常。'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>利用布林带的"回归"特性。价格触及上轨（压力位）且张口不继续扩大时，短线卖出；触及下轨（支撑位）且收出下影线时，短线买入。当布林带上下轨极度收缩（收口），预示变盘在即，短线交易员会停止开新仓，等待方向选择。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.boll.width < 10
                        ? '布林带宽仅' + formatNumber(trend.boll.width, 1) + '%，处于窄幅收口状态，变盘在即。短线应停止开新仓，等待明确方向选择后再操作。'
                        : report.latestPrice > trend.boll.upper_band
                          ? '价格突破上轨 ¥' + formatNumber(trend.boll.upper_band, 2) + '，短线超买，不宜追高，准备止盈。'
                          : report.latestPrice < trend.boll.lower_band
                            ? '价格跌破下轨 ¥' + formatNumber(trend.boll.lower_band, 2) + '，短线超卖，关注反弹机会。'
                            : '价格在布林带内运行，短线可沿中轨方向操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期趋势以布林带中轨为核心防线。只要收盘价不有效跌破中轨，波段持仓不变；一旦放量跌破中轨，波段结束。当布林带呈现明显的向上或向下张大嘴形态（喇叭口张开），且价格沿上轨或下轨运行，是中期主升浪或主跌浪的信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.boll.middle_band && trend.boll.width > 10
                        ? '价格在中轨 ¥' + formatNumber(trend.boll.middle_band, 2) + '之上，布林带开口正常，中期多头格局保持。'
                        : report.latestPrice < trend.boll.middle_band
                          ? '价格跌破中轨，中期趋势转弱，建议减仓。'
                          : '布林带收口，中期方向不明，等待突破。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者通常切换到周线或月线级别观察BOLL。若月线级别价格站稳上轨，代表超级牛市；若跌破下轨，代表历史性大底或大熊市确立。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.boll.middle_band
                        ? '价格在中轨之上，长期趋势偏多。需结合周线级别确认，若周线也站稳中轨上方，长线可建仓。'
                        : report.latestPrice < trend.boll.middle_band
                          ? '价格在中轨之下，长期趋势偏弱。等待周线级别出现明确的底部形态再考虑长线布局。'
                          : '价格贴近中轨，长期方向不明，继续观察。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.expma && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">4. EXPMA（指数平滑移动平均线）</h3>
                <p className="text-xs text-slate-500 mb-3">Exponential Moving Average | 参数: (12, 50)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">EXP12（短期）</span>
                      <div className="text-xl font-black mt-1 text-slate-900">{formatNumber(trend.expma.exp1, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">EXP50（长期）</span>
                      <div className="text-xl font-black mt-1 text-slate-900">{formatNumber(trend.expma.exp2, 2)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {trend.expma.exp1 > trend.expma.exp2 
                        ? '短期EXP12（' + formatNumber(trend.expma.exp1, 2) + '）在长期EXP50（' + formatNumber(trend.expma.exp2, 2) + '）上方，形成多头排列，金叉状态，表明上升趋势明确。'
                        : '短期EXP12（' + formatNumber(trend.expma.exp1, 2) + '）在长期EXP50（' + formatNumber(trend.expma.exp2, 2) + '）下方，形成空头排列，死叉状态，表明下降趋势明确。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注EXP1与EXP2在分时图上的频繁缠绕——当两条均线反复交叉，代表短期方向不明，应观望。若价格急跌后迅速拉回并站上EXP1，视为短线诱空结束，可轻仓跟进。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.expma.exp1 > trend.expma.exp2 && report.latestPrice > trend.expma.exp1
                        ? 'EXP12(' + formatNumber(trend.expma.exp1, 2) + ')在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')之上，且价格站稳EXP12，短线可积极做多。'
                        : trend.expma.exp1 < trend.expma.exp2 && report.latestPrice < trend.expma.exp1
                          ? 'EXP12在EXP50之下，且价格跌破EXP12，短线应回避。'
                          : 'EXPMA均线系统方向不明，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>严格等待短期EXPMA上穿长期EXPMA形成"黄金交叉"，以此为波段起点；下穿则为波段终点。当股价大幅偏离短期EXPMA线（乖离率过大），交易员预期会有回归均线的动作，此时是减仓时机而非追涨。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.expma.exp1 > trend.expma.exp2
                        ? 'EXP12上穿EXP50形成金叉，中期多头趋势确立。当前EXP12(' + formatNumber(trend.expma.exp1, 2) + ')持续在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')之上，可持仓。'
                        : 'EXP12在EXP50之下，中期趋势偏弱。等待EXP12重新上穿EXP50再考虑进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者将长期EXPMA（50日或120日）视为市场的平均持仓成本。只要价格维持在长期EXPMA上方运行，就认为长期上升趋势未改。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.expma.exp2
                        ? '价格 ¥' + report.latestPrice.toFixed(2) + '在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')之上，长期成本线支撑有效，长线可继续持有。'
                        : '价格跌破EXP50长期成本线，长线趋势转弱，建议减仓或离场。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.ene && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">5. ENE（轨道线）</h3>
                <p className="text-xs text-slate-500 mb-3">Envelope | 参数: (25, 6%, 6%)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-red-600">上轨</span>
                      <div className="text-lg font-black mt-1 text-red-600">{formatNumber(trend.ene.upper, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">中轨</span>
                      <div className="text-lg font-black mt-1 text-slate-900">{formatNumber(trend.ene.middle, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-green-600">下轨</span>
                      <div className="text-lg font-black mt-1 text-green-600">{formatNumber(trend.ene.lower, 2)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {report.latestPrice > trend.ene.upper 
                        ? '价格突破上轨 ¥' + formatNumber(trend.ene.upper, 2) + '，短线超买，注意回档风险。'
                        : report.latestPrice < trend.ene.lower
                          ? '价格跌破下轨 ¥' + formatNumber(trend.ene.lower, 2) + '，短线超卖，关注反弹机会。'
                          : '价格在轨道内运行，属于正常波动区间。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>当价格触及ENE上轨且轨道向上倾斜时，短线持有；若轨道走平且价格触及上轨，短线卖出。当价格跌破ENE下轨且轨道向下倾斜时，短线回避。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.upper
                        ? '价格突破上轨 ¥' + formatNumber(trend.ene.upper, 2) + '，短线超买，建议卖出或减仓。'
                        : report.latestPrice < trend.ene.lower
                          ? '价格跌破下轨 ¥' + formatNumber(trend.ene.lower, 2) + '，短线超卖，可尝试抄底。'
                          : '价格在轨道内正常运行，短线可沿趋势方向操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段要求ENE轨道有明确的倾斜方向。在上涨波段中，价格会沿着ENE上轨运行，回调到下轨获得支撑。若ENE轨道由向上转为走平，且价格跌破中轨，中期波段结束。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.middle
                        ? '价格在中轨 ¥' + formatNumber(trend.ene.middle, 2) + '之上，中期多头格局保持。若回踩下轨 ¥' + formatNumber(trend.ene.lower, 2) + '获得支撑，可加仓。'
                        : '价格跌破中轨，中期趋势转弱，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者观察到，在长期的牛市中，ENE轨道会呈现稳定的向上开口，价格很少跌破中轨。若ENE轨道开口向下，且价格跌破下轨，代表长期趋势逆转，进入熊市。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.middle
                        ? '价格在中轨之上，长期趋势偏多。只要不有效跌破中轨，长线可继续持有。'
                        : '价格跌破中轨，长期趋势转弱，建议重新评估持仓策略。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.bbi && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">6. BBI（多空指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Bull And Bear Index | 参数: (3, 6, 12, 24)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="text-center mb-4">
                    <span className="text-xs font-bold text-slate-600">BBI 数值</span>
                    <div className="text-2xl font-black mt-1 text-slate-900">{formatNumber(trend.bbi.bbi, 2)}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">MA3</span>
                      <div className="text-sm font-black mt-1 text-slate-900">{formatNumber(trend.bbi.ma3, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MA6</span>
                      <div className="text-sm font-black mt-1 text-slate-900">{formatNumber(trend.bbi.ma6, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MA12</span>
                      <div className="text-sm font-black mt-1 text-slate-900">{formatNumber(trend.bbi.ma12, 2)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MA24</span>
                      <div className="text-sm font-black mt-1 text-slate-900">{formatNumber(trend.bbi.ma24, 2)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      当前价格 ¥{report.latestPrice.toFixed(2)}，BBI 值为 {formatNumber(trend.bbi.bbi, 2)}。
                      {report.latestPrice > trend.bbi.bbi ? '价格在BBI上方，多头市场占优。' : '价格在BBI下方，空头市场占优。'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>当价格大幅高于BBI线时，短线交易员会警惕回调风险；当价格大幅低于BBI线时，关注反弹机会。BBI线由跌转涨，且价格站上BBI线，是短线买入信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '价格 ¥' + report.latestPrice.toFixed(2) + '在BBI(' + formatNumber(trend.bbi.bbi, 2) + ')之上，短线多头信号。'
                        : '价格在BBI之下，短线空头信号，等待价格站上BBI再进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段以BBI线为多空分界线。只要价格不跌破BBI线，就认为中期趋势依然向好。若价格有效跌破BBI线，且BBI线拐头向下，中期波段结束，考虑减仓。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '价格在BBI之上，中期多头格局保持。可继续持有，以BBI(' + formatNumber(trend.bbi.bbi, 2) + ')为止损位。'
                        : '价格跌破BBI，中期趋势转弱，建议减仓或离场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期持有者观察到，在长期的牛市中，价格会始终运行在BBI线上方。若价格跌破BBI线，且BBI线开始向下弯曲，代表长期多空力量发生转变，需考虑长期持有策略的调整。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '价格在BBI之上，长期多头趋势保持。只要BBI线不向下弯曲，长线可坚定持有。'
                        : '价格跌破BBI，长期多空力量发生转变，建议重新评估长线持仓策略。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.trix && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">7. TRIX（三重指数平滑移动平均线）</h3>
                <p className="text-xs text-slate-500 mb-3">Triple Exponentially Smoothed Average | 参数: (12, 9)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">TRIX</span>
                      <div className={`text-xl font-black mt-1 ${trend.trix.trix > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(trend.trix.trix, 4)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MATRIX</span>
                      <div className={`text-xl font-black mt-1 ${trend.trix.matrix > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(trend.trix.matrix, 4)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {trend.trix.trix > trend.trix.matrix 
                        ? 'TRIX（' + formatNumber(trend.trix.trix, 4) + '%）在MATRIX（' + formatNumber(trend.trix.matrix, 4) + '%）上方，金叉状态，建议持有。'
                        : 'TRIX（' + formatNumber(trend.trix.trix, 4) + '%）在MATRIX（' + formatNumber(trend.trix.matrix, 4) + '%）下方，死叉状态，建议离场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>短期交易员极少使用TRIX，因为其极度滞后。若TRIX在极低位置突然抬头，可作为长期底部可能形成的预警，但不作为短线入场依据。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix < -1 && trend.trix.trix > trend.trix.matrix
                        ? 'TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在低位开始抬头，可能预示长期底部正在形成，但不作为短线入场信号。'
                        : 'TRIX为长线指标，短期交易参考价值有限，建议结合其他短线指标操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注TRIX在零轴附近的金叉或死叉。当TRIX上穿零轴且趋势向上，视为中期多头确立；下穿零轴则视为中期走弱。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix > 0 && trend.trix.trix > trend.trix.matrix
                        ? 'TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在零轴上方且形成金叉，中期多头确立。'
                        : trend.trix.trix < 0 && trend.trix.trix < trend.trix.matrix
                          ? 'TRIX在零轴下方且形成死叉，中期趋势走弱。'
                          : 'TRIX信号不明确，建议结合其他指标综合判断。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>将TRIX视为长线持仓的风向标。只要TRIX线保持向上的斜率且维持在零轴上方，就坚定长期持有，忽略中途的回调波动。若TRIX在高位掉头向下，预示长线行情可能终结。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix > 0 && trend.trix.trix > trend.trix.matrix
                        ? 'TRIX保持在零轴上方且呈多头排列，长线持仓信号明确。只要TRIX不跌破零轴，可坚定持有。'
                        : trend.trix.trix > 0 && trend.trix.trix < trend.trix.matrix
                          ? 'TRIX在零轴上方但出现死叉，需警惕长线趋势可能转弱，建议减仓观望。'
                          : 'TRIX在零轴下方，长线趋势偏弱，暂不适合长线建仓。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 mb-6">三、摆动类指标分析</h2>
            
            {oscillator.kdj && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">1. KDJ（随机指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Stochastic Oscillator | 参数: (9, 3, 3)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">K值</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.kdj.k < 20 ? 'text-green-600' : oscillator.kdj.k > 80 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.kdj.k, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.kdj.k < 20 ? '超卖' : oscillator.kdj.k > 80 ? '超买' : '正常'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">D值</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.kdj.d < 20 ? 'text-green-600' : oscillator.kdj.d > 80 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.kdj.d, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.kdj.d < 20 ? '超卖' : oscillator.kdj.d > 80 ? '超买' : '正常'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">J值</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.kdj.j < 0 ? 'text-green-600' : oscillator.kdj.j > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.kdj.j, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.kdj.j < 0 ? '超卖' : oscillator.kdj.j > 100 ? '超买' : '正常'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {oscillator.kdj.k > oscillator.kdj.d 
                        ? (oscillator.kdj.k < 30 ? '低位金叉（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），强烈买入信号。' : '金叉状态（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），可持有。')
                        : (oscillator.kdj.k > 70 ? '高位死叉（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），强烈卖出信号。' : '死叉状态（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），建议离场。')
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注J值极值——J值超过100为严重超买，低于0为严重超卖。短线交易员常在J值大于100时卖出，小于0时买入。同时关注K线与D线在20以下形成金叉，是短线强烈的买入信号；在80以上形成死叉，是短线卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.j > 100
                        ? 'J值(' + formatNumber(oscillator.kdj.j, 1) + ')超过100，严重超买，短线应卖出。'
                        : oscillator.kdj.j < 0
                          ? 'J值(' + formatNumber(oscillator.kdj.j, 1) + ')低于0，严重超卖，短线可买入。'
                          : oscillator.kdj.k > oscillator.kdj.d && oscillator.kdj.k < 30
                            ? 'KDJ在低位(' + formatNumber(oscillator.kdj.k, 1) + ')形成金叉，短线买入信号。'
                            : oscillator.kdj.k < oscillator.kdj.d && oscillator.kdj.k > 70
                              ? 'KDJ在高位(' + formatNumber(oscillator.kdj.k, 1) + ')形成死叉，短线卖出信号。'
                              : 'KDJ指标无明确短线信号，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>在极强的单边牛市或熊市中，KDJ会在高位或低位长时间钝化（反复金叉死叉）。中期交易员不会因短暂的死叉而轻易下车，而是等待K线跌破20或突破80后的有效发散。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.k > 80 && oscillator.kdj.k > oscillator.kdj.d
                        ? 'KDJ在高位(' + formatNumber(oscillator.kdj.k, 1) + ')形成金叉，若处于强势行情中，可能是高位钝化，需结合趋势判断。'
                        : oscillator.kdj.k < 20 && oscillator.kdj.k < oscillator.kdj.d
                          ? 'KDJ在低位(' + formatNumber(oscillator.kdj.k, 1) + ')形成死叉，若处于弱势行情中，可能是低位钝化。'
                          : 'KDJ处于正常区间，中期可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注KDJ在20以下的低位徘徊时间。若KDJ在低位形成W底或多重底，且伴随成交量温和放大，是长线资金悄然吸筹的信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.k < 30 && oscillator.kdj.d < 30
                        ? 'KDJ处于低位区域(K=' + formatNumber(oscillator.kdj.k, 1) + ', D=' + formatNumber(oscillator.kdj.d, 1) + ')，若持续时间较长，可能是长线资金吸筹阶段，可关注。'
                        : oscillator.kdj.k > 70 && oscillator.kdj.d > 70
                          ? 'KDJ处于高位区域，长期风险较大，建议逐步减仓。'
                          : 'KDJ处于中间区域，长线趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.skdj && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">2. SKDJ（慢速随机指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Slow Stochastic | 参数: (9, 3)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">SLOW_K</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.skdj.slow_k < 20 ? 'text-green-600' : oscillator.skdj.slow_k > 80 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.skdj.slow_k, 2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">SLOW_D</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.skdj.slow_d < 20 ? 'text-green-600' : oscillator.skdj.slow_d > 80 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.skdj.slow_d, 2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {oscillator.skdj.slow_k > oscillator.skdj.slow_d 
                        ? 'SLOW_K（' + formatNumber(oscillator.skdj.slow_k, 1) + '）大于SLOW_D（' + formatNumber(oscillator.skdj.slow_d, 1) + '），多头信号。'
                        : 'SLOW_K（' + formatNumber(oscillator.skdj.slow_k, 1) + '）小于SLOW_D（' + formatNumber(oscillator.skdj.slow_d, 1) + '），空头信号。'
                      }
                      SKDJ相比KDJ更平滑，信号更稳定。
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>在极度震荡的行情中，SKDJ产生的金叉死叉信号比KDJ少，减少了被市场反复"打脸"的假信号。通常观察KDJ寻找激进的短线切入点，而SKDJ用于确认中期的趋势方向是否依然健康。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k < 20 && oscillator.skdj.slow_k > oscillator.skdj.slow_d
                        ? 'SKDJ在低位(' + formatNumber(oscillator.skdj.slow_k, 1) + ')形成金叉，短线可尝试买入。'
                        : oscillator.skdj.slow_k > 80 && oscillator.skdj.slow_k < oscillator.skdj.slow_d
                          ? 'SKDJ在高位(' + formatNumber(oscillator.skdj.slow_k, 1) + ')形成死叉，短线应卖出。'
                          : 'SKDJ信号不明确，建议结合KDJ综合判断。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期交易员看重SKDJ在50中轴线的穿越。当SKDJ从下方金叉50，视为中期多头开始；当SKDJ从上方死叉50，视为中期空头开始。由于SKDJ更平滑，中期信号的误报率更低。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k > 50 && oscillator.skdj.slow_k > oscillator.skdj.slow_d
                        ? 'SKDJ(' + formatNumber(oscillator.skdj.slow_k, 1) + ')在50之上且形成金叉，中期多头格局确立。'
                        : oscillator.skdj.slow_k < 50 && oscillator.skdj.slow_k < oscillator.skdj.slow_d
                          ? 'SKDJ在50之下且形成死叉，中期空头格局。'
                          : 'SKDJ围绕50中轴线波动，中期方向不明。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者将SKDJ视为趋势确认的辅助工具。当股价长期上涨，而SKDJ指标在高位形成双顶或头肩顶，视为长期趋势可能衰竭的信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k > 70 && oscillator.skdj.slow_d > 70
                        ? 'SKDJ处于高位区域(' + formatNumber(oscillator.skdj.slow_k, 1) + ')，需警惕长期趋势衰竭风险。'
                        : oscillator.skdj.slow_k < 30 && oscillator.skdj.slow_d < 30
                          ? 'SKDJ处于低位区域，可能是长线建仓机会，建议结合成交量确认。'
                          : 'SKDJ处于中间区域，长期趋势需结合其他指标综合判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.rsi && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">3. RSI（相对强弱指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Relative Strength Index | 参数: (6, 12, 24)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">RSI6</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.rsi.rsi6 < 30 ? 'text-green-600' : oscillator.rsi.rsi6 > 70 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.rsi.rsi6, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.rsi.rsi6 < 30 ? '超卖' : oscillator.rsi.rsi6 > 70 ? '超买' : '正常'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">RSI12</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.rsi.rsi12 < 30 ? 'text-green-600' : oscillator.rsi.rsi12 > 70 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.rsi.rsi12, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.rsi.rsi12 < 30 ? '超卖' : oscillator.rsi.rsi12 > 70 ? '超买' : '正常'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">RSI24</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.rsi.rsi24 < 30 ? 'text-green-600' : oscillator.rsi.rsi24 > 70 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.rsi.rsi24, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.rsi.rsi24 < 30 ? '超卖' : oscillator.rsi.rsi24 > 70 ? '超买' : '正常'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      RSI6 = {formatNumber(oscillator.rsi.rsi6, 1)}，RSI12 = {formatNumber(oscillator.rsi.rsi12, 1)}，RSI24 = {formatNumber(oscillator.rsi.rsi24, 1)}。
                      {oscillator.rsi.rsi6 > 70 
                        ? 'RSI6处于超买区（>70），谨防回调。'
                        : oscillator.rsi.rsi6 < 30
                          ? 'RSI6处于超卖区（<30），关注反弹机会。'
                          : 'RSI6处于正常区间（30-70），可继续观察。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>观察6日RSI在20-80区间的波动。RSI低于20买入，高于80卖出。重点关注RSI与价格的顶背离（价格新高，RSI未新高），这是短线见顶的强烈信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.rsi.rsi6 > 80
                        ? 'RSI6(' + formatNumber(oscillator.rsi.rsi6, 1) + ')超过80，严重超买，短线应卖出。'
                        : oscillator.rsi.rsi6 < 20
                          ? 'RSI6(' + formatNumber(oscillator.rsi.rsi6, 1) + ')低于20，严重超卖，短线可买入。'
                          : 'RSI6处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期交易员看重RSI与价格的同步性。若RSI未能创出新高而价格新高，视为中期多头力量衰竭的预警。RSI在50上方为多头市场，下方为空头市场。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.rsi.rsi12 > 50
                        ? 'RSI12(' + formatNumber(oscillator.rsi.rsi12, 1) + ')在50之上，中期多头市场，可持仓。'
                        : 'RSI12(' + formatNumber(oscillator.rsi.rsi12, 1) + ')在50之下，中期空头市场，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者利用24日RSI来判断大级别的市场情绪。若24日RSI在50以上运行，视为长期多头市场；若在50以下，视为长期空头市场。长期底背离是重要的底部信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.rsi.rsi24 > 50
                        ? 'RSI24(' + formatNumber(oscillator.rsi.rsi24, 1) + ')在50之上，长期多头市场，可坚定持有。'
                        : 'RSI24(' + formatNumber(oscillator.rsi.rsi24, 1) + ')在50之下，长期空头市场，暂不适合长线建仓。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.cci && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">4. CCI（顺势指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Commodity Channel Index | 参数: (14)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
                  <span className="text-xs font-bold text-slate-600">CCI</span>
                  <div className={`text-3xl font-black mt-2 ${
                    oscillator.cci.cci > 100 ? 'text-red-600' : oscillator.cci.cci < -100 ? 'text-green-600' : 'text-slate-900'
                  }`}>
                    {formatNumber(oscillator.cci.cci, 2)}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {oscillator.cci.cci > 100 ? '超买区（>100）' : oscillator.cci.cci < -100 ? '超卖区（<-100）' : '常态区（-100~100）'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {oscillator.cci.cci > 100 
                        ? 'CCI突破+100，进入超买区间，短线强势，但需注意回调风险。'
                        : oscillator.cci.cci < -100
                          ? 'CCI跌破-100，进入超卖区间，短线弱势，关注反弹机会。'
                          : 'CCI在常态区间（-100~100），趋势不明显，观望为主。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>CCI在+100至-100之间为常态分布区。短线交易员在CCI从+100上方跌破+100时卖出，在CCI从-100下方突破-100时买入。当CCI达到+300或-300的极端值时，短线交易员会密切关注，一旦拐头，立即执行反向操作。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.cci.cci > 300
                        ? 'CCI(' + formatNumber(oscillator.cci.cci, 1) + ')达到极端超买区（>300），随时可能拐头回落，短线应卖出。'
                        : oscillator.cci.cci < -300
                          ? 'CCI(' + formatNumber(oscillator.cci.cci, 1) + ')达到极端超卖区（<-300），随时可能反弹，短线可买入。'
                          : oscillator.cci.cci > 100
                            ? 'CCI在超买区，短线强势但有回调风险。'
                            : oscillator.cci.cci < -100
                              ? 'CCI在超卖区，短线弱势但有反弹机会。'
                              : 'CCI在常态区间，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段交易员更看重CCI突破±100的有效性。只有CCI连续两日站稳在+100上方，才确认中期多头趋势成立。股价创出新低，但CCI未创新低（底背离），是中期波段抄底的强有力信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.cci.cci > 100
                        ? 'CCI(' + formatNumber(oscillator.cci.cci, 1) + ')突破+100，中期多头趋势确认。'
                        : oscillator.cci.cci < -100
                          ? 'CCI(' + formatNumber(oscillator.cci.cci, 1) + ')跌破-100，中期空头趋势确认，建议减仓。'
                          : 'CCI在常态区间，中期方向不明，等待突破。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注CCI在-200至-300区域的极端低值。若CCI在此区域出现长下影线并迅速拉回，往往是长期底部形成的信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.cci.cci < -200
                        ? 'CCI(' + formatNumber(oscillator.cci.cci, 1) + ')处于极端超卖区（<-200），可能是长期底部信号，可关注。'
                        : oscillator.cci.cci > 200
                          ? 'CCI处于极端超买区，长期风险较大，建议谨慎。'
                          : 'CCI处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.wr && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">5. WR（威廉指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Williams Overbought/Oversold Index | 参数: (10)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
                  <span className="text-xs font-bold text-slate-600">W%R10</span>
                  <div className={`text-3xl font-black mt-2 ${
                    oscillator.wr.wr10 > -20 ? 'text-red-600' : oscillator.wr.wr10 < -80 ? 'text-green-600' : 'text-slate-900'
                  }`}>
                    {formatNumber(oscillator.wr.wr10, 2)}%
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {oscillator.wr.wr10 > -20 ? '超买区（>-20）' : oscillator.wr.wr10 < -80 ? '超卖区（<-80）' : '正常区间'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {oscillator.wr.wr10 > -20 
                        ? 'WR接近0，超买状态，注意见顶回落风险。'
                        : oscillator.wr.wr10 < -80
                          ? 'WR接近-100，超卖状态，关注见底反弹机会。'
                          : 'WR在中间区域（-20~-80），多空相对平衡。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>WR高于-20视为超买，低于-80视为超卖。短线交易员常在WR低于-80时买入，高于-20时卖出。当WR触及-100（或接近-100的低点）后迅速掉头向上，是短线强烈的买入信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.wr.wr10 > -20
                        ? 'WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)高于-20，超买状态，短线应卖出。'
                        : oscillator.wr.wr10 < -80
                          ? 'WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)低于-80，超卖状态，短线可买入。'
                          : 'WR在正常区间，短线观望或高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>在中期趋势中，WR会在-20至-80之间波动。中期交易员主要关注WR在-50中轴线的得失。若WR有效突破-50（向上），视为中期多头增强。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.wr.wr10 > -50
                        ? 'WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)在-50之上，中期多头力量较强。'
                        : 'WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)在-50之下，中期空头力量较强。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>在长期大牛市中，WR会长期处于-20以上的超买钝化区。长期交易者不会因此卖出，而是将其视为强势特征，直到WR突破-20后出现明显的顶部形态。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.wr.wr10 > -20
                        ? 'WR处于超买区，若处于长期牛市中，这是强势特征。但需结合趋势判断是否见顶。'
                        : 'WR处于正常或超卖区，长期趋势需结合其他指标确认。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.lwr && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">6. LWR（慢速威廉指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Larry Williams R | 参数: (10)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
                  <span className="text-xs font-bold text-slate-600">LWR10</span>
                  <div className={`text-3xl font-black mt-2 ${
                    oscillator.lwr.lwr10 > -20 ? 'text-red-600' : oscillator.lwr.lwr10 < -80 ? 'text-green-600' : 'text-slate-900'
                  }`}>
                    {formatNumber(oscillator.lwr.lwr10, 2)}%
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {oscillator.lwr.lwr10 > -20 ? '超买区（>-20）' : oscillator.lwr.lwr10 < -80 ? '超卖区（<-80）' : '正常区间'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      LWR比WR更平滑，信号更可靠。
                      {oscillator.lwr.lwr10 > -20 
                        ? '超买区域，谨慎追高。'
                        : oscillator.lwr.lwr10 < -80
                          ? '超卖区域，关注机会。'
                          : '中性区间，观察为主。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>逻辑与WR类似，但曲线更平滑。在WR的极端值区域（-20/-80）附近，LWR的转向信号更值得信赖，减少了假突破。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.lwr.lwr10 > -20
                        ? 'LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)高于-20，超买状态，短线应卖出。'
                        : oscillator.lwr.lwr10 < -80
                          ? 'LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)低于-80，超卖状态，短线可买入。'
                          : 'LWR在正常区间，短线观望或高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>LWR的波动比WR平缓，更趋向于反映中期的趋势。当LWR持续在低位（超卖区）徘徊并拐头向上，往往预示着中期底部的形成。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.lwr.lwr10 < -60 && oscillator.lwr.lwr10 > -100
                        ? 'LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)处于超卖区，若出现拐头向上，可能是中期底部信号。'
                        : oscillator.lwr.lwr10 > -40
                          ? 'LWR处于超买或偏强区域，中期可继续观察。'
                          : 'LWR处于中间区域，中期方向不明。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者将其作为WR的辅助，用于确认WR发出的长期极端信号。若LWR和WR同时在历史低位区域发生金叉，长期底部的可靠性更高。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.lwr.lwr10 < -80
                        ? 'LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)处于深度超卖区，结合WR指标可确认长期底部信号。'
                        : oscillator.lwr.lwr10 > -20
                          ? 'LWR处于超买区，长期需谨慎。'
                          : 'LWR处于中间区域，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.bias && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">7. BIAS（乖离率）</h3>
                <p className="text-xs text-slate-500 mb-3">Bias Rate | 参数: (6, 12, 24)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">BIAS6</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.bias.bias6 > 3 ? 'text-red-600' : oscillator.bias.bias6 < -3 ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.bias.bias6, 2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">BIAS12</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.bias.bias12 > 4 ? 'text-red-600' : oscillator.bias.bias12 < -4 ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.bias.bias12, 2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">BIAS24</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.bias.bias24 > 6 ? 'text-red-600' : oscillator.bias.bias24 < -6 ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatNumber(oscillator.bias.bias24, 2)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      BIAS6 = {formatNumber(oscillator.bias.bias6, 1)}%，BIAS12 = {formatNumber(oscillator.bias.bias12, 1)}%，BIAS24 = {formatNumber(oscillator.bias.bias24, 1)}%。
                      乖离率表示价格与均线的偏离程度，{oscillator.bias.bias6 > 3 
                        ? '短期正乖离过大（BIAS6 > 3%），有回调需求。'
                        : oscillator.bias.bias6 < -3
                          ? '短期负乖离过大（BIAS6 < -3%），有反弹需求。'
                          : '乖离率在正常范围内。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>短线交易员利用乖离率的均值回归特性。当BIAS6大于+8%（正乖离过大），预期股价将向均线回归，选择卖出；当BIAS6小于-8%，选择买入。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.bias.bias6 > 8
                        ? 'BIAS6(' + formatNumber(oscillator.bias.bias6, 1) + '%)超过+8%，正乖离过大，短线应卖出。'
                        : oscillator.bias.bias6 < -8
                          ? 'BIAS6(' + formatNumber(oscillator.bias.bias6, 1) + '%)低于-8%，负乖离过大，短线可买入。'
                          : 'BIAS6处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期趋势中，BIAS12通常在-5%到+5%之间波动。若BIAS12跌破-5%，视为中线买入良机；若突破+5%，视为中线获利了结点。在强势主升浪中，BIAS会持续维持在+5%以上甚至更高。中期交易员不会过早下车，直到BIAS出现明显的拐头向下迹象。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.bias.bias12 > 5
                        ? 'BIAS12(' + formatNumber(oscillator.bias.bias12, 1) + '%)超过+5%，中期可考虑减仓。'
                        : oscillator.bias.bias12 < -5
                          ? 'BIAS12(' + formatNumber(oscillator.bias.bias12, 1) + '%)低于-5%，中期可考虑加仓。'
                          : 'BIAS12处于正常区间，中期可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注BIAS24在极端负值区域的长期徘徊。若股价长期低于均线（BIAS持续为负），且基本面未发生恶化，往往是长线投资的极佳切入点。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.bias.bias24 < -10
                        ? 'BIAS24(' + formatNumber(oscillator.bias.bias24, 1) + '%)处于深度负乖离区，若基本面健康，是长线建仓机会。'
                        : oscillator.bias.bias24 > 10
                          ? 'BIAS24处于深度正乖离区，长期风险较大。'
                          : 'BIAS24处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {oscillator.mtm && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">8. MTM（动量指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Momentum | 参数: (12, 6)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">MTM12</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.mtm.mtm12 > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(oscillator.mtm.mtm12, 4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MTMMA6</span>
                      <div className={`text-xl font-black mt-1 ${oscillator.mtm.mtm_ma6 > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(oscillator.mtm.mtm_ma6, 4)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {oscillator.mtm.mtm12 > oscillator.mtm.mtm_ma6 
                        ? 'MTM（' + formatNumber(oscillator.mtm.mtm12, 4) + '）在均线（' + formatNumber(oscillator.mtm.mtm_ma6, 4) + '）之上，动量向上，多头强势。'
                        : 'MTM（' + formatNumber(oscillator.mtm.mtm12, 4) + '）在均线（' + formatNumber(oscillator.mtm.mtm_ma6, 4) + '）之下，动量向下，空头强势。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>MTM上穿零轴，视为短期买入信号；MTM下穿零轴，视为短期卖出信号。MTM上穿MTMMA形成金叉，是短线买入信号；下穿形成死叉，是短线卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.mtm.mtm12 > 0 && oscillator.mtm.mtm12 > oscillator.mtm.mtm_ma6
                        ? 'MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')在零轴上方且形成金叉，短线买入信号。'
                        : oscillator.mtm.mtm12 < 0 && oscillator.mtm.mtm12 < oscillator.mtm.mtm_ma6
                          ? 'MTM在零轴下方且形成死叉，短线卖出信号。'
                          : 'MTM信号不明确，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>MTM对价格变化的反应比ROC更为灵敏。中期交易员利用MTM与价格的背离，提前预判中期趋势的转折。在单边上涨行情中，MTM会持续在零轴上方运行。只要MTM不跌破零轴，中期趋势就未改变。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.mtm.mtm12 > 0
                        ? 'MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')在零轴上方，中期多头趋势保持。'
                        : 'MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')在零轴下方，中期空头趋势，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注MTM在高位（如+100以上）的长期钝化。若MTM从高位缓慢回落，且股价仍在高位横盘，提示长期动能衰竭，需警惕长期顶部的形成。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.mtm.mtm12 > 50
                        ? 'MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')处于高位区域，需警惕长期动能衰竭风险。'
                        : oscillator.mtm.mtm12 < -50
                          ? 'MTM处于低位区域，可能是长线建仓机会。'
                          : 'MTM处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 mb-6">四、成交量类指标分析</h2>
            
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3">1. 基础成交量数据</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-600">成交量</span>
                    <div className="text-xl font-black mt-1 text-slate-900">{formatLargeNumber(volume.latestVolume)}</div>
                    <p className="text-xs text-slate-400">股</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-600">成交额</span>
                    <div className="text-xl font-black mt-1 text-slate-900">{formatLargeNumber(volume.latestTurnover)}</div>
                    <p className="text-xs text-slate-400">元</p>
                  </div>
                </div>
              </div>
            </div>

            {volume.obv && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">2. OBV（能量潮）</h3>
                <p className="text-xs text-slate-500 mb-3">On Balance Volume | 参数: 30日均线</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">OBV</span>
                      <div className="text-xl font-black mt-1 text-slate-900">{formatLargeNumber(volume.obv.obv)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MAOBV30</span>
                      <div className="text-xl font-black mt-1 text-slate-900">{formatLargeNumber(volume.obv.maobv30)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {volume.obv.obv > volume.obv.maobv30 
                        ? 'OBV（' + formatLargeNumber(volume.obv.obv) + '）在均线（' + formatLargeNumber(volume.obv.maobv30) + '）之上，量能支撑价格，趋势健康。'
                        : 'OBV（' + formatLargeNumber(volume.obv.obv) + '）在均线（' + formatLargeNumber(volume.obv.maobv30) + '）之下，量能不足，注意风险。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>若股价创新高，而OBV未创新高（顶背离），视为短线见顶信号，坚决止盈。当股价创新低，而OBV未创新低（底背离），视为短线见底信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.obv.obv > volume.obv.maobv30
                        ? 'OBV在均线之上，量能充足，短线可积极操作。'
                        : 'OBV在均线之下，量能不足，短线应谨慎。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段交易员看重OBV与其均线（如30日）的关系。当OBV线上穿其均线，且两者均呈上升态势，确认中期多头趋势。当股价突破重要阻力位时，若OBV同步向上突破其前期高点，则该突破的有效性极高。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.obv.obv > volume.obv.maobv30
                        ? 'OBV上穿均线，中期多头趋势确认，可持仓。'
                        : 'OBV在均线之下，中期趋势偏弱，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者将OBV视为长期资金流向的宏观指标。若OBV在长期上升通道中运行，代表长期资金持续流入，牛市基础坚实。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.obv.obv > volume.obv.maobv30
                        ? 'OBV持续在均线之上，长期资金流入，牛市基础坚实，可坚定持有。'
                        : 'OBV在均线之下，长期资金流出，需谨慎。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {volume.vr && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">3. VR（容量比率）</h3>
                <p className="text-xs text-slate-500 mb-3">Volume Ratio | 参数: (26)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
                  <span className="text-xs font-bold text-slate-600">VR</span>
                  <div className={`text-3xl font-black mt-2 ${
                    volume.vr.vr > 400 ? 'text-red-600' : volume.vr.vr < 70 ? 'text-green-600' : 'text-slate-900'
                  }`}>
                    {formatNumber(volume.vr.vr, 2)}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {volume.vr.vr > 400 ? '高价区（>400）' : volume.vr.vr < 40 ? '低价区（<40）' : volume.vr.vr < 70 ? '超卖区（<70）' : volume.vr.vr < 160 ? '安全区（70-160）' : '警戒区（160-400）'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      VR = {formatNumber(volume.vr.vr, 1)}。
                      {volume.vr.vr > 400 
                        ? 'VR超过400，市场异常活跃，注意高位风险。'
                        : volume.vr.vr < 40
                          ? 'VR低于40，市场极度低迷，可能处于底部区域。'
                          : volume.vr.vr < 70
                            ? 'VR低于70，超卖区，可关注抄底机会。'
                            : 'VR在正常区间，交易活跃度适中。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>VR 超过 350 甚至 400，说明短期买盘过盛，应警惕短期顶部；VR 低于 40，说明短期卖压沉重，可能出现短期底部。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.vr.vr > 400
                        ? 'VR(' + formatNumber(volume.vr.vr, 1) + ')超过400，短期买盘过盛，应警惕短期顶部。'
                        : volume.vr.vr < 40
                          ? 'VR(' + formatNumber(volume.vr.vr, 1) + ')低于40，短期卖压沉重，可能出现短期底部。'
                          : 'VR处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期交易员看重 VR 在 80-150 之间的安全区运行。若 VR 突破 160 进入获利区，应逐步减仓；若 VR 跌破 70 进入低价区，是中期介入的好时机。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.vr.vr > 160
                        ? 'VR(' + formatNumber(volume.vr.vr, 1) + ')进入获利区，中期应逐步减仓。'
                        : volume.vr.vr < 70
                          ? 'VR(' + formatNumber(volume.vr.vr, 1) + ')进入低价区，是中期介入的好时机。'
                          : 'VR在安全区运行，中期可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注 VR 的长期均线和极端值。若 VR 长期在 150 上方运行，代表长期市场狂热；若长期在 50 下方徘徊，代表长期市场低迷，往往是长期底部的特征之一。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.vr.vr > 150
                        ? 'VR(' + formatNumber(volume.vr.vr, 1) + ')在150上方，长期市场情绪偏热。'
                        : volume.vr.vr < 50
                          ? 'VR在50下方，长期市场低迷，可能是长期底部特征。'
                          : 'VR处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {volume.brar && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">4. BRAR（情绪指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Buying Range / Average Range | 参数: (26)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">BR</span>
                      <div className={`text-xl font-black mt-1 ${volume.brar.br > 300 ? 'text-red-600' : volume.brar.br < 50 ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatNumber(volume.brar.br, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {volume.brar.br > 300 ? '超买' : volume.brar.br < 50 ? '超卖' : '正常'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">AR</span>
                      <div className={`text-xl font-black mt-1 ${volume.brar.ar > 180 ? 'text-red-600' : volume.brar.ar < 40 ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatNumber(volume.brar.ar, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {volume.brar.ar > 180 ? '超买' : volume.brar.ar < 40 ? '超卖' : '正常'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      BR = {formatNumber(volume.brar.br, 1)}，AR = {formatNumber(volume.brar.ar, 1)}。
                      BR反映买卖意愿强度，AR反映开盘强弱。
                      {volume.brar.br > 300 || volume.brar.ar > 180 ? '当前情绪偏于过热，注意回调。' : volume.brar.br < 50 || volume.brar.ar < 40 ? '当前情绪过于低迷，可能临近反弹。' : '市场情绪处于正常水平。'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>AR {'&gt;'} 180 或 BR {'&gt;'} 400，暗示短期行情过热，应反向卖出；AR {'&lt;'} 40 或 BR {'&lt;'} 40，行情将起死回生，应买进。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.brar.br > 400 || volume.brar.ar > 180
                        ? 'BR(' + formatNumber(volume.brar.br, 1) + ')或AR(' + formatNumber(volume.brar.ar, 1) + ')过高，短期行情过热，应卖出。'
                        : volume.brar.br < 40 || volume.brar.ar < 40
                          ? 'BR或AR过低，行情将起死回生，应买进。'
                          : 'BRAR处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期交易员看重 AR 和 BR 的同步性。若 AR 和 BR 同时向上突破 100，是中期买入信号；若 AR 和 BR 同时掉头向下，是中期卖出信号。AR在BR上方为强势。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.brar.ar > 100 && volume.brar.br > 100
                        ? 'AR(' + formatNumber(volume.brar.ar, 1) + ')和BR(' + formatNumber(volume.brar.br, 1) + ')均在100之上，中期多头信号。' + (volume.brar.ar > volume.brar.br ? 'AR在BR上方，强势特征。' : '')
                        : 'AR或BR低于100，中期趋势偏弱。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注 AR 和 BR 在极端区域的钝化。在长期的牛市中，BR 往往会长时间维持在 300 以上，此时不应轻易言顶，而应结合其他指标判断趋势的延续性。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.brar.br > 300
                        ? 'BR(' + formatNumber(volume.brar.br, 1) + ')超过300，若处于长期牛市中，这是强势特征，不应轻易言顶。'
                        : 'BRAR处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {volume.cr && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">5. CR（带状能量线）</h3>
                <p className="text-xs text-slate-500 mb-3">Commodity Research Index | 参数: (26)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
                  <span className="text-xs font-bold text-slate-600">CR</span>
                  <div className={`text-3xl font-black mt-2 ${
                    volume.cr.cr > 200 ? 'text-red-600' : volume.cr.cr < 40 ? 'text-green-600' : 'text-slate-900'
                  }`}>
                    {formatNumber(volume.cr.cr, 2)}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {volume.cr.cr > 200 ? '超买区' : volume.cr.cr < 40 ? '超卖区' : '正常区间'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      CR = {formatNumber(volume.cr.cr, 1)}。
                      {volume.cr.cr > 200 
                        ? 'CR超过200，能量过度释放，有调整需求。'
                        : volume.cr.cr < 40
                          ? 'CR低于40，能量极度萎缩，可能止跌回升。'
                          : 'CR在正常区间，能量适中。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>CR 值在 75-300 区间波动时，视为短期正常区间；若 CR 超过 400，说明短期买盘过盛，应警惕短期顶部。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.cr.cr > 400
                        ? 'CR(' + formatNumber(volume.cr.cr, 1) + ')超过400，短期买盘过盛，应警惕短期顶部。'
                        : volume.cr.cr < 75
                          ? 'CR低于75，短期能量偏低，可能反弹。'
                          : 'CR处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期交易员看重 CR 与其各条均线（带状）的关系。若 CR 在所有均线上方运行，且均线呈多头排列，是中期强势持股信号。若 CR 连续跌破多条均线，则提示中期调整。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.cr.cr > 100
                        ? 'CR(' + formatNumber(volume.cr.cr, 1) + ')在100之上，中期强势特征。'
                        : 'CR在100之下，中期趋势偏弱。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注 CR 在 30-60 区域的极端低值。若 CR 在此区域企稳并抬头，往往是长期底部形成的信号。CR在低位上穿所有均线是长线启动的重要标志。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.cr.cr < 60
                        ? 'CR(' + formatNumber(volume.cr.cr, 1) + ')处于极端低值区（30-60），若企稳抬头，可能是长期底部信号。'
                        : volume.cr.cr > 150
                          ? 'CR处于较高区域，长期需谨慎。'
                          : 'CR处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {volume.dma && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">6. DMA（平行线差）</h3>
                <p className="text-xs text-slate-500 mb-3">Difference of Moving Average | 参数: (10, 50, 10)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">DIF</span>
                      <div className={`text-xl font-black mt-1 ${volume.dma.dif > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(volume.dma.dif, 4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">AMA</span>
                      <div className={`text-xl font-black mt-1 ${volume.dma.ama > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(volume.dma.ama, 4)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {volume.dma.dif > volume.dma.ama 
                        ? 'DIF（' + formatNumber(volume.dma.dif, 4) + '）在AMA（' + formatNumber(volume.dma.ama, 4) + '）之上，多头排列，上升趋势。'
                        : 'DIF（' + formatNumber(volume.dma.dif, 4) + '）在AMA（' + formatNumber(volume.dma.ama, 4) + '）之下，空头排列，下降趋势。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>紧盯 DIF 线与 AMA 线的交叉。DIF 线上穿 AMA 线形成金叉，是短线买入信号；下穿形成死叉，是短线卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.dma.dif > volume.dma.ama
                        ? 'DIF(' + formatNumber(volume.dma.dif, 4) + ')上穿AMA(' + formatNumber(volume.dma.ama, 4) + ')形成金叉，短线买入信号。'
                        : 'DIF下穿AMA形成死叉，短线卖出信号。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>看重 DMA 指标与价格的背离。若股价创出新高，但 DMA 未能创出新高（顶背离），提示中期上涨动能衰竭，应考虑减仓。DIF在零轴上方运行为中期多头市场。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.dma.dif > 0
                        ? 'DIF(' + formatNumber(volume.dma.dif, 4) + ')在零轴上方，中期多头市场。' + (volume.dma.dif > volume.dma.ama ? 'DIF上穿AMA，可持仓。' : 'DIF下穿AMA，需警惕。')
                        : 'DIF在零轴下方，中期空头市场，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易员主要关注 DMA 指标在零轴上的运行时间。只要 DMA 的 DIF 线维持在零轴上方，就认为整体趋势偏多，可作为长线持仓的辅助依据。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.dma.dif > 0
                        ? 'DIF(' + formatNumber(volume.dma.dif, 4) + ')在零轴上方，长期趋势偏多，可作为长线持仓依据。'
                        : 'DIF在零轴下方，长期趋势偏弱。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {volume.lon && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">7. LON（钱龙长线指标）</h3>
                <p className="text-xs text-slate-500 mb-3">Long-term Oscillator | 参数: (300, 10)</p>
                <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center">
                  <span className="text-xs font-bold text-slate-600">LON</span>
                  <div className={`text-3xl font-black mt-2 ${volume.lon.lon > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(volume.lon.lon, 4)}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {volume.lon.lon > 0 ? '多头趋势' : '空头趋势'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      LON = {formatNumber(volume.lon.lon, 4)}。
                      {volume.lon.lon > 0 ? 'LON大于0，长线多头趋势明确。' : 'LON小于0，长线空头趋势明确。'}
                      LON是长线操作的重要参考指标。
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>短期交易员不常用LON指标，因为其参数设置决定了它的滞后性。但若LON线在短期内急剧上升并上穿LONMA线，可视为短线爆发信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.lon.lon > 0
                        ? 'LON(' + formatNumber(volume.lon.lon, 4) + ')大于0，长线多头趋势。短线可结合其他指标操作。'
                        : 'LON小于0，长线空头趋势。短线应谨慎。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>当LON线在0轴上方形成金叉，且LONMA线同步向上，是中期买入信号。若LON线在0轴上方形成死叉，且LONMA线同步向下，是中期卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.lon.lon > 0
                        ? 'LON(' + formatNumber(volume.lon.lon, 4) + ')在0轴上方，中期多头趋势。'
                        : 'LON在0轴下方，中期空头趋势，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者将LON视为长线趋势的确认工具。当LON线从下向上穿过LONMA线，且两者均为正值，为长线买入信号，预示着主升浪的开启。只要LON线保持向上的斜率，无论短期价格如何回调，长线交易员都会坚定持有。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.lon.lon > 0
                        ? 'LON(' + formatNumber(volume.lon.lon, 4) + ')大于0，长线多头趋势明确。只要LON保持向上斜率，可坚定持有。'
                        : 'LON小于0，长线空头趋势，暂不适合长线建仓。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h2 className="text-sm font-black text-slate-700 mb-4">风险提示</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              以上指标的计算逻辑和业务解释仅供技术分析参考。技术指标反映的是历史数据和统计规律，不能作为对未来走势的绝对预测。股市有风险，投资需谨慎，请结合自身判断进行决策。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
