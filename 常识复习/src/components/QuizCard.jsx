import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function QuizCard({ quiz, onRecordAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setShowAnalysis(false);
  }, [quiz]);

  if (!quiz) return null;

  const isSubmitted = selectedOption !== null;
  const isCorrect = selectedOption === quiz.answer;

  const handleSelectOption = (key) => {
    if (isSubmitted) return;
    setSelectedOption(key);
    setShowAnalysis(true);
    if (onRecordAnswer) {
      onRecordAnswer(quiz.id, key === quiz.answer);
    }
  };

  const getCategoryColor = (ch) => {
    if (ch.includes('法律')) return { color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.12)' };
    if (ch.includes('人文')) return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' };
    if (ch.includes('科技')) return { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' };
    if (ch.includes('地理')) return { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
    return { color: '#e11d48', bg: 'rgba(225, 29, 72, 0.12)' };
  };

  const themeStyle = getCategoryColor(quiz.chapter);

  return (
    <div className="quiz-card">
      <div className="card-header-meta">
        <span
          className="chapter-tag"
          style={{ background: themeStyle.bg, color: themeStyle.color }}
        >
          {quiz.chapter}
        </span>
        <span className="topic-path">
          {quiz.section && quiz.section !== '通用' ? `${quiz.section} • ` : ''}真题第 {quiz.q_num} 题
        </span>
      </div>

      {quiz.source && (
        <div>
          <span className="quiz-source">🎯 来源：{quiz.source}</span>
        </div>
      )}

      <div className="quiz-stem">
        {quiz.stem}
      </div>

      <div className="options-grid">
        {quiz.options.map((opt) => {
          let btnStateClass = '';
          if (isSubmitted) {
            if (opt.key === quiz.answer) {
              btnStateClass = 'highlight-correct';
            }
            if (opt.key === selectedOption) {
              btnStateClass = isCorrect ? 'selected-correct' : 'selected-wrong';
            }
          }

          return (
            <button
              key={opt.key}
              className={`option-btn ${btnStateClass}`}
              onClick={() => handleSelectOption(opt.key)}
              disabled={isSubmitted}
            >
              <span className="option-badge">{opt.key}.</span>
              <div style={{ flex: 1 }}>{opt.text}</div>
              {isSubmitted && opt.key === quiz.answer && (
                <CheckCircle size={18} color="#10b981" />
              )}
              {isSubmitted && opt.key === selectedOption && !isCorrect && (
                <XCircle size={18} color="#ef4444" />
              )}
            </button>
          );
        })}
      </div>

      {isSubmitted && (
        <div style={{ marginTop: '0.5rem' }}>
          <button
            className="btn-nav"
            style={{ width: '100%', borderRadius: '14px' }}
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            <FileText size={16} />
            {showAnalysis ? '收起权威答案解析' : '展开权威答案解析'}
            {showAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAnalysis && (
            <div className="quiz-analysis-box" style={{ borderLeftColor: isCorrect ? '#10b981' : '#ef4444' }}>
              <div className="analysis-header" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                正确答案：{quiz.answer} | 你的选择：{selectedOption}
              </div>
              <div className="analysis-content">
                {quiz.analysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
