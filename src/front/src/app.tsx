import React from 'react';

import type { Note } from './types';
import { NoteListItem } from './note_list_item';
import { nanoid } from 'nanoid';

import './app.scss';
import { Header, Mode } from './header';

type Props = {
  defaultNotes: Note[];
  upsertNote: (note: Note) => void;
  deleteNote: (id: string) => void;
};

export const App = (props: Props) => {
  const { defaultNotes, upsertNote, deleteNote } = props;

  const [notes, setNotes] = React.useState(
    defaultNotes.sort((a, b) =>
      (a.created_at ?? '').localeCompare(b.created_at ?? ''),
    ),
  );
  const [mode, setMode] = React.useState<Mode>('home');
  const [isSearching, setIsSearching] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');

  const onChangeMode = React.useCallback((mode: Mode) => {
    setMode(mode);
  }, []);

  const onChangeIsSearching = React.useCallback(() => {
    setIsSearching((prev) => !prev);
  }, []);

  const onChangeKeyword = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
    },
    [],
  );

  const onChangeNote = React.useCallback(
    (note: Note) => {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      upsertNote(note);
    },
    [upsertNote],
  );

  const onTrashNote = React.useCallback(
    (id: string) => {
      setNotes((prev) => {
        const prevNote = prev.find((note) => note.id === id);
        if (!prevNote) {
          return prev;
        }
        const note = { ...prevNote, trashed: !prevNote.trashed };
        upsertNote(note);
        return prev.map((n) => (n.id === id ? note : n));
      });
    },
    [upsertNote],
  );

  const onRestoreNote = onTrashNote;

  const onDeleteNote = React.useCallback(
    (id: string) => {
      setNotes((prev) => {
        deleteNote(id);
        return prev.filter((n) => n.id !== id);
      });
    },
    [deleteNote],
  );

  const onAddNote = () => {
    const note = { id: nanoid(), content: '', trashed: false, created_at: '' };
    setNotes((prev) => {
      return [...prev, note];
    });
    upsertNote(note);

    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
  };

  const {
    liveNotes,
    trashedNotes,
    filteredLiveNotes,
    filteredTrashedNotes,
    isMatchByNoteId,
  } = React.useMemo(() => {
    const liveNotes = [];
    const trashedNotes = [];
    const filteredLiveNotes = [];
    const filteredTrashedNotes = [];
    const isMatchByNoteId: { [id: string]: boolean } = {};
    for (const note of notes) {
      const isMatch = note.content.includes(keyword);
      isMatchByNoteId[note.id] = isMatch;
      if (note.trashed) {
        trashedNotes.push(note);
        if (isMatch) {
          filteredTrashedNotes.push(note);
        }
      } else {
        liveNotes.push(note);
        if (isMatch) {
          filteredLiveNotes.push(note);
        }
      }
    }
    return {
      liveNotes,
      trashedNotes,
      filteredLiveNotes,
      filteredTrashedNotes,
      isMatchByNoteId,
    };
  }, [notes, keyword]);

  return (
    <>
      <Header
        mode={mode}
        isSearching={isSearching}
        keyword={keyword}
        liveNotesCount={liveNotes.length}
        trashedNotesCount={trashedNotes.length}
        filteredLiveNotesCount={filteredLiveNotes.length}
        filteredTrashedNotesCount={filteredTrashedNotes.length}
        onChangeMode={onChangeMode}
        onChangeIsSearching={onChangeIsSearching}
        onChangeKeyword={onChangeKeyword}
      />
      <ul className="list-unstyled m-0" style={{ paddingTop: 36 }}>
        {notes.map((note) => {
          const isHidden =
            (mode === 'home' && note.trashed) ||
            (mode === 'trash' && !note.trashed) ||
            (isSearching && !isMatchByNoteId[note.id]);

          return (
            <li
              key={note.id}
              className={`p-1 pb-0 position-relative border-bottom ${isHidden ? 'd-none' : ''}`}
            >
              <NoteListItem
                note={note}
                onChange={onChangeNote}
                onTrash={onTrashNote}
                onRestore={onRestoreNote}
                onDelete={onDeleteNote}
              />
            </li>
          );
        })}
        {mode === 'home' && !isSearching && (
          <li className="d-grid">
            <button
              onClick={onAddNote}
              className="btn btn-light bg-transparent rounded-0"
            >
              <i className="bi-plus-lg" />
            </button>
          </li>
        )}
      </ul>
    </>
  );
};
