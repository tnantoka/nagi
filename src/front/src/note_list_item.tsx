import React from 'react';

import type { Note } from './types';

const MIN_ROWS = 1;

type Props = {
  note: Note;
  onChange: (note: Note) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
};

export const NoteListItem = React.memo((props: Props) => {
  const { note, onChange, onTrash, onRestore, onDelete } = props;

  const onChangeNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...note,
      content: e.target.value,
    });
  };

  return (
    <>
      <textarea
        value={note.content}
        onChange={onChangeNote}
        rows={Math.max(note.content.split('\n').length, MIN_ROWS)}
        className="w-100 border-0"
        autoFocus
      />
      <div className="btn-group position-absolute end-0 me-1 opacity-75">
        {note.trashed ? (
          <>
            <button
              onClick={() => onRestore(note.id)}
              className="px-1 py-0 btn btn-light bg-transparent rounded-0"
            >
              <i className="bi-arrow-counterclockwise fs-5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="px-1 py-0 btn btn-light bg-transparent rounded-0"
            >
              <i className="bi-trash fs-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onTrash(note.id)}
            className="px-1 py-0 btn btn-light bg-transparent rounded-0"
          >
            <i className="bi-x fs-5" />
          </button>
        )}
      </div>
    </>
  );
});
