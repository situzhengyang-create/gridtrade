const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/trendIndicatorService.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldImport1 = "import { RawData, TrendIndicator, MA20Signal, MACDSignal, ADXSignal, BollingerSignal, TrendParams } from '../types';";
const newImport1 = "import { RawData, TrendIndicator, MA20Signal, MACDSignal, ADXSignal, BollingerSignal } from '../types';";

const oldImport2 = "import { defaultTrendParams } from '../types/params';";
const newImport2 = "import { TrendParams, defaultTrendParams } from '../types/params';";

content = content.replace(oldImport1, newImport1);
content = content.replace(oldImport2, newImport2);

fs.writeFileSync(filePath, content);
console.log('Fixed imports in trendIndicatorService.ts');
