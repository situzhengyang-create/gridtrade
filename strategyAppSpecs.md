# GridTrade 核心逻辑与功能开发规格说明书

本说明书详细记录了 GridTrade 的核心业务逻辑、数据处理公式及界面功能实现细节，旨在为 UI/逻辑复刻提供完整参考。

## 1. 核心数据类型声明 (`src/types.ts`)

```typescript
// 诊断报告子报告（对应不同时间轴）
export interface DiagnosisReport {
  score: number;             // 总分 (0-10)
  rating: string;            // 评级文字
  suggestion: string;        // 核心建议
  detailedScores: {          // 四大维度扣分/加分明细
    trend: number;
    volatility: number;
    oscillation: number;
    priceDistribution: number;
  };
  details: {                 // 具体计算数值
    cumulativeReturn: number;
    annualizedVolatility: number;
    averageIntradayVolatility: number;
    trendChangeFreq: number;
    bollingerRatio: number;
    maxConsecutiveUp: number;
    maxConsecutiveDown: number;
  };
  backtest: {               // 实盘指导数据
    historicalMin: number;
    historicalMax: number;
    safeGridMin: number;
    safeGridMax: number;
    maxDrawdown: number;
    avgDailyAmplitude: number;
    medianDailyAmplitude: number;
    recommendedGridSize: number;
  };
  summary: {
    date: string;
    currentPrice: number;
  };
  advantages: string[];      // 优势文案
  risks: string[];           // 风险文案
  interpretations: Record<string, string>; // 指标口语化解释
  metricsInfo?: Record<string, MetricInfo>; // 算法详析内容
}

// 网格层级结构
export interface GridLevel {
  level: number;       // 层级 (从 1 开始)
  price: number;       // 该层价格
  amount: number;      // 该层买入金额
  profit: number;      // 对应的单网格利润 (预估值)
  isPlaced: boolean;   // UI 状态：是否已下单
  isTriggered: boolean; // UI 状态：是否已成交
}
```

## 2. 实时行情获取逻辑 (`src/App.tsx: getLivePrice`)

系统采用顺序降级策略获取最新收盘价：

1.  **API 1 (Sina)**: 尝试从 `https://quotes.sina.cn/cn/api/jsonp.php/var%20s_` + `symbol` + `=/JS_StdData/` 获取。
2.  **API 2 (Tencent)**: 尝试从 `https://qt.gtimg.cn/q=` + `symbol` 获取。
3.  **解析逻辑**: 腾讯 API 返回文本格式，通过 `split('~')` 获取第 [3] 位数据作为现价。
4.  **失败处理**: 若所有 API 失败，返回 0。

## 3. 分析算法全流程 (`src/services/gridDiagnosticService.ts`)

### 3.1 维度 A：趋势强度分析 (满分 3 分)
*   **累计收益率**: `((End - Start) / Start) * 100`。
*   **最大连涨/连跌天数**: 统计价格序列中连续正收益和负收益的最大长度。
*   **评分规则**:
    *   累计收益率在 `(-10%, 10%)` 区间：+1 分。
    *   最大连续上涨或下跌天数 ≤ 3 天：+2 分。
    *   最大连续涨跌 ≤ 5 天：+1 分。

### 3.2 维度 B：波动水平分析 (满分 3 分)
*   **年化波动率**: `stdDev(DailyLogReturns) * sqrt(252)`。
*   **日均振幅**: `mean((High - Low) / PrevClose)`。
*   **评分规则**:
    *   `[20%, 40%]` 的年化波动率：3 分。
    *   `[15%, 20%)` 或 `(40%, 50%]`：2 分。
    *   `> 50%`: 1 分。
    *   `< 15%`: 0 分。

### 3.3 维度 C：震荡特征 (满分 2 分)
*   **交替频率**: 统计收盘价变动方向切换的频率。
*   **算法**: `DirectionChanges / (TotalDays - 2)`。
*   **评分规则**:
    *   频率 ≥ 50%：2 分。
    *   频率 ≥ 40%：1 分。

### 3.4 维度 D：价格分布 (满分 2 分)
*   **布林占比**: 价格在 `MA20 ± 2*StdDev` 范围内的天数比例。
*   **评分规则**:
    *   占比 ≥ 90%：2 分。
    *   占比 ≥ 80%：1 分。

## 4. 界面功能逻辑详解

### 4.1 筛选与排序 (`sortedStrategies`)
*   **过滤**: 当 `isFiltered` 为真时，隐藏结论为 "不适合"、"数据不足"、"获取失败" 的条目。
*   **排序**: 当模式为 `CONCLUSION` 时，按 3Y/2Y/1Y 三个报告的平均分降序排列。

### 4.2 文字颜色映射
*   **非常适合 / 适合**: `text-blue-600` 或 `text-emerald-600`。
*   **勉强适合**: `text-amber-500`。
*   **不适合**: `text-rose-500`。

### 4.3 网格生成逻辑
*   **价格计算**: `Price_i = BasePrice * (1 - Interval * i)`。
*   **金额计算**: 根据递增类型（百分比/固定），计算每一层的预设买入金额。
*   **回撤警告**: 在网格列表中，若某个价格跌破了历史周期内的最大回撤线，则在对应位置插入红色警告分割线。

## 5. 持久化与状态管理
*   **状态同步**: `useEffect` 监听核心 Map 的变化，实时写入 `localStorage`。
*   **滑动手势**: 详情页支持左右滑动切换标的，通过监听 `touchstart/touchend` 计算 `deltaX` 并修改 `viewSymbol` 实现。
