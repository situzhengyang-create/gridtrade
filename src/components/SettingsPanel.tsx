import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Save, RefreshCw, HelpCircle, X } from 'lucide-react';
import { TrendParams, defaultTrendParams, paramDescriptions } from '../types/params';

export default function SettingsPanel({
  params,
  onParamsChange,
  onBack,
  onRefresh,
}: {
  params: TrendParams;
  onParamsChange: (params: TrendParams) => void;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [localParams, setLocalParams] = useState<TrendParams>(params);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleParamChange = (section: keyof TrendParams, key: string, value: number) => {
    setLocalParams(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onParamsChange(localParams);
  };

  const handleReset = () => {
    setLocalParams(defaultTrendParams);
  };

  const InputRow = ({
    label,
    value,
    onChange,
    paramKey,
    min = 1,
    max = 200,
    step = 1,
    unit = '',
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    paramKey: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">{label}</span>
        <button
          onClick={() => setActiveModal(paramKey)}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          title="查看说明"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, parseFloat(e.target.value) || min)))}
          min={min}
          max={max}
          step={step}
          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
    </div>
  );

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
            <h1 className="text-base font-bold text-slate-900">系统参数设置</h1>
            <p className="text-xs text-slate-500">趋势交易系统参数配置</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重置</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>保存</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>刷新报告</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <h2 className="text-base font-bold text-blue-800 mb-4">MA20均线参数</h2>
            <InputRow
              label="主趋势窗口"
              value={localParams.ma20.mainTrendWindow}
              onChange={(v) => handleParamChange('ma20', 'mainTrendWindow', v)}
              paramKey="ma20_mainTrendWindow"
              min={5}
              max={30}
              unit="日"
            />
            <InputRow
              label="短期趋势窗口"
              value={localParams.ma20.shortTrendWindow}
              onChange={(v) => handleParamChange('ma20', 'shortTrendWindow', v)}
              paramKey="ma20_shortTrendWindow"
              min={3}
              max={15}
              unit="日"
            />
            <InputRow
              label="长期趋势窗口"
              value={localParams.ma20.longTrendWindow}
              onChange={(v) => handleParamChange('ma20', 'longTrendWindow', v)}
              paramKey="ma20_longTrendWindow"
              min={10}
              max={60}
              unit="日"
            />
            <InputRow
              label="斜率判定阈值"
              value={localParams.ma20.slopeThreshold}
              onChange={(v) => handleParamChange('ma20', 'slopeThreshold', v)}
              paramKey="ma20_slopeThreshold"
              min={0.001}
              max={0.01}
              step={0.001}
            />
            <InputRow
              label="加速/减速阈值"
              value={localParams.ma20.accelerationThreshold}
              onChange={(v) => handleParamChange('ma20', 'accelerationThreshold', v)}
              paramKey="ma20_accelerationThreshold"
              min={0.0005}
              max={0.005}
              step={0.0005}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-purple-50 rounded-xl border border-purple-200"
          >
            <h2 className="text-base font-bold text-purple-800 mb-4">ADX趋势强度参数</h2>
            <InputRow
              label="ADX计算周期"
              value={localParams.adx.period}
              onChange={(v) => handleParamChange('adx', 'period', v)}
              paramKey="adx_period"
              min={5}
              max={30}
              unit="日"
            />
            <InputRow
              label="ADX斜率窗口"
              value={localParams.adx.slopeWindow}
              onChange={(v) => handleParamChange('adx', 'slopeWindow', v)}
              paramKey="adx_slopeWindow"
              min={3}
              max={10}
              unit="日"
            />
            <InputRow
              label="DI预警线"
              value={localParams.adx.diWarningLevel}
              onChange={(v) => handleParamChange('adx', 'diWarningLevel', v)}
              paramKey="adx_diWarningLevel"
              min={30}
              max={60}
            />
            <InputRow
              label="DI强烈预警线"
              value={localParams.adx.diStrongWarningLevel}
              onChange={(v) => handleParamChange('adx', 'diStrongWarningLevel', v)}
              paramKey="adx_diStrongWarningLevel"
              min={40}
              max={70}
            />
            <InputRow
              label="趋势萌芽线"
              value={localParams.adx.trendStartLevel}
              onChange={(v) => handleParamChange('adx', 'trendStartLevel', v)}
              paramKey="adx_trendStartLevel"
              min={15}
              max={25}
            />
            <InputRow
              label="最佳趋势线"
              value={localParams.adx.trendOptimalLevel}
              onChange={(v) => handleParamChange('adx', 'trendOptimalLevel', v)}
              paramKey="adx_trendOptimalLevel"
              min={20}
              max={35}
            />
            <InputRow
              label="趋势过热线"
              value={localParams.adx.trendHotLevel}
              onChange={(v) => handleParamChange('adx', 'trendHotLevel', v)}
              paramKey="adx_trendHotLevel"
              min={40}
              max={75}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-amber-50 rounded-xl border border-amber-200"
          >
            <h2 className="text-base font-bold text-amber-800 mb-4">布林带参数</h2>
            <InputRow
              label="布林带周期"
              value={localParams.bollinger.period}
              onChange={(v) => handleParamChange('bollinger', 'period', v)}
              paramKey="bollinger_period"
              min={10}
              max={50}
              unit="日"
            />
            <InputRow
              label="标准差倍数"
              value={localParams.bollinger.stdDevMultiplier}
              onChange={(v) => handleParamChange('bollinger', 'stdDevMultiplier', v)}
              paramKey="bollinger_stdDevMultiplier"
              min={1}
              max={3}
              step={0.5}
            />
            <InputRow
              label="历史参照窗口"
              value={localParams.bollinger.historyWindow}
              onChange={(v) => handleParamChange('bollinger', 'historyWindow', v)}
              paramKey="bollinger_historyWindow"
              min={60}
              max={200}
              unit="日"
            />
            <InputRow
              label="容错系数"
              value={localParams.bollinger.toleranceFactor}
              onChange={(v) => handleParamChange('bollinger', 'toleranceFactor', v)}
              paramKey="bollinger_toleranceFactor"
              min={1}
              max={1.2}
              step={0.01}
            />
            <InputRow
              label="低位分位"
              value={localParams.bollinger.lowPercentile}
              onChange={(v) => handleParamChange('bollinger', 'lowPercentile', v)}
              paramKey="bollinger_lowPercentile"
              min={0.1}
              max={0.3}
              step={0.05}
            />
            <InputRow
              label="最小持续时间"
              value={localParams.bollinger.minDuration}
              onChange={(v) => handleParamChange('bollinger', 'minDuration', v)}
              paramKey="bollinger_minDuration"
              min={2}
              max={10}
              unit="日"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-emerald-50 rounded-xl border border-emerald-200"
          >
            <h2 className="text-base font-bold text-emerald-800 mb-4">MACD参数</h2>
            <InputRow
              label="快速周期"
              value={localParams.macd.fastPeriod}
              onChange={(v) => handleParamChange('macd', 'fastPeriod', v)}
              paramKey="macd_fastPeriod"
              min={5}
              max={20}
              unit="日"
            />
            <InputRow
              label="慢速周期"
              value={localParams.macd.slowPeriod}
              onChange={(v) => handleParamChange('macd', 'slowPeriod', v)}
              paramKey="macd_slowPeriod"
              min={15}
              max={40}
              unit="日"
            />
            <InputRow
              label="信号周期"
              value={localParams.macd.signalPeriod}
              onChange={(v) => handleParamChange('macd', 'signalPeriod', v)}
              paramKey="macd_signalPeriod"
              min={5}
              max={15}
              unit="日"
            />
            <InputRow
              label="动量变化阈值"
              value={localParams.macd.momentumThreshold}
              onChange={(v) => handleParamChange('macd', 'momentumThreshold', v)}
              paramKey="macd_momentumThreshold"
              min={0.02}
              max={0.1}
              step={0.01}
            />
            <InputRow
              label="背离检测窗口"
              value={localParams.macd.divergenceWindow}
              onChange={(v) => handleParamChange('macd', 'divergenceWindow', v)}
              paramKey="macd_divergenceWindow"
              min={15}
              max={60}
              unit="日"
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {paramDescriptions[activeModal]?.label || '参数说明'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                {paramDescriptions[activeModal]?.description || ''}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {paramDescriptions[activeModal]?.explanation || ''}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}