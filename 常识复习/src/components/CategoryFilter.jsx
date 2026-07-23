import React from 'react';
import { Scale, BookMarked, Cpu, Compass, TrendingUp, Layers } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: '全部大类', icon: Layers, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.2)' },
  { id: '第一章 法律常识', name: '🏛️ 法律常识', icon: Scale, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.2)' },
  { id: '第二章 人文历史常识', name: '📜 人文历史', icon: BookMarked, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.2)' },
  { id: '第三章 科技常识', name: '🔬 科技常识', icon: Cpu, color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)' },
  { id: '第四章 地理常识', name: '🌍 地理常识', icon: Compass, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' },
  { id: '第五章 经济常识', name: '📈 经济常识', icon: TrendingUp, color: '#fb7185', bg: 'rgba(244, 63, 94, 0.2)' },
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="filter-bar">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            className={`filter-chip ${isActive ? 'active' : ''}`}
            style={{
              '--chip-color': cat.color,
              '--chip-bg': cat.bg,
            }}
            onClick={() => onSelectCategory(cat.id)}
          >
            <Icon size={14} />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
