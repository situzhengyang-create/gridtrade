const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/components/IndicatorReportPanel.tsx', 'utf-8');

// 创建新的指标报告组件内容
const newContent = `import React from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
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

export default function IndicatorReportPanel({ report, onBack, onPrev, onNext, hasPrev, hasNext, currentIndex, totalCount }: IndicatorReportPanelProps) {
  const { trend, oscillator, volume } = report;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="px-4 py-3 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
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
                ? \`\${currentIndex + 1}/\${totalCount}\` 
                : \`数据量: \${report.dataCount} 日\`
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
            className={\`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors \${
              hasPrev 
                ? 'text-indigo-600 hover:bg-indigo-100' 
                : 'text-slate-300 cursor-not-allowed'
            }\`}
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
            className={\`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors \${
              hasNext 
                ? 'text-indigo-600 hover:bg-indigo-100' 
                : 'text-slate-300 cursor-not-allowed'
            }\`}
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">DIF</span>
                      <div className={\`text-xl font-black mt-1 \${trend.macd.dif > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                        {formatNumber(trend.macd.dif)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">DEA</span>
                      <div className={\`text-xl font-black mt-1 \${trend.macd.dea > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                        {formatNumber(trend.macd.dea)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">柱状图</span>
                      <div className={\`text-xl font-black mt-1 \${trend.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                        {formatNumber(trend.macd.histogram)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {trend.macd.dif > trend.macd.dea 
                        ? (trend.macd.dif > 0 ? '多头市场，金叉确认，建议持有或加仓。' : '空头市场，金叉反弹，谨慎对待。')
                        : (trend.macd.dif > 0 ? '多头市场，死叉回调，减仓观望。' : '空头市场，死叉确认，建议离场。')
                      }
                      {trend.macd.histogram > 0 ? '红柱放大表明上涨动能增强，' : '绿柱放大表明下跌动能增强，'}
                      DIF {'{'}'>{'}'} 0 表示多头强势，DIF {'{'}'<'{'}'} 0 表示空头强势。
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>紧盯分时或日线级别的价格与MACD的顶背离（价格新高，MACD红柱未新高）或底背离，以及DIFF快线在零轴附近的反复穿越。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0 && trend.macd.dif > trend.macd.dea 
                        ? '当前DIF(' + formatNumber(trend.macd.dif) + ')在零轴上方且上穿DEA(' + formatNumber(trend.macd.dea) + ')，形成金叉，短线可积极做多。'
                        : trend.macd.dif < 0 && trend.macd.dea < 0 && trend.macd.dif < trend.macd.dea
                          ? '当前DIF在零轴下方且下穿DEA，形成死叉，短线应回避。'
                          : '当前MACD处于震荡状态，短线宜观望或高抛低吸。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>观察MACD柱状体（能量柱）的长度变化，红柱持续放大代表多头动能强劲；红柱开始缩短（顶背离预警），即使价格仍在上涨，也提示风险。关注"空中加油"形态：股价拉升后回调，MACD在零轴上方形成二次金叉。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.histogram > 0 && Math.abs(trend.macd.histogram) > Math.abs(trend.macd.dif - trend.macd.dea) * 0.5
                        ? '当前MACD红柱长度' + (trend.macd.histogram > 0.5 ? '较大' : '适中') + '，多头动能' + (trend.macd.histogram > 0.5 ? '强劲' : '健康') + '，中期趋势向上。'
                        : '当前MACD柱体较短，多头动能有所减弱，需警惕回调风险。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>要求日线、周线级别的MACD均在零轴上方运行（多头市场）。只要DIFF线和DEA线不死叉，就长期持有，忽略中间的微小波动。只有当DIFF线从下向上放量突破DEA线，且两者均在零轴之上时，才视为长线建仓的确认信号。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.macd.dif > 0 && trend.macd.dea > 0
                        ? 'DIF(' + formatNumber(trend.macd.dif) + ')和DEA(' + formatNumber(trend.macd.dea) + ')均在零轴上方，长期多头市场确立，可坚定持有。'
                        : 'MACD指标未完全站在零轴上方，长期趋势尚需确认，建议等待更明确的信号。'
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">ADX</span>
                      <div className={\`text-lg font-black mt-1 \${trend.dmi.adx > 50 ? 'text-red-600' : trend.dmi.adx > 25 ? 'text-green-600' : 'text-slate-600'}\`}>
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
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {trend.dmi.plus_di > trend.dmi.minus_di ? '多头力量占优' : '空头力量占优'}。
                      ADX 当前值为 {formatNumber(trend.dmi.adx, 1)}，{trend.dmi.adx > 50 ? '趋势极强，' : trend.dmi.adx > 25 ? '趋势明显，' : '趋势较弱，'}
                      当 ADX {'{'}'>{'}'} 25 时可顺势交易，ADX {'{'}'<'{'}'} 20 时市场处于盘整状态。
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>当ADX数值低于20且极度走平时，预示市场处于无趋势的震荡期，此时应停止趋势交易，转而进行高抛低吸。关注+DI上穿-DI形成金叉，且ADX随后抬头，作为短线进场的触发条件。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx < 20
                        ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')低于20，市场处于无趋势震荡期，短线应采取高抛低吸策略，不宜追涨杀跌。'
                        : trend.dmi.plus_di > trend.dmi.minus_di && trend.dmi.adx > 20
                          ? '+DI(' + formatNumber(trend.dmi.plus_di, 1) + ')上穿-DI(' + formatNumber(trend.dmi.minus_di, 1) + ')，且ADX开始抬头，短线可进场做多。'
                          : 'DMI指标显示当前趋势方向不明朗，短线观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段要求ADX大于25，表明趋势已经形成。若ADX从高位回落至50以下，提示波段行情可能进入尾声。在上涨波段中，-DI往往在价格回踩时提供支撑；若-DI拐头向上且下穿+DI，波段结束。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx > 25
                        ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')大于25，中期趋势明确。' + (trend.dmi.plus_di > trend.dmi.minus_di ? '多头趋势，可继续持有。' : '空头趋势，建议回避。')
                        : 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')小于25，中期趋势尚未形成，波段交易需等待。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者只在ADX持续大于25的市场环境中操作。若ADX突破40后开始掉头向下，意味着长达数月的单边趋势可能面临终结，需考虑战略性减仓。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.dmi.adx > 40
                        ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')处于高位，长期趋势强劲，但需警惕ADX掉头向下的信号。'
                        : trend.dmi.adx > 25
                          ? 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')维持在25-40区间，长期趋势健康，可继续持有。'
                          : 'ADX(' + formatNumber(trend.dmi.adx, 1) + ')低于25，长期趋势不明确，暂不适合长线建仓。'
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
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
                      <div className={\`text-lg font-black mt-1 \${trend.boll.width < 10 ? 'text-orange-600' : 'text-slate-600'}\`}>
                        {formatNumber(trend.boll.width, 2)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
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
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>利用布林带的"回归"特性。价格触及上轨（压力位）且张口不继续扩大时，短线卖出；触及下轨（支撑位）且收出下影线时，短线买入。当布林带上下轨极度收缩（收口），预示变盘在即，短线交易员会停止开新仓，等待方向选择。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.boll.width < 10
                        ? '布林带宽(' + formatNumber(trend.boll.width, 1) + '%)小于10%，处于窄幅盘整状态，变盘在即，短线应观望等待方向选择。'
                        : report.latestPrice > trend.boll.upper_band
                          ? '价格(' + formatNumber(report.latestPrice, 2) + ')突破上轨(' + formatNumber(trend.boll.upper_band, 2) + ')，短线有回调风险，不宜追高。'
                          : report.latestPrice < trend.boll.lower_band
                            ? '价格(' + formatNumber(report.latestPrice, 2) + ')跌破下轨(' + formatNumber(trend.boll.lower_band, 2) + ')，短线超卖，可关注反弹机会。'
                            : '价格在布林带内正常波动，短线可按震荡思路操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>中期趋势以布林带中轨为核心防线。只要收盘价不有效跌破中轨，波段持仓不变；一旦放量跌破中轨，波段结束。当布林带呈现明显的向上或向下张大嘴形态，且价格沿上轨或下轨运行，是中期主升浪或主跌浪的信号。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.boll.middle_band
                        ? '价格(' + formatNumber(report.latestPrice, 2) + ')在中轨(' + formatNumber(trend.boll.middle_band, 2) + ')上方，中期偏多，可继续持有。'
                        : '价格(' + formatNumber(report.latestPrice, 2) + ')在中轨下方，中期偏弱，建议减仓或观望。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者通常切换到周线或月线级别观察BOLL。若月线级别价格站稳上轨，代表超级牛市；若跌破下轨，代表历史性大底或大熊市确立。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.boll.upper_band && trend.boll.width > 15
                        ? '日线级别价格突破上轨且带宽扩大，显示趋势强劲，长期交易者可继续持有并关注周线确认。'
                        : report.latestPrice < trend.boll.lower_band && trend.boll.width > 15
                          ? '日线级别价格跌破下轨且带宽扩大，趋势转弱，长期交易者需警惕。'
                          : '日线级别布林带形态正常，长期趋势需结合更大周期判断。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.expma && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">4. EXPMA（指数平均）</h3>
                <p className="text-xs text-slate-500 mb-3">Exponential Moving Average | 参数: (12, 50)</p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
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
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {trend.expma.exp1 > trend.expma.exp2 
                        ? '短期EXP12（' + formatNumber(trend.expma.exp1, 2) + '）在长期EXP50（' + formatNumber(trend.expma.exp2, 2) + '）上方，形成多头排列，金叉状态，表明上升趋势明确。'
                        : '短期EXP12（' + formatNumber(trend.expma.exp1, 2) + '）在长期EXP50（' + formatNumber(trend.expma.exp2, 2) + '）下方，形成空头排列，死叉状态，表明下降趋势明确。'
                      }
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>EXP1与EXP2在分时图上的频繁缠绕，代表短期方向不明，应观望。价格急跌后迅速拉回并站上EXP1，视为短线诱空结束，可轻仓跟进。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {Math.abs(trend.expma.exp1 - trend.expma.exp2) < 0.1 * report.latestPrice
                        ? 'EXP12与EXP50距离较近，短期方向不明，建议观望。'
                        : trend.expma.exp1 > trend.expma.exp2 && report.latestPrice > trend.expma.exp1
                          ? '价格站上EXP12且EXP12在EXP50上方，短线可轻仓跟进。'
                          : '短期EXPMA信号不明确，观望为宜。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>严格等待短期EXPMA上穿长期EXPMA形成"黄金交叉"，以此为波段起点；下穿则为波段终点。当股价大幅偏离短期EXPMA线（乖离率过大），预期会有回归均线的动作，此时是减仓时机而非追涨。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.expma.exp1 > trend.expma.exp2
                        ? 'EXP12(' + formatNumber(trend.expma.exp1, 2) + ')上穿EXP50(' + formatNumber(trend.expma.exp2, 2) + ')，黄金交叉形成，中期波段可进场。'
                        : 'EXP12在EXP50下方，中期趋势向下，波段操作需等待。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者将长期EXPMA（50日或120日）视为市场的平均持仓成本。只要价格维持在长期EXPMA上方运行，就认为长期上升趋势未改。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.expma.exp2
                        ? '价格(' + formatNumber(report.latestPrice, 2) + ')在EXP50(' + formatNumber(trend.expma.exp2, 2) + ')上方，长期持仓成本支撑有效，可继续持有。'
                        : '价格跌破EXP50，长期趋势可能改变，需重新评估持仓策略。'
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
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
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {report.latestPrice > trend.ene.upper 
                        ? '价格突破上轨，短线超买，注意回档风险。'
                        : report.latestPrice < trend.ene.lower
                          ? '价格跌破下轨，短线超卖，关注反弹机会。'
                          : '价格在轨道内运行，属于正常波动区间。'
                      }
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>当价格触及ENE上轨且轨道向上倾斜时，短线持有；若轨道走平且价格触及上轨，短线卖出。当价格跌破ENE下轨且轨道向下倾斜时，短线回避。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.ene.upper
                        ? '价格(' + formatNumber(report.latestPrice, 2) + ')触及上轨(' + formatNumber(trend.ene.upper, 2) + ')，短线有回调风险。'
                        : report.latestPrice < trend.ene.lower
                          ? '价格(' + formatNumber(report.latestPrice, 2) + ')跌破下轨(' + formatNumber(trend.ene.lower, 2) + ')，短线关注反弹。'
                          : '价格在轨道内运行，短线可按震荡区间操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段要求ENE轨道有明确的倾斜方向。在上涨波段中，价格会沿着ENE上轨运行，回调到下轨获得支撑。若ENE轨道由向上转为走平，且价格跌破中轨，中期波段结束。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.ene.upper > trend.ene.middle && trend.ene.middle > trend.ene.lower
                        ? 'ENE轨道向上倾斜，中期多头趋势明确，可沿上轨持有。'
                        : 'ENE轨道走平或向下，中期趋势不明，波段交易需谨慎。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者观察到，在长期的牛市中，ENE轨道会呈现稳定的向上开口，价格很少跌破中轨。若ENE轨道开口向下，且价格跌破下轨，代表长期趋势逆转，进入熊市。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.ene.upper - trend.ene.lower > 0.1 * trend.ene.middle && trend.ene.upper > trend.ene.middle
                        ? 'ENE轨道向上开口明显，长期牛市特征，可坚定持有。'
                        : trend.ene.upper < trend.ene.middle
                          ? 'ENE轨道向下开口，长期趋势转熊，建议战略性减仓。'
                          : 'ENE轨道形态正常，长期趋势需结合其他指标确认。'
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
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
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      当前价格 ¥{report.latestPrice.toFixed(2)}，BBI 值为 {formatNumber(trend.bbi.bbi, 2)}。
                      {report.latestPrice > trend.bbi.bbi ? '价格在BBI上方，多头市场占优。' : '价格在BBI下方，空头市场占优。'}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>当价格大幅高于BBI线时，短线交易员会警惕回调风险；当价格大幅低于BBI线时，关注反弹机会。BBI线由跌转涨，且价格站上BBI线，是短线买入信号。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi * 1.03
                        ? '价格(' + formatNumber(report.latestPrice, 2) + ')大幅高于BBI(' + formatNumber(trend.bbi.bbi, 2) + ')，短线有回调风险。'
                        : report.latestPrice < trend.bbi.bbi * 0.97
                          ? '价格大幅低于BBI，短线可关注反弹机会。'
                          : '价格围绕BBI波动，短线震荡思路操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>中期波段以BBI线为多空分界线。只要价格不跌破BBI线，就认为中期趋势依然向好。若价格有效跌破BBI线，且BBI线拐头向下，中期波段结束，考虑减仓。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {report.latestPrice > trend.bbi.bbi
                        ? '价格在BBI上方，中期多头趋势保持，可继续持有。'
                        : '价格跌破BBI，中期趋势转空，建议减仓。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>长期持有者观察到，在长期的牛市中，价格会始终运行在BBI线上方。若价格跌破BBI线，且BBI线开始向下弯曲，代表长期多空力量发生转变，需考虑长期持有策略的调整。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.bbi.ma3 > trend.bbi.ma6 && trend.bbi.ma6 > trend.bbi.ma12 && trend.bbi.ma12 > trend.bbi.ma24
                        ? '短期均线在长期均线上方，形成多头排列，长期牛市格局确立。'
                        : trend.bbi.ma3 < trend.bbi.ma6 && trend.bbi.ma6 < trend.bbi.ma12 && trend.bbi.ma12 < trend.bbi.ma24
                          ? '短期均线在长期均线下方，形成空头排列，长期趋势转弱。'
                          : '均线系统纠缠，长期趋势不明，需等待方向选择。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.trix && (
              <div className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                <h3 className="text-base font-bold text-slate-900 mb-3">7. TRIX（三重指数平滑）</h3>
                <p className="text-xs text-slate-500 mb-3">Triple Exponentially Smoothed Average | 参数: (12, 9)</p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">TRIX</span>
                      <div className={\`text-xl font-black mt-1 \${trend.trix.trix > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                        {formatNumber(trend.trix.trix, 4)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">MATRIX</span>
                      <div className={\`text-xl font-black mt-1 \${trend.trix.matrix > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                        {formatNumber(trend.trix.matrix, 4)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {trend.trix.trix > trend.trix.matrix 
                        ? 'TRIX（' + formatNumber(trend.trix.trix, 4) + '%）在MATRIX（' + formatNumber(trend.trix.matrix, 4) + '%）上方，金叉状态，建议持有。'
                        : 'TRIX（' + formatNumber(trend.trix.trix, 4) + '%）在MATRIX（' + formatNumber(trend.trix.matrix, 4) + '%）下方，死叉状态，建议离场。'
                      }
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>短期交易员极少使用TRIX，因为其极度滞后。若TRIX在极低位置突然抬头，可作为长期底部可能形成的预警，但不作为短线入场依据。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>TRIX指标滞后性较强，不适合短线交易。当前TRIX(' + formatNumber(trend.trix.trix, 4) + '%)，建议结合其他短期指标操作。
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>关注TRIX在零轴附近的金叉或死叉。当TRIX上穿零轴且趋势向上，视为中期多头确立；下穿零轴则视为中期走弱。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix > 0 && trend.trix.trix > trend.trix.matrix
                        ? 'TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在零轴上方且上穿MATRIX，中期多头确立。'
                        : trend.trix.trix < 0
                          ? 'TRIX在零轴下方，中期趋势偏弱。'
                          : 'TRIX在零轴附近徘徊，中期趋势待确认。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>将TRIX视为长线持仓的风向标。只要TRIX线保持向上的斜率且维持在零轴上方，就坚定长期持有，忽略中途的回调波动。若TRIX在高位掉头向下，预示长线行情可能终结。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {trend.trix.trix > 0
                        ? 'TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在零轴上方，长期多头趋势明确，可坚定持有。'
                        : 'TRIX(' + formatNumber(trend.trix.trix, 4) + '%)在零轴下方，长期趋势转空，需考虑减仓。'
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">K值</span>
                      <div className={\`text-xl font-black mt-1 \${oscillator.kdj.k < 20 ? 'text-green-600' : oscillator.kdj.k > 80 ? 'text-red-600' : 'text-slate-900'}\`}>
                        {formatNumber(oscillator.kdj.k, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.kdj.k < 20 ? '超卖' : oscillator.kdj.k > 80 ? '超买' : '正常'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">D值</span>
                      <div className={\`text-xl font-black mt-1 \${oscillator.kdj.d < 20 ? 'text-green-600' : oscillator.kdj.d > 80 ? 'text-red-600' : 'text-slate-900'}\`}>
                        {formatNumber(oscillator.kdj.d, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.kdj.d < 20 ? '超卖' : oscillator.kdj.d > 80 ? '超买' : '正常'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">J值</span>
                      <div className={\`text-xl font-black mt-1 \${oscillator.kdj.j < 0 ? 'text-green-600' : oscillator.kdj.j > 100 ? 'text-red-600' : 'text-slate-900'}\`}>
                        {formatNumber(oscillator.kdj.j, 2)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{oscillator.kdj.j < 0 ? '超卖' : oscillator.kdj.j > 100 ? '超买' : '正常'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {oscillator.kdj.k > oscillator.kdj.d 
                        ? (oscillator.kdj.k < 30 ? '低位金叉（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），强烈买入信号。' : '金叉状态（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），可持有。')
                        : (oscillator.kdj.k > 70 ? '高位死叉（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），强烈卖出信号。' : '死叉状态（K=' + formatNumber(oscillator.kdj.k, 1) + '，D=' + formatNumber(oscillator.kdj.d, 1) + '），建议离场。')
                      }
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>J值超过100为严重超买，低于0为严重超卖。短线交易员常在J值大于100时卖出，小于0时买入。K线与D线在20以下形成金叉，是短线强烈的买入信号；在80以上形成死叉，是短线卖出信号。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.j > 100
                        ? 'J值(' + formatNumber(oscillator.kdj.j, 1) + ')超过100，严重超买，短线卖出。'
                        : oscillator.kdj.j < 0
                          ? 'J值(' + formatNumber(oscillator.kdj.j, 1) + ')低于0，严重超卖，短线买入。'
                          : oscillator.kdj.k < 30 && oscillator.kdj.k > oscillator.kdj.d
                            ? 'K(' + formatNumber(oscillator.kdj.k, 1) + ')上穿D(' + formatNumber(oscillator.kdj.d, 1) + ')，低位金叉，短线买入。'
                            : oscillator.kdj.k > 70 && oscillator.kdj.k < oscillator.kdj.d
                              ? 'K下穿D，高位死叉，短线卖出。'
                              : 'KDJ指标处于正常区间，短线观望或震荡操作。'
                      }
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>在极强的单边牛市或熊市中，KDJ会在高位或低位长时间钝化（反复金叉死叉）。中期交易员不会因短暂的死叉而轻易下车，而是等待K线跌破20或突破80后的有效发散。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.k > 80 && oscillator.kdj.d > 80
                        ? 'KDJ在高位(' + formatNumber(oscillator.kdj.k, 1) + ')钝化，中期趋势强劲，但需警惕回落。'
                        : oscillator.kdj.k < 20 && oscillator.kdj.d < 20
                          ? 'KDJ在低位(' + formatNumber(oscillator.kdj.k, 1) + ')钝化，中期可能见底。'
                          : 'KDJ在正常区间波动，中期趋势健康。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 mb-2">📅 长期交易员观测（半年周期）</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      <strong>观测逻辑：</strong>长期交易者关注KDJ在20以下的低位徘徊时间。若KDJ在低位形成W底或多重底，且伴随成交量温和放大，是长线资金悄然吸筹的信号。
                    </p>
                    <p className="text-sm text-green-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.kdj.k < 30
                        ? 'KDJ在低位(' + formatNumber(oscillator.kdj.k, 1) + ')，长期交易者可关注是否形成底部形态。'
                        : oscillator.kdj.k > 70
                          ? 'KDJ在高位(' + formatNumber(oscillator.kdj.k, 1) + ')，长期需警惕顶部风险。'
                          : 'KDJ在中间区间，长期趋势需结合其他指标判断。'
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
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600">SLOW_K</span>
                      <div className={\`text-xl font-black mt-1 \${oscillator.skdj.slow_k < 20 ? 'text-green-600' : oscillator.skdj.slow_k > 80 ? 'text-red-600' : 'text-slate-900'}\`}>
                        {formatNumber(oscillator.skdj.slow_k, 2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-600">SLOW_D</span>
                      <div className={\`text-xl font-black mt-1 \${oscillator.skdj.slow_d < 20 ? 'text-green-600' : oscillator.skdj.slow_d > 80 ? 'text-red-600' : 'text-slate-900'}\`}>
                        {formatNumber(oscillator.skdj.slow_d, 2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2">📊 信号判断</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {oscillator.skdj.slow_k > oscillator.skdj.slow_d 
                        ? 'SLOW_K（' + formatNumber(oscillator.skdj.slow_k, 1) + '）大于SLOW_D（' + formatNumber(oscillator.skdj.slow_d, 1) + '），多头信号。'
                        : 'SLOW_K（' + formatNumber(oscillator.skdj.slow_k, 1) + '）小于SLOW_D（' + formatNumber(oscillator.skdj.slow_d, 1) + '），空头信号。'
                      }
                      SKDJ相比KDJ更平滑，信号更稳定。
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 mb-2">⏱️ 短期交易员观测（半个月周期）</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      <strong>观测逻辑：</strong>在极度震荡的行情中，SKDJ产生的金叉死叉信号比KDJ少，减少了被市场反复"打脸"的假信号。通常观察KDJ寻找激进的短线切入点，而SKDJ用于确认中期的趋势方向是否依然健康。
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>SKDJ当前SLOW_K=' + formatNumber(oscillator.skdj.slow_k, 1) + ', SLOW_D=' + formatNumber(oscillator.skdj.slow_d, 1) + '。信号较KDJ更平滑，适合作为短线操作的确认工具。
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">📈 中期交易员观测（1-2个月周期）</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>观测逻辑：</strong>中期交易员看重SKDJ在50中轴线的穿越。当SKDJ从下方金叉50，视为中期多头开始；当SKDJ从上方死叉50，视为中期空头开始。由于SKDJ更平滑，中期信号的误报率更低。
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed mt-2">
                      <strong>当前观测结果：</strong>
                      {oscillator.skdj.slow_k > 50
                        ? 'SLOW_K(' + formatNumber(oscillator.skdj.slow_k, 1) + ')在50上方，中期多头趋势。'
                        : 'SLOW_K(' + formatNumber(oscillator.skdj.slow_k, 1) + ')在50下方，中期空头趋势。'
                      }
                    </p>
                  </div>
                  <div className="bg-green-5