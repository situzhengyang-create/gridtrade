const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

// 删除重复的 parsedData 定义
const newContent = content.replace(
  /      const parsedData = parseKlines\(klines, \{ name \}\);\n/g,
  ''
);

fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log('Duplicate removed successfully');
