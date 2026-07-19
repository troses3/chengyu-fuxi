import json
import re

log_file = "/Users/gougou/.gemini/antigravity/brain/0050158c-3185-4f55-b1bb-26eb730a9c6c/.system_generated/logs/transcript.jsonl"

all_text = ""
with open(log_file, "r") as f:
    for line in f:
        try:
            data = json.loads(line)
            if "content" in data:
                all_text += data["content"] + "\n"
        except:
            pass

# Find the content between ==Start of PDF== and ==End of PDF==
# The first one is the 2023 version, the second is 2026.
# We will use the second one.
sections = all_text.split("==Start of PDF==")
if len(sections) > 2:
    pdf_text = sections[2].split("==End of PDF==")[0]
else:
    pdf_text = sections[1].split("==End of PDF==")[0] if len(sections) > 1 else ""

lines = pdf_text.split("\n")
idioms = []
current_freq = 5

pattern = re.compile(r'^(\d+)、\s*([^：:]+)[：:](.*)')
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

print(f"Extracted {len(idioms)} idioms.")

js_content = f"export const initialIdioms = {json.dumps(idioms, ensure_ascii=False, indent=2)};"

out_path = "/Users/gougou/学习/Antigravity/考公/成语复习/src/data/idioms.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Written to {out_path}")
