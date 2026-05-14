import binascii

# 读取文件的原始字节
with open('src/App.tsx', 'rb') as f:
    content = f.read()

# 找到第996行
lines = content.split(b'\n')
if len(lines) > 995:
    line_996 = lines[995]
    print("Line 996 hex:")
    print(binascii.hexlify(line_996).decode())
    print("\nLine 996 length:", len(line_996))
