const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

// 修复乱码字符
let newContent = content.replace(
  /'1骞存渶澶у洖锟?'/g,
  "'1年最大回撤'"
);

newContent = newContent.replace(
  /'2骞存渶澶у洖锟?'/g,
  "'2年最大回撤'"
);

newContent = newContent.replace(
  /'3骞存渶澶у洖锟?'/g,
  "'3年最大回撤'"
);

// 修复第338行的注释乱码
newContent = newContent.replace(
  '// 绛夊緟涓€甯э紝璁︰I鏇存柊',
  '// 等待一帧，让UI更新'
);

fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log('Gibberish fixed successfully');
