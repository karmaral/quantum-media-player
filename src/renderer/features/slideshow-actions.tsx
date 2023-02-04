import React, { useEffect, useState, useCallback, useContext } from 'react';
import type { MouseEventHandler, KeyboardEventHandler } from 'react';
import { RxShuffle, RxPlay, RxPause, RxDotsHorizontal } from 'react-icons/rx';
import { MdOutlinePermMedia } from 'react-icons/md';
import { UIContext, DataContext } from '../lib/context';
import { joinClasses } from '../lib/utils';

interface SlideShowActionsProps {
  isPlaying: boolean;
  currentMedia: string;
  playNext: () => Promise<void>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  mediaFolder: string;
}

export default function SlideShowActions(props: SlideShowActionsProps) {
  const { mediaFolder, currentMedia, isPlaying, playNext, setIsPlaying } =
    props;

  const ctx = useContext(DataContext);
  const { onIdle } = useContext(UIContext);

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const optionsClasses = joinClasses([
    'options-menu',
    isOptionsOpen ? 'open' : '',
  ]);

  const keyHandler = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === 'Escape') {
      // exit fullscreen
    }
  }, []);

  const addIdleListener = useCallback(() => {
    onIdle(() => setIsOptionsOpen(false));
  }, [onIdle]);

  const handlePlayback: MouseEventHandler<HTMLDivElement> = (e) => {
    setIsPlaying((prev) => !prev);
  };

  const handlePlaybackKeydown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.repeat) return;
    if (e.key === 'Enter' || e.key === 'Space') {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleSkip: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    playNext();
  };

  const handleOptionsToggle: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsOptionsOpen((prev) => !prev);
  };

  const handleSelectFolder: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    ctx.selectMediaFolder();
  };

  useEffect(() => {
    document.addEventListener('keydown', keyHandler);
  }, [keyHandler]);

  useEffect(() => {
    addIdleListener();
  }, [addIdleListener]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="actions fades-on-idle"
      onClick={handlePlayback}
      onKeyDown={handlePlaybackKeydown}
    >
      {currentMedia && (
        <div className="icon-paused">{!isPlaying && <RxPlay />}</div>
      )}
      {!ctx.mediaFolder && (
        <button
          type="button"
          className="btn-select-folder"
          onClick={handleSelectFolder}
        >
          Select media folder
        </button>
      )}
      <div className="side">
        <div className="side-wrapper">
          <button
            type="button"
            className="action-btn btn-skip"
            onClick={handleSkip}
          >
            <RxShuffle />
          </button>
          <div className="options">
            <button
              type="button"
              className="action-btn options-btn"
              onClick={handleOptionsToggle}
            >
              <RxDotsHorizontal />
            </button>
            <div className={optionsClasses}>
              <button type="button" onClick={handleSelectFolder}>
                <MdOutlinePermMedia />
                Change media folder
                <span className="desc">{mediaFolder}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
