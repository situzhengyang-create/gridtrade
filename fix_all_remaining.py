# 读取文件
with open('src/App.tsx', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 修复所有类似的问题
content = content.replace('未找到报告数手/p>', '未找到报告数据</p>')

# 写入文件
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('All remaining issues fixed')
