import { useEffect, useState } from 'react';
import NotesModal from './NotesModal';
import { translations } from '../i18n';

const InputScreen = props => {
  const { states, actions, constants } = props;
  const t = translations[states.lang];
  const isEn = states.lang === 'en';

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
      alert(t.alreadySaved);
    } else {
      alert(t.saved);
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
      <div className="relative w-full min-h-dvh overflow-y-auto flex flex-col justify-center items-center px-6 pt-16 pb-6 space-y-4 text-lg sm:text-2xl bg-white">
        {/* Language toggle */}
        <div
          className="absolute top-4 right-4 flex items-center text-base font-bold border border-gray-400 rounded-lg overflow-hidden"
          role="group"
          aria-label="Language"
        >
          {['en', 'ja'].map((code, i) => (
            <button
              key={code}
              className={`px-3 py-1 cursor-pointer ${i > 0 ? 'border-l border-gray-400' : ''} ${states.lang === code ? 'bg-slate-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              aria-pressed={states.lang === code}
              onClick={() => actions.setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="w-full max-w-xl flex justify-end gap-2 text-lg">
          <button
            className="bg-slate-400 text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={saveNote}
          >
            <i className="fa-regular fa-floppy-disk"></i> {t.save}
          </button>
          <button
            className="bg-slate-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={() => setShowNotes(true)}
          >
            <i className="fa-regular fa-file-lines"></i> {t.notes}
          </button>
        </div>

        <textarea
          className="bg-gray-50 border border-gray-400 p-4 w-full max-w-xl rounded-lg resize-none"
          placeholder={t.placeholder}
          rows={4}
          value={states.text}
          onChange={actions.handleInput}
        />

        <div className="w-full max-w-xl flex justify-around">
          <div>
            <label className="font-bold">{t.textColor}: </label>
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
            <label className="font-bold">{t.bgColor}: </label>
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
          <label className="font-bold">{t.displayMode}: </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="displayMode"
              value="scroll"
              checked={states.displayMode === 'scroll'}
              onChange={() => actions.setDisplayMode('scroll')}
            />
            {t.scroll}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="displayMode"
              value="typing"
              checked={states.displayMode === 'typing'}
              onChange={() => actions.setDisplayMode('typing')}
            />
            {t.typing}
          </label>
        </div>

        {isEn && (
          <>
            <div className="w-full max-w-xl flex justify-around items-start gap-2">
              <label className="font-bold">{t.font}: </label>
              <label className="flex items-center gap-2 font-roboto">
                <input
                  type="radio"
                  name="enFont"
                  value="sans"
                  checked={states.enFont === 'sans'}
                  onChange={() => actions.setEnFont('sans')}
                />
                {t.fontSans}
              </label>
              <label className="flex items-center gap-2 font-merriweather">
                <input
                  type="radio"
                  name="enFont"
                  value="serif"
                  checked={states.enFont === 'serif'}
                  onChange={() => actions.setEnFont('serif')}
                />
                {t.fontSerif}
              </label>
            </div>

            <div className="w-full max-w-xl flex justify-around items-start gap-2">
              <label className="font-bold">{t.weight}: </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="enWeight"
                  value="default"
                  checked={states.enWeight === 'default'}
                  onChange={() => actions.setEnWeight('default')}
                />
                {t.weightDefault}
              </label>
              <label className="flex items-center gap-2 font-bold">
                <input
                  type="radio"
                  name="enWeight"
                  value="bold"
                  checked={states.enWeight === 'bold'}
                  onChange={() => actions.setEnWeight('bold')}
                />
                {t.weightBold}
              </label>
            </div>
          </>
        )}

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
          {t.help.map(line => (
            <span key={line} className="block text-base text-gray-500">
              ● {line}
            </span>
          ))}
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
          t={t}
        />
      )}
    </>
  );
};

export default InputScreen;
