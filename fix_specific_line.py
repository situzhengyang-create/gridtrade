# 读取文件
with open('src/App.tsx', 'rb') as f:
    content = f.read()

# 找到并替换有问题的字节序列
# 有问题的模式包含 efbfbd（替换字符）
# 正确的"回撤" UTF-8 是 e68ba4

# 修复包含乱码的模式
old_pattern = b"'1\xe5\xb9\xb4\xe6\x9c\x80\xe5\xa4\xa7\xe5\x9b\x9e\xef\xbf\xbd?"
new_pattern = b"'1\xe5\xb9\xb4\xe6\x9c\x80\xe5\xa4\xa7\xe5\x9b\x9e\xe6\x8b\xa4'"

content = content.replace(old_pattern, new_pattern)

old_pattern2 = b"'2\xe5\xb9\xb4\xe6\x9c\x80\xe5\xa4\xa7\xe5\x9b\x9e\xef\xbf\xbd?"
new_pattern2 = b"'2\xe5\xb9\xb4\xe6\x9c\x80\xe5\xa4\xa7\xe5\x9b\x9e\xe6\x8b\xa4'"

content = content.replace(old_pattern2, new_pattern2)

old_pattern3 = b"'3\xe5\xb9\xb4\xe6\x9c\x80\xe5\xa4\xa7\xe5\x9b\x9e\xef\xbf\xbd?"
new_pattern3 = b"'3\xe5\xb9\xb4\xe6\x9c\x80\xe5\xa4\xa7\xe5\x9b\x9e\xe6\x8b\xa4'"

content = content.replace(old_pattern3, new_pattern3)

# 写入文件
with open('src/App.tsx', 'wb') as f:
    f.write(content)

print('Specific line fixed successfully')
