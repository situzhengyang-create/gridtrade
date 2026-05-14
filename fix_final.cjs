const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

// 修复问题1：删除重复的 parsedData 定义
let newContent = content.replace(
  /\n\s*const parsedData = parseKlines\(klines, \{ name \}\);\n/,
  '\n'
);

// 修复问题2：修复乱码字符
newContent = newContent.replace(
  /label: i === 0 \? '1年最大回\u{5e74}' : \(i === 1 \? '2年最大回\u{5e74}' : '3年最大回\u{5e74}'\)/,
  "label: i === 0 ? '1年最大回撤' : (i === 1 ? '2年最大回撤' : '3年最大回撤')"
);

fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log('All issues fixed successfully');
