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
      id: 'stock',
      name: '股票',
      planPercentage: 60,
      targets: [
        { id: 'tencent', name: '腾讯', planPercentage: 40, actualMarketValue: 2500000 },
        { id: 'alibaba', name: '阿里巴巴', planPercentage: 30, actualMarketValue: 2000000 },
        { id: 'moutai', name: '茅台', planPercentage: 30, actualMarketValue: 1800000 },
      ],
    },
    {
      id: 'bond',
      name: '债券',
      planPercentage: 30,
      targets: [
        { id: 'gov_bond', name: '国债', planPercentage: 60, actualMarketValue: 1800000 },
        { id: 'corp_bond', name: '企业债', planPercentage: 40, actualMarketValue: 1200000 },
      ],
    },
    {
      id: 'cash',
      name: '现金',
      planPercentage: 10,
      targets: [
        { id: 'cash_deposit', name: '活期存款', planPercentage: 100, actualMarketValue: 800000 },
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