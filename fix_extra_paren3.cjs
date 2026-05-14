const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 找到并删除第1218行的多余 );
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  // 删除第1218行（索引为1217）的多余 );
  if (!(i === 1217 && lines[i].trim() === ');')) {
    newLines.push(lines[i]);
  }
}

const newContent = newLines.join('\n');

console.log('Extra parentheses fixed at line 1218');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
