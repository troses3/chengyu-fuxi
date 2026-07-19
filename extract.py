import fitz  # PyMuPDF
import re
import json

def parse_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    idioms = []
    
    current_freq = 5 # Start with default 5 based on first heading
    
    text = ""
    for page in doc:
        text += page.get_text()
        
    lines = text.split('\n')
    
    pattern = re.compile(r'^(\d+)、\s*([^：:]+)：(.*)')
    freq_pattern = re.compile(r'频\s*(\d+)\s*次')
    
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
            
            # Determine color
            color = "中性"
            if "含贬义" in meaning or "含贬" in meaning or "贬义" in meaning:
                color = "贬义"
            elif "含褒义" in meaning or "褒义" in meaning:
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
    pdf_path = "/Users/gougou/学习/研二下/00KG/顾斐丨26言语理解高频成语800词.pdf"
    idioms = parse_pdf(pdf_path)
    
    print(f"Extracted {len(idioms)} idioms.")
    
    js_content = f"export const initialIdioms = {json.dumps(idioms, ensure_ascii=False, indent=2)};"
    
    out_path = "/Users/gougou/学习/Antigravity/考公/成语复习/src/data/idioms.js"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Written to {out_path}")
