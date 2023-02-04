import React from 'react';
import { IUIContext, IDataContext } from './types';

const defaultUIContext: IUIContext = {
  isIdle: false,
  isFullscreen: false,
  setIsFullscreen: () => undefined,
};
export const UIContext = React.createContext(defaultUIContext);

const defaultDataContext: IDataContext = {
  mediaFiles: [],
  mediaFolder: '',
  selectMediaFolder: () => undefined,
};
export const DataContext = React.createContext(defaultDataContext);
