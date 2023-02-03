import { contextBridge, ipcRenderer } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  app: {
    minimize: () => ipcRenderer.send('app:minimize'),
    quit: () => ipcRenderer.send('app:quit'),
  },
  media: {
    setMediaFolder: () => ipcRenderer.invoke('request:set_media_folder'),
    getMediaFolder: () => ipcRenderer.sendSync('request:get_media_folder'),
    getMediaFiles: () => ipcRenderer.invoke('request:media_files'),
  },
};

contextBridge.exposeInMainWorld('api', electronHandler);

export type ElectronHandler = typeof electronHandler;
