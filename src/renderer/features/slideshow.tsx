import ReactPlayer from 'react-player';
import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { joinClasses, isVideo, isImage } from '$lib/utils';
import { DataContext, SlideshowContext } from '$lib/context';
import cls from './slideshow.module.css';
import SlideshowActions from './slideshow-actions';

async function fetchIndices(maxItems = 1): Promise<number[]> {
  const url = `https://qrng.anu.edu.au/API/jsonI.php?length=${maxItems}&type=uint8`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.success) {
    console.log('QNRG!', json.data);
    return json.data;
  }
  const pseudoRnd = Math.floor(Math.random() * maxItems);
  console.log('PSRNG', pseudoRnd);
  return [pseudoRnd];
}
function compare(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const elems = new Set([...a, ...b]);

  // eslint-disable-next-line no-restricted-syntax
  for (const x of elems) {
    const countA = a.filter((e) => e === x).length;
    const countB = b.filter((e) => e === x).length;
    if (countA !== countB) return false;
  }

  return true;
}

/* @TODO:
 * [x] dont repeat videos until all played
 * [x] random initial video
 * [x] allow public folder with dynamic data
 * [x] better shuffle icon
 * [ ] play/pause animation
 * [x] bundle Actions into component
 * [ ] listen to f11 fullscreen
 * [x] Loop if < 50s
 * [ ] Fade in/out anims?
 * [x] refetch/reshuffle on depleted
 */

export default function Slideshow() {
  const { mediaFiles, mediaFolder } = useContext(DataContext);

  const [allMediaPaths, setAllMediaPaths] = useState(mediaFiles);
  const [queuedMediaPaths, setQueuedMediaPaths] = useState(mediaFiles);
  const [currentMedia, setCurrentMedia] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loopTimes, setLoopTimes] = useState(0);

  const playerRef = useRef<ReactPlayer>();
  const rngPool = useRef<number[]>([]);

  const classes = joinClasses([cls.slideshow, !isPlaying ? 'paused' : '']);

  const playNext = useCallback(async (): Promise<void> => {
    console.log('playNext', {
      rngPoolLen: rngPool.current.length,
      queuedMediaPaths,
      allMediaPaths,
    });
    const nextIndex = rngPool.current[0] % queuedMediaPaths.length || 0;
    const nextMedia = queuedMediaPaths[nextIndex];

    if (!nextMedia) return undefined;

    rngPool.current.shift();

    console.log({ nextIndex, nextMedia });
    if (!isImage(nextMedia) && !isVideo(nextMedia)) {
      return playNext();
    }
    const filtered = queuedMediaPaths.filter((p) => p !== nextMedia);
    const nextQueue = filtered.length ? filtered : allMediaPaths;
    setQueuedMediaPaths(nextQueue);
    setCurrentMedia(nextMedia);
    setIsPlaying(true);
    return undefined;
  }, [allMediaPaths, queuedMediaPaths]);

  const handleDuration = (duration: number) => {
    let times = 0;
    if (duration < 5) {
      times = 3;
    } else if (duration < 50) {
      times = Math.ceil(40 / duration);
    }
    console.log(`${duration} x ${times}`);
    setLoopTimes(times);
  };

  const handleEnd = () => {
    console.log('onEnd');
    if (loopTimes !== 0) {
      console.log(`looping: ${loopTimes}`);
      setLoopTimes((prev) => prev - 1);
      playerRef.current?.seekTo(0);
      return;
    }
    playNext();
  };

  const src = `media://${currentMedia}`;

  useEffect(() => {
    if (mediaFolder !== currentFolder) {
      console.log('changed folder', mediaFolder, currentFolder);
      setCurrentFolder(mediaFolder);
      rngPool.current = [];
    }
  }, [mediaFolder, currentFolder]);

  useEffect(() => {
    if (mediaFiles.length) {
      setAllMediaPaths(mediaFiles);
      setQueuedMediaPaths(mediaFiles);
    }
  }, [mediaFiles]);

  useEffect(() => {
    const rngEmpty = !rngPool.current.length;
    if (allMediaPaths.length) {
      if (rngEmpty) {
        console.log('init rngPool');
        const fetchData = async () => {
          rngPool.current = await fetchIndices(allMediaPaths.length);
          playNext();
        };
        fetchData();
      }
    }
  }, [allMediaPaths, playNext]);

  return (
    <div className={classes}>
      <div className={cls.content}>
        {mediaFolder && !currentMedia && (
          <p className={cls.placeHolder}>
            {!allMediaPaths.length ? 'No playable files found.' : 'Loading...'}
          </p>
        )}
        {currentMedia && isVideo(currentMedia) && (
          <ReactPlayer
            width="100%"
            height="100%"
            url={src}
            muted={isMuted}
            playing={isPlaying}
            onDuration={handleDuration}
            onEnded={handleEnd}
            ref={playerRef as React.LegacyRef<ReactPlayer>}
          />
        )}
        {currentMedia && isImage(currentMedia) && (
          <div>
            <img src={src} alt="" />
          </div>
        )}
        <SlideshowContext.Provider
          value={{
            currentMedia,
            allMediaPaths,
            queuedMediaPaths,
            isMuted,
            setIsMuted,
            isPlaying,
            setIsPlaying,
            playNext,
          }}
        >
          <SlideshowActions />
        </SlideshowContext.Provider>
      </div>
    </div>
  );
}
