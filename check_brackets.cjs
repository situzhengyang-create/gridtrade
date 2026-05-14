const fs = require('fs');

// 读取文件
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 检查括号匹配
let braces = 0;
let parens = 0;
let brackets = 0;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') braces++;
  if (char === '}') braces--;
  if (char === '(') parens++;
  if (char === ')') parens--;
  if (char === '[') brackets++;
  if (char === ']') brackets--;
  
  // 检查是否有负数（表示括号不匹配）
  if (braces < 0 || parens < 0 || brackets < 0) {
    console.log(`Mismatch at position ${i}: braces=${braces}, parens=${parens}, brackets=${brackets}`);
    break;
  }
}

console.log(`Final counts: braces=${braces}, parens=${parens}, brackets=${brackets}`);
console.log(`File length: ${content.length}`);
