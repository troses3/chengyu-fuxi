import React from 'react';
import { BookOpen, HelpCircle, Sparkles } from 'lucide-react';

export default function Header({ activeMode, onModeChange }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">2027 常识判断复习</span>
            <span className="brand-tag">精讲+真题</span>
          </div>
        </div>
      </div>

      <div className="mode-switch">
        <button
          className={`mode-btn ${activeMode === 'knowledge' ? 'active' : ''}`}
          onClick={() => onModeChange('knowledge')}
        >
          <BookOpen size={16} />
          考点背诵 (1100)
        </button>
        <button
          className={`mode-btn ${activeMode === 'quiz' ? 'active' : ''}`}
          onClick={() => onModeChange('quiz')}
        >
          <HelpCircle size={16} />
          真题演练 (78)
        </button>
      </div>
    </header>
  );
}
