import React, { useState, useEffect } from 'react';
import { PositionPortfolio } from '../types';
import PositionDashboardPanel from './PositionDashboardPanel';
import PositionSettingsPanel from './PositionSettingsPanel';

interface PositionManagementPanelProps {
  onOpenNav: () => void;
}

const defaultPortfolio: PositionPortfolio = {
  id: 'default',
  name: '我的投资组合',
  totalAmount: 10000000,
  modules: [
    {
      id: 'core',
      name: '核心',
      planPercentage: 40,
      targets: [
        { id: 'core1', name: '核心资产1', planPercentage: 50, actualMarketValue: 2000000 },
        { id: 'core2', name: '核心资产2', planPercentage: 50, actualMarketValue: 2000000 },
      ],
    },
    {
      id: 'offense',
      name: '进攻',
      planPercentage: 30,
      targets: [
        { id: 'offense1', name: '成长股', planPercentage: 60, actualMarketValue: 1800000 },
        { id: 'offense2', name: '主题投资', planPercentage: 40, actualMarketValue: 1200000 },
      ],
    },
    {
      id: 'hedge',
      name: '对冲',
      planPercentage: 15,
      targets: [
        { id: 'hedge1', name: '对冲工具', planPercentage: 100, actualMarketValue: 1500000 },
      ],
    },
    {
      id: 'defense',
      name: '防守',
      planPercentage: 15,
      targets: [
        { id: 'defense1', name: '现金', planPercentage: 60, actualMarketValue: 900000 },
        { id: 'defense2', name: '国债', planPercentage: 40, actualMarketValue: 600000 },
      ],
    },
  ],
};

type ViewMode = 'dashboard' | 'settings';

export default function PositionManagementPanel({ onOpenNav }: PositionManagementPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [portfolio, setPortfolio] = useState<PositionPortfolio>(() => {
    const saved = localStorage.getItem('position_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultPortfolio;
      }
    }
    return defaultPortfolio;
  });
  const [totalAmount, setTotalAmount] = useState(portfolio.totalAmount);

  useEffect(() => {
    localStorage.setItem('position_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    setTotalAmount(portfolio.totalAmount);
  }, [portfolio.totalAmount]);

  const handlePortfolioChange = (newPortfolio: PositionPortfolio) => {
    setPortfolio(newPortfolio);
  };

  const handleTotalAmountChange = (amount: number) => {
    setTotalAmount(amount);
    setPortfolio(prev => ({ ...prev, totalAmount: amount }));
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
  };

  const handleOpenSettings = () => {
    setViewMode('settings');
  };

  if (viewMode === 'settings') {
    return (
      <PositionSettingsPanel
        portfolio={portfolio}
        totalAmount={totalAmount}
        onPortfolioChange={handlePortfolioChange}
        onTotalAmountChange={handleTotalAmountChange}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <PositionDashboardPanel
      portfolio={portfolio}
      totalAmount={totalAmount}
      onOpenNav={onOpenNav}
      onOpenSettings={handleOpenSettings}
    />
  );
}