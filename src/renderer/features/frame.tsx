import './frame.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { UIContext } from '../lib/context';
import Topbar from './topbar';

interface FrameProps {
  children: React.ReactNode;
}

export default function Frame(props: FrameProps) {
  const { children } = props;
  const IDLE_TIMEOUT = 3000;
  const idleTimer = useRef<NodeJS.Timeout>();
  const onIdleListeners = useRef<(() => void)[]>([]);

  const [isIdle, setIsIdle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onIdle = useCallback((fn: () => void) => {
    onIdleListeners.current.push(fn);
  }, []);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('click', resetTimer);
    window.addEventListener('blur', () => setIsIdle(true));
    window.addEventListener('focus', resetTimer);
  }, [resetTimer]);

  useEffect(() => {
    document.body.classList.toggle('idle', isIdle);
    if (isIdle) {
      onIdleListeners.current.forEach((fn) => fn());
    }
  }, [isIdle]);

  return (
    <div className="app">
      <UIContext.Provider
        value={{ isIdle, isFullscreen, setIsFullscreen, onIdle }}
      >
        <Topbar />
        <main>{children}</main>
      </UIContext.Provider>
    </div>
  );
}
