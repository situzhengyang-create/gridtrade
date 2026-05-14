const fs = require('fs');

// 读取当前文件
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 添加换行符到文件末尾
if (!content.endsWith('\n')) {
  content = content + '\n';
}

console.log('Added newline to end of file');
fs.writeFileSync('src/App.tsx', content, 'utf-8');
