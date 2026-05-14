# 读取文件
with open('src/App.tsx', 'rb') as f:
    content = f.read()

# 找到并替换有问题的字节序列
# 问题是 "未获取到有效的价格新手" 中的 "手" 变成了乱码
# 原始序列: e695b0efbfbd3f -> 新?
# 正确序列: e695b0e6898b -> 新手

old_pattern = b"\xe6\x95\xb0\xef\xbf\xbd?"
new_pattern = b"\xe6\x95\xb0\xe6\x89\x8b"

content = content.replace(old_pattern, new_pattern)

# 写入文件
with open('src/App.tsx', 'wb') as f:
    f.write(content)

print('Line 996 fixed successfully')
