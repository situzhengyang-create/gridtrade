export interface GridLevel {
  level: number; // 0 is initial, positive is above, negative is below
  price: number;
  amount: number;
  profit: number;
  type: 'buy' | 'sell' | 'initial';
}

export interface GridStrategy {
  id: string;
  name: string;
  initialPrice: number;
  gridInterval: number; // 间距 %
  initialAmount: number; // 初始金额
  stepValue: number; // 步进值 (百分比或金额)
  stepType: 'percent' | 'amount'; // 步进类型
  commissionRate: number; // 佣金率 %
  placedLevels?: number[]; // 已设置的层级
  triggeredLevels?: number[]; // 已触发的层级
  createdAt: number;
}

export interface AppState {
  strategies: GridStrategy[];
  activeStrategyId: string | null;
}
