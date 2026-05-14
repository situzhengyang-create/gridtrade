import re

# 读取文件
with open('src/App.tsx', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 修复乱码
# \u5e74 是 "年" 的Unicode编码
content = content.replace('\u5e74', '年')

# 修复其他可能的乱码
content = content.replace('1年最大回?', '1年最大回撤')
content = content.replace('2年最大回?', '2年最大回撤')
content = content.replace('3年最大回?', '3年最大回撤')

# 写入文件
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Encoding fixed successfully')
