import React from 'react';
import debounce from 'lodash/debounce';

import { App } from './app.tsx';
import { Note, Settings } from './types.tsx';

import './root.scss';

declare global {
  interface Window {
    setNotes: React.Dispatch<React.SetStateAction<Note[]>> | null;
    setSettings: React.Dispatch<React.SetStateAction<Settings>> | null;
    init: () => void;
    upsertNote: (note: Note) => void;
    deleteNote: (id: string) => void;
    ipc: {
      postMessage: (message: string) => void;
    };
  }
}

const UPSERT_DEBOUNCE_WAIT = 300;

if (window.ipc) {
  window.init = () => {
    window.ipc.postMessage('init:');
  };
  window.upsertNote = debounce((note: Note) => {
    window.ipc.postMessage(`upsertNote:${JSON.stringify(note)}`);
  }, UPSERT_DEBOUNCE_WAIT);
  window.deleteNote = (id: string) => {
    window.ipc.postMessage(`deleteNote:${id}`);
  };
} else {
  window.init = () => {
    window.setNotes?.(
      Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        content: `Note ${i}`,
        trashed: i % 5 === 0,
        created_at: new Date(i).toISOString(),
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
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [settings, setSettings] = React.useState({ font_size: 16 });

  React.useEffect(() => {
    window.setNotes = (notes) => {
      setNotes(notes);
      setIsLoaded(true);
    };
    window.setSettings = setSettings;
    window.init();

    return () => {
      window.setNotes = null;
    };
  }, []);

  return isLoaded ? (
    <div style={{ fontSize: settings.font_size }}>
      <App
        defaultNotes={notes}
        upsertNote={window.upsertNote}
        deleteNote={window.deleteNote}
      />
    </div>
  ) : (
    <div className="text-center mt-5">
      <div className="spinner-grow text-secondary" />
    </div>
  );
};
