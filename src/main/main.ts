/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import Store from 'electron-store';
import { resolveHtmlPath } from './util';
import { isImage, isVideo } from '../shared/utils';
import { cleanFilename, registerMediaProtocol } from './lib/media';

const store = new Store<{ mediaFolder: string }>();

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const getValidMediaFolder = (): string => {
  const stored = store.get('mediaFolder');
  if (fs.existsSync(stored)) return stored;
  store.set('mediaFolder', '');
  return '';
};

function getMediaFiles(): string[] {
  const mediaFolder = getValidMediaFolder();
  if (!mediaFolder) return [];
  const files = fs.readdirSync(mediaFolder, { withFileTypes: true });
  const validPaths: string[] = [];
  try {
    files.forEach((file) => {
      if (file.isDirectory()) return;
      if (!isImage(file.name) && !isVideo(file.name)) return;
      const oldPath = path.join(mediaFolder, file.name);
      const safeName = cleanFilename(file.name);
      const newPath = path.join(mediaFolder, safeName);
      if (safeName !== file.name) {
        fs.renameSync(oldPath, newPath);
      }
      validPaths.push(newPath);
      console.log(safeName);
    });
  } catch (e) {
    console.log(e);
  }
  return validPaths;
}
function getMediaFolder(event: Electron.IpcMainEvent) {
  const mediaFolder = getValidMediaFolder();
  event.returnValue = mediaFolder;
}

async function selectMediaFolder() {
  const options: Electron.OpenDialogOptions = {
    title: 'Select media folder',
    properties: ['openDirectory'],
    buttonLabel: 'Select',
  };
  try {
    const { filePaths } = await dialog.showOpenDialog(
      mainWindow as BrowserWindow,
      options
    );
    console.log(filePaths);
    store.set('mediaFolder', filePaths[0]);
    return filePaths[0];
  } catch (e) {
    console.log('Error setting the media folder path: ', e);
  }
  return undefined;
}

/* @TODO: fun things
 * [ ] total video duration (get-video-duration)
 * [x] pick custom folder for media? (dont bundle)
 */
const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    autoHideMenuBar: true,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

/**
 * Add event listeners...
 */

ipcMain.handle('request:media_files', getMediaFiles);
ipcMain.handle('request:set_media_folder', selectMediaFolder);
ipcMain.on('request:get_media_folder', getMediaFolder);

ipcMain.on('app:minimize', () => mainWindow?.minimize());
ipcMain.on('app:quit', () => app.quit());

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    registerMediaProtocol();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
