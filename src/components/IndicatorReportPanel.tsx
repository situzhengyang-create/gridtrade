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

interface SlidingCardProps {
  children: React.ReactNode[];
}

const SlidingCards: React.FC<SlidingCardProps> = ({ children }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const slideTo = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.scrollWidth / children.length;
      scrollRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.scrollWidth / children.length;
      const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, children.length - 1)));
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[calc(100%-1rem)] snap-center"
          >
            {child}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => slideTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-indigo-600 w-6'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

type AccordionItemId = 'trend' | 'oscillator' | 'volume';

interface AccordionItemProps {
  id: AccordionItemId;
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-black text-slate-800 flex items-center gap-3">
          <span>{icon}</span>
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function IndicatorReportPanel({ report, onBack, onPrev, onNext, hasPrev, hasNext, currentIndex, totalCount }: IndicatorReportPanelProps) {
  const { trend, oscillator, volume } = report;
  const [openAccordion, setOpenAccordion] = React.useState<AccordionItemId>('trend');

  const handleAccordionToggle = (id: AccordionItemId) => {
    setOpenAccordion(openAccordion === id ? '' : id);
  };

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

          <AccordionItem
            id="trend"
            title="二、趋势类指标分析"
            icon="📈"
            isOpen={openAccordion === 'trend'}
            onToggle={() => handleAccordionToggle('trend')}
          >
            <div className="pt-2">
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>紧盯分时或日线级别的价格与MACD的顶背离（价格新高，MACD红柱未新高）或底背离，以及DIFF快线在零轴附近的反复穿越（金叉/死叉）作为短线高抛低吸的核心依据。短期交易员使用(6, 13, 5)参数组合，对价格变化更敏感。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif > trend.macd.dea 
                        ? '【买入信号】当前DIF(' + formatNumber(trend.macd.dif) + ')在零轴上方且上穿DEA(' + formatNumber(trend.macd.dea) + ')，形成金叉，短线可积极做多，目标位看前期高点。'
                        : trend.macd.dif < 0 && trend.macd.dea < 0 && trend.macd.dif < trend.macd.dea
                          ? '【卖出信号】当前DIF在零轴下方且下穿DEA，形成死叉，短线应回避，等待底背离信号出现再考虑进场。'
                          : trend.macd.histogram > 0 && trend.macd.histogram > 0.01
                            ? '【持有信号】当前MACD红柱持续放大，上涨动能增强，短线可继续持有，关注量能变化。'
                            : trend.macd.histogram < 0 && Math.abs(trend.macd.histogram) > 0.01
                              ? '【离场信号】当前MACD绿柱持续放大，下跌动能增强，短线应减仓或离场。'
                              : '【观望信号】当前MACD处于震荡状态，DIF与DEA缠绕，短线宜观望或在区间内高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>观察MACD柱状体（能量柱）的长度变化。红柱持续放大代表多头动能强劲；红柱开始缩短（顶背离预警），即使价格仍在上涨，也提示风险。关注"空中加油"形态：股价拉升后回调，MACD在零轴上方形成二次金叉，视为洗盘结束，开启第二波波段行情。中期交易员使用标准(12, 26, 9)参数组合。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif > trend.macd.dea && trend.macd.histogram > 0
                        ? '【多头确立】MACD双线均在零轴上方，中期多头格局确立，能量柱持续放大，多头动能充足。建议坚定持有，波段目标位可看前期高点或布林带上轨。'
                        : trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif < trend.macd.dea
                          ? '【回调预警】MACD双线仍在零轴上方但出现死叉，能量柱由红转绿，中期有回调风险。建议减仓至半仓，等待二次金叉信号确认。'
                          : trend.macd.dif < 0 && trend.macd.dea < 0
                            ? '【空头格局】MACD双线均在零轴下方，中期空头格局明确。建议保持轻仓或空仓观望，等待有效金叉信号且双线回到零轴上方再考虑进场。'
                            : trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.histogram < 0
                              ? '【背离预警】MACD双线在零轴上方但绿柱出现，警惕顶背离风险，建议逐步减仓保护利润。'
                              : '【方向不明】MACD指标处于零轴附近，方向不明朗，建议等待明确的突破信号再行动，可结合量能指标确认。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>要求日线、周线级别的MACD均在零轴上方运行（多头市场）。只要DIFF线和DEA线不死叉，就长期持有，忽略中间的微小波动。只有当DIFF线从下向上放量突破DEA线，且两者均在零轴之上时，才视为长线建仓的确认信号。长期交易员使用(24, 52, 18)参数组合，更平滑稳定。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif > trend.macd.dea
                        ? '【长线持仓】当前MACD处于多头排列且双线均在零轴上方，符合长线持仓条件。DIF(' + formatNumber(trend.macd.dif) + ')持续在DEA(' + formatNumber(trend.macd.dea) + ')之上运行，可坚定持有，忽略短期波动。'
                        : trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif < trend.macd.dea
                          ? '【长线减仓】MACD双线仍在零轴上方但出现死叉，长期趋势有转弱迹象。建议减仓至三分之一仓位，等待重新金叉信号确认后再补仓。'
                          : trend.macd.dif < 0 && trend.macd.dea < 0
                            ? '【长线观望】MACD双线均在零轴下方，长期空头趋势明确。暂不适合长线建仓，建议继续观察，等待双线回到零轴上方且形成金叉再考虑。'
                            : '【等待确认】当前MACD状态不符合长线建仓条件，建议继续观察，等待明确的多头信号（双线在零轴上方形成金叉）。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>判断市场趋势的方向、强度以及趋势是否确立，特别擅长识别盘整与趋势行情。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的最高价（High）、最低价（Low）、收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(14, 6)，即计算周期14日，ADX平滑周期6日。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 计算真实波幅（TR）：</span>
                          <span>TR = MAX(当日最高价-当日最低价, |当日最高价-前日收盘价|, |当日最低价-前日收盘价|)</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 计算方向线（+DM与-DM）：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ +DM = 当日最高价 - 前日最高价（若结果≤0，则+DM=0）</div>
                            <div>▫ -DM = 前日最低价 - 当日最低价（若结果≤0，则-DM=0）</div>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">3. 平滑处理：</span>
                          <span>分别对TR、+DM、-DM进行14日平滑移动平均，得到ATR、+DI14、-DI14。</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">4. 计算趋向指标（DI）：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ +DI = (+DI14 / ATR) × 100</div>
                            <div>▫ -DI = (-DI14 / ATR) × 100</div>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">5. 计算趋向平均值（ADX）：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ 先计算动向值DX：DX = |(+DI) - (-DI)| / ((+DI) + (-DI)) × 100</div>
                            <div>▫ 再对DX进行6日平滑移动平均，得到ADX。</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>短期交易员关注ADX极值反转和+DI/-DI交叉。当ADX低于20且走平时，市场处于震荡期，应高抛低吸。使用(7, 3)参数组合，更灵敏捕捉短期趋势变化。+DI上穿-DI形成金叉且ADX抬头时进场。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx < 20
                        ? '【震荡信号】ADX(' + formatNumber(trend.dmi.adx, 1) + ')低于20，市场处于无趋势震荡期，短线宜在支撑压力位之间高抛低吸，不宜追涨杀跌。'
                        : trend.dmi.plus_di > trend.dmi.minus_di && trend.dmi.adx > 20
                          ? '【买入信号】+DI(' + formatNumber(trend.dmi.plus_di, 1) + ')上穿-DI(' + formatNumber(trend.dmi.minus_di, 1) + ')形成金叉，ADX抬头，短线可积极做多。'
                          : trend.dmi.minus_di > trend.dmi.plus_di && trend.dmi.adx > 20
                            ? '【卖出信号】-DI上穿+DI形成死叉，短线应卖出回避，等待下一次金叉机会。'
                            : '【观望信号】DMI指标尚无明确信号，短线观望为宜，等待趋势明朗。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段要求ADX大于25表明趋势形成。使用标准(14, 6)参数。若ADX从高位回落至50以下，提示波段行情可能进入尾声。在上涨波段中，-DI在价格回踩时提供支撑；若-DI拐头向上且下穿+DI，波段结束。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx > 25 && trend.dmi.adx < 50 && trend.dmi.plus_di > trend.dmi.minus_di
                        ? '【多头确立】ADX(' + formatNumber(trend.dmi.adx, 1) + ')在25-50区间，+DI在-DI之上，中期多头趋势确立。建议坚定持有，波段目标看前期高点。'
                        : trend.dmi.adx > 25 && trend.dmi.adx < 50 && trend.dmi.minus_di > trend.dmi.plus_di
                          ? '【空头确立】ADX在25-50区间，-DI在+DI之上，中期空头趋势确立。建议减仓，等待趋势反转信号。'
                        : trend.dmi.adx > 50
                          ? '【趋势尾声】ADX超过50，趋势强度达到极值，需密切关注是否出现拐头向下，警惕波段行情进入尾声。'
                          : '【等待趋势】ADX低于25，中期趋势不明朗，建议等待趋势明确后再进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者只在ADX持续大于25的市场环境中操作。使用(28, 12)参数组合，更平滑反映长期趋势。若ADX突破40后开始掉头向下，意味着长达数月的单边趋势可能面临终结，需考虑战略性减仓。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx > 25 && trend.dmi.adx < 40 && trend.dmi.plus_di > trend.dmi.minus_di
                        ? '【长线持仓】ADX(' + formatNumber(trend.dmi.adx, 1) + ')在25-40区间，+DI持续在-DI之上，长期趋势健康。可坚定持有，忽略短期波动。'
                        : trend.dmi.adx > 40
                          ? '【长线预警】ADX超过40，趋势强度达到极值，需密切关注是否出现拐头向下迹象，准备战略性减仓。'
                          : trend.dmi.adx < 25
                            ? '【观望等待】ADX低于25，市场缺乏明确趋势，不适合长线建仓，等待趋势明朗。'
                            : '【趋势转弱】ADX在高位但+DI下穿-DI，长期趋势有转弱迹象，建议减仓保护利润。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>基于股价的标准差构建动态的上下轨道，衡量价格波动的范围，辅助判断超买超卖及突破行情。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(20, 2)，即中轨周期20日，标准差倍数2。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 计算中轨（MB）：</span>
                          <span>计算收盘价的20日简单移动平均线（SMA）。MB = MA(CLOSE, 20)</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 计算标准差（MD）：</span>
                          <span>计算这20日收盘价相对于中轨的标准差。MD = STD(CLOSE, 20)</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">3. 计算上轨（UP）与下轨（DN）：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ 上轨：UP = MB + 2 × MD</div>
                            <div>▫ 下轨：DN = MB - 2 × MD</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>利用布林带的"回归"特性。使用(10, 2)参数组合，更灵敏捕捉短期波动。价格触及上轨且张口不继续扩大时卖出；触及下轨且收出下影线时买入。布林带收口预示变盘在即，停止开新仓等待方向选择。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.boll.width < 10
                        ? '【观望信号】布林带宽仅' + formatNumber(trend.boll.width, 1) + '%，处于窄幅收口状态，变盘在即。短线应停止开新仓，等待明确方向选择后再操作。'
                        : report.latestPrice > trend.boll.upper_band
                          ? '【卖出信号】价格突破上轨 ¥' + formatNumber(trend.boll.upper_band, 2) + '，短线超买，不宜追高，准备止盈。'
                          : report.latestPrice < trend.boll.lower_band
                            ? '【买入信号】价格跌破下轨 ¥' + formatNumber(trend.boll.lower_band, 2) + '，短线超卖，可轻仓介入抢反弹。'
                            : report.latestPrice > trend.boll.middle_band
                              ? '【持有信号】价格在中轨之上，短线偏多，可沿趋势操作。'
                              : '【观望信号】价格在中轨之下，短线偏弱，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(20, 2)参数组合。中期趋势以布林带中轨为核心防线，收盘价不有效跌破中轨则持仓不变。布林带喇叭口张开且价格沿上轨或下轨运行，是主升浪或主跌浪信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.boll.middle_band && trend.boll.width > 10
                        ? '【多头确立】价格在中轨 ¥' + formatNumber(trend.boll.middle_band, 2) + '之上，布林带开口正常，中期多头格局保持，可坚定持有。'
                        : report.latestPrice < trend.boll.middle_band
                          ? '【趋势转弱】价格跌破中轨，中期趋势转弱，建议减仓至半仓，等待反抽确认。'
                          : '【等待突破】布林带收口，中期方向不明，等待有效突破后再进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(50, 2)参数组合，切换到周线级别观察。月线级别价格站稳上轨代表超级牛市；跌破下轨代表历史性大底或大熊市确立。关注长期布林带的支撑与压力作用。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.boll.middle_band
                        ? '【长线偏多】价格在中轨之上，长期趋势偏多。若周线级别也站稳中轨上方，长线可逐步建仓。'
                        : report.latestPrice < trend.boll.lower_band
                          ? '【长线机会】价格跌破下轨 ¥' + formatNumber(trend.boll.lower_band, 2) + '，长期超卖，关注是否形成历史性底部。'
                          : report.latestPrice < trend.boll.middle_band
                            ? '【长线观望】价格在中轨之下，长期趋势偏弱，等待周线级别出现明确底部形态再布局。'
                            : '【等待确认】价格贴近中轨，长期方向不明，继续观察。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>侧重反映中短期的价格趋势，比普通均线对价格变化更敏感，能更快响应趋势变化。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(12, 50)，即短期周期12日，长期周期50日。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 计算短期EXPMA（EXP1）：</span>
                          <span>EXP1 = 前一日EXP1 × (12-1)/(12+1) + 今日收盘价 × 2/(12+1)</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 计算长期EXPMA（EXP2）：</span>
                          <span>EXP2 = 前一日EXP2 × (50-1)/(50+1) + 今日收盘价 × 2/(50+1)</span>
                        </div>
                        <div className="text-slate-500">注：首日的EXPMA可用简单移动平均（SMA）代替。</div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(6, 12)参数组合，关注EXP1与EXP2在分时图上的频繁缠绕。两条均线反复交叉代表短期方向不明，应观望。若价格急跌后迅速拉回并站上EXP1，视为短线诱空结束，可轻仓跟进。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.expma.exp1 > trend.expma.exp2 && report.latestPrice > trend.expma.exp1
                        ? '【买入信号】EXP12(' + formatNumber(trend.expma.exp1, 2) + ')在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')之上，且价格站稳EXP12，短线可积极做多。'
                        : trend.expma.exp1 < trend.expma.exp2 && report.latestPrice < trend.expma.exp1
                          ? '【卖出信号】EXP12在EXP50之下，且价格跌破EXP12，短线应回避。'
                          : '【观望信号】EXPMA均线系统方向不明，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(12, 50)参数组合。严格等待短期EXPMA上穿长期EXPMA形成"黄金交叉"作为波段起点；下穿则为波段终点。当股价大幅偏离短期EXPMA线，预期会回归均线，此时是减仓时机而非追涨。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.expma.exp1 > trend.expma.exp2 && report.latestPrice > trend.expma.exp1
                        ? '【多头确立】EXP12上穿EXP50形成金叉，中期多头趋势确立。当前EXP12(' + formatNumber(trend.expma.exp1, 2) + ')持续在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')之上，可持仓。'
                        : trend.expma.exp1 > trend.expma.exp2 && report.latestPrice < trend.expma.exp1
                          ? '【回调预警】EXPMA多头排列但价格跌破短期线，警惕回调风险，减仓观望。'
                          : '【等待信号】EXP12在EXP50之下，中期趋势偏弱，等待EXP12重新上穿EXP50再进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(50, 120)参数组合，将长期EXPMA视为市场的平均持仓成本。只要价格维持在长期EXPMA上方运行，就认为长期上升趋势未改。关注周线级别的EXPMA交叉。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.expma.exp2
                        ? '【长线持仓】价格 ¥' + report.latestPrice.toFixed(2) + '在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')之上，长期成本线支撑有效，长线可继续持有。'
                        : '【长线减仓】价格跌破EXP50长期成本线，长线趋势转弱，建议减仓或离场。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>由上轨、中轨和下轨组成，常用于判断股价的波动区间和趋势转折。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(25, 6%, 6%)，即中轨周期25日，上轨偏移6%，下轨偏移6%。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 计算中轨（MIDDLE）：</span>
                          <span>计算收盘价的25日简单移动平均线（SMA）。</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 计算上轨（UPPER）与下轨（LOWER）：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ 上轨：UPPER = 中轨 × (1 + 6%)</div>
                            <div>▫ 下轨：LOWER = 中轨 × (1 - 6%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(10, 4%, 4%)参数组合。当价格触及ENE上轨且轨道向上倾斜时持有；轨道走平且价格触及上轨时卖出。价格跌破下轨且轨道向下倾斜时回避。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.upper
                        ? '【卖出信号】价格突破上轨 ¥' + formatNumber(trend.ene.upper, 2) + '，短线超买，建议卖出或减仓。'
                        : report.latestPrice < trend.ene.lower
                          ? '【买入信号】价格跌破下轨 ¥' + formatNumber(trend.ene.lower, 2) + '，短线超卖，可尝试轻仓抄底。'
                          : report.latestPrice > trend.ene.middle
                            ? '【持有信号】价格在中轨之上，短线偏多，可沿趋势方向操作。'
                            : '【观望信号】价格在中轨之下，短线偏弱，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(25, 6%, 6%)参数组合。中期波段要求ENE轨道有明确的倾斜方向。上涨波段中价格沿上轨运行，回调到下轨获得支撑。轨道由向上转为走平且价格跌破中轨，波段结束。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.middle && report.latestPrice < trend.ene.upper
                        ? '【多头确立】价格在中轨 ¥' + formatNumber(trend.ene.middle, 2) + '之上，中期多头格局保持。若回踩下轨 ¥' + formatNumber(trend.ene.lower, 2) + '获得支撑，可加仓。'
                        : report.latestPrice < trend.ene.middle
                          ? '【趋势转弱】价格跌破中轨，中期趋势转弱，建议减仓至半仓。'
                          : '【超买预警】价格触及上轨，警惕回落风险。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(50, 8%, 8%)参数组合，观察周线级别。长期牛市中ENE轨道稳定向上开口，价格很少跌破中轨。轨道开口向下且价格跌破下轨，代表长期趋势逆转。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.middle
                        ? '【长线持仓】价格在中轨之上，长期趋势偏多。只要不有效跌破中轨，长线可继续持有。'
                        : report.latestPrice < trend.ene.lower
                          ? '【长线预警】价格跌破下轨，长期趋势转弱明显，建议重新评估持仓策略。'
                          : '【观望等待】价格跌破中轨，长期趋势转弱，等待趋势确认后再操作。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>综合多条不同周期的移动平均线平均值，作为市场多空力量的分界线。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(3, 6, 12, 24)，即计算3日、6日、12日、24日四条均线的平均值。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 分别计算收盘价的移动平均线：</span>
                          <div className="mt-1 pl-4 space-y-1">
                            <div>▫ MA3 = 收盘价的3日简单移动平均</div>
                            <div>▫ MA6 = 收盘价的6日简单移动平均</div>
                            <div>▫ MA12 = 收盘价的12日简单移动平均</div>
                            <div>▫ MA24 = 收盘价的24日简单移动平均</div>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 计算BBI值：</span>
                          <span>BBI = (MA3 + MA6 + MA12 + MA24) / 4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(2, 4, 8, 16)参数组合。当价格大幅高于BBI线时警惕回调风险；大幅低于BBI线时关注反弹机会。BBI线由跌转涨且价格站上BBI线，是短线买入信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '【买入信号】价格 ¥' + report.latestPrice.toFixed(2) + '在BBI(' + formatNumber(trend.bbi.bbi, 2) + ')之上，短线多头信号，可入场。'
                        : '【观望信号】价格在BBI之下，短线空头信号，等待价格站上BBI再进场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(3, 6, 12, 24)参数组合。中期波段以BBI线为多空分界线，价格不跌破BBI线则趋势向好。价格有效跌破BBI线且BBI线拐头向下，波段结束。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '【多头确立】价格在BBI之上，中期多头格局保持。可继续持有，以BBI(' + formatNumber(trend.bbi.bbi, 2) + ')为止损位。'
                        : '【趋势转弱】价格跌破BBI，中期趋势转弱，建议减仓或离场。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(6, 12, 24, 48)参数组合。长期牛市中价格始终运行在BBI线上方。价格跌破BBI线且BBI线向下弯曲，代表长期多空力量转变。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '【长线持仓】价格在BBI之上，长期多头趋势保持。只要BBI线不向下弯曲，长线可坚定持有。'
                        : '【长线预警】价格跌破BBI，长期多空力量发生转变，建议重新评估长线持仓策略。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>通过三次指数平滑处理收盘价，过滤掉短期股价波动，精准捕捉股价的长期运行趋势。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(12, 9)，即TRIX计算周期12日，MATRIX平滑周期9日。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 第一次指数平滑：</span>
                          <span>计算收盘价的12日指数移动平均线（EMA12）</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 第二次指数平滑：</span>
                          <span>对第一次平滑结果再进行12日EMA</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">3. 第三次指数平滑：</span>
                          <span>对第二次平滑结果再进行12日EMA</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">4. 计算TRIX：</span>
                          <span>TRIX = (第三次EMA - 前一日第三次EMA) / 前一日第三次EMA × 100</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">5. 计算MATRIX：</span>
                          <span>对TRIX进行9日指数平滑移动平均</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>短期交易员极少使用TRIX，因其极度滞后。若TRIX在极低位置突然抬头，可作为长期底部可能形成的预警，但不作为短线入场依据。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix < -1 && trend.trix.trix > trend.trix.matrix
                        ? '【预警信号】TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在低位开始抬头，可能预示长期底部正在形成，但不作为短线入场信号。'
                        : '【参考有限】TRIX为长线指标，短期交易参考价值有限，建议结合其他短线指标操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(12, 9)参数组合。关注TRIX在零轴附近的金叉或死叉。TRIX上穿零轴且趋势向上视为中期多头确立；下穿零轴则视为中期走弱。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix > 0 && trend.trix.trix > trend.trix.matrix
                        ? '【多头确立】TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在零轴上方且形成金叉，中期多头确立。'
                        : trend.trix.trix < 0 && trend.trix.trix < trend.trix.matrix
                          ? '【趋势走弱】TRIX在零轴下方且形成死叉，中期趋势走弱。'
                          : '【等待确认】TRIX信号不明确，建议结合其他指标综合判断。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(24, 18)参数组合，将TRIX视为长线持仓的风向标。TRIX线保持向上斜率且维持在零轴上方则坚定持有。TRIX在高位掉头向下预示长线行情可能终结。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix > 0 && trend.trix.trix > trend.trix.matrix
                        ? '【长线持仓】TRIX保持在零轴上方且呈多头排列，长线持仓信号明确。只要TRIX不跌破零轴，可坚定持有。'
                        : trend.trix.trix > 0 && trend.trix.trix < trend.trix.matrix
                          ? '【长线预警】TRIX在零轴上方但出现死叉，需警惕长线趋势可能转弱，建议减仓观望。'
                          : '【观望等待】TRIX在零轴下方，长线趋势偏弱，暂不适合长线建仓。'
                      }
                    </p>
                  </div>
                </SlidingCards>
              </div>
            )}
            </div>
          </AccordionItem>

          <AccordionItem
            id="oscillator"
            title="三、摆动类指标分析"
            icon="📊"
            isOpen={openAccordion === 'oscillator'}
            onToggle={() => handleAccordionToggle('oscillator')}
          >
            <div className="pt-2">
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
                <CollapsibleSection title="指标详解（业务目标、参数与计算逻辑）">
                  <div className="text-xs text-slate-600 space-y-3">
                    <div>
                      <span className="font-bold text-slate-700">• 业务目标：</span>
                      <span>衡量股价在近期价格区间中的相对位置，判断超买超卖状态，辅助捕捉价格反转信号。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 输入数据：</span>
                      <span>连续N日的最高价（High）、最低价（Low）、收盘价（Close）。</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">• 默认参数：</span>
                      <span>(9, 3, 3)，即计算周期9日，K值平滑周期3日，D值平滑周期3日。</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700">• 核心计算逻辑：</span>
                      <div className="mt-2 space-y-2 pl-4">
                        <div>
                          <span className="font-bold text-slate-700">1. 计算未成熟随机值（RSV）：</span>
                          <span>RSV = (当日收盘价 - 9日内最低价) / (9日内最高价 - 9日内最低价) × 100</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">2. 计算K值：</span>
                          <span>K = 前一日K × 2/3 + 今日RSV × 1/3</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">3. 计算D值：</span>
                          <span>D = 前一日D × 2/3 + 今日K × 1/3</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">4. 计算J值：</span>
                          <span>J = 3 × K - 2 × D</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(5, 3, 3)参数组合，关注J值极值。J值超过100为严重超买，低于0为严重超卖。K线与D线在20以下形成金叉是强烈买入信号；在80以上形成死叉是卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.j > 100
                        ? '【卖出信号】J值(' + formatNumber(oscillator.kdj.j, 1) + ')超过100，严重超买，短线应卖出。'
                        : oscillator.kdj.j < 0
                          ? '【买入信号】J值(' + formatNumber(oscillator.kdj.j, 1) + ')低于0，严重超卖，短线可买入。'
                          : oscillator.kdj.k > oscillator.kdj.d && oscillator.kdj.k < 30
                            ? '【买入信号】KDJ在低位(' + formatNumber(oscillator.kdj.k, 1) + ')形成金叉，短线买入信号。'
                            : oscillator.kdj.k < oscillator.kdj.d && oscillator.kdj.k > 70
                              ? '【卖出信号】KDJ在高位(' + formatNumber(oscillator.kdj.k, 1) + ')形成死叉，短线卖出信号。'
                              : '【观望信号】KDJ指标无明确短线信号，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(9, 3, 3)参数组合。极强单边行情中KDJ会在高位或低位长时间钝化。中期交易员不会因短暂死叉下车，等待K线跌破20或突破80后的有效发散。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.k > 80 && oscillator.kdj.k > oscillator.kdj.d
                        ? '【预警信号】KDJ在高位(' + formatNumber(oscillator.kdj.k, 1) + ')形成金叉，可能是高位钝化，需结合趋势判断是否持股。'
                        : oscillator.kdj.k < 20 && oscillator.kdj.k < oscillator.kdj.d
                          ? '【预警信号】KDJ在低位(' + formatNumber(oscillator.kdj.k, 1) + ')形成死叉，可能是低位钝化，等待反转信号。'
                          : oscillator.kdj.k > oscillator.kdj.d && oscillator.kdj.k > 50
                            ? '【持有信号】KDJ处于正常区间且金叉，中期可继续持有。'
                            : '【观望信号】KDJ信号不明确，建议结合其他指标。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(18, 3, 3)参数组合，关注KDJ在20以下的低位徘徊时间。KDJ在低位形成W底或多重底且伴随成交量温和放大，是长线资金吸筹信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.k < 30 && oscillator.kdj.d < 30
                        ? '【长线机会】KDJ处于低位区域(K=' + formatNumber(oscillator.kdj.k, 1) + ', D=' + formatNumber(oscillator.kdj.d, 1) + ')，可能是长线资金吸筹阶段，可关注。'
                        : oscillator.kdj.k > 70 && oscillator.kdj.d > 70
                          ? '【长线预警】KDJ处于高位区域，长期风险较大，建议逐步减仓。'
                          : '【观望等待】KDJ处于中间区域，长线趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(5, 3)参数组合。SKDJ产生的金叉死叉信号比KDJ少，减少假信号。通常观察KDJ寻找激进短线切入点，SKDJ用于确认趋势方向是否健康。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k < 20 && oscillator.skdj.slow_k > oscillator.skdj.slow_d
                        ? '【买入信号】SKDJ在低位(' + formatNumber(oscillator.skdj.slow_k, 1) + ')形成金叉，短线可尝试买入。'
                        : oscillator.skdj.slow_k > 80 && oscillator.skdj.slow_k < oscillator.skdj.slow_d
                          ? '【卖出信号】SKDJ在高位(' + formatNumber(oscillator.skdj.slow_k, 1) + ')形成死叉，短线应卖出。'
                          : '【观望信号】SKDJ信号不明确，建议结合KDJ综合判断。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(9, 3)参数组合。看重SKDJ在50中轴线的穿越，从下方金叉50视为中期多头开始；从上方死叉50视为中期空头开始。SKDJ更平滑，中期信号误报率更低。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k > 50 && oscillator.skdj.slow_k > oscillator.skdj.slow_d
                        ? '【多头确立】SKDJ(' + formatNumber(oscillator.skdj.slow_k, 1) + ')在50之上且形成金叉，中期多头格局确立。'
                        : oscillator.skdj.slow_k < 50 && oscillator.skdj.slow_k < oscillator.skdj.slow_d
                          ? '【空头格局】SKDJ在50之下且形成死叉，中期空头格局。'
                          : '【观望信号】SKDJ围绕50中轴线波动，中期方向不明。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(18, 3)参数组合，将SKDJ视为趋势确认辅助工具。股价长期上涨而SKDJ在高位形成双顶或头肩顶，视为长期趋势衰竭信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k > 70 && oscillator.skdj.slow_d > 70
                        ? '【长线预警】SKDJ处于高位区域(' + formatNumber(oscillator.skdj.slow_k, 1) + ')，需警惕长期趋势衰竭风险。'
                        : oscillator.skdj.slow_k < 30 && oscillator.skdj.slow_d < 30
                          ? '【长线机会】SKDJ处于低位区域，可能是长线建仓机会，建议结合成交量确认。'
                          : '【观望等待】SKDJ处于中间区域，长期趋势需结合其他指标综合判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用6日RSI，观察20-80区间的波动。RSI低于20买入，高于80卖出。重点关注RSI与价格的顶背离（价格新高，RSI未新高），这是短线见顶的强烈信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.rsi.rsi6 > 80
                        ? '【卖出信号】RSI6(' + formatNumber(oscillator.rsi.rsi6, 1) + ')超过80，严重超买，短线应卖出。'
                        : oscillator.rsi.rsi6 < 20
                          ? '【买入信号】RSI6(' + formatNumber(oscillator.rsi.rsi6, 1) + ')低于20，严重超卖，短线可买入。'
                          : oscillator.rsi.rsi6 > 50
                            ? '【持有信号】RSI6处于正常区间且偏多，短线可继续持有。'
                            : '【观望信号】RSI6处于正常区间但偏弱，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用12日RSI，看重RSI与价格的同步性。RSI未能创出新高而价格新高，视为中期多头力量衰竭的预警。RSI在50上方为多头市场，下方为空头市场。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.rsi.rsi12 > 50 && oscillator.rsi.rsi12 < 70
                        ? '【多头确立】RSI12(' + formatNumber(oscillator.rsi.rsi12, 1) + ')在50之上，中期多头市场，可持仓。'
                        : oscillator.rsi.rsi12 > 70
                          ? '【预警信号】RSI12超过70进入超买区，警惕中期回调风险。'
                          : '【空头格局】RSI12(' + formatNumber(oscillator.rsi.rsi12, 1) + ')在50之下，中期空头市场，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用24日RSI判断大级别的市场情绪。RSI在50以上运行视为长期多头市场；在50以下视为长期空头市场。长期底背离是重要的底部信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.rsi.rsi24 > 50
                        ? '【长线持仓】RSI24(' + formatNumber(oscillator.rsi.rsi24, 1) + ')在50之上，长期多头市场，可坚定持有。'
                        : '【观望等待】RSI24(' + formatNumber(oscillator.rsi.rsi24, 1) + ')在50之下，长期空头市场，暂不适合长线建仓。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用7日CCI。CCI在+100至-100之间为常态分布区。CCI从+100上方跌破+100时卖出，从-100下方突破-100时买入。CCI达到+300或-300极端值时密切关注，一旦拐头立即反向操作。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.cci.cci > 300
                        ? '【卖出信号】CCI(' + formatNumber(oscillator.cci.cci, 1) + ')达到极端超买区（>300），随时可能拐头回落，短线应卖出。'
                        : oscillator.cci.cci < -300
                          ? '【买入信号】CCI(' + formatNumber(oscillator.cci.cci, 1) + ')达到极端超卖区（<-300），随时可能反弹，短线可买入。'
                          : oscillator.cci.cci > 100
                            ? '【预警信号】CCI在超买区，短线强势但有回调风险。'
                            : oscillator.cci.cci < -100
                              ? '【买入信号】CCI在超卖区，短线弱势但有反弹机会，可轻仓介入。'
                              : '【观望信号】CCI在常态区间，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准14日CCI。看重CCI突破±100的有效性，连续两日站稳+100上方才确认中期多头趋势。股价创出新低但CCI未创新低（底背离），是中期波段抄底的强有力信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.cci.cci > 100
                        ? '【多头确立】CCI(' + formatNumber(oscillator.cci.cci, 1) + ')突破+100，中期多头趋势确认。'
                        : oscillator.cci.cci < -100
                          ? '【空头格局】CCI(' + formatNumber(oscillator.cci.cci, 1) + ')跌破-100，中期空头趋势确认，建议减仓。'
                          : '【等待突破】CCI在常态区间，中期方向不明，等待突破。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用28日CCI。关注CCI在-200至-300区域的极端低值，出现长下影线并迅速拉回往往是长期底部形成的信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.cci.cci < -200
                        ? '【长线机会】CCI(' + formatNumber(oscillator.cci.cci, 1) + ')处于极端超卖区（<-200），可能是长期底部信号，可关注。'
                        : oscillator.cci.cci > 200
                          ? '【长线预警】CCI处于极端超买区，长期风险较大，建议谨慎。'
                          : '【观望等待】CCI处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用5日WR。WR高于-20视为超买，低于-80视为超卖。WR低于-80时买入，高于-20时卖出。WR触及-100后迅速掉头向上是短线强烈买入信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.wr.wr10 > -20
                        ? '【卖出信号】WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)高于-20，超买状态，短线应卖出。'
                        : oscillator.wr.wr10 < -80
                          ? '【买入信号】WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)低于-80，超卖状态，短线可买入。'
                          : '【观望信号】WR在正常区间，短线观望或高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准10日WR。中期趋势中WR在-20至-80之间波动，主要关注WR在-50中轴线的得失。WR有效突破-50（向上）视为中期多头增强。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.wr.wr10 > -50
                        ? '【多头确立】WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)在-50之上，中期多头力量较强。'
                        : '【空头格局】WR(' + formatNumber(oscillator.wr.wr10, 1) + '%)在-50之下，中期空头力量较强。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用20日WR。长期大牛市中WR会长期处于-20以上的超买钝化区，视为强势特征。WR突破-20后出现明显顶部形态才考虑卖出。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.wr.wr10 > -20
                        ? '【长线预警】WR处于超买区，若处于长期牛市中是强势特征，但需结合趋势判断是否见顶。'
                        : '【观望等待】WR处于正常或超卖区，长期趋势需结合其他指标确认。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用5日LWR。逻辑与WR类似但曲线更平滑，在极端值区域（-20/-80）附近，LWR的转向信号更值得信赖，减少假突破。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.lwr.lwr10 > -20
                        ? '【卖出信号】LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)高于-20，超买状态，短线应卖出。'
                        : oscillator.lwr.lwr10 < -80
                          ? '【买入信号】LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)低于-80，超卖状态，短线可买入。'
                          : '【观望信号】LWR在正常区间，短线观望或高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准10日LWR。LWR的波动比WR平缓，更趋向于反映中期趋势。LWR持续在低位徘徊并拐头向上，往往预示中期底部的形成。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.lwr.lwr10 < -60 && oscillator.lwr.lwr10 > -100
                        ? '【买入信号】LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)处于超卖区，若出现拐头向上，可能是中期底部信号。'
                        : oscillator.lwr.lwr10 > -40
                          ? '【持有信号】LWR处于超买或偏强区域，中期可继续观察。'
                          : '【观望信号】LWR处于中间区域，中期方向不明。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用20日LWR。将其作为WR的辅助，用于确认WR发出的长期极端信号。LWR和WR同时在历史低位区域发生金叉，长期底部可靠性更高。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.lwr.lwr10 < -80
                        ? '【长线机会】LWR(' + formatNumber(oscillator.lwr.lwr10, 1) + '%)处于深度超卖区，结合WR指标可确认长期底部信号。'
                        : oscillator.lwr.lwr10 > -20
                          ? '【长线预警】LWR处于超买区，长期需谨慎。'
                          : '【观望等待】LWR处于中间区域，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用6日BIAS。利用乖离率的均值回归特性，BIAS6大于+8%（正乖离过大）时卖出；小于-8%时买入。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.bias.bias6 > 8
                        ? '【卖出信号】BIAS6(' + formatNumber(oscillator.bias.bias6, 1) + '%)超过+8%，正乖离过大，短线应卖出。'
                        : oscillator.bias.bias6 < -8
                          ? '【买入信号】BIAS6(' + formatNumber(oscillator.bias.bias6, 1) + '%)低于-8%，负乖离过大，短线可买入。'
                          : oscillator.bias.bias6 > 0
                            ? '【持有信号】BIAS6处于正常区间且偏多，短线可继续持有。'
                            : '【观望信号】BIAS6处于正常区间但偏弱，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用12日BIAS。中期趋势中BIAS12通常在-5%到+5%之间波动。跌破-5%视为中线买入良机；突破+5%视为中线获利了结点。强势主升浪中BIAS会持续维持在+5%以上。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.bias.bias12 > 5
                        ? '【预警信号】BIAS12(' + formatNumber(oscillator.bias.bias12, 1) + '%)超过+5%，中期可考虑减仓。'
                        : oscillator.bias.bias12 < -5
                          ? '【买入信号】BIAS12(' + formatNumber(oscillator.bias.bias12, 1) + '%)低于-5%，中期可考虑加仓。'
                          : '【持有信号】BIAS12处于正常区间，中期可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用24日BIAS。关注BIAS24在极端负值区域的长期徘徊，股价长期低于均线且基本面未恶化，往往是长线投资的极佳切入点。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.bias.bias24 < -10
                        ? '【长线机会】BIAS24(' + formatNumber(oscillator.bias.bias24, 1) + '%)处于深度负乖离区，若基本面健康，是长线建仓机会。'
                        : oscillator.bias.bias24 > 10
                          ? '【长线预警】BIAS24处于深度正乖离区，长期风险较大。'
                          : '【观望等待】BIAS24处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(6, 3)参数组合。MTM上穿零轴视为短期买入信号；下穿零轴视为短期卖出信号。MTM上穿MTMMA形成金叉是短线买入信号；下穿形成死叉是短线卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.mtm.mtm12 > 0 && oscillator.mtm.mtm12 > oscillator.mtm.mtm_ma6
                        ? '【买入信号】MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')在零轴上方且形成金叉，短线买入信号。'
                        : oscillator.mtm.mtm12 < 0 && oscillator.mtm.mtm12 < oscillator.mtm.mtm_ma6
                          ? '【卖出信号】MTM在零轴下方且形成死叉，短线卖出信号。'
                          : '【观望信号】MTM信号不明确，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(12, 6)参数组合。利用MTM与价格的背离提前预判中期趋势转折。单边上涨行情中MTM会持续在零轴上方运行，MTM不跌破零轴则中期趋势未改变。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.mtm.mtm12 > 0 && oscillator.mtm.mtm12 > oscillator.mtm.mtm_ma6
                        ? '【多头确立】MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')在零轴上方且金叉，中期多头趋势保持。'
                        : oscillator.mtm.mtm12 > 0 && oscillator.mtm.mtm12 < oscillator.mtm.mtm_ma6
                          ? '【预警信号】MTM在零轴上方但死叉，警惕中期回调风险。'
                          : '【空头格局】MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')在零轴下方，中期空头趋势，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(24, 12)参数组合。关注MTM在高位的长期钝化，MTM从高位缓慢回落且股价仍在高位横盘，提示长期动能衰竭，需警惕长期顶部形成。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.mtm.mtm12 > 50
                        ? '【长线预警】MTM(' + formatNumber(oscillator.mtm.mtm12, 4) + ')处于高位区域，需警惕长期动能衰竭风险。'
                        : oscillator.mtm.mtm12 < -50
                          ? '【长线机会】MTM处于低位区域，可能是长线建仓机会。'
                          : '【观望等待】MTM处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
              </div>
            )}
            </div>
          </AccordionItem>

          <AccordionItem
            id="volume"
            title="四、成交量类指标分析"
            icon="💰"
            isOpen={openAccordion === 'volume'}
            onToggle={() => handleAccordionToggle('volume')}
          >
            <div className="pt-2">
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注OBV与股价的背离。股价创新高而OBV未创新高（顶背离）视为短线见顶信号；股价创新低而OBV未创新低（底背离）视为短线见底信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.obv.obv > volume.obv.maobv30
                        ? '【持有信号】OBV在均线之上，量能充足，短线可积极操作。'
                        : '【观望信号】OBV在均线之下，量能不足，短线应谨慎。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>看重OBV与其30日均线的关系。OBV线上穿均线且两者均呈上升态势，确认中期多头趋势。股价突破重要阻力位时OBV同步突破前期高点，突破有效性极高。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.obv.obv > volume.obv.maobv30
                        ? '【多头确立】OBV上穿均线，中期多头趋势确认，可持仓。'
                        : '【趋势转弱】OBV在均线之下，中期趋势偏弱，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>将OBV视为长期资金流向的宏观指标。OBV在长期上升通道中运行代表长期资金持续流入，牛市基础坚实。关注OBV周线级别的走势。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.obv.obv > volume.obv.maobv30
                        ? '【长线持仓】OBV持续在均线之上，长期资金流入，牛市基础坚实，可坚定持有。'
                        : '【长线预警】OBV在均线之下，长期资金流出，需谨慎。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                    {volume.vr.vr > 400 ? '高价区（&gt;400）' : volume.vr.vr < 40 ? '低价区（&lt;40）' : volume.vr.vr < 70 ? '超卖区（&lt;70）' : volume.vr.vr < 160 ? '安全区（70-160）' : '警戒区（160-400）'}
                  </p>
                </div>
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>VR超过350甚至400说明短期买盘过盛，应警惕短期顶部；VR低于40说明短期卖压沉重，可能出现短期底部。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.vr.vr > 400
                        ? '【卖出信号】VR(' + formatNumber(volume.vr.vr, 1) + ')超过400，短期买盘过盛，应警惕短期顶部。'
                        : volume.vr.vr < 40
                          ? '【买入信号】VR(' + formatNumber(volume.vr.vr, 1) + ')低于40，短期卖压沉重，可能出现短期底部。'
                          : '【持有信号】VR处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>看重VR在80-150之间的安全区运行。VR突破160进入获利区应逐步减仓；VR跌破70进入低价区是中期介入的好时机。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.vr.vr > 160
                        ? '【预警信号】VR(' + formatNumber(volume.vr.vr, 1) + ')进入获利区，中期应逐步减仓。'
                        : volume.vr.vr < 70
                          ? '【买入信号】VR(' + formatNumber(volume.vr.vr, 1) + ')进入低价区，是中期介入的好时机。'
                          : '【持有信号】VR在安全区运行，中期可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注VR的长期均线和极端值。VR长期在150上方运行代表长期市场狂热；长期在50下方徘徊代表长期市场低迷，往往是长期底部特征之一。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.vr.vr > 150
                        ? '【长线预警】VR(' + formatNumber(volume.vr.vr, 1) + ')在150上方，长期市场情绪偏热。'
                        : volume.vr.vr < 50
                          ? '【长线机会】VR在50下方，长期市场低迷，可能是长期底部特征。'
                          : '【观望等待】VR处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>AR &gt; 180 或 BR &gt; 400暗示短期行情过热，应反向卖出；AR &lt; 40 或 BR &lt; 40行情将起死回生，应买进。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.brar.br > 400 || volume.brar.ar > 180
                        ? '【卖出信号】BR(' + formatNumber(volume.brar.br, 1) + ')或AR(' + formatNumber(volume.brar.ar, 1) + ')过高，短期行情过热，应卖出。'
                        : volume.brar.br < 40 || volume.brar.ar < 40
                          ? '【买入信号】BR或AR过低，行情将起死回生，应买进。'
                          : '【持有信号】BRAR处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>看重AR和BR的同步性。AR和BR同时向上突破100是中期买入信号；同时掉头向下是中期卖出信号。AR在BR上方为强势。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.brar.ar > 100 && volume.brar.br > 100
                        ? '【多头确立】AR(' + formatNumber(volume.brar.ar, 1) + ')和BR(' + formatNumber(volume.brar.br, 1) + ')均在100之上，中期多头信号。' + (volume.brar.ar > volume.brar.br ? 'AR在BR上方，强势特征。' : '')
                        : '【趋势转弱】AR或BR低于100，中期趋势偏弱。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>关注AR和BR在极端区域的钝化。长期牛市中BR往往长时间维持在300以上，不应轻易言顶，应结合其他指标判断趋势延续性。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.brar.br > 300
                        ? '【长线预警】BR(' + formatNumber(volume.brar.br, 1) + ')超过300，若处于长期牛市中是强势特征，不应轻易言顶。'
                        : '【观望等待】BRAR处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(13, 6)参数组合，CR 值在 75-300 区间波动时视为短期正常区间；若 CR 超过 400，说明短期买盘过盛，应警惕短期顶部。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.cr.cr > 400
                        ? '【卖出信号】CR(' + formatNumber(volume.cr.cr, 1) + ')超过400，短期买盘过盛，应卖出回避。'
                        : volume.cr.cr < 75
                          ? '【买入信号】CR(' + formatNumber(volume.cr.cr, 1) + ')低于75，短期能量偏低，可能反弹，可轻仓介入。'
                          : '【持有信号】CR处于正常区间，短线可继续持有。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(26)参数。看重 CR 与其各条均线（带状）的关系。若 CR 在所有均线上方运行，且均线呈多头排列，是中期强势持股信号。若 CR 连续跌破多条均线，则提示中期调整。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.cr.cr > 100
                        ? '【多头确立】CR(' + formatNumber(volume.cr.cr, 1) + ')在100之上，中期强势特征，可持仓。'
                        : '【趋势转弱】CR(' + formatNumber(volume.cr.cr, 1) + ')在100之下，中期趋势偏弱，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(52)参数，关注 CR 在 30-60 区域的极端低值。若 CR 在此区域企稳并抬头，往往是长期底部形成的信号。CR在低位上穿所有均线是长线启动的重要标志。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.cr.cr < 60
                        ? '【长线机会】CR(' + formatNumber(volume.cr.cr, 1) + ')处于极端低值区（30-60），若企稳抬头，可能是长期底部信号，可关注。'
                        : volume.cr.cr > 150
                          ? '【长线预警】CR(' + formatNumber(volume.cr.cr, 1) + ')处于较高区域，长期风险较大，建议谨慎。'
                          : '【观望等待】CR处于正常区间，长期趋势需结合其他指标判断。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(5, 25, 5)参数组合，紧盯 DIF 线与 AMA 线的交叉。DIF 线上穿 AMA 线形成金叉是短线买入信号；下穿形成死叉是短线卖出信号。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.dma.dif > volume.dma.ama && volume.dma.dif > 0
                        ? '【买入信号】DIF(' + formatNumber(volume.dma.dif, 4) + ')上穿AMA(' + formatNumber(volume.dma.ama, 4) + ')形成金叉，短线买入信号。'
                        : volume.dma.dif < volume.dma.ama && volume.dma.dif < 0
                          ? '【卖出信号】DIF下穿AMA形成死叉，且在零轴下方，短线卖出信号。'
                          : '【观望信号】DMA信号不明确，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(10, 50, 10)参数组合。看重 DMA 指标与价格的背离。若股价创出新高，但 DMA 未能创出新高（顶背离），提示中期上涨动能衰竭，应考虑减仓。DIF在零轴上方运行为中期多头市场。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.dma.dif > 0 && volume.dma.dif > volume.dma.ama
                        ? '【多头确立】DIF(' + formatNumber(volume.dma.dif, 4) + ')在零轴上方且上穿AMA，中期多头市场，可持仓。'
                        : volume.dma.dif > 0 && volume.dma.dif < volume.dma.ama
                          ? '【回调预警】DIF在零轴上方但下穿AMA，警惕中期回调风险。'
                          : '【趋势转弱】DIF(' + formatNumber(volume.dma.dif, 4) + ')在零轴下方，中期空头市场，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用(20, 100, 20)参数组合。主要关注 DMA 指标在零轴上的运行时间。只要 DMA 的 DIF 线维持在零轴上方，就认为整体趋势偏多，可作为长线持仓的辅助依据。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.dma.dif > 0
                        ? '【长线持仓】DIF(' + formatNumber(volume.dma.dif, 4) + ')在零轴上方，长期趋势偏多，可作为长线持仓依据。'
                        : '【观望等待】DIF在零轴下方，长期趋势偏弱，暂不适合长线建仓。'
                      }
                    </p>
                  </div>
                </SlidingCards>
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
                <SlidingCards>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>短期交易员不常用LON指标，因为其参数设置决定了它的滞后性。但若LON线在短期内急剧上升，可作为短线爆发的辅助参考，但需结合其他短线指标确认。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.lon.lon > 0
                        ? '【参考有限】LON(' + formatNumber(volume.lon.lon, 4) + ')大于0，长线多头趋势。LON为长线指标，短期交易参考价值有限，建议结合KDJ、RSI等短线指标操作。'
                        : '【观望信号】LON小于0，长线空头趋势。短线应谨慎，等待其他短线指标发出明确信号。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>使用标准(300, 10)参数。当LON线在0轴上方运行且呈上升态势，是中期多头趋势确认信号。若LON线从高位回落至0轴附近，提示中期调整可能到来。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.lon.lon > 0
                        ? '【多头确立】LON(' + formatNumber(volume.lon.lon, 4) + ')在0轴上方，中期多头趋势确认，可持仓。'
                        : '【趋势转弱】LON在0轴下方，中期空头趋势，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">🌳 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>观测逻辑：</strong>将LON视为长线趋势的核心确认工具。当LON线从下向上突破0轴并持续上升，是长线买入信号，预示主升浪开启。只要LON线保持向上斜率，无论短期价格如何回调，都可坚定持有。
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {volume.lon.lon > 0
                        ? '【长线持仓】LON(' + formatNumber(volume.lon.lon, 4) + ')大于0，长线多头趋势明确。只要LON保持向上斜率，可坚定持有。'
                        : '【观望等待】LON小于0，长线空头趋势明确，暂不适合长线建仓，等待LON突破0轴后再考虑。'
                      }
                    </p>
                  </div>
                </SlidingCards>
              </div>
            )}
            </div>
          </AccordionItem>

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
