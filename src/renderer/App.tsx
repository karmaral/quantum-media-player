import './App.css';
import { useEffect, useState, useCallback } from 'react';
import DataContext from './lib/context';
import Frame from './features/frame';
import SlideShow from './features/slideshow';

export default function App() {
  const [mediaFolder, setMediaFolder] = useState<string>('');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  const getMediaFiles = useCallback(async () => {
    const files = await window.api.media.getMediaFiles();
    return files;
  }, []);

  const getMediaFolder = useCallback(() => {
    const path = window.api.media.getMediaFolder();
    return path;
  }, []);

  const selectMediaFolder = async () => {
    const path = await window.api.media.setMediaFolder();
    if (path) {
      setMediaFolder(path);
    }
  };

  useEffect(() => {
    if (mediaFolder) {
      getMediaFiles()
        .then((files) => setMediaFiles(files))
        .catch((e) => console.log(e));
    }
  }, [getMediaFiles, mediaFolder]);

  useEffect(() => {
    const path = getMediaFolder();
    setMediaFolder(path);
  }, [getMediaFolder]);

  return (
    <Frame>
      <DataContext.Provider
        value={{ mediaFiles, mediaFolder, selectMediaFolder }}
      >
        <SlideShow />
      </DataContext.Provider>
    </Frame>
  );
}
