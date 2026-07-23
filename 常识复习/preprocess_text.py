import re

input_file = "/Users/gougou/学习/Antigravity/考公/常识复习/2027常识判断-理论精讲_utf8.txt"
output_file = "/Users/gougou/学习/Antigravity/考公/常识复习/2027常识判断_clean.txt"

with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# 1. 修正章节错字
text = re.sub(r'第一农', '第一章', text)
text = re.sub(r'第二农', '第二章', text)
text = re.sub(r'第三农', '第三章', text)
text = re.sub(r'第四农', '第四章', text)
text = re.sub(r'第五农', '第五章', text)

# 2. 规范化真题再现标签
text = re.sub(r'[［【]珍题再现[］】]', '【真题再现】', text)

# 3. 规范化答案标签及常见的 OCR 字母错误 (如 A -> 尤)
text = re.sub(r'［答案】', '【答案】', text)
text = re.sub(r'【答案】尤[。．.]', '【答案】A。', text)
text = re.sub(r'【答案】日[。．.]', '【答案】B。', text)
text = re.sub(r'【答案】匚[。．.]', '【答案】C。', text)

# 4. 规范化选项字母开头 (c. -> C., a. -> A., etc.)
def replace_option(match):
    prefix = match.group(1).upper()
    return f"{prefix}."

text = re.sub(r'^\s*([a-d])([\.．、])', replace_option, text, flags=re.MULTILINE)
text = re.sub(r'^\s*([A-D])([．、])', r'\1.', text, flags=re.MULTILINE)

# 5. 修正常见的题号 OCR 错字 (l. -> 1.)
text = re.sub(r'^\s*l[\.．\s]+\[', '1. [', text, flags=re.MULTILINE)

with open(output_file, "w", encoding="utf-8") as f:
    f.write(text)

print(f"清洗完成，已保存至 {output_file}")
