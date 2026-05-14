# 读取文件
with open('src/App.tsx', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# 修复第996行 (索引995)
if len(lines) > 995:
    # 找到包含 "未获取到有效的价格" 的行并修复
    line = lines[995]
    if '未获取到有效的价格' in line:
        # 替换整个错误的行
        lines[995] = "        throw new Error('未获取到有效的价格数据');\n"

# 写入文件
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Line 996 fixed directly')
