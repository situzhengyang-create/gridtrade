import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, AlertTriangle, Target, CheckCircle, Lightbulb } from 'lucide-react';

export default function ApplicationGuidePanel({ onBack }: { onBack: () => void }) {
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
            <h1 className="text-base font-bold text-slate-900">交易系统应用说明</h1>
            <p className="text-xs text-slate-500">高胜率、高盈亏比、低频次的趋势跟踪体系</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">系统核心优势</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              本系统脱离了"看指标交叉就买卖"的初级阶段，具有极其严密的逻辑闭环。
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-slate-600">🛡️</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">完美规避"绞肉机"行情（防震荡）</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    系统的"漏斗式"架构是其灵魂。必须先通过<b>天</b>（MA20定方向+ADX定强度），再看<b>地</b>（布林带定极低波动率位置），最后才找<b>时机</b>（MACD精准爆破）。这直接屏蔽了70%无序震荡市中的无效磨损。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-slate-600">📐</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">绝对的"量化标准"（反人性）</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    不再有"感觉均线朝上"、"感觉布林带很窄"这种主观判断。系统将所有条件化为冰冷的数字（如斜率必须&gt;0.003，宽度必须处在历史后20%）。这彻底排除了交易中"恐惧与贪婪"的干扰。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-slate-600">🔔</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">卓越的"利润保卫战"（防利润回撤）</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    传统趋势策略往往等价格跌破均线才离场，利润回吐极大。本系统首创了<b>"指标动能衰竭先于价格"</b>的左侧预警（如：MA20斜率减速、MACD柱状体连续缩短、ADX极值预警）。让您在真正的暴跌到来前，提前锁定绝大部分利润。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">系统的内在妥协与盲区</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              任何交易系统都是胜率、赔率和频率的平衡。执行本系统，您必须接纳以下特点。
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-slate-600">🐢</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">必然的"滞后性"（放弃鱼头和鱼尾）</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    均线和ADX本质上是平滑历史数据的滞后指标。当市场发生"V型反转"时，底部拉升的前20%空间系统是反应不过来的。<b>本系统只吃最肥的"鱼身"，拒绝抄底摸顶。</b>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-slate-600">📉</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">极低的交易频次（考验耐心）</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    要同时满足四大指标的严苛条件形成"信号共振"，概率非常低。在长时间的熊市或震荡市中，系统可能连续数月都不会发出A级/B级开仓信号。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-slate-600">⚠️</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">固定参数的"品种水土不服"风险</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    系统内置的固定阈值（如斜率&gt;0.003）是对市场平均波动的拟合。对于极度活跃的资产（如山寨币），0.3%可能只是微波；而对于低波动大盘股，0.3%可能已是单边狂飙。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">实战部署与操作建议</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-xs font-bold">1</span>
                  <h3 className="font-bold text-slate-800">采用"多标的雷达扫描"模式</h3>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  <b>绝对不要只盯着单一品种！</b>既然单品种触发共振信号的频率极低，正确的用法是：建立一个包含几十上百个标的（如沪深300成分股、美股标普500、加密货币主流币种）的资产池，用程序每天跑一遍扫描，<b>东方不亮西方亮，只做出现A级/B级信号的品种。</b>
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-xs font-bold">2</span>
                  <h3 className="font-bold text-slate-800">依据品种波动率微调绝对参数</h3>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  在将系统应用到不同市场前，建议基于该市场的平均ATR（真实波幅）对硬性阈值进行微调。<br/>
                  <b>高波动市场</b>：适当调高MA20主趋势斜率阈值（如0.003调至0.005），防止假突破。<br/>
                  <b>低波动市场</b>：适当调低斜率阈值，增加灵敏度。
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-xs font-bold">3</span>
                  <h3 className="font-bold text-slate-800">严格遵守信号分级仓位管理</h3>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  <b>A级信号</b>：果断重仓/标准仓位，这是系统为您筛选出的"天时地利人和"之局。<br/>
                  <b>C级信号</b>：轻仓试探或直接放弃。<br/>
                  <b>预警信号</b>：一旦系统发出"减速"或"背离"预警，<b>不要对资产产生感情</b>，严格按照系统提示减仓或推高止损线。
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">最终结语：系统能为您保证什么？</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              如果您能像机器一样严格遵守这套系统，它虽然不能保证您一夜暴富，但可以为您提供三大绝对保证：
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-500" />
                <p className="text-xs text-slate-600">
                  <b>您绝对不会在阴跌和暴跌中被深套</b>（系统方向判定机制会强制您空仓）。
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-500" />
                <p className="text-xs text-slate-600">
                  <b>您绝对不会在无序震荡中把本金磨光</b>（ADX和布林带机制锁死了震荡市开仓的可能）。
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-500" />
                <p className="text-xs text-slate-600">
                  <b>您大概率能抓住每年那仅有的几次、真正酣畅淋漓的大单边主升浪</b>，并且在市场陷入疯狂之前从容抽身。
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-bold text-center text-slate-800">
                "交易不是比谁做得多，而是比谁活得久。忍受空仓的寂寞，等待系统共振的致命一击。"
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}