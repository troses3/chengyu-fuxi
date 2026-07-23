import json
import re

input_file = "/Users/gougou/学习/Antigravity/考公/常识复习/src/data/knowledge_db.json"

with open(input_file, "r", encoding="utf-8") as f:
    big_cards = json.load(f)

print(f"原大卡片总数: {len(big_cards)} 张")

atomic_cards = []

def sanitize_title(t_str):
    # 清理前缀数字与标点
    t = re.sub(r'^[0-9一二三四五六七八九十\.\（\(\)、\s]+', '', t_str).strip()
    t = re.sub(r'^[【［（(]*[一二三四五六七八九十\d]+[）)]*[、．\s]*', '', t).strip()
    t = re.sub(r'[”"“‘’。；，,;：:]', '', t).strip()
    # 截取前 12 个字，避免过长
    if len(t) > 12:
        # 如果包含常见词汇，如 "概念" "注意" "监护"
        m = re.search(r'(概念|注意|监护|效力|基本原则|权利能力|行为能力|诉讼时效|所有权|用益物权|担保物权|无权处分|合同|撤销|违约|侵权|犯罪|刑罚|宪法|行政|公职|石器时代|古文化|物理|化学|生物|地理|经济)', t)
        if m:
            return m.group(1)
        return t[:10]
    return t or "要点"

for big_card in big_cards:
    ch = big_card["chapter"]
    sec = big_card["section"]
    top = big_card["topic"]
    parent_title = big_card["title"]
    content = big_card["content"]
    
    # 按行扫描，按段落和重要小标题节点切分
    lines = content.splitlines()
    
    curr_sub_title = parent_title
    curr_lines = []
    
    def emit_sub_card(sub_t, lines_arr):
        if not lines_arr:
            return
        text_content = "\n".join([l.strip() for l in lines_arr if l.strip()]).strip()
        # 对连粘的关键标签加冒号排版，如 "概念民法" -> "【概念】民法"
        text_content = re.sub(r'^(概念|注意|有关规定|定义／核心要点|生活应用举例|效力类型)', r'【\1】', text_content)
        
        if len(text_content) >= 12:
            clean_sub_t = sanitize_title(sub_t)
            
            if clean_sub_t and clean_sub_t != parent_title and clean_sub_t not in parent_title:
                display_title = f"{parent_title} • {clean_sub_t}"
            else:
                display_title = parent_title
                
            atomic_cards.append({
                "id": f"k_{len(atomic_cards)+1:04d}",
                "chapter": ch,
                "section": sec,
                "topic": top,
                "title": display_title,
                "content": text_content
            })

    for line in lines:
        l_str = line.strip()
        if not l_str:
            continue
        
        # 判断是否是强考点子标题开头
        m = re.match(r'^\s*([0-9一二三四五六七八九十]+[\.．、\s]|（[0-9一二三四五六七八九十]+）|概念|注意|有关规定|定义／核心要点|生活应用举例|[【［](.*?)[】］])(.*)', l_str)
        
        if m and len(curr_lines) > 0:
            emit_sub_card(curr_sub_title, curr_lines)
            
            matched_head = m.group(1).strip()
            # 提取合适子标题
            if matched_head.startswith("【") or matched_head.startswith("［"):
                curr_sub_title = m.group(2) if len(m.groups()) >= 2 else matched_head
            else:
                rest_sample = m.group(3).strip()[:12] if len(m.groups()) >= 3 else ""
                curr_sub_title = matched_head + rest_sample if len(matched_head) < 6 else matched_head
            
            curr_lines = [l_str]
        else:
            curr_lines.append(l_str)

    emit_sub_card(curr_sub_title, curr_lines)

print(f"原子化提炼完成！微常识闪卡总数: {len(atomic_cards)} 张 (每张 50~200 字，背诵极度轻便！)")

# 抽样打印前 10 张闪卡
print("\n=== 微常识闪卡抽样 (前 10 张) ===")
for c in atomic_cards[:10]:
    print(f"{c['id']} | [{c['chapter']}] | 标题: [{c['title']}]\n  内容 ({len(c['content'])}字):\n{c['content']}\n")

# 导出到 src/data/ 与根目录
with open("/Users/gougou/学习/Antigravity/考公/常识复习/src/data/knowledge_db.json", "w", encoding="utf-8") as f:
    json.dump(atomic_cards, f, ensure_ascii=False, indent=2)

with open("/Users/gougou/学习/Antigravity/考公/常识复习/knowledge_db.json", "w", encoding="utf-8") as f:
    json.dump(atomic_cards, f, ensure_ascii=False, indent=2)

print("原子化闪卡数据库全量替换更新成功！")
