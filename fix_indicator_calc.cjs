const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `    try {
      const days = 3 * 252;
      const params = {
        url: 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get',
        params: {
          param: \`\${symbol},day,,,-\${days},qfq\`,
          _var: \`kline_day_qfq\${symbol}\`,
          r: Date.now()
        },
        responseType: 'text' as const
      };

      const response = await axios.get(params.url, {
        params: params.params,
        responseType: 'text'
      });

      let name = symbol.toUpperCase();
      let klines: string[] = [];

      try {
        const varName = params.params._var;
        const jsonStr = response.data.replace(\`var \${varName}=\`, '');
        const data = JSON.parse(jsonStr);
        
        const key = data.data ? Object.keys(data.data)[0] : null;
        if (key && data.data[key]) {
          const stockData = data.data[key];
          klines = stockData.day || stockData.qfqday || [];
        }

        if (data.data) {
          const info = data.data[symbol];
          if (info && info.name) {
            name = info.name;
          }
        }
      } catch (e) {
        console.error('解析K线数据失败:', e);
        klines = [];
      }

      if (klines.length === 0) {
        throw new Error('未获取到数据');
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

      const parsedData = parseKlines(klines, { name });`;

const newCode = `    try {
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

const newContent = content.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log('File updated successfully');
