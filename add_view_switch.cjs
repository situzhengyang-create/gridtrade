const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 添加视图切换逻辑
const viewMarker = '{view === AppView.INDICATOR_DETAIL && (';
const viewCode = `{view === AppView.INDICATOR_DETAIL && (
          <motion.div key="indicator-detail" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderIndicatorDetail()}
          </motion.div>
        )}
        {view === AppView.INDICATOR_CALCULATOR && (
          <motion.div key="indicator-calculator" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderIndicatorCalculator()}
          </motion.div>
        )}
        {view === AppView.INDICATOR_REPORT && (
          <motion.div key="indicator-report" className="flex-1 flex flex-col min-h-0 min-w-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderIndicatorReport()}
          </motion.div>
        )}
        {(view === AppView.SETTING || view === AppView.GRID || view === AppView.REPORT) && (`;

let newContent = content.replace(viewMarker, viewCode);

console.log('View switch logic added successfully');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
