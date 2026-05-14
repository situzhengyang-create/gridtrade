const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 检查是否已经添加了指标计算功能
if (content.includes('IndicatorCalculatorPanel')) {
  console.log('Indicator calculator already applied');
  process.exit(0);
}

// 1. 添加导入
const importsToAdd = `
import IndicatorCalculatorPanel from './components/IndicatorCalculatorPanel';
import IndicatorReportPanel from './components/IndicatorReportPanel';
import { calculateAllIndicators, parseKlines } from './services/indicatorCalculator';
import { CalculationRecord, ComprehensiveIndicatorReport } from './types';`;

let newContent = content.replace(
  /enum AppView \{/,
  importsToAdd + '\n\nenum AppView {'
);

// 2. 添加新的视图枚举
newContent = newContent.replace(
  /INDICATOR_DETAIL = 'INDICATOR_DETAIL'/,
  'INDICATOR_DETAIL = \'INDICATOR_DETAIL\',\n  INDICATOR_CALCULATOR = \'INDICATOR_CALCULATOR\',\n  INDICATOR_REPORT = \'INDICATOR_REPORT\''
);

console.log('Basic changes applied');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
