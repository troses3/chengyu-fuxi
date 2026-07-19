import re
import json

def parse_txt(txt_path):
    idioms = []
    current_freq = 5
    
    pattern = re.compile(r'^(\d+)[、,\. \t]+([^：:。，,\s]+)[：:\s]+(.*)')
    freq_pattern = re.compile(r'频.*?(\d+)\s*次')
    
    try:
        with open(txt_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open(txt_path, 'r', encoding='gb18030') as f:
            lines = f.readlines()
            
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        freq_match = freq_pattern.search(line)
        if freq_match:
            current_freq = int(freq_match.group(1))
            continue
            
        match = pattern.match(line)
        if match:
            id_val = int(match.group(1))
            word = match.group(2).strip()
            meaning = match.group(3).strip()
            
            color = "中性"
            if "贬义" in meaning or "含贬" in meaning or "贬义词" in meaning:
                color = "贬义"
            elif "褒义" in meaning or "含褒" in meaning or "褒义词" in meaning:
                color = "褒义"
                
            idioms.append({
                "id": id_val,
                "word": word,
                "meaning": meaning,
                "color": color,
                "frequency": current_freq
            })
            
    return idioms

if __name__ == "__main__":
    txt_path = "/Users/gougou/学习/研二下/00KG/顾斐丨26言语理解高频成语800词.txt"
    idioms = parse_txt(txt_path)
    
    unique_idioms = []
    seen = set()
    for item in idioms:
        if item["id"] not in seen and item["word"] not in seen:
            unique_idioms.append(item)
            seen.add(item["id"])
            seen.add(item["word"])
            
    print(f"Extracted {len(unique_idioms)} unique idioms from TXT.")
    
    js_content = f"export const initialIdioms = {json.dumps(unique_idioms, ensure_ascii=False, indent=2)};"
    
    out_path = "/Users/gougou/学习/Antigravity/考公/成语复习/src/data/idioms.js"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Written to {out_path}")
