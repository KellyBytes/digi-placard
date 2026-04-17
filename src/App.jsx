import { useState, useEffect, useMemo, useRef } from 'react';
import InputScreen from './components/InputScreen';

const TEXT_COLORS = {
  red: 'text-red-600',
  blue: 'text-blue-500',
  yellow: 'text-yellow-300',
  green: 'text-green-400',
  black: 'text-black',
  white: 'text-white',
  rainbow: '',
};

const BG_COLORS = {
  white: 'bg-white',
  black: 'bg-black',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-300',
  green: 'bg-green-400',
};

function App() {
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('red');
  const [bgColor, setBgColor] = useState('white');
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  const [mode, setMode] = useState('input'); // input | play
  const [displayMode, setDisplayMode] = useState('scroll'); // typing | scroll
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | pause | blink | interval | scroll
  const [, setBlinkStep] = useState(0);
  const [visible, setVisible] = useState(true); // entire text
  const [scrollKey, setScrollKey] = useState(0);
  const [scrollDuration, setScrollDuration] = useState(8);
  const [scrollSpeed, setScrollSpeed] = useState(() => {
    const saved = localStorage.getItem('scrollSpeed');
    const parsed = Number(saved);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 800;
  });
  const [showButtons, setShowButtons] = useState(false);

  const chars = useMemo(() => [...text], [text]);

  const scrollTextRef = useRef(null);

  const handleInput = e => {
    let value = e.target.value;
    let lines = value.split('\n');
    lines = lines.slice(0, 4);
    lines = lines.map(line => line.slice(0, 20));
    setText(lines.join('\n'));
  };

  const getWeightedLength = text => {
    let length = 0;

    for (const char of text) {
      if (char.match(/[^\x00-\x7F]/)) {
        length += 2;
      } else {
        length += 1;
      }
    }

    return length;
  };

  const getMaxLineLength = text => {
    const lines = text.split('\n');
    return Math.max(...lines.map(line => getWeightedLength(line)), 0);
  };

  const getFontSize = text => {
    const maxLen = getMaxLineLength(text);

    if (maxLen <= 5) return 32;
    if (maxLen <= 10) return 22;
    if (maxLen <= 16) return 16;
    if (maxLen <= 20) return 12;
    if (maxLen <= 32) return 8;
    if (maxLen <= 40) return 6;
    return 5;
  };

  const getRainbowStyle = () => ({
    backgroundImage:
      'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00cc00, #0000ff, #8b00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  });

  // 1文字ずつ表示するモード
  useEffect(() => {
    if (mode !== 'play' || displayMode !== 'typing') return;

    let timer;

    switch (phase) {
      case 'typing':
        if (index < chars.length) {
          timer = setTimeout(() => {
            setIndex(prev => prev + 1);
          }, 250);
        } else {
          timer = setTimeout(() => {
            setPhase('pause'); // setTimeoutはエラー避け
          }, 1);
        }
        break;

      case 'pause': // typing → blinkの間に0.5秒
        timer = setTimeout(() => {
          setVisible(false);
          setPhase('blink'); // 最終文字の表示が終わったら点滅表示に
          setBlinkStep(0);
        }, 500);
        break;

      case 'blink':
        timer = setTimeout(
          () => {
            setVisible(prev => !prev);

            setBlinkStep(prev => {
              const next = prev + 1;

              if (next >= 4) {
                setPhase('interval');
                setBlinkStep(0);
              }

              return next;
            });
          },
          visible ? 8000 : 1000,
        );
        break;

      case 'interval':
        timer = setTimeout(() => {
          setPhase('typing');
          setIndex(0);
          setVisible(true);
        }, 1500);
        break;
    }

    return () => clearTimeout(timer);
  }, [mode, index, phase, visible, text, chars.length, displayMode]);

  // 横スクロールモード
  useEffect(() => {
    if (mode !== 'play' || displayMode !== 'scroll') return;
    if (!scrollTextRef.current) return;

    const textWidth = scrollTextRef.current.offsetWidth;
    const totalDistance = window.innerWidth + textWidth;
    const speed = scrollSpeed; // px/sec
    const duration = totalDistance / speed;

    setScrollDuration(duration);
    setScrollKey(prev => prev + 1);
  }, [mode, displayMode, scrollSpeed]);

  useEffect(() => {
    if (mode !== 'play' || displayMode !== 'scroll') return;
    // if (scrollDuration === 0) return;

    let timer;

    switch (phase) {
      case 'scroll':
        timer = setTimeout(() => {
          setVisible(false);
          setPhase('blink');
          setBlinkStep(0);
        }, scrollDuration * 1000);
        break;

      case 'blink':
        timer = setTimeout(
          () => {
            setVisible(prev => !prev);

            setBlinkStep(prev => {
              const next = prev + 1;

              if (next >= 4) {
                setPhase('interval');
                setBlinkStep(0);
              }
              return next;
            });
          },
          visible ? 8000 : 1000,
        );
        break;

      case 'interval':
        timer = setTimeout(() => {
          setPhase('scroll');
          setVisible(true);
          setScrollKey(prev => prev + 1);
        }, 1500);
    }

    return () => clearTimeout(timer);
  }, [
    mode,
    phase,
    visible,
    text,
    chars.length,
    displayMode,
    scrollKey,
    scrollDuration,
  ]);

  useEffect(() => {
    if (Number.isFinite(scrollSpeed)) {
      localStorage.setItem('scrollSpeed', scrollSpeed);
    }
  }, [scrollSpeed]);

  // 文字列入力画面
  if (mode === 'input') {
    return (
      <InputScreen
        states={{
          text,
          textColor,
          bgColor,
          displayMode,
        }}
        actions={{
          handleInput,
          setTextColor,
          setBgColor,
          setDisplayMode,
          setMode,
          setIndex,
          setPhase,
          setScrollKey,
          setText,
        }}
        constants={{ TEXT_COLORS, BG_COLORS }}
      />
    );
  }

  // 文字列表示画面
  return (
    <div
      className={`w-full h-dvh flex items-center justify-center overflow-hidden ${BG_COLORS[bgColor]} ${textColor !== 'rainbow' ? TEXT_COLORS[textColor] : ''}`}
      onClick={() => setShowButtons(prev => !prev)}
    >
      {/* Cancel Button */}
      {showButtons && (
        <div className="absolute top-18 right-8 z-10 w-46 flex flex-col items-center gap-2 font-bold">
          <button
            className="w-full h-10 bg-gray-300 hover:bg-gray-200 text-black px-4 py-2 rounded-lg"
            onClick={e => {
              e.stopPropagation();
              setMode('input');
              setShowButtons(false);
              setFontSizeOffset(0);
            }}
          >
            CANCEL
          </button>

          <div className="w-full h-10  flex justify-between items-center gap-2 bg-gray-300 text-black rounded-lg">
            <button
              className="w-8 h-8 ml-2 rounded-full hover:bg-gray-200"
              onClick={e => {
                e.stopPropagation();
                setFontSizeOffset(prev => prev - 1);
              }}
            >
              <i className="fa-solid fa-minus"></i>
            </button>
            <span className="text-nowrap">FONT SIZE</span>
            <button
              className="w-8 h-8 mr-2 rounded-full hover:bg-gray-200"
              onClick={e => {
                e.stopPropagation();
                setFontSizeOffset(prev => prev + 1);
              }}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>

          {displayMode === 'scroll' && (
            <div className="w-full h-10  flex justify-between items-center gap-2 bg-gray-300 text-black rounded-lg">
              <button
                className="w-8 h-8 ml-2 rounded-full hover:bg-gray-200"
                onClick={e => {
                  e.stopPropagation();
                  setScrollSpeed(prev => Math.max(100, prev - 100));
                }}
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="text-nowrap">
                SPEED {`${scrollSpeed / 100}`}
              </span>
              <button
                className="w-8 h-8 mr-2 rounded-full hover:bg-gray-200"
                onClick={e => {
                  e.stopPropagation();
                  setScrollSpeed(prev => Math.min(2000, prev + 100));
                }}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Display */}
      <div className="w-full h-full flex justify-center items-center overflow-hidden relative font-protest">
        {/* 1文字ずつ表示 */}
        {displayMode === 'typing' && (
          <>
            <span
              className={`absolute text-[min(80vmin,90vw)] leading-none font-extrabold transition-opacity duration-300 ${phase === 'typing' ? 'opacity-100' : 'opacity-0'}`}
              style={textColor === 'rainbow' ? getRainbowStyle() : {}}
            >
              {/* {text.slice(index, index + 1)} */}
              {chars[index]}
            </span>

            {/* 全文表示 */}
            <span
              className={`w-full h-full flex justify-center items-center text-center wrap-break-word whitespace-pre-wrap font-black leading-[1.05] px-4 pb-4 transition-opacity duration-600 ${phase === 'blink' ? (visible ? 'opacity-100 animate-breathe' : 'opacity-0') : 'opacity-0'}`}
              style={{
                fontSize: `${getFontSize(text) + fontSizeOffset}vmin`,
                ...(textColor === 'rainbow' ? getRainbowStyle() : {}),
              }}
            >
              {text}
            </span>
          </>
        )}

        {/* 横スクロール */}
        {displayMode === 'scroll' && (
          <>
            <div
              className={`absolute w-full overflow-hidden ${phase === 'scroll' ? 'opacity-100' : 'opacity-0'}`}
            >
              <div
                key={scrollKey}
                ref={scrollTextRef}
                className="inline-block whitespace-nowrap text-[min(65vmin,70vw)] font-extrabold animate-marquee"
                style={{
                  animation: `marquee ${scrollDuration}s linear forwards`,
                  ...(textColor === 'rainbow' ? getRainbowStyle() : {}),
                }}
              >
                {text.replace(/\n/g, ' ')}
              </div>
            </div>

            {/* 全文表示 */}
            <span
              className={`absolute w-full h-full flex justify-center items-center text-center wrap-break-word whitespace-pre-wrap font-black leading-[1.05] px-4 pb-4 transition-opacity duration-600 ${phase === 'blink' ? (visible ? 'opacity-100 animate-breathe' : 'opacity-0') : 'opacity-0'}`}
              style={{
                fontSize: `${getFontSize(text) + fontSizeOffset}vmin`,
                ...(textColor === 'rainbow' ? getRainbowStyle() : {}),
              }}
            >
              {text}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
