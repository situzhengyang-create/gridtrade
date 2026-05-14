const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. 添加导航菜单中的指标计算入口
const navMarker = '趋势交易系统</div>\n                   </div>\n                 </button>\n              </div>';
const navCode = `趋势交易系统</div>
                   </div>
                 </button>

                 <button 
                  onClick={() => {
                    setView(AppView.INDICATOR_CALCULATOR);
                    setShowNavDrawer(false);
                  }}
                  className={\`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all \${view === AppView.INDICATOR_CALCULATOR || view === AppView.INDICATOR_REPORT ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'}\`}
                 >
                   <div className={\`p-2 rounded-xl flex-shrink-0 \${view === AppView.INDICATOR_CALCULATOR || view === AppView.INDICATOR_REPORT ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}\`}>
                     <Calculator className="w-5 h-5" />
                   </div>
                   <div className="text-left flex-1">
                     <div className="text-sm">指标计算</div>
                     <div className="text-[10px] uppercase tracking-widest opacity-60">Indicator Calc</div>
                   </div>
                 </button>
              </div>`;

let newContent = content.replace(navMarker, navCode);

console.log('Navigation menu added successfully');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
