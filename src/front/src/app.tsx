import React from 'react';

import './app.css';

import type { Note } from './types';
import { NoteListItem } from './note_list_item';

type Mode = 'home' | 'trash';

export const App = () => {
  const [notes, setNotes] = React.useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      content: `Note ${i}`,
      trashed: i % 5 === 0,
    })),
  );
  const [mode, setMode] = React.useState<Mode>('home');
  const [isSearching, setIsSearching] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');

  const onChangeMode = (mode: Mode) => {
    setMode(mode);
  };

  const onChangeSearching = () => {
    setIsSearching((prev) => !prev);
  };

  const onChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const onChangeNote = React.useCallback((note: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  }, []);

  const onTrashNote = React.useCallback((id: number) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, trashed: true } : note)),
    );
  }, []);

  const onAddNote = () => {
    setNotes((prev) => {
      const id = new Date().getTime();
      return [...prev, { id, content: `Note ${id}`, trashed: false }];
    });
  };

  const canTrash = mode === 'home';

  return (
    <ul>
      <nav>
        {isSearching && (
          <input type="search" value={keyword} onChange={onChangeKeyword} />
        )}
        <button onClick={onChangeSearching}>Search</button>
        <span>{notes.length} notes</span>
        <button onClick={() => onChangeMode('home')}>Home</button>
        <button onClick={() => onChangeMode('trash')}>Trash</button>
      </nav>
      {notes.map((note) => {
        const hidden =
          (mode === 'home' && note.trashed) ||
          (mode === 'trash' && !note.trashed) ||
          (isSearching && !note.content.includes(keyword));

        return (
          <li
            key={note.id}
            style={{ display: hidden ? 'none' : 'block', padding: 10 }}
          >
            <NoteListItem
              key={note.id}
              note={note}
              canTrash={canTrash}
              onChange={onChangeNote}
              onTrash={onTrashNote}
            />
          </li>
        );
      })}
      {mode === 'home' && !isSearching && (
        <li>
          <button onClick={onAddNote} className="btn-add">
            +
          </button>
        </li>
      )}
    </ul>
  );
};
