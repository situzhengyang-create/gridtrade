const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 修复多余的 ); 
const problematicPattern = /  \};\n\n      \);\n  \};/;
const fixedPattern = '  };\n\n  };';

let newContent = content.replace(problematicPattern, fixedPattern);

console.log('Extra parentheses fixed');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
