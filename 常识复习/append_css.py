import shutil

idiom_css = "/Users/gougou/学习/Antigravity/考公/成语复习/src/App.css"
target_css = "/Users/gougou/学习/Antigravity/考公/常识复习/src/App.css"

with open(idiom_css, "r", encoding="utf-8") as f:
    css_content = f.read()

append_str = """
/* -------------------------------------- */
/* 常识判断专有补充样式 (Category Filters)  */
/* -------------------------------------- */

.cat-filter-row {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.cat-filter-row::-webkit-scrollbar {
  display: none;
}

.cat-btn {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cat-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.cat-btn.active {
  background: white;
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--accent-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
"""

with open(target_css, "w", encoding="utf-8") as f:
    f.write(css_content + "\n" + append_str)
