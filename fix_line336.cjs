const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

// 删除第336行（索引335）
const newLines = lines.filter((_, index) => index !== 335);

fs.writeFileSync('src/App.tsx', newLines.join('\n'), 'utf8');
console.log('Line 336 removed successfully');
