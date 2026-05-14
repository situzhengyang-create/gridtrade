const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 检查是否已经添加了完整功能
if (content.includes('indicatorCalcSymbols')) {
  console.log('Indicator calculator features already added');
  process.exit(0);
}

// 找到状态变量定义的位置并添加指标计算相关状态
const stateMarker = '// New delete mode states';
const stateCode = `// 指标计算模块状态
  const [indicatorCalcSymbols, setIndicatorCalcSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('indicator_calc_symbols');
    return saved ? Array.from(new Set(JSON.parse(saved) as string[])) : [];
  });
  const [indicatorCalcRecords, setIndicatorCalcRecords] = useState<Record<string, CalculationRecord>>(() => {
    const saved = localStorage.getItem('indicator_calc_records');
    return saved ? JSON.parse(saved) : {};
  });
  const [showIndicatorAddPanel, setShowIndicatorAddPanel] = useState(false);
  const [indicatorSymbolsInput, setIndicatorSymbolsInput] = useState('');
  const [isIndicatorCalculating, setIsIndicatorCalculating] = useState(false);
  const [indicatorCalculatingProgress, setIndicatorCalculatingProgress] = useState(0);
  const [indicatorCalculatingSymbol, setIndicatorCalculatingSymbol] = useState<string | null>(null);
  const [indicatorReportSymbol, setIndicatorReportSymbol] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('indicator_calc_symbols', JSON.stringify(indicatorCalcSymbols));
  }, [indicatorCalcSymbols]);

  useEffect(() => {
    localStorage.setItem('indicator_calc_records', JSON.stringify(indicatorCalcRecords));
  }, [indicatorCalcRecords]);

  // 批量添加证券到指标计算列表
  const handleBatchAddIndicatorSymbols = (input: string) => {
    const symbols = input
      .split(/[\\s,，\\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        const lower = s.toLowerCase();
        if (/^\\d{6}$/.test(s)) {
          if (s.startsWith('6')) return 'sh' + s;
          return 'sz' + s;
        }
        return lower;
      });

    if (symbols.length === 0) return;

    setIndicatorCalcSymbols(prev => {
      const existing = new Set(prev);
      const newSymbols = symbols.filter(s => !existing.has(s));
      return [...prev, ...newSymbols];
    });

    setIndicatorCalcRecords(prev => {
      const next = { ...prev };
      symbols.forEach(s => {
        if (!next[s]) {
          next[s] = { symbol: s, name: s.toUpperCase(), status: 'pending' };
        }
      });
      return next;
    });
  };

  // 从指标计算列表移除证券
  const handleRemoveIndicatorSymbol = (symbol: string) => {
    setIndicatorCalcSymbols(prev => prev.filter(s => s !== symbol));
    setIndicatorCalcRecords(prev => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  };

  // 计算单个证券的指标
  const calculateSingleIndicator = async (symbol: string): Promise<void> => {
    setIndicatorCalcRecords(prev => ({
      ...prev,
      [symbol]: { 
        ...(prev[symbol] || { symbol, name: symbol.toUpperCase() }), 
        status: 'calculating',
        message: '正在获取数据...'
      }
    }));

    try {
      const formattedSymbol = symbol.replace(/SH|SZ/i, '').toUpperCase();
      const rawData = await fetchDiagnosticData(formattedSymbol);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('未获取到数据');
      }

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

      const parsedData: RawData[] = rawData.map(item => ({
        date: item.date,
        open: item.open,
        close: item.close,
        high: item.high,
        low: item.low,
        volume: item.volume,
        change_pct: item.change_pct
      }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const report = calculateAllIndicators(parsedData, symbol, name);

      if (!report) {
        throw new Error('指标计算失败');
      }

      setIndicatorCalcRecords(prev => ({
        ...prev,
        [symbol]: { 
          symbol, 
          name, 
          status: 'completed',
          report,
          calculatedAt: report.calculatedAt
        }
      }));

    } catch (err: any) {
      const errorMsg = err?.message || '未知错误';
      setIndicatorCalcRecords(prev => ({
        ...prev,
        [symbol]: { 
          symbol, 
          name: prev[symbol]?.name || symbol.toUpperCase(), 
          status: 'error',
          errorMsg
        }
      }));
    }
  };

  // 一键计算所有证券指标
  const handleCalculateAllIndicators = async () => {
    if (indicatorCalcSymbols.length === 0 || isIndicatorCalculating) return;

    setIsIndicatorCalculating(true);
    setIndicatorCalculatingProgress(0);

    const symbolsToCalc = [...indicatorCalcSymbols];

    for (let i = 0; i < symbolsToCalc.length; i++) {
      const symbol = symbolsToCalc[i];
      setIndicatorCalculatingSymbol(symbol);
      setIndicatorCalculatingProgress((i / symbolsToCalc.length) * 100);
      
      await calculateSingleIndicator(symbol);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIndicatorCalculatingProgress(100);
    setIndicatorCalculatingSymbol(null);
    setIsIndicatorCalculating(false);
  };

`;

let newContent = content.replace(stateMarker, stateCode + stateMarker);

console.log('State variables added successfully');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
