import React from 'react';
import debounce from 'lodash/debounce';

import { App } from './app.tsx';
import { Note } from './types.tsx';

import './root.scss';

declare global {
  interface Window {
    setNotes: React.Dispatch<React.SetStateAction<Note[]>> | null;
    loadNotes: () => void;
    upsertNote: (note: Note) => void;
    deleteNote: (id: string) => void;
    ipc: {
      postMessage: (message: string) => void;
    };
  }
}

const UPSERT_DEBOUNCE_WAIT = 1000;

if (window.ipc) {
  window.loadNotes = () => {
    window.ipc.postMessage('loadNotes:');
  };
  window.upsertNote = debounce((note: Note) => {
    window.ipc.postMessage(`upsertNote:${JSON.stringify(note)}`);
  }, UPSERT_DEBOUNCE_WAIT);
  window.deleteNote = (id: string) => {
    window.ipc.postMessage(`deleteNote:${id}`);
  };
} else {
  window.loadNotes = () => {
    window.setNotes?.(
      Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        content: `Note ${i}`,
        trashed: i % 5 === 0,
      })),
    );
  };
  window.upsertNote = debounce(
    (note: Note) => {
      console.log('upsertNote:', note);
    },
    UPSERT_DEBOUNCE_WAIT,
    { leading: true },
  );
  window.deleteNote = (id: string) => {
    console.log('deleteNote:', id);
  };
}

export const Root = () => {
  const [notes, setNotes] = React.useState<Note[]>([]);

  React.useEffect(() => {
    window.setNotes = setNotes;
    window.loadNotes();

    return () => {
      window.setNotes = null;
    };
  }, []);

  return notes.length > 0 ? (
    <App
      defaultNotes={notes}
      upsertNote={window.upsertNote}
      deleteNote={window.deleteNote}
    />
  ) : (
    <div className="text-center mt-5">
      <div className="spinner-grow text-secondary" />
    </div>
  );
};
