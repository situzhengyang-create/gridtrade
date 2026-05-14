# 读取文件
with open('src/App.tsx', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# 修复第1201行 - 缺少闭合的 </p> 标签
if len(lines) > 1200:
    line = lines[1200]
    if '未找到指标数手/p>' in line:
        lines[1200] = line.replace('未找到指标数手/p>', '未找到指标数据</p>')

# 写入文件
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Multiple lines fixed')
