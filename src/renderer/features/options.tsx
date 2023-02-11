import { useEffect, useState, useCallback, useContext } from 'react';
import type { MouseEventHandler } from 'react';
import { RxDotsHorizontal } from 'react-icons/rx';
import {
  IoFilmOutline,
  IoVolumeMuteOutline,
  IoVolumeHighOutline,
} from 'react-icons/io5';
import { DataContext, UIContext, SlideshowContext } from '$lib/context';
import { joinClasses } from '$lib/utils';
import cls from './options.module.css';

export default function Options() {
  const [optionsOpen, setOptionsOpen] = useState(false);

  const { mediaFolder, selectMediaFolder } = useContext(DataContext);
  const { onIdle } = useContext(UIContext);
  const { isMuted, setIsMuted, allMediaPaths, queuedMediaPaths } =
    useContext(SlideshowContext);

  const menuClasses = joinClasses([cls.optionsMenu, optionsOpen ? 'open' : '']);

  const calcProgress = (type: 'label' | 'width' = 'label') => {
    const { length: all } = allMediaPaths;
    const { length: queued } = queuedMediaPaths;
    if (type === 'width') {
      if (!all) return '0%';
      return `${((all - queued) / all) * 100}%`;
    }
    if (type === 'label') {
      if (!all) {
        return 'No files loaded';
      }
      return `${all - queued} / ${all} played`;
    }
    return '';
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
    addIdleListener();
  }, [addIdleListener]);

  return (
    <div className={cls.options}>
      <button
        type="button"
        className={joinClasses([cls.actionBtn, cls.optionsBtn])}
        onClick={handleOptionsToggle}
      >
        <RxDotsHorizontal />
      </button>
      <div className={menuClasses}>
        <div className={cls.optionItem}>
          Progress
          {Boolean(allMediaPaths.length) && (
            <div className={cls.progressBar}>
              <div
                className={cls.progress}
                style={{ width: calcProgress('width') }}
              />
            </div>
          )}
          <span className={cls.desc}>{calcProgress('label')}</span>
        </div>
        <button
          type="button"
          className={cls.optionItem}
          onClick={handleVolumeToggle}
        >
          {isMuted ? <IoVolumeMuteOutline /> : <IoVolumeHighOutline />}
          Toggle sound
        </button>
        <button
          type="button"
          className={cls.optionItem}
          onClick={handleSelectFolder}
        >
          <IoFilmOutline />
          Change media folder
          {mediaFolder && <span className={cls.desc}>{mediaFolder}</span>}
        </button>
      </div>
    </div>
  );
}
