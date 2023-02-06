import type { Dispatch, SetStateAction } from 'react';

export interface IUIContext {
  isIdle: boolean;
  isFullscreen: boolean;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  onIdle: (fn: () => void) => void;
}

export interface IDataContext {
  mediaFiles: string[];
  mediaFolder: string;
  selectMediaFolder: () => void;
}

export interface ISlideshowContext {
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  isMuted: boolean;
  setIsMuted: Dispatch<SetStateAction<boolean>>;
  currentMedia: string;
  allMediaPaths: string[];
  queuedMediaPaths: string[];
  playNext: () => Promise<void>;
}
