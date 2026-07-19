import { useState, useEffect } from 'react';
import { initialIdioms } from './data/idioms';
import './App.css';

const STORAGE_KEY = 'idiom-tracker-data-v3';

function App() {
  const [idioms, setIdioms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unsure: 0, unknown: 0 });
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
      const opts = [
        { text: currentIdiom.meaning, isCorrect: true },
        { text: currentIdiom.distractor || "比喻与本意不相符的其他事物或行为。", isCorrect: false }
      ];
      const shuffled = Math.random() < 0.5 ? [opts[0], opts[1]] : [opts[1], opts[0]];
      setShuffledOptions(shuffled);
      setSelectedOption(null);
    }
  }, [currentIndex, idioms.length]);

  const handleNext = (status) => {
    const updatedIdioms = [...idioms];
    updatedIdioms[currentIndex].status = status;
    setIdioms(updatedIdioms);
    setIsFlipped(false);
    
    // Select next idiom index
    setTimeout(() => {
      let nextIndex = currentIndex;
      if (isRandom) {
        // Find indices of idioms that are not 'known'
        const candidateIndices = [];
        updatedIdioms.forEach((idiom, index) => {
          if (idiom.status !== 'known') {
            candidateIndices.push(index);
          }
        });
        
        if (candidateIndices.length > 0) {
          // Exclude current index if possible to prevent repeating the same card
          let finalCandidates = candidateIndices;
          if (candidateIndices.length > 1) {
            finalCandidates = candidateIndices.filter(idx => idx !== currentIndex);
          }
          const randomIdx = Math.floor(Math.random() * finalCandidates.length);
          nextIndex = finalCandidates[randomIdx];
        } else {
          // If all are known, pick any random index except current
          const allIndices = Array.from({length: idioms.length}, (_, i) => i);
          const otherIndices = allIndices.filter(idx => idx !== currentIndex);
          if (otherIndices.length > 0) {
            nextIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)];
          } else {
            nextIndex = 0; // Only one idiom total
          }
        }
      } else {
        // Sequential mode logic
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
        <h1>成语题库</h1>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="stats">
            <span style={{color: '#10b981'}}>已掌握: {stats.known}</span>
            <span style={{color: '#f59e0b'}}>模糊: {stats.unsure}</span>
            <span style={{color: '#ef4444'}}>生词: {stats.unknown}</span>
            <span style={{color: '#9ca3af'}}>总计: {total}</span>
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
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="quiz-feedback-details">
                  <div className="idiom-details">
                    <span className={`color-tag ${currentIdiom.color === '贬义' ? 'negative' : currentIdiom.color === '褒义' ? 'positive' : 'neutral'}`}>
                      {currentIdiom.color}
                    </span>
                    <span className="freq-tag">考频: {currentIdiom.frequency} 次</span>
                  </div>
                  <div className="correct-answer-reveal">
                    <strong>正确释义：</strong>{currentIdiom.meaning}
                  </div>
                </div>
              )}
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
