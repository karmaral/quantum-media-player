import { useEffect, useCallback, useContext } from 'react';
import type { MouseEventHandler, KeyboardEventHandler } from 'react';
import { RxShuffle, RxPlay, RxPause } from 'react-icons/rx';
import { IoFilmOutline } from 'react-icons/io5';
import { DataContext, SlideshowContext } from '../lib/context';
import Options from './options';

export default function SlideshowActions() {
  const ctx = useContext(DataContext);
  const { currentMedia, playNext, isPlaying, setIsPlaying } =
    useContext(SlideshowContext);

  const keyHandler = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === 'Escape') {
      // exit fullscreen
    }
  }, []);

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

  const handleSelectFolder: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    ctx.selectMediaFolder();
  };

  useEffect(() => {
    document.addEventListener('keydown', keyHandler);
  }, [keyHandler]);

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
          <IoFilmOutline size="4em" />
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
          <Options />
        </div>
      </div>
    </div>
  );
}
