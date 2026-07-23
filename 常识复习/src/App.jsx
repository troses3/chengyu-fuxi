import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import KnowledgeCard from './components/KnowledgeCard';
import QuizCard from './components/QuizCard';
import { Search, ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';

import knowledgeData from './data/knowledge_db.json';
import questionData from './data/question_db.json';

export default function App() {
  const [activeMode, setActiveMode] = useState('knowledge'); // 'knowledge' | 'quiz'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'known' | 'unsure' | 'unknown'

  // 记录卡片熟练状态: id -> 'known' | 'unsure' | 'unknown'
  const [cardStatuses, setCardStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_card_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [quizAnswers, setQuizAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_quiz_answers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('cs_card_statuses', JSON.stringify(cardStatuses));
  }, [cardStatuses]);

  useEffect(() => {
    localStorage.setItem('cs_quiz_answers', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  // 重置索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory, searchQuery, activeMode, statusFilter]);

  // 状态统计
  const stats = useMemo(() => {
    let known = 0, unsure = 0, unknown = 0;
    Object.values(cardStatuses).forEach((st) => {
      if (st === 'known') known++;
      else if (st === 'unsure') unsure++;
      else if (st === 'unknown') unknown++;
    });
    return { known, unsure, unknown, total: knowledgeData.length };
  }, [cardStatuses]);

  // 过滤考点数据源
  const filteredKnowledge = useMemo(() => {
    return knowledgeData.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.chapter === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const st = cardStatuses[item.id] || 'unmarked';
      let matchStatus = true;
      if (statusFilter === 'known') matchStatus = st === 'known';
      else if (statusFilter === 'unsure') matchStatus = st === 'unsure';
      else if (statusFilter === 'unknown') matchStatus = st === 'unknown';

      return matchCat && matchSearch && matchStatus;
    });
  }, [selectedCategory, searchQuery, statusFilter, cardStatuses]);

  // 过滤真题数据源
  const filteredQuizzes = useMemo(() => {
    return questionData.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.chapter === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.stem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.options.some((o) => o.text.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const currentList = activeMode === 'knowledge' ? filteredKnowledge : filteredQuizzes;
  const currentItem = currentList[currentIndex] || null;

  const handleSetStatus = (id, newStatus) => {
    setCardStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === newStatus ? 'unmarked' : newStatus,
    }));
  };

  const handleRecordAnswer = (quizId, isCorrect) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [quizId]: { isCorrect, timestamp: Date.now() },
    }));
  };

  const handleNext = () => {
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRandom = () => {
    if (currentList.length > 0) {
      const randIdx = Math.floor(Math.random() * currentList.length);
      setCurrentIndex(randIdx);
    }
  };

  const progressPercent = Math.round((stats.known / stats.total) * 100) || 0;

  return (
    <div className="app-container">
      <Header activeMode={activeMode} onModeChange={setActiveMode} />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 顶部进度与搜索一体卡片 - 成语风格 */}
      <div className="progress-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>复习总进度: <strong style={{ color: '#10b981' }}>{progressPercent}%</strong></span>
          <div style={{ display: 'flex', gap: '1rem', fontWeight: '600' }}>
            <span
              style={{ cursor: 'pointer', color: statusFilter === 'known' ? '#10b981' : 'inherit' }}
              onClick={() => setStatusFilter(statusFilter === 'known' ? 'all' : 'known')}
            >
              🟢 掌握: {stats.known}
            </span>
            <span
              style={{ cursor: 'pointer', color: statusFilter === 'unsure' ? '#f59e0b' : 'inherit' }}
              onClick={() => setStatusFilter(statusFilter === 'unsure' ? 'all' : 'unsure')}
            >
              🟡 模糊: {stats.unsure}
            </span>
            <span
              style={{ cursor: 'pointer', color: statusFilter === 'unknown' ? '#ef4444' : 'inherit' }}
              onClick={() => setStatusFilter(statusFilter === 'unknown' ? 'all' : 'unknown')}
            >
              🔴 生词/需复习: {stats.unknown}
            </span>
          </div>
        </div>

        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="control-row">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="搜索考点/民法/宪法/石器时代/光合作用..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {currentList.length > 0 ? `${currentIndex + 1} / ${currentList.length}` : '0 / 0'}
          </div>
        </div>
      </div>

      <main style={{ minHeight: '340px' }}>
        {currentList.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>未搜索到匹配的卡片或题目</p>
            <p style={{ fontSize: '0.85rem' }}>可以尝试重置搜索关键词或切换顶部的状态筛选过滤器。</p>
          </div>
        ) : activeMode === 'knowledge' ? (
          <KnowledgeCard
            card={currentItem}
            cardStatus={cardStatuses[currentItem?.id]}
            onSetStatus={handleSetStatus}
          />
        ) : (
          <QuizCard quiz={currentItem} onRecordAnswer={handleRecordAnswer} />
        )}
      </main>

      {/* 底部导航按钮 */}
      {currentList.length > 0 && (
        <div className="action-controls">
          <button className="btn-nav" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft size={18} />
            上一题 / 上一卡
          </button>

          <button className="btn-nav" onClick={handleRandom}>
            <Shuffle size={16} />
            随机抽卡
          </button>

          <button
            className="btn-nav"
            onClick={handleNext}
            disabled={currentIndex === currentList.length - 1}
          >
            下一题 / 下一卡
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
