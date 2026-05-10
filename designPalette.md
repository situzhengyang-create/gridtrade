# GridTrade 视觉设计与配色方案说明

本说明书详细定义了 GridTrade 应用程序的 UI 视觉规范与配色方案，旨在确保应用在复刻过程中能够保持专业、严谨且具有金融质感的界面风格。

## 1. 核心调色板 (Core Palette)

应用采用了以 **Slate (石板色)** 为中性基调，配合 **Blue (蓝色)** 作为主行动色的现代金融设计风格。

| 颜色类型 | Tailwind 变量 (Level) | 十六进制 (Hex) / 含义 | 应用场景 |
| :--- | :--- | :--- | :--- |
| **主色 (Primary)** | `Blue-600` | `#2563EB` | 标题栏、主按钮、激活状态切换、高亮数值 |
| **主背景 (Bg)** | `Slate-50` | `#F8FAFC` | 页面全局背景、输入框底色 |
| **卡片背景** | `White` | `#FFFFFF` | 模块容器、列表行、对话框 |
| **边框 (Border)** | `Slate-200` | `#E2E8F0` | 分隔线、输入框边框、卡片描边 |

## 2. 语义化颜色设计 (Semantic Colors)

为了直观反馈诊断结论与盈亏状态，应用定义了四种语义色：

### 2.1 成功与正向 (Positive / Success)
*   **色系**: `Emerald` (祖母绿)
*   **组合**: `text-emerald-700 bg-emerald-50 border-emerald-200`
*   **场景**: “非常适合”结论、符合标准的 ✓ 标记、盈利动作。

### 2.2 引导与稳定 (Informing / Action)
*   **色系**: `Blue` (蓝色)
*   **组合**: `text-blue-700 bg-blue-50 border-blue-200`
*   **场景**: “适合”结论、当前选中的时间轴、计算结果展示。

### 2.3 警告与边界 (Warning / Caution)
*   **色系**: `Amber` (琥珀色)
*   **组合**: `text-amber-700 bg-amber-50 border-amber-200`
*   **场景**: “勉强适合”结论、网格交易的 0 轴参考位、风险提示背景。

### 2.4 危险与负向 (Danger / Negative)
*   **色系**: `Rose` / `Red` (玫瑰红)
*   **组合**: `text-rose-700 bg-rose-50 border-rose-200`
*   **场景**: “不适合”结论、最大回撤风险预警、失败状态提示。

## 3. 金融特性配色规范 (Financial-specific)

由于针对中国市场，应用遵循 **“红涨绿跌”** 的传统习惯：

*   **价格上涨/卖出位**: `text-red-500` (Red)
*   **价格下跌/买入位**: `text-green-500` (Green)
*   **金额/利润**: `text-blue-600` (强调金融资产属性)

## 4. 文字层级 (Typography Logic)

*   **强调正文**: `text-slate-900` / `font-black` (用于标题、核心结论数值)
*   **标准正文**: `text-slate-700` / `font-bold` (用于标签名、指标名称)
*   **辅助信息**: `text-slate-500` / `font-medium` (用于说明文字、次要指标)
*   **极弱/衬托**: `text-slate-400` / `text-[10px]` (用于时间戳、水印说明、背景单位)

## 5. UI 组件视觉细节

1.  **输入框 (Input)**: 
    *   背景 `bg-slate-50`，边框 `border-slate-200`。
    *   Focus 状态：`border-blue-500`, `ring-blue-500/20`。
2.  **卡片 (Card)**:
    *   带极细阴影或 `border-slate-100` 的 1px 描边。
    *   圆角规格：默认 `rounded-lg` (8px)，重要容器 `rounded-xl` (12px)。
3.  **按钮 (Button)**:
    *   主按钮选用 `bg-blue-600` 配 `text-white`。
    *   辅助按钮显示为 `bg-slate-100` 配 `text-slate-600`，Hover 时加深为 `bg-slate-200`。
4.  **图标 (Icons)**:
    *   统一采用 `Lucide-React` 图标库，线条粗细保持全局一致。
