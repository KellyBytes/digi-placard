import { useState, useEffect } from 'react';

const TEXT_COLORS = {
  red: 'text-red-600/90',
  blue: 'text-blue-600/90',
  yellow: 'text-yellow-300',
  green: 'text-green-400',
  black: 'text-black',
  white: 'text-white',
};

const BG_COLORS = {
  white: 'bg-white',
  black: 'bg-black',
  yellow: 'bg-yellow-300',
};

function App() {
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('red');
  const [bgColor, setBgColor] = useState('white');

  const [mode, setMode] = useState('input'); // input | play
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | pause | blink | pause2
  const [blinkStep, setBlinkStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showCancel, setShowCancel] = useState(false);

  const handleInput = e => {
    let value = e.target.value;
    let lines = value.split('\n');
    lines = lines.slice(0, 3);
    lines = lines.map(line => line.slice(0, 20));
    setText(lines.join('\n'));
  };

  const getWeightedLength = text => {
    let length = 0;

    for (const char of text) {
      if (char.match(/[^\x00-\x7F]/)) {
        length += 3;
      } else {
        length += 2;
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

    if (maxLen <= 10) return 'text-[32vmin]';
    if (maxLen <= 16) return 'text-[28vmin]';
    if (maxLen <= 20) return 'text-[22vmin]';
    if (maxLen <= 32) return 'text-[14vmin]';
    if (maxLen <= 40) return 'text-[11vmin]';
    return 'text-[9vmin]';
  };

  useEffect(() => {
    if (mode !== 'play') return; // play中のみ先へ進む

    let timer;

    switch (phase) {
      case 'typing': // 1文字ずつ表示
        if (index < text.length) {
          timer = setTimeout(() => {
            setIndex(prev => prev + 1);
          }, 250);
        } else {
          timer = setTimeout(() => {
            setVisible(true);
            setPhase('pause'); // typing → blinkの間に1秒
          }, 0);
        }
        break;

      case 'pause':
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

              if (next >= 6) {
                setPhase('pause2');
                setBlinkStep(0);
              }

              return next;
            });
          },
          visible ? 6000 : 1000,
        );
        break;

      case 'pause2':
        timer = setTimeout(() => {
          setPhase('typing');
          setIndex(0);
          setVisible(true);
        }, 1500);
        break;
    }

    return () => clearTimeout(timer);
  }, [mode, index, phase, visible, text]);

  // 文字列入力画面
  if (mode === 'input') {
    return (
      <div className="w-full min-h-dvh overflow-y-auto flex flex-col justify-center items-center px-6 space-y-4 text-lg sm:text-2xl bg-white">
        <textarea
          className="border border-gray-400 p-4 w-full max-w-xl rounded-lg resize-none"
          placeholder="文字列を入力してください"
          rows={3}
          value={text}
          onChange={handleInput}
        />

        <div className="w-full max-w-xl flex flex-row justify-around">
          <div>
            <label>文字色: </label>
            <select
              value={textColor}
              onChange={e => setTextColor(e.target.value)}
              className="w-30 ml-2 px-2 py-1 bg-gray-100 rounded-lg"
            >
              {Object.keys(TEXT_COLORS).map(color => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </div>

          <div>
            <label>背景色: </label>
            <select
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-30 ml-2 px-2 py-1 bg-gray-100 rounded-lg"
            >
              {Object.keys(BG_COLORS).map(color => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="w-full max-w-xl bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            if (!text) return;
            setMode('play');
            setIndex(0);
            setPhase('typing');
          }}
        >
          START
        </button>

        <div className="w-full max-w-xl flex flex-col justify-center items-start px-6">
          <span className="block text-base text-gray-500">
            ● 文字列は1行20文字、3行まで入力できます
          </span>
          <span className="block text-base text-gray-500">
            ● 文字色、背景色を選んでSTARTを押してください
          </span>
          <span className="block text-base text-gray-500">
            ●
            文字列表示中にこの画面に戻るには、画面をタップして右上に表示されるCANCELボタンをタップしてください
          </span>
          <span className="block text-base text-gray-500">
            ●
            スマホ・タブレットで全画面表示にするには、ホーム画面にアイコンを追加してください
          </span>
        </div>

        <div className="w-full max-w-xl text-right text-sm text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} Digi-Placard. All rights reserved.{' '}
          <a
            href="https://x.com/kellydawk"
            className="text-sm text-gray-500 hover:text-gray-600"
            target="_blank"
            aria-label="link to x"
          >
            Contact me at <i className="fa-brands fa-x-twitter"></i>
          </a>
        </div>
      </div>
    );
  }

  // 文字列表示画面
  return (
    <div
      className={`w-full h-dvh flex items-center justify-center overflow-hidden font-mp1 ${BG_COLORS[bgColor]} ${TEXT_COLORS[textColor]}`}
      style={{
        paddingTop: 'env(safe-area-inset-top',
        paddingBottom: 'env(safe-area-inset-bottom',
      }}
      onClick={() => setShowCancel(true)}
    >
      {/* Cancel Button */}
      {showCancel && (
        <button
          className="absolute top-12 right-8 z-10 bg-gray-700 text-white px-4 py-2 rounded-lg"
          onClick={e => {
            e.stopPropagation();
            setMode('input');
            setShowCancel(false);
          }}
        >
          CANCEL
        </button>
      )}

      {/* Display */}
      <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
        <span
          className={`absolute text-[min(80vmin,90vw)] leading-none font-extrabold transition-opacity duration-300 ${phase === 'typing' ? 'opacity-100' : 'opacity-0'}`}
        >
          {text.slice(index, index + 1)}
        </span>

        <span
          className={`w-full h-full flex justify-center items-center text-center wrap-break-word whitespace-pre-wrap font-black leading-none px-4 pb-4 ${getFontSize(text)} transition-opacity duration-600 ${phase === 'blink' ? (visible ? 'opacity-100 animate-breathe' : 'opacity-0') : 'opacity-0'}`}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

export default App;
