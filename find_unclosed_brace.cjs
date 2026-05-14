const fs = require('fs');

// 读取文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

// 检查括号匹配并跟踪行号
let braces = 0;
let parens = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
  }
  
  // 输出关键位置的括号计数
  if (braces === 1 && (line.includes('export default') || line.includes('const render'))) {
    console.log(`Line ${i + 1}: braces=${braces} - ${line.trim().substring(0, 50)}...`);
  }
}

console.log(`\nFinal braces count: ${braces}`);
