const NotesModal = ({ notes, setShowNotes, setText, deleteNote }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-xl max-h-[70vh] overflow-y-auto rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="font-bold">メモ</span>
          <button onClick={() => setShowNotes(false)}>閉じる</button>
        </div>

        {notes.length === 0 && (
          <div className="text-gray-400 text-center py-6">
            保存されたテキストはありません
          </div>
        )}

        {notes.map((note, i) => (
          <div
            key={i}
            className="bg-gray-50 border p-2 rounded mb-2 flex justify-between items-center"
          >
            <div
              className="whitespace-pre-wrap cursor-pointer flex-1"
              onClick={() => {
                setText(note);
                setShowNotes(false);
              }}
            >
              {note}
            </div>

            <button
              className="ml-2 text-red-500"
              onClick={() => deleteNote(note)}
            >
              <i className="fa-solid fa-trash-can"></i> 削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesModal;
