const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 找到返回语句结束的位置并添加缺少的 }
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  // 在返回语句结束后添加 } 来关闭 App 函数
  if (i === 2589 && lines[i].trim() === ');') {
    newLines.push('}');
  }
}

const newContent = newLines.join('\n');

console.log('Fixed App function closing brace');
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
