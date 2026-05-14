# 读取文件
with open('src/App.tsx', 'rb') as f:
    content = f.read()

# 修复正确的字符串
# '未获取到有效的价格数手' -> '未获取到有效的价格数据'
# 使用十六进制转义序列

# 旧字符串: '未获取到有效的价格数手'
old_pattern = b"\xe6\x9c\xaa\xe8\x8e\xb7\xe5\x8f\x96\xe5\x88\xb0\xe6\x9c\x89\xe6\x95\x88\xe7\x9a\x84\xe4\xbb\xb7\xe6\xa0\xbc\xe6\x95\xb0\xe6\x89\x8b'"
# 新字符串: '未获取到有效的价格数据'  
new_pattern = b"\xe6\x9c\xaa\xe8\x8e\xb7\xe5\x8f\x96\xe5\x88\xb0\xe6\x9c\x89\xe6\x95\x88\xe7\x9a\x84\xe4\xbb\xb7\xe6\xa0\xbc\xe6\x95\xb0\xe6\x89\x8b'"

# 实际上我们需要替换 "数手" 为 "数据"
# 数 = e695b0
# 手 = e6898b
# 据 = e68dbf

old_part = b"\xe6\x95\xb0\xe6\x89\x8b'"  # 数手'
new_part = b"\xe6\x95\xb0\xe6\x8d\xbf'"  # 数据'

content = content.replace(old_part, new_part)

# 写入文件
with open('src/App.tsx', 'wb') as f:
    f.write(content)

print('Correct string fixed successfully')
