import { useEffect, useState, useCallback, useContext } from 'react';
import type { MouseEventHandler } from 'react';
import { RxDotsHorizontal } from 'react-icons/rx';
import {
  IoFilmOutline,
  IoVolumeMuteOutline,
  IoVolumeHighOutline,
} from 'react-icons/io5';
import { DataContext, UIContext, SlideshowContext } from '../lib/context';
import { joinClasses } from '../lib/utils';

export default function Options() {
  const [optionsOpen, setOptionsOpen] = useState(false);

  const { mediaFolder, selectMediaFolder } = useContext(DataContext);
  const { onIdle } = useContext(UIContext);
  const { isMuted, setIsMuted, allMediaPaths, queuedMediaPaths } =
    useContext(SlideshowContext);

  const menuClasses = joinClasses(['options-menu', optionsOpen ? 'open' : '']);

  const calcProgress = (type: 'label' | 'width' = 'label') => {
    const { length: all } = allMediaPaths;
    const { length: queued } = queuedMediaPaths;
    if (type === 'width') {
      return `${((all - queued) / all) * 100}%`;
    }
    return `${all - queued} / ${all} played`;
  };

  const handleOptionsToggle: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setOptionsOpen((prev) => !prev);
  };

  const handleVolumeToggle: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleSelectFolder: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    selectMediaFolder();
  };

  const addIdleListener = useCallback(() => {
    onIdle(() => setOptionsOpen(false));
  }, [onIdle]);

  useEffect(() => {
    console.log('registering onIdle');
    addIdleListener();
  }, [addIdleListener]);

  return (
    <div className="options">
      <button
        type="button"
        className="action-btn options-btn"
        onClick={handleOptionsToggle}
      >
        <RxDotsHorizontal />
      </button>
      <div className={menuClasses}>
        <div className="option-item">
          Progress
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: calcProgress('width') }}
            />
          </div>
          <span className="desc">{calcProgress('label')}</span>
        </div>
        <button
          type="button"
          className="option-item"
          onClick={handleVolumeToggle}
        >
          {isMuted ? <IoVolumeMuteOutline /> : <IoVolumeHighOutline />}
          Toggle sound
        </button>
        <button
          type="button"
          className="option-item"
          onClick={handleSelectFolder}
        >
          <IoFilmOutline />
          Change Media Folder
          <span className="desc">{mediaFolder}</span>
        </button>
      </div>
    </div>
  );
}
