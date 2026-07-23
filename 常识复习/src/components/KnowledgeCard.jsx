import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';

export default function KnowledgeCard({ card, cardStatus, onSetStatus }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardHeight, setCardHeight] = useState('auto');
  const backRef = useRef(null);
  const frontRef = useRef(null);

  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  useEffect(() => {
    if (frontRef.current && backRef.current) {
      const frontH = frontRef.current.scrollHeight;
      const backH = backRef.current.scrollHeight;
      const maxH = Math.max(frontH, backH, 320);
      setCardHeight(`${maxH}px`);
    }
  }, [card, isFlipped]);

  if (!card) return null;

  const getCategoryColor = (ch) => {
    if (ch.includes('法律')) return { color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.12)' };
    if (ch.includes('人文')) return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' };
    if (ch.includes('科技')) return { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' };
    if (ch.includes('地理')) return { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
    return { color: '#e11d48', bg: 'rgba(225, 29, 72, 0.12)' };
  };

  const themeStyle = getCategoryColor(card.chapter);

  return (
    <div className="card-scene">
      <div
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        style={{ height: cardHeight }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* 正面：成语风格大字号考点 */}
        <div className="card-face card-front" ref={frontRef}>
          <div className="card-header-meta">
            <span
              className="chapter-tag"
              style={{ background: themeStyle.bg, color: themeStyle.color }}
            >
              <Sparkles size={14} />
              {card.chapter}
            </span>
            <span className="topic-path">
              {card.section && card.section !== '通用' ? `${card.section} ` : ''}
              {card.topic && card.topic !== '通用' && card.topic !== card.section ? `• ${card.topic}` : ''}
            </span>
          </div>

          <div style={{ margin: 'auto 0' }}>
            <div className="card-title-idiom">
              {card.title}
            </div>
          </div>

          <div className="card-hint">
            <RotateCw size={15} />
            点击卡片翻转查看详细讲义释义
          </div>
        </div>

        {/* 反面：成语风格高亮框与三色操作按钮 */}
        <div className="card-face card-back" ref={backRef}>
          <div className="card-header-meta">
            <span
              className="chapter-tag"
              style={{ background: themeStyle.bg, color: themeStyle.color }}
            >
              考点讲义精释
            </span>
            <span className="topic-path">{card.title}</span>
          </div>

          <div className="full-definition-container" style={{ borderLeftColor: themeStyle.color }}>
            <div className="card-body-text">
              {card.content}
            </div>
          </div>

          <div style={{ width: '100%', marginTop: '1.25rem' }}>
            <div className="btn-status-group" onClick={(e) => e.stopPropagation()}>
              <button
                className={`btn-status btn-unknown`}
                style={{ opacity: cardStatus === 'unknown' ? 1 : 0.8 }}
                onClick={() => onSetStatus(card.id, 'unknown')}
              >
                <XCircle size={16} />
                生词/需复习
              </button>

              <button
                className={`btn-status btn-unsure`}
                style={{ opacity: cardStatus === 'unsure' ? 1 : 0.8 }}
                onClick={() => onSetStatus(card.id, 'unsure')}
              >
                <AlertCircle size={16} />
                模糊/尚不熟
              </button>

              <button
                className={`btn-status btn-known`}
                style={{ opacity: cardStatus === 'known' ? 1 : 0.8 }}
                onClick={() => onSetStatus(card.id, 'known')}
              >
                <CheckCircle2 size={16} />
                已掌握
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
