import { contextBridge, ipcRenderer } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  app: {
    minimize: () => ipcRenderer.send('app:minimize'),
    quit: () => ipcRenderer.send('app:quit'),
  },
  getMediaFiles: () => ipcRenderer.invoke('request:media_files'),
};

contextBridge.exposeInMainWorld('api', electronHandler);

export type ElectronHandler = typeof electronHandler;
