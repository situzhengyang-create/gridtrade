const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

// 找到 calculateSingleIndicator 函数中 try 块的开始和结束
const startPattern = /(\s*const calculateSingleIndicator = async \(symbol: string\): Promise<void> => \{[\s\S]*?\s*try \{)/;
const endPattern = /(\s*const parsedData = parseKlines\(klines, \{ name \}\);)/;

const startMatch = content.match(startPattern);
const endMatch = content.match(endPattern);

if (!startMatch || !endMatch) {
  console.log('Pattern not found');
  process.exit(1);
}

const startIndex = startMatch.index + startMatch[1].length;
const endIndex = endMatch.index;

const beforeCode = content.substring(0, startIndex);
const afterCode = content.substring(endIndex);

const newCode = `
      const formattedSymbol = symbol.replace(/SH|SZ/i, '').toUpperCase();
      
      // 使用趋势交易模块相同的数据获取方式
      const rawData = await fetchDiagnosticData(formattedSymbol);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('未获取到数据');
      }

      // 获取股票名称
      let name = symbol.toUpperCase();
      try {
        const text = await fetchTencentQuote(\`s_\${symbol}\`);
        if (text && text.split('~').length > 1) {
          const fetchedName = text.split('~')[1];
          if (fetchedName && fetchedName !== 'N/A') {
            name = fetchedName;
          }
        }
      } catch(e) {
        console.warn('获取股票名称失败:', e);
      }

      setIndicatorCalcRecords(prev => ({
        ...prev,
        [symbol]: { 
          ...(prev[symbol] || { symbol, name }), 
          name,
          status: 'calculating',
          message: '正在计算指标...'
        }
      }));

      // 转换数据格式
      const parsedData: RawData[] = rawData.map(item => ({
        date: item.date,
        open: item.open,
        close: item.close,
        high: item.high,
        low: item.low,
        volume: item.volume,
        change_pct: item.change_pct
      }));`;

const newContent = beforeCode + newCode + afterCode;
fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log('File updated successfully');
