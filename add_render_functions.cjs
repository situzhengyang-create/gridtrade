const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 添加渲染函数
const renderMarker = '    );';
const renderCode = `    );
  };

  const renderIndicatorCalculator = () => (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative w-full min-w-0">
      <IndicatorCalculatorPanel
        symbols={indicatorCalcSymbols}
        records={indicatorCalcRecords}
        isCalculating={isIndicatorCalculating}
        calculatingProgress={indicatorCalculatingProgress}
        calculatingSymbol={indicatorCalculatingSymbol}
        onAddSymbol={() => setShowIndicatorAddPanel(true)}
        onRemoveSymbol={handleRemoveIndicatorSymbol}
        onCalculate={handleCalculateAllIndicators}
        onOpenReport={(symbol) => {
          setIndicatorReportSymbol(symbol);
          setView(AppView.INDICATOR_REPORT);
        }}
        addPanelOpen={showIndicatorAddPanel}
        onToggleAddPanel={() => setShowIndicatorAddPanel(!showIndicatorAddPanel)}
        inputValue={indicatorSymbolsInput}
        onInputChange={(value) => setIndicatorSymbolsInput(value)}
        onConfirmAdd={() => {
          if (indicatorSymbolsInput.trim()) {
            handleBatchAddIndicatorSymbols(indicatorSymbolsInput);
            setIndicatorSymbolsInput('');
            setShowIndicatorAddPanel(false);
          }
        }}
        onOpenNav={() => setShowNavDrawer(true)}
      />
    </div>
  );

  const renderIndicatorReport = () => {
    const record = indicatorReportSymbol ? indicatorCalcRecords[indicatorReportSymbol] : null;
    if (!record || !record.report) {
      return (
        <div className="flex-1 flex flex-col bg-white">
          <header className="px-4 py-3 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
            <button
              onClick={() => setView(AppView.INDICATOR_CALCULATOR)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">指标报告</h1>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">未找到报告数据</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <IndicatorReportPanel
          report={record.report}
          onBack={() => setView(AppView.INDICATOR_CALCULATOR)}
        />
      </div>
    );
  };`;

let newContent = content.replace(
  /const renderHome = \(\) => \(/,
  renderCode + '\n\n  const renderHome = () => ('
);

console.log('Render functions added successfully');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
