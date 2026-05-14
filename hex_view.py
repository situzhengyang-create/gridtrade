import binascii

# 读取文件的原始字节
with open('src/App.tsx', 'rb') as f:
    content = f.read()

# 找到第524行附近的内容
lines = content.split(b'\n')
if len(lines) > 523:
    line_524 = lines[523]
    print("Line 524 hex:")
    print(binascii.hexlify(line_524).decode())
    print("\nLine 524 ascii:")
    print(line_524.decode('ascii', errors='replace'))
