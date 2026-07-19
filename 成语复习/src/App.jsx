import { useState, useEffect } from 'react';
import { initialIdioms } from './data/idioms';
import './App.css';

const STORAGE_KEY = 'idiom-tracker-data-v4';

const getShortMeaning = (meaning) => {
  if (!meaning) return "";
  if (!meaning.includes('：') && !meaning.includes(':')) {
    return meaning;
  }
  const parts = meaning.split('。');
  const shortParts = parts
    .map(p => p.trim())
    .filter(p => p && !p.includes('：') && !p.includes(':'));
  
  if (shortParts.length > 0) {
    // Check if the filtered meaning actually says something descriptive
    // e.g. if it only contains punctuation or single char, fallback to original
    const result = shortParts.join('。') + (meaning.endsWith('。') ? '。' : '');
    if (result.replace(/[。，；、“”‘’（）]/g, '').trim().length > 1) {
      return result;
    }
  }
  return meaning; // Fallback to full meaning if everything had a colon or is too short
};

function App() {
  const [idioms, setIdioms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unsure: 0, unknown: 0 });
  const [filter, setFilter] = useState('all'); // 'all', 'known', 'unsure', 'unknown'
  const [isRandom, setIsRandom] = useState(() => {
    return localStorage.getItem('idiom-tracker-random') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('idiom-tracker-random', isRandom);
  }, [isRandom]);

  useEffect(() => {
    // Load from local storage or use initial
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIdioms(JSON.parse(stored));
    } else {
      const initialized = initialIdioms.map(idiom => ({
        ...idiom,
        status: 'new' // 'new', 'known', 'unsure', 'unknown'
      }));
      setIdioms(initialized);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialized));
    }
  }, []);

  useEffect(() => {
    if (idioms.length > 0) {
      const known = idioms.filter(i => i.status === 'known').length;
      const unsure = idioms.filter(i => i.status === 'unsure').length;
      const unknown = idioms.filter(i => i.status === 'unknown').length;
      setStats({ known, unsure, unknown });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idioms));
    }
  }, [idioms]);

  const currentIdiom = idioms[currentIndex];

  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (idioms.length > 0 && currentIdiom) {
      // Find candidates in the same group
      const sameGroupCandidates = idioms.filter(i => i.group === currentIdiom.group && i.word !== currentIdiom.word);
      let distractor = null;
      
      if (sameGroupCandidates.length > 0) {
        distractor = sameGroupCandidates[Math.floor(Math.random() * sameGroupCandidates.length)];
      } else {
        // Fallback: pick any random idiom from the list
        const otherCandidates = idioms.filter(i => i.word !== currentIdiom.word);
        if (otherCandidates.length > 0) {
          distractor = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];
        }
      }
      
      const distractorMeaning = distractor ? distractor.meaning : "比喻与本意不相符的其他事物或行为。";
      const distractorWord = distractor ? distractor.word : "其他成语";
      
      const opts = [
        { 
          text: getShortMeaning(currentIdiom.meaning), 
          fullText: currentIdiom.meaning,
          isCorrect: true,
          word: currentIdiom.word
        },
        { 
          text: getShortMeaning(distractorMeaning), 
          fullText: distractorMeaning,
          isCorrect: false,
          word: distractorWord
        }
      ];
      const shuffled = Math.random() < 0.5 ? [opts[0], opts[1]] : [opts[1], opts[0]];
      setShuffledOptions(shuffled);
      setSelectedOption(null);
    }
  }, [currentIndex, idioms.length]);

  const handleFilterClick = (targetFilter) => {
    if (filter === targetFilter) {
      setFilter('all');
      return;
    }
    const count = targetFilter === 'known' ? stats.known :
                  targetFilter === 'unsure' ? stats.unsure :
                  targetFilter === 'unknown' ? stats.unknown : 0;
    if (count === 0) {
      alert(`当前没有处于“${targetFilter === 'known' ? '已掌握' : targetFilter === 'unsure' ? '模糊' : '生词'}”状态的成语！`);
      return;
    }
    const targetIndex = idioms.findIndex(i => i.status === targetFilter);
    if (targetIndex !== -1) {
      setFilter(targetFilter);
      setCurrentIndex(targetIndex);
      setIsFlipped(false);
      setSelectedOption(null);
    }
  };

  const handleNext = (status) => {
    const updatedIdioms = [...idioms];
    updatedIdioms[currentIndex].status = status;
    setIdioms(updatedIdioms);
    setIsFlipped(false);
    
    // Select next idiom index
    setTimeout(() => {
      let nextIndex = currentIndex;
      let activeFilter = filter;
      let candidates = [];
      
      if (filter !== 'all') {
        candidates = updatedIdioms
          .map((idiom, index) => ({ status: idiom.status, index }))
          .filter(item => item.status === filter)
          .map(item => item.index);
        
        if (candidates.length === 0) {
          activeFilter = 'all';
          setFilter('all');
          alert(`恭喜！你已复习完该类别的所有成语，系统已自动切回“全部”模式。`);
        }
      }
      
      if (activeFilter === 'all') {
        if (isRandom) {
          const candidateIndices = [];
          updatedIdioms.forEach((idiom, index) => {
            if (idiom.status !== 'known') {
              candidateIndices.push(index);
            }
          });
          
          if (candidateIndices.length > 0) {
            let finalCandidates = candidateIndices;
            if (candidateIndices.length > 1) {
              finalCandidates = candidateIndices.filter(idx => idx !== currentIndex);
            }
            nextIndex = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
          } else {
            const allIndices = Array.from({length: idioms.length}, (_, i) => i);
            const otherIndices = allIndices.filter(idx => idx !== currentIndex);
            nextIndex = otherIndices.length > 0 
              ? otherIndices[Math.floor(Math.random() * otherIndices.length)]
              : 0;
          }
        } else {
          let found = false;
          for (let i = 0; i < idioms.length; i++) {
            let checkIndex = (currentIndex + 1 + i) % idioms.length;
            if (updatedIdioms[checkIndex].status !== 'known') {
              nextIndex = checkIndex;
              found = true;
              break;
            }
          }
          if (!found) {
            nextIndex = (currentIndex + 1) % idioms.length;
          }
        }
      } else {
        // Filtered mode
        if (isRandom) {
          let finalCandidates = candidates;
          if (candidates.length > 1) {
            finalCandidates = candidates.filter(idx => idx !== currentIndex);
          }
          nextIndex = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
        } else {
          const nextCandidate = candidates.find(idx => idx > currentIndex);
          nextIndex = nextCandidate !== undefined ? nextCandidate : candidates[0];
        }
      }
      
      setCurrentIndex(nextIndex);
    }, 300);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'known': return '#10b981';
      case 'unsure': return '#f59e0b';
      case 'unknown': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!currentIdiom) return <div className="loading">加载中...</div>;

  const total = idioms.length;
  const progress = ((stats.known) / total) * 100;

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <span>📚</span>
          <span className="title-text">成语题库</span>
        </h1>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="stats">
            <button 
              className={`stat-item ${filter === 'known' ? 'active-known' : ''}`}
              onClick={() => handleFilterClick('known')}
              title="只复习已掌握"
            >
              <span className="dot dot-known"></span>
              已掌握: <span className="stat-count">{stats.known}</span>
            </button>
            <button 
              className={`stat-item ${filter === 'unsure' ? 'active-unsure' : ''}`}
              onClick={() => handleFilterClick('unsure')}
              title="只复习模糊"
            >
              <span className="dot dot-unsure"></span>
              模糊: <span className="stat-count">{stats.unsure}</span>
            </button>
            <button 
              className={`stat-item ${filter === 'unknown' ? 'active-unknown' : ''}`}
              onClick={() => handleFilterClick('unknown')}
              title="只复习生词"
            >
              <span className="dot dot-unknown"></span>
              生词: <span className="stat-count">{stats.unknown}</span>
            </button>
            <button 
              className={`stat-item ${filter === 'all' ? 'active-all' : ''}`}
              onClick={() => setFilter('all')}
              title="查看全部"
            >
              总计: <span className="stat-count">{total}</span>
            </button>
          </div>
          <div className="mode-toggle">
            <button className={`mode-btn ${!isRandom ? 'active' : ''}`} onClick={() => setIsRandom(false)}>顺序模式</button>
            <button className={`mode-btn ${isRandom ? 'active' : ''}`} onClick={() => setIsRandom(true)}>随机模式</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="card-container" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`card ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
              <h2 className="idiom-word">{currentIdiom.word}</h2>
              <div className="card-hint">点击翻转查看释义</div>
              {currentIdiom.status !== 'new' && (
                <div className="status-badge" style={{backgroundColor: getStatusColor(currentIdiom.status)}}>
                  上次标记: {currentIdiom.status === 'known' ? '认识' : currentIdiom.status === 'unsure' ? '模糊' : '不认识'}
                </div>
              )}
            </div>
            <div className="card-back">
              <div className="card-back-inner">
                <div className="group-tag">
                  {currentIdiom.group} {currentIdiom.subcategory ? `· ${currentIdiom.subcategory}` : ''}
                </div>
                <h3>{currentIdiom.word}</h3>
                <div className="quiz-title">请选择正确的释义：</div>
                <div className="options-container">
                  {shuffledOptions.map((opt, index) => {
                    let btnClass = "option-btn";
                    if (selectedOption !== null) {
                      if (opt.isCorrect) {
                        btnClass += " correct";
                      } else if (selectedOption === index) {
                        btnClass += " incorrect";
                      }
                      btnClass += " disabled";
                    }
                    return (
                      <button
                        key={index}
                        className={btnClass}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedOption === null) {
                            setSelectedOption(index);
                          }
                        }}
                        disabled={selectedOption !== null}
                      >
                        <span className="option-label">{index === 0 ? 'A' : 'B'}. </span>
                        <span className="option-text">{opt.text}</span>
                        {selectedOption !== null && opt.isCorrect && (
                          <span className="option-status-icon correct-icon">✓</span>
                        )}
                        {selectedOption !== null && !opt.isCorrect && selectedOption === index && (
                          <span className="option-status-icon incorrect-icon">✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (() => {
                  const distractorOpt = shuffledOptions.find(o => !o.isCorrect);
                  const isWrongSelected = selectedOption !== null && shuffledOptions[selectedOption] && !shuffledOptions[selectedOption].isCorrect;
                  return (
                    <div className="quiz-feedback-details">
                      <div className="idiom-details">
                        {currentIdiom.color !== '中性' && (
                          <span className={`color-tag ${currentIdiom.color === '贬义' ? 'negative' : 'positive'}`}>
                            {currentIdiom.color}
                          </span>
                        )}
                      </div>
                      
                      <div className="full-definition-container">
                        <strong>【{currentIdiom.word}】的完整释义：</strong>
                        <span className="full-definition-text">{currentIdiom.meaning}</span>
                      </div>

                      {distractorOpt && (
                        <div className={`full-definition-container distractor-definition ${isWrongSelected ? 'highlight-wrong' : ''}`}>
                          <strong>
                            【{distractorOpt.word}】的完整释义（干扰项）
                            {isWrongSelected && " - 你误选了此项"}
                          </strong>
                          <span className="full-definition-text">{distractorOpt.fullText}</span>
                        </div>
                      )}

                      {currentIdiom.examples && currentIdiom.examples.length > 0 && (
                        <div className="examples-container">
                          {currentIdiom.examples.map((ex, exIdx) => (
                            <div key={exIdx} className="example-item">
                              <strong>例{exIdx + 1}：</strong>{ex}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className={`action-buttons ${(!isFlipped || selectedOption === null) ? 'hidden' : ''}`}>
          <button className="btn btn-unknown" onClick={(e) => { e.stopPropagation(); handleNext('unknown'); }}>
            不认识
          </button>
          <button className="btn btn-unsure" onClick={(e) => { e.stopPropagation(); handleNext('unsure'); }}>
            模糊
          </button>
          <button className="btn btn-known" onClick={(e) => { e.stopPropagation(); handleNext('known'); }}>
            认识
          </button>
        </div>
        
        <div className="controls">
          <button className="btn-text" onClick={() => {
            if(window.confirm('确定要重置所有学习进度吗？')) {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }
          }}>
            <svg className="reset-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            <span className="reset-text">重置进度</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
