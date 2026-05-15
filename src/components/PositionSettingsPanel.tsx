import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Check, X, ArrowLeft, AlertTriangle, Clipboard, CheckCheck, Move, Trash, AlertCircle } from 'lucide-react';
import { PositionPortfolio, PositionModule, PositionTarget } from '../types';

interface PositionSettingsPanelProps {
  portfolio: PositionPortfolio;
  totalAmount: number;
  onPortfolioChange: (portfolio: PositionPortfolio) => void;
  onTotalAmountChange: (amount: number) => void;
  onBack: () => void;
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
  return value.toFixed(2) + '%';
};

interface PasteResult {
  matched: Record<string, number>;
  newTargets: Array<{ name: string; value: number }>;
  missingTargets: Array<{ id: string; name: string; moduleName: string }>;
}

export default function PositionSettingsPanel({
  portfolio,
  totalAmount,
  onPortfolioChange,
  onTotalAmountChange,
  onBack,
}: PositionSettingsPanelProps) {
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModulePercentage, setNewModulePercentage] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModulePercentage, setEditingModulePercentage] = useState('');
  const [marketValueInput, setMarketValueInput] = useState<Record<string, string>>({});
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [pasteResult, setPasteResult] = useState<PasteResult | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movingTargetId, setMovingTargetId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'modules' | 'targets'>('modules');

  const totalModulePercentage = useMemo(() => {
    return portfolio.modules.reduce((sum, m) => sum + m.planPercentage, 0);
  }, [portfolio.modules]);

  const allTargets = useMemo(() => {
    const targets: Array<{ target: PositionTarget; moduleId: string; moduleName: string }> = [];
    portfolio.modules.forEach(module => {
      module.targets.forEach(target => {
        targets.push({ target, moduleId: module.id, moduleName: module.name });
      });
    });
    return targets;
  }, [portfolio.modules]);

  useEffect(() => {
    localStorage.setItem('position_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    const initialValues: Record<string, string> = {};
    portfolio.modules.forEach(module => {
      module.targets.forEach(target => {
        initialValues[target.id] = target.actualMarketValue.toString();
      });
    });
    setMarketValueInput(initialValues);
  }, [portfolio]);

  const handleTotalAmountChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onTotalAmountChange(num);
    }
  };

  const handleAddModule = () => {
    if (!newModuleName.trim()) return;
    const percentage = parseFloat(newModulePercentage);
    if (isNaN(percentage) || percentage <= 0) return;
    if (totalModulePercentage + percentage > 100) return;

    const newModule: PositionModule = {
      id: crypto.randomUUID(),
      name: newModuleName.trim(),
      planPercentage: percentage,
      targets: [],
    };

    onPortfolioChange({ ...portfolio, modules: [...portfolio.modules, newModule] });
    setNewModuleName('');
    setNewModulePercentage('');
    setShowAddModule(false);
  };

  const handleDeleteModule = (moduleId: string) => {
    onPortfolioChange({ ...portfolio, modules: portfolio.modules.filter(m => m.id !== moduleId) });
  };

  const handleStartEditModule = (module: PositionModule) => {
    setEditingModuleId(module.id);
    setEditingModulePercentage(module.planPercentage.toString());
  };

  const handleSaveModulePercentage = (moduleId: string) => {
    const newPercentage = parseFloat(editingModulePercentage);
    if (isNaN(newPercentage) || newPercentage < 0) {
      setEditingModuleId(null);
      setEditingModulePercentage('');
      return;
    }

    const module = portfolio.modules.find(m => m.id === moduleId);
    if (!module) {
      setEditingModuleId(null);
      setEditingModulePercentage('');
      return;
    }

    const otherModulesTotal = totalModulePercentage - module.planPercentage;
    if (otherModulesTotal + newPercentage > 100) {
      setEditingModuleId(null);
      setEditingModulePercentage('');
      return;
    }

    onPortfolioChange({
      ...portfolio,
      modules: portfolio.modules.map(m => m.id === moduleId ? { ...m, planPercentage: newPercentage } : m),
    });
    setEditingModuleId(null);
    setEditingModulePercentage('');
  };

  const handleAddTarget = (moduleId: string) => {
    const module = portfolio.modules.find(m => m.id === moduleId);
    if (!module) return;

    const targetPlanPercentage = module.targets.length === 0 ? 100 : 0;
    const newTarget: PositionTarget = {
      id: crypto.randomUUID(),
      name: '新标的',
      planPercentage: targetPlanPercentage,
      actualMarketValue: 0,
    };

    onPortfolioChange({
      ...portfolio,
      modules: portfolio.modules.map(m =>
        m.id === moduleId ? { ...m, targets: [...m.targets, newTarget] } : m
      ),
    });
    setMarketValueInput(prev => ({ ...prev, [newTarget.id]: '0' }));
  };

  const handleDeleteTarget = (moduleId: string, targetId: string) => {
    const updatedPortfolio = {
      ...portfolio,
      modules: portfolio.modules.map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          targets: m.targets.filter(t => t.id !== targetId),
        };
      }),
    };
    onPortfolioChange(updatedPortfolio);
    setMarketValueInput(prev => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  };

  const handleMarketValueChange = (targetId: string, value: string) => {
    setMarketValueInput(prev => ({ ...prev, [targetId]: value }));
  };

  const handleSaveAllMarketValues = () => {
    const updatedPortfolio = {
      ...portfolio,
      modules: portfolio.modules.map(module => ({
        ...module,
        targets: module.targets.map(target => ({
          ...target,
          actualMarketValue: parseFloat(marketValueInput[target.id] || target.actualMarketValue.toString()) || target.actualMarketValue,
        })),
      })),
    };
    onPortfolioChange(updatedPortfolio);
  };

  const parsePasteText = (text: string): PasteResult => {
    const lines = text.split(/[\n\r]+/);
    const matched: Record<string, number> = {};
    const newTargets: Array<{ name: string; value: number }> = [];
    const existingTargetNames = new Set<string>();
    
    portfolio.modules.forEach(module => {
      module.targets.forEach(target => {
        existingTargetNames.add(target.name);
      });
    });

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const name = parts.slice(0, -1).join(' ').trim();
        const value = parseFloat(parts[parts.length - 1]);
        if (!isNaN(value) && name) {
          let found = false;
          portfolio.modules.forEach(module => {
            module.targets.forEach(target => {
              if (target.name === name) {
                matched[target.id] = value;
                found = true;
              }
            });
          });
          if (!found) {
            newTargets.push({ name, value });
          }
        }
      }
    });

    const pastedNames = new Set([...Object.keys(matched).map(id => {
      for (const module of portfolio.modules) {
        const target = module.targets.find(t => t.id === id);
        if (target) return target.name;
      }
      return '';
    }), ...newTargets.map(t => t.name)]);

    const missingTargets: Array<{ id: string; name: string; moduleName: string }> = [];
    portfolio.modules.forEach(module => {
      module.targets.forEach(target => {
        if (!pastedNames.has(target.name)) {
          missingTargets.push({ id: target.id, name: target.name, moduleName: module.name });
        }
      });
    });

    return { matched, newTargets, missingTargets };
  };

  const handlePreviewPaste = () => {
    const result = parsePasteText(pasteText);
    setPasteResult(result);
    if (result.missingTargets.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      handleExecutePaste(result);
    }
  };

  const handleExecutePaste = (result: PasteResult) => {
    let updatedPortfolio = { ...portfolio };

    Object.entries(result.matched).forEach(([targetId, value]) => {
      updatedPortfolio.modules = updatedPortfolio.modules.map(module => ({
        ...module,
        targets: module.targets.map(target =>
          target.id === targetId ? { ...target, actualMarketValue: value } : target
        ),
      }));
    });

    if (result.newTargets.length > 0) {
      let defaultModule = updatedPortfolio.modules.find(m => m.name === '其他' || m.name === '默认');
      if (!defaultModule) {
        defaultModule = {
          id: crypto.randomUUID(),
          name: '其他',
          planPercentage: 0,
          targets: [],
        };
        updatedPortfolio.modules = [...updatedPortfolio.modules, defaultModule];
      }

      result.newTargets.forEach(newTarget => {
        const target: PositionTarget = {
          id: crypto.randomUUID(),
          name: newTarget.name,
          planPercentage: 0,
          actualMarketValue: newTarget.value,
        };
        updatedPortfolio.modules = updatedPortfolio.modules.map(module =>
          module.id === defaultModule!.id
            ? { ...module, targets: [...module.targets, target] }
            : module
        );
      });
    }

    if (result.missingTargets.length > 0) {
      result.missingTargets.forEach(missing => {
        updatedPortfolio.modules = updatedPortfolio.modules.map(module => ({
          ...module,
          targets: module.targets.filter(t => t.id !== missing.id),
        }));
      });
    }

    onPortfolioChange(updatedPortfolio);
    setPasteSuccess(true);
    setTimeout(() => setPasteSuccess(false), 2000);
    setShowPasteArea(false);
    setPasteText('');
    setPasteResult(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = () => {
    if (pasteResult) {
      handleExecutePaste(pasteResult);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPasteResult(null);
  };

  const handleMoveTarget = (targetId: string, newModuleId: string) => {
    let movedTarget: PositionTarget | null = null;
    let sourceModuleId: string | null = null;

    const tempPortfolio = { ...portfolio };
    tempPortfolio.modules = tempPortfolio.modules.map(module => ({
      ...module,
      targets: module.targets.filter(target => {
        if (target.id === targetId) {
          movedTarget = target;
          sourceModuleId = module.id;
          return false;
        }
        return true;
      }),
    }));

    if (movedTarget && sourceModuleId && sourceModuleId !== newModuleId) {
      tempPortfolio.modules = tempPortfolio.modules.map(module =>
        module.id === newModuleId
          ? { ...module, targets: [...module.targets, movedTarget!] }
          : module
      );
      onPortfolioChange(tempPortfolio);
    }
    setMovingTargetId(null);
  };

  const handleSaveTargetName = (moduleId: string, targetId: string, newName: string) => {
    onPortfolioChange({
      ...portfolio,
      modules: portfolio.modules.map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          targets: m.targets.map(t =>
            t.id === targetId ? { ...t, name: newName } : t
          ),
        };
      }),
    });
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
          <h1 className="text-lg font-black text-slate-900">仓位设置</h1>
          <p className="text-xs text-slate-500">{portfolio.name}</p>
        </div>
        <button
          onClick={() => setShowPasteArea(!showPasteArea)}
          className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Clipboard className="w-3.5 h-3.5" />
          批量粘贴
        </button>
      </header>

      <div className="flex border-b border-slate-100 bg-white">
        <button
          onClick={() => setViewMode('modules')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${viewMode === 'modules' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          模块管理
        </button>
        <button
          onClick={() => setViewMode('targets')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${viewMode === 'targets' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          标的汇总
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-xl p-4 border border-slate-100">
            <h2 className="text-xs font-bold text-slate-600 mb-2">总投资金额</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">¥</span>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                className="text-2xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none px-2 py-1 w-40"
              />
              <span className="text-sm text-slate-500">元</span>
            </div>
          </div>

          {showPasteArea && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h2 className="text-xs font-bold text-green-700 mb-2 flex items-center gap-2">
                <Clipboard className="w-3.5 h-3.5" />
                批量粘贴市值数据
              </h2>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="粘贴格式（每行一个）：&#10;证券名1 市值金额&#10;证券名2 市值金额&#10;..."
                className="w-full h-32 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm outline-none focus:border-green-500 resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handlePreviewPaste}
                  disabled={!pasteText.trim()}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  {pasteSuccess ? <CheckCheck className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  {pasteSuccess ? '粘贴成功' : '粘贴匹配'}
                </button>
                <button
                  onClick={() => {
                    setShowPasteArea(false);
                    setPasteText('');
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
              <p className="text-[10px] text-green-600 mt-2">
                新标的自动添加到"其他"模块，不存在的标的将提示是否删除
              </p>
            </div>
          )}

          {totalModulePercentage !== 100 && viewMode === 'modules' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">模块比例总和异常</p>
                <p className="text-[10px] text-amber-600">当前: {formatPercentage(totalModulePercentage)}，需要: 100%</p>
              </div>
            </div>
          )}

          {viewMode === 'modules' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800">投资模块</h2>
                <button
                  onClick={() => setShowAddModule(true)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加
                </button>
              </div>

              {showAddModule && (
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="模块名称"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newModulePercentage}
                      onChange={(e) => setNewModulePercentage(e.target.value)}
                      placeholder="计划比例 %"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs text-slate-500 self-center">
                      剩余: {formatPercentage(100 - totalModulePercentage)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddModule}
                      disabled={!newModuleName.trim() || !newModulePercentage || totalModulePercentage + parseFloat(newModulePercentage) > 100}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => {
                        setShowAddModule(false);
                        setNewModuleName('');
                        setNewModulePercentage('');
                      }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {portfolio.modules.map((module) => (
                  <div key={module.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-700">{module.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{module.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingModuleId === module.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingModulePercentage}
                              onChange={(e) => setEditingModulePercentage(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500"
                              autoFocus
                            />
                            <span className="text-xs text-slate-500">%</span>
                            <button
                              onClick={() => handleSaveModulePercentage(module.id)}
                              className="p-1 hover:bg-green-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingModuleId(null);
                                setEditingModulePercentage('');
                              }}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <X className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-slate-600">{formatPercentage(module.planPercentage)}</span>
                            <button
                              onClick={() => handleStartEditModule(module)}
                              className="p-1 hover:bg-slate-100 rounded"
                            >
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteModule(module.id)}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500">投资标的</span>
                        <button
                          onClick={() => handleAddTarget(module.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-3 h-3 inline mr-0.5" />
                          添加
                        </button>
                      </div>

                      {module.targets.length === 0 ? (
                        <div className="text-center py-3 text-xs text-slate-400">
                          暂无标的
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {module.targets.map((target) => (
                            <div key={target.id} className="bg-slate-50 rounded p-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-slate-800 truncate">{target.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    计划 {formatPercentage(target.planPercentage)}
                                  </div>
                                </div>
                                <input
                                  type="number"
                                  value={marketValueInput[target.id] || target.actualMarketValue}
                                  onChange={(e) => handleMarketValueChange(target.id, e.target.value)}
                                  className="w-32 px-2 py-1.5 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500 text-right font-mono"
                                />
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteTarget(module.id, target.id)}
                                    className="p-1 hover:bg-red-50 rounded"
                                  >
                                    <Trash className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {portfolio.modules.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  <p>点击上方按钮添加投资模块</p>
                </div>
              )}
            </>
          )}

          {viewMode === 'targets' && (
            <>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                  <h2 className="text-sm font-black text-slate-800">所有标的</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500">标的名称</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500">所属模块</th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500">计划%</th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500">市值</th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold text-slate-500">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allTargets.map(({ target, moduleId, moduleName }) => (
                        <tr key={target.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={target.name}
                              onChange={(e) => handleSaveTargetName(moduleId, target.id, e.target.value)}
                              className="text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {movingTargetId === target.id ? (
                              <select
                                value={moduleId}
                                onChange={(e) => handleMoveTarget(target.id, e.target.value)}
                                className="text-sm text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                autoFocus
                              >
                                {portfolio.modules.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600">{moduleName}</span>
                                <button
                                  onClick={() => setMovingTargetId(target.id)}
                                  className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Move className="w-3 h-3 text-slate-400" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-500">{formatPercentage(target.planPercentage)}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600">
                            <input
                              type="number"
                              value={marketValueInput[target.id] || target.actualMarketValue}
                              onChange={(e) => handleMarketValueChange(target.id, e.target.value)}
                              className="w-28 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500 text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setMovingTargetId(target.id)}
                                className="p-1 hover:bg-slate-100 rounded"
                                title="移动"
                              >
                                <Move className="w-3 h-3 text-slate-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteTarget(moduleId, target.id)}
                                className="p-1 hover:bg-red-50 rounded"
                                title="删除"
                              >
                                <Trash className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {allTargets.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">暂无标的</p>
                </div>
              )}
            </>
          )}

          {(viewMode === 'modules' || allTargets.length > 0) && (
            <button
              onClick={handleSaveAllMarketValues}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              保存所有数据
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && pasteResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-2">确认删除</h3>
                <p className="text-sm text-slate-600">
                  粘贴的数据中缺少以下标的，是否确认删除这些标的？
                </p>
                <div className="mt-3 max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3">
                  {pasteResult.missingTargets.map((missing, index) => (
                    <div key={index} className="text-sm text-slate-700 py-1 border-b border-slate-100 last:border-0">
                      <span className="font-bold">{missing.name}</span>
                      <span className="text-slate-500 ml-2">({missing.moduleName})</span>
                    </div>
                  ))}
                </div>
                {pasteResult.newTargets.length > 0 && (
                  <div className="mt-3 text-xs text-green-600 bg-green-50 rounded-lg p-2">
                    将新增 {pasteResult.newTargets.length} 个标的到"其他"模块
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}