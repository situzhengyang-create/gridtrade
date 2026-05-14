// 使用 Node.js 安全地应用指标计算功能更改
const fs = require('fs');
const path = require('path');

// 读取原始文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. 添加导入
const importsToAdd = `
import IndicatorCalculatorPanel from './components/IndicatorCalculatorPanel';
import IndicatorReportPanel from './components/IndicatorReportPanel';
import { calculateAllIndicators, parseKlines } from './services/indicatorCalculator';
import { CalculationRecord, ComprehensiveIndicatorReport } from './types';`;

// 在 'enum AppView {' 之前添加导入
let newContent = content.replace(
  /enum AppView \{/,
  importsToAdd + '\n\nenum AppView {'
);

// 2. 添加新的视图枚举
newContent = newContent.replace(
  /INDICATOR_DETAIL = 'INDICATOR_DETAIL'/,
  'INDICATOR_DETAIL = \'INDICATOR_DETAIL\',\n  INDICATOR_CALCULATOR = \'INDICATOR_CALCULATOR\',\n  INDICATOR_REPORT = \'INDICATOR_REPORT\''
);

console.log('Indicator calculation changes applied successfully');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
