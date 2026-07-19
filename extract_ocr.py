import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import re
import json
import time

def parse_pdf_with_ocr(pdf_path):
    doc = fitz.open(pdf_path)
    idioms = []
    current_freq = 5
    
    # \d+ followed by 、 or . or , then idiom then ： or :
    # Tesseract might output some noises, we try to be robust
    pattern = re.compile(r'^(\d+)[、,\.。]([^：:。，,]+)[：:](.*)')
    freq_pattern = re.compile(r'频.*?(\d+)\s*次')
    
    print(f"Total pages: {len(doc)}")
    
    for i in range(len(doc)):
        print(f"Processing page {i+1}...")
        page = doc[i]
        pix = page.get_pixmap(dpi=300)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        text = pytesseract.image_to_string(img, lang='chi_sim')
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip().replace(" ", "")
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
                
                # Cleanup typical OCR artifacts on idioms
                word = re.sub(r'[^\w\u4e00-\u9fa5]', '', word)
                if len(word) > 8 or len(word) < 3: # Basic sanity check for idiom length
                    continue
                
                color = "中性"
                if "贬义" in meaning or "贬" in meaning[-5:]:
                    color = "贬义"
                elif "褒义" in meaning or "褒" in meaning[-5:]:
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
    start = time.time()
    pdf_path = "/Users/gougou/学习/研二下/00KG/顾斐丨26言语理解高频成语800词.pdf"
    idioms = parse_pdf_with_ocr(pdf_path)
    
    # Remove duplicates if any (due to page breaks etc)
    unique_idioms = []
    seen = set()
    for item in idioms:
        if item["id"] not in seen and item["word"] not in seen:
            unique_idioms.append(item)
            seen.add(item["id"])
            seen.add(item["word"])
            
    print(f"Extracted {len(unique_idioms)} unique idioms in {time.time() - start:.1f}s.")
    
    js_content = f"export const initialIdioms = {json.dumps(unique_idioms, ensure_ascii=False, indent=2)};"
    
    out_path = "/Users/gougou/学习/Antigravity/考公/成语复习/src/data/idioms.js"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Written to {out_path}")
