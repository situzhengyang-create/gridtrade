import React, { useMemo } from 'react';
import { Menu, Settings, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { PositionPortfolio, PositionAnalysis, PositionModuleAnalysis, PositionCategoryAnalysis, PositionTargetAnalysis } from '../types';

interface PositionDashboardPanelProps {
  portfolio: PositionPortfolio;
  totalAmount: number;
  onOpenNav: () => void;
  onOpenSettings: () => void;
}

const formatCurrency = (value: number): string => {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  }
  if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万';
  }
  return value.toFixed(0);
};

const formatPercentage = (value: number): string => {
  return value.toFixed(1) + '%';
};

const getDeviationColor = (deviation: number): string => {
  if (deviation > 5) return 'text-red-600';
  if (deviation < -5) return 'text-green-600';
  if (deviation > 2) return 'text-orange-500';
  if (deviation < -2) return 'text-teal-500';
  return 'text-slate-600';
};

const getDeviationBgColor = (deviation: number): string => {
  if (deviation > 5) return 'bg-red-50';
  if (deviation < -5) return 'bg-green-50';
  if (deviation > 2) return 'bg-orange-50';
  if (deviation < -2) return 'bg-teal-50';
  return 'bg-slate-50';
};

const getDeviationIcon = (deviation: number) => {
  if (deviation > 0) return <TrendingUp className="w-3 h-3" />;
  if (deviation < 0) return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

export default function PositionDashboardPanel({
  portfolio,
  totalAmount,
  onOpenNav,
  onOpenSettings,
}: PositionDashboardPanelProps) {
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set(portfolio.modules.map(m => m.id)));
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  const analysis: PositionAnalysis = useMemo(() => {
    const totalPlanAmount = totalAmount;
    let totalActualAmount = 0;

    const modules: PositionModuleAnalysis[] = portfolio.modules.map(module => {
      const planAmount = totalAmount * (module.planPercentage / 100);
      const categories = module.categories || [];
      const targets = module.targets || [];
      
      let actualAmount = 0;
      categories.forEach(category => {
        category.targets.forEach(target => {
          actualAmount += target.actualMarketValue;
        });
      });
      targets.forEach(target => {
        actualAmount += target.actualMarketValue;
      });
      
      totalActualAmount += actualAmount;

      const actualPercentage = totalActualAmount > 0 ? (actualAmount / totalActualAmount) * 100 : 0;
      const amountDeviation = actualAmount - planAmount;
      const percentageDeviation = actualPercentage - module.planPercentage;

      const categoryAnalysis: PositionCategoryAnalysis[] = categories.map(category => {
        const categoryPlanAmount = planAmount * (category.planPercentage / 100);
        const categoryActualAmount = category.targets.reduce((sum, t) => sum + t.actualMarketValue, 0);
        const categoryActualPercentage = actualAmount > 0 ? (categoryActualAmount / actualAmount) * 100 : 0;
        const categoryAmountDeviation = categoryActualAmount - categoryPlanAmount;
        const categoryPercentageDeviation = categoryActualPercentage - category.planPercentage;

        const categoryTargets: PositionTargetAnalysis[] = category.targets.map(target => {
          const targetPlanAmount = categoryPlanAmount * (target.planPercentage / 100);
          const targetActualPercentage = categoryActualAmount > 0 ? (target.actualMarketValue / categoryActualAmount) * 100 : 0;
          const targetPercentageDeviation = targetActualPercentage - target.planPercentage;

          return {
            targetId: target.id,
            targetName: target.name,
            planPercentage: target.planPercentage,
            planAmount: targetPlanAmount,
            actualMarketValue: target.actualMarketValue,
            actualPercentage: targetActualPercentage,
            percentageDeviation: targetPercentageDeviation,
          };
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          planPercentage: category.planPercentage,
          planAmount: categoryPlanAmount,
          actualAmount: categoryActualAmount,
          actualPercentage: categoryActualPercentage,
          amountDeviation: categoryAmountDeviation,
          percentageDeviation: categoryPercentageDeviation,
          targets: categoryTargets,
        };
      });

      const directTargets: PositionTargetAnalysis[] = targets.map(target => {
        const targetPlanAmount = planAmount * (target.planPercentage / 100);
        const targetActualPercentage = actualAmount > 0 ? (target.actualMarketValue / actualAmount) * 100 : 0;
        const targetPercentageDeviation = targetActualPercentage - target.planPercentage;

        return {
          targetId: target.id,
          targetName: target.name,
          planPercentage: target.planPercentage,
          planAmount: targetPlanAmount,
          actualMarketValue: target.actualMarketValue,
          actualPercentage: targetActualPercentage,
          percentageDeviation: targetPercentageDeviation,
        };
      });

      const allTargets: PositionTargetAnalysis[] = [
        ...categoryAnalysis.flatMap(c => c.targets),
        ...directTargets,
      ];

      return {
        moduleId: module.id,
        moduleName: module.name,
        planPercentage: module.planPercentage,
        planAmount,
        actualAmount,
        actualPercentage,
        amountDeviation,
        percentageDeviation,
        categories: categoryAnalysis,
        targets: allTargets,
      };
    });

    return { totalPlanAmount, totalActualAmount, modules };
  }, [portfolio, totalAmount]);

  const overallDeviation = analysis.totalActualAmount - analysis.totalPlanAmount;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenNav}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900">仓位管理</h1>
            <p className="text-xs text-slate-500">{portfolio.name}</p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors"
          title="设置"
        >
          <Settings className="w-5 h-5 text-slate-500" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-100">
              <div className="text-[10px] font-bold text-indigo-600/70 mb-1">计划总金额</div>
              <div className="text-xl font-black text-indigo-900">¥{formatCurrency(analysis.totalPlanAmount)}</div>
            </div>
            <div className={`rounded-xl p-4 border ${overallDeviation >= 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className="text-[10px] font-bold text-slate-500 mb-1">实际总金额</div>
              <div className={`text-xl font-black ${overallDeviation >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                ¥{formatCurrency(analysis.totalActualAmount)}
              </div>
              <div className={`text-[10px] font-bold mt-1 ${overallDeviation >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {overallDeviation >= 0 ? '+' : ''}{formatCurrency(overallDeviation)}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800">仓位分布</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">层级</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">计划%</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">实际%</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">偏差</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">计划金额</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">实际金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analysis.modules.map((module) => (
                    <React.Fragment key={module.moduleId}>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleModule(module.moduleId)}>
                            {expandedModules.has(module.moduleId) ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${getDeviationBgColor(module.percentageDeviation)}`}>
                              <span className="text-xs font-bold text-slate-700">{module.moduleName.charAt(0)}</span>
                            </div>
                            <span className="font-bold text-slate-800">{module.moduleName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-slate-700">{formatPercentage(module.planPercentage)}</td>
                        <td className="px-3 py-3 text-right font-bold text-slate-700">{formatPercentage(module.actualPercentage)}</td>
                        <td className={`px-3 py-3 text-right font-bold ${getDeviationColor(module.percentageDeviation)}`}>
                          <div className="flex items-center justify-end gap-1">
                            {getDeviationIcon(module.percentageDeviation)}
                            {module.percentageDeviation > 0 ? '+' : ''}{formatPercentage(module.percentageDeviation)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-600">¥{formatCurrency(module.planAmount)}</td>
                        <td className={`px-3 py-3 text-right font-mono ${getDeviationColor(module.percentageDeviation)}`}>¥{formatCurrency(module.actualAmount)}</td>
                      </tr>

                      {expandedModules.has(module.moduleId) && (
                        <React.Fragment key={`module-content-${module.moduleId}`}>
                          {module.categories.map((category) => (
                            <React.Fragment key={category.categoryId}>
                              <tr className="bg-slate-50/30">
                                <td className="px-3 py-2 pl-10">
                                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleCategory(category.categoryId)}>
                                    {expandedCategories.has(category.categoryId) ? (
                                      <ChevronDown className="w-3 h-3 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-slate-400" />
                                    )}
                                    <span className="text-sm font-bold text-slate-600">{category.categoryName}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right text-slate-500">{formatPercentage(category.planPercentage)}</td>
                                <td className="px-3 py-2 text-right text-slate-500">{formatPercentage(category.actualPercentage)}</td>
                                <td className={`px-3 py-2 text-right ${getDeviationColor(category.percentageDeviation)}`}>
                                  <div className="flex items-center justify-end gap-1">
                                    {getDeviationIcon(category.percentageDeviation)}
                                    {category.percentageDeviation > 0 ? '+' : ''}{formatPercentage(category.percentageDeviation)}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-slate-400">¥{formatCurrency(category.planAmount)}</td>
                                <td className="px-3 py-2 text-right font-mono text-slate-600">¥{formatCurrency(category.actualAmount)}</td>
                              </tr>

                              {expandedCategories.has(category.categoryId) ? category.targets.map((target) => (
                                <tr key={`target-${target.targetId}`} className="bg-slate-50/50">
                                  <td className="px-3 py-2 pl-16">
                                    <span className="text-slate-500">{target.targetName}</span>
                                  </td>
                                  <td className="px-3 py-2 text-right text-slate-400 text-xs">{formatPercentage(target.planPercentage)}</td>
                                  <td className="px-3 py-2 text-right text-slate-400 text-xs">{formatPercentage(target.actualPercentage)}</td>
                                  <td className={`px-3 py-2 text-right text-xs ${getDeviationColor(target.percentageDeviation)}`}>
                                    {target.percentageDeviation > 0 ? '+' : ''}{formatPercentage(target.percentageDeviation)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-400 text-xs">¥{formatCurrency(target.planAmount)}</td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-500 text-xs">¥{formatCurrency(target.actualMarketValue)}</td>
                                </tr>
                              )) : null}
                            </React.Fragment>
                          ))}

                          {module.targets.length > 0 && (
                            <React.Fragment key={`direct-targets-${module.moduleId}`}>
                              <tr className="bg-slate-50/30">
                                <td className="px-3 py-2 pl-10">
                                  <span className="text-sm font-bold text-slate-600">直接标的</span>
                                </td>
                                <td className="px-3 py-2 text-right text-slate-400">-</td>
                                <td className="px-3 py-2 text-right text-slate-400">-</td>
                                <td className="px-3 py-2 text-right text-slate-400">-</td>
                                <td className="px-3 py-2 text-right font-mono text-slate-400">-</td>
                                <td className="px-3 py-2 text-right font-mono text-slate-400">-</td>
                              </tr>
                              {module.targets.map((target) => {
                                const targetPlanAmount = module.planAmount * (target.planPercentage / 100);
                                const targetActualPercentage = module.actualAmount > 0 ? (target.actualMarketValue / module.actualAmount) * 100 : 0;
                                const targetPercentageDeviation = targetActualPercentage - target.planPercentage;

                                return (
                                  <tr key={target.id} className="bg-slate-50/50">
                                    <td className="px-3 py-2 pl-16">
                                      <span className="text-slate-500">{target.name}</span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-slate-400 text-xs">{formatPercentage(target.planPercentage)}</td>
                                    <td className="px-3 py-2 text-right text-slate-400 text-xs">{formatPercentage(targetActualPercentage)}</td>
                                    <td className={`px-3 py-2 text-right text-xs ${getDeviationColor(targetPercentageDeviation)}`}>
                                      {targetPercentageDeviation > 0 ? '+' : ''}{formatPercentage(targetPercentageDeviation)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-400 text-xs">¥{formatCurrency(targetPlanAmount)}</td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-500 text-xs">¥{formatCurrency(target.actualMarketValue)}</td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          )}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-600 mb-3">偏差分析</h3>
            <div className="grid grid-cols-2 gap-3">
              {analysis.modules.map((module) => (
                <div key={module.moduleId} className={`rounded-lg p-3 ${getDeviationBgColor(module.percentageDeviation)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700">{module.moduleName}</span>
                    {getDeviationIcon(module.percentageDeviation)}
                  </div>
                  <div className={`text-lg font-black ${getDeviationColor(module.percentageDeviation)}`}>
                    {module.percentageDeviation > 0 ? '超配' : '低配'}
                    {Math.abs(module.percentageDeviation).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {module.percentageDeviation > 0 ? '+' : ''}{formatCurrency(module.amountDeviation)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {analysis.modules.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">暂无仓位配置</p>
              <p className="text-xs mt-1">点击右上角设置按钮进行配置</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}