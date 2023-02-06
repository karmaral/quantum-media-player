import React from 'react';
import { IUIContext, IDataContext, ISlideshowContext } from './types';

const defaultUIContext: IUIContext = {
  isIdle: false,
  isFullscreen: false,
  setIsFullscreen: () => undefined,
  onIdle: () => undefined,
};
export const UIContext = React.createContext(defaultUIContext);

const defaultDataContext: IDataContext = {
  mediaFiles: [],
  mediaFolder: '',
  selectMediaFolder: () => undefined,
};
export const DataContext = React.createContext(defaultDataContext);

const defaultSlideshowContext: ISlideshowContext = {
  isPlaying: false,
  setIsPlaying: () => undefined,
  isMuted: false,
  setIsMuted: () => undefined,
  playNext: () => undefined,
  currentMedia: '',
  allMediaPaths: [],
  queuedMediaPaths: [],
};
export const SlideshowContext = React.createContext(defaultSlideshowContext);
