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
