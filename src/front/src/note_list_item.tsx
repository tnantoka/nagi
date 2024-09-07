import React from 'react';

import './app.css';

import type { Note } from './types';

const MIN_ROWS = 5;

type Props = {
  note: Note;
  canTrash: boolean;
  onChange: (note: Note) => void;
  onTrash: (id: number) => void;
};

export const NoteListItem = React.memo((props: Props) => {
  const { note, canTrash, onChange, onTrash } = props;

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
      />
      {canTrash && (
        <button onClick={() => onTrash(note.id)} className="btn-trash">
          x
        </button>
      )}
    </>
  );
});
