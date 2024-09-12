import React from 'react';

import type { Note } from './types';

const MIN_ROWS = 5;

type Props = {
  note: Note;
  onChange: (note: Note) => void;
  onTrash: (id: string) => void;
};

export const NoteListItem = React.memo((props: Props) => {
  const { note, onChange, onTrash } = props;

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
      {!note.trashed && (
        <button
          onClick={() => onTrash(note.id)}
          className="position-absolute end-0 me-1 px-1 py-0 btn btn-light bg-transparent rounded-0"
        >
          <i className="bi-x-lg" />
        </button>
      )}
    </>
  );
});
