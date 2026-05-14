const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 找到并删除多余的 );
const lines = content.split('\n');
const newLines = lines.filter((line, index) => {
  // 删除第1213行（索引为1212）的多余 );
  if (index === 1212 && line.trim() === ');') {
    return false;
  }
  return true;
});

const newContent = newLines.join('\n');

console.log('Extra parentheses fixed at line 1213');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
