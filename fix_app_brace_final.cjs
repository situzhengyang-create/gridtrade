const fs = require('fs');

// 读取文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

// 查找App函数的返回语句结束位置并添加缺失的大括号
const newLines = [];
let appReturnFound = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  
  // 在App函数返回语句结束后（但在CopyableValue函数之前）添加关闭大括号
  if (!appReturnFound && lines[i].trim() === ');' && i > 2100 && i < 2600) {
    // 检查下几行是否包含CopyableValue函数定义
    let hasCopyableValue = false;
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes('function CopyableValue')) {
        hasCopyableValue = true;
        break;
      }
    }
    
    if (hasCopyableValue) {
      newLines.push('}'); // 添加关闭App函数的大括号
      appReturnFound = true;
    }
  }
}

const newContent = newLines.join('\n');

console.log(`Fixed: Added closing brace for App function`);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
