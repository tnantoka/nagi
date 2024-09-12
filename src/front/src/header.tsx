import React from 'react';

export type Mode = 'home' | 'trash';

type Props = {
  mode: Mode;
  isSearching: boolean;
  keyword: string;
  liveNotesCount: number;
  trashedNotesCount: number;
  filteredLiveNotesCount: number;
  filteredTrashedNotesCount: number;
  onChangeMode: (mode: Mode) => void;
  onChangeIsSearching: () => void;
  onChangeKeyword: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Header = React.memo((props: Props) => {
  const {
    mode,
    isSearching,
    keyword,
    liveNotesCount,
    trashedNotesCount,
    filteredLiveNotesCount,
    filteredTrashedNotesCount,
    onChangeMode,
    onChangeKeyword,
  } = props;

  const keywordRef = React.useRef<HTMLInputElement>(null);

  const onChangeIsSearching = () => {
    props.onChangeIsSearching();
    if (!isSearching) {
      setTimeout(() => keywordRef.current?.focus(), 0);
    }
  };

  return (
    <div className="bg-body-secondary d-flex fixed-top">
      <button
        className={`btn border-0 rounded-0 ${mode === 'home' ? 'bg-dark-subtle' : ''}`}
        onClick={() => onChangeMode('home')}
      >
        {mode === 'home' ? (
          <i className="bi-house-door-fill" />
        ) : (
          <i className="bi-house-door" />
        )}
      </button>
      <button
        className={`btn border-0 rounded-0 ${mode === 'trash' ? 'bg-dark-subtle' : ''}`}
        onClick={() => onChangeMode('trash')}
      >
        {mode === 'trash' ? (
          <i className="bi-trash-fill" />
        ) : (
          <i className="bi-trash" />
        )}
      </button>
      <div className="d-flex align-items-center">
        <button className="btn border-0" onClick={onChangeIsSearching}>
          {isSearching ? (
            <i className="bi-filter-square-fill" />
          ) : (
            <i className="bi-filter-square" />
          )}
        </button>
        {isSearching && (
          <input
            type="search"
            className="form-control form-control-sm"
            value={keyword}
            onChange={onChangeKeyword}
            ref={keywordRef}
          />
        )}
      </div>

      <div className="d-flex align-items-center small ms-auto me-2">
        {isSearching && (
          <>
            <span>
              {mode === 'home'
                ? filteredLiveNotesCount
                : filteredTrashedNotesCount}{' '}
              notes
            </span>
            <span className="mx-1">/</span>
          </>
        )}
        <span>
          {mode === 'home' ? liveNotesCount : trashedNotesCount} notes
        </span>
      </div>
    </div>
  );
});
