import './frame.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import Topbar from './topbar';

interface FrameProps {
  children: React.ReactNode;
}

export default function Frame(props: FrameProps) {
  const { children } = props;
  const IDLE_TIMEOUT = 3000;
  const idleTimer = useRef<NodeJS.Timeout>();
  const [isIdle, setIsIdle] = useState(false);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('click', resetTimer);
  }, [resetTimer]);

  useEffect(() => {
    document.body.classList.toggle('idle', isIdle);
  }, [isIdle]);

  return (
    <div className="app">
      <Topbar />
      <main>{children}</main>
    </div>
  );
}
