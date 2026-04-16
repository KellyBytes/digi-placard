import { useEffect, useState } from 'react';
import NotesModal from './NotesModal';

const InputScreen = props => {
  const { states, actions, constants } = props;

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('placard-notes');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotes, setShowNotes] = useState(false);

  const saveNote = () => {
    if (!states.text.trim()) return;

    setNotes(prev => {
      if (prev.includes(states.text)) {
        return prev; // 重複禁止
      }
      return [states.text, ...prev].slice(0, 10);
    });

    if (notes.includes(states.text)) {
      alert('すでに保存されています');
    } else {
      alert('保存しました');
    }
  };

  const deleteNote = target => {
    setNotes(prev => prev.filter(b => b !== target));
  };

  useEffect(() => {
    localStorage.setItem('placard-notes', JSON.stringify(notes));
  }, [notes]);

  return (
    <>
      <div className="w-full min-h-dvh overflow-y-auto flex flex-col justify-center items-center px-6 space-y-4 text-lg sm:text-2xl bg-white">
        <div className="w-full max-w-xl flex justify-end gap-2 text-lg">
          <button
            className="bg-slate-400 text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={saveNote}
          >
            <i className="fa-regular fa-floppy-disk"></i> 保存
          </button>
          <button
            className="bg-slate-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={() => setShowNotes(true)}
          >
            <i className="fa-regular fa-file-lines"></i> メモ
          </button>
        </div>

        <textarea
          className="bg-gray-50 border border-gray-400 p-4 w-full max-w-xl rounded-lg resize-none"
          placeholder="文字列を入力してください"
          rows={4}
          value={states.text}
          onChange={actions.handleInput}
        />

        <div className="w-full max-w-xl flex justify-around">
          <div>
            <label className="font-bold">文字色: </label>
            <select
              value={states.textColor}
              onChange={e => actions.setTextColor(e.target.value)}
              className="w-36 ml-2 px-2 py-1 bg-gray-100 rounded-lg"
            >
              {Object.keys(constants.TEXT_COLORS).map(color => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold">背景色: </label>
            <select
              value={states.bgColor}
              onChange={e => actions.setBgColor(e.target.value)}
              className="w-36 ml-2 px-2 py-1 bg-gray-100 rounded-lg"
            >
              {Object.keys(constants.BG_COLORS).map(color => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full max-w-xl flex justify-around items-start gap-2">
          <label className="font-bold">表示方法: </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="displayMode"
              value="scroll"
              checked={states.displayMode === 'scroll'}
              onChange={() => actions.setDisplayMode('scroll')}
            />
            横スクロール
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="displayMode"
              value="typing"
              checked={states.displayMode === 'typing'}
              onChange={() => actions.setDisplayMode('typing')}
            />
            1文字ずつ表示
          </label>
        </div>

        <button
          className="w-full max-w-xl bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          onClick={() => {
            if (!states.text) return;
            actions.setMode('play');
            actions.setIndex(0);
            actions.setPhase(
              states.displayMode === 'typing' ? 'typing' : 'scroll',
            );
            if (states.displayMode === 'scroll')
              actions.setScrollKey(prev => prev + 1);
          }}
        >
          START
        </button>

        <div className="w-full max-w-xl flex flex-col justify-center items-start px-6">
          <span className="block text-base text-gray-500">
            ● 文字列は1行20文字、4行まで入力できます
          </span>
          <span className="block text-base text-gray-500">
            ● 文字色、背景色、表示方法を選んでSTARTを押してください
          </span>
          <span className="block text-base text-gray-500">
            ● 文字列は10件まで保存でき、「メモ」から選べます
          </span>
          <span className="block text-base text-gray-500">
            ●
            文字列表示中に画面をタップし、右上のCANCELボタンを押すとこの画面に戻ります
          </span>
          <span className="block text-base text-gray-500">
            ●
            全文表示のフォントサイズと横スクロールのスピードは+/-ボタンで調整できます
          </span>
          <span className="block text-base text-gray-500">
            ●
            スマホ・タブレットで全画面表示にするには、ホーム画面にアイコンを追加してそこから起動してください
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

      {showNotes && (
        <NotesModal
          notes={notes}
          setShowNotes={setShowNotes}
          setText={actions.setText}
          deleteNote={deleteNote}
        />
      )}
    </>
  );
};

export default InputScreen;
