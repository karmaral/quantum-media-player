import './topbar.css';
import {
  RxMinus,
  RxEnterFullScreen,
  RxExitFullScreen,
  RxCross1,
} from 'react-icons/rx';
import { useCallback, useEffect, useState } from 'react';

export default function Topbar() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMinimize = () => window.api.app.minimize();
  const handleFullscreen = () => {
    return isFullscreen
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
  };
  const handleQuit = () => window.api.app.quit();

  const onFullScreenChange = useCallback((e: Event) => {
    console.log(e);
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullScreenChange);
  }, [onFullScreenChange]);

  return (
    <div className="topbar fades-on-idle">
      <div className="topbar-drag-zone" />
      <button type="button" className="topbar-btn" onClick={handleMinimize}>
        <RxMinus />
      </button>
      <button type="button" className="topbar-btn" onClick={handleFullscreen}>
        {isFullscreen ? <RxExitFullScreen /> : <RxEnterFullScreen />}
      </button>
      <button type="button" className="topbar-btn" onClick={handleQuit}>
        <RxCross1 />
      </button>
    </div>
  );
}
