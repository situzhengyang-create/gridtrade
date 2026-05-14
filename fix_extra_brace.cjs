const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 找到并删除第2593行的多余 }
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  // 删除第2593行（索引为2592）的多余 }
  if (!(i === 2592 && lines[i].trim() === '}')) {
    newLines.push(lines[i]);
  }
}

const newContent = newLines.join('\n');

console.log('Extra brace fixed at line 2593');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
