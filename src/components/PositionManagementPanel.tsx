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
      categories: [
        {
          id: 'core_cat1',
          name: '蓝筹股',
          planPercentage: 60,
          targets: [
            { id: 'core1', name: '贵州茅台', planPercentage: 50, actualMarketValue: 1200000, categoryId: 'core_cat1' },
            { id: 'core2', name: '招商银行', planPercentage: 50, actualMarketValue: 1200000, categoryId: 'core_cat1' },
          ],
        },
        {
          id: 'core_cat2',
          name: '消费龙头',
          planPercentage: 40,
          targets: [
            { id: 'core3', name: '五粮液', planPercentage: 60, actualMarketValue: 960000, categoryId: 'core_cat2' },
            { id: 'core4', name: '格力电器', planPercentage: 40, actualMarketValue: 640000, categoryId: 'core_cat2' },
          ],
        },
      ],
      targets: [],
    },
    {
      id: 'offense',
      name: '进攻',
      planPercentage: 30,
      categories: [
        {
          id: 'offense_cat1',
          name: '科技成长',
          planPercentage: 70,
          targets: [
            { id: 'offense1', name: '腾讯控股', planPercentage: 40, actualMarketValue: 840000, categoryId: 'offense_cat1' },
            { id: 'offense2', name: '比亚迪', planPercentage: 35, actualMarketValue: 735000, categoryId: 'offense_cat1' },
            { id: 'offense3', name: '宁德时代', planPercentage: 25, actualMarketValue: 525000, categoryId: 'offense_cat1' },
          ],
        },
        {
          id: 'offense_cat2',
          name: '主题投资',
          planPercentage: 30,
          targets: [
            { id: 'offense4', name: 'AIETF', planPercentage: 100, actualMarketValue: 900000, categoryId: 'offense_cat2' },
          ],
        },
      ],
      targets: [],
    },
    {
      id: 'hedge',
      name: '对冲',
      planPercentage: 15,
      categories: [
        {
          id: 'hedge_cat1',
          name: '期权策略',
          planPercentage: 100,
          targets: [
            { id: 'hedge1', name: '保护性看跌', planPercentage: 100, actualMarketValue: 1500000, categoryId: 'hedge_cat1' },
          ],
        },
      ],
      targets: [],
    },
    {
      id: 'defense',
      name: '防守',
      planPercentage: 15,
      categories: [
        {
          id: 'defense_cat1',
          name: '现金类',
          planPercentage: 60,
          targets: [
            { id: 'defense1', name: '货币基金', planPercentage: 100, actualMarketValue: 900000, categoryId: 'defense_cat1' },
          ],
        },
        {
          id: 'defense_cat2',
          name: '固收类',
          planPercentage: 40,
          targets: [
            { id: 'defense2', name: '国债ETF', planPercentage: 100, actualMarketValue: 600000, categoryId: 'defense_cat2' },
          ],
        },
      ],
      targets: [],
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