import React from 'react';
import { IDataContext } from './types';

const defaultContext: IDataContext = {
  mediaFiles: [],
  mediaFolder: '',
  selectMediaFolder: () => undefined,
};

const DataContext = React.createContext(defaultContext);

export default DataContext;
