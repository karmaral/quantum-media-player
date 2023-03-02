import ReactPlayer from 'react-player';
import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { isImage, isVideo } from 'shared/utils';
import { joinClasses } from '$lib/utils';
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
  console.log('PRNG', pseudoRnd);
  return [pseudoRnd];
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

  const isFetching = useRef(false);
  const playerRef = useRef<ReactPlayer>();
  const rngPool = useRef<number[]>([]);

  const imageTimer = useRef<NodeJS.Timer | undefined>();
  const [imageSlideState, setImageSlideState] = useState({
    initial: 0,
    remaining: 0,
  });

  const classes = joinClasses([cls.slideshow, !isPlaying ? 'paused' : '']);

  const IMAGE_SLIDE_DURATION = 60 * 1000;

  const playImage = useCallback(() => {
    imageTimer.current = clearTimeout(imageTimer.current) as undefined;
    const remaining = IMAGE_SLIDE_DURATION;
    setImageSlideState({
      initial: Date.now(),
      remaining,
    });
  }, [IMAGE_SLIDE_DURATION]);

  const playNext = useCallback(
    async (looping = false): Promise<void> => {
      console.log('playNext', {
        rngPoolLen: rngPool.current.length,
        queuedMediaPaths,
        allMediaPaths,
      });

      if (looping && loopTimes !== 0) {
        setLoopTimes((prev) => prev - 1);
        playerRef.current?.seekTo(0);
        return undefined;
      }

      const nextIndex = rngPool.current[0] % queuedMediaPaths.length || 0;
      const nextMedia = queuedMediaPaths[nextIndex];
      if (!nextMedia) return undefined;

      rngPool.current.shift();

      console.log({ nextIndex, nextMedia });

      const filtered = queuedMediaPaths.filter((p) => p !== nextMedia);
      const nextQueue = filtered.length ? filtered : allMediaPaths;
      setQueuedMediaPaths(nextQueue);
      setCurrentMedia(nextMedia);

      if (isImage(nextMedia)) {
        playImage();
      }

      setIsPlaying(true);
      return undefined;
    },
    [allMediaPaths, queuedMediaPaths, playImage, loopTimes]
  ); // react pls

  const handleDuration = (duration: number) => {
    let times = 0;
    if (duration < 5) {
      times = 2;
    } else if (duration < 50) {
      times = Math.ceil(40 / duration);
    }
    setLoopTimes(times);
  };

  const src = `media://${currentMedia}`;

  useEffect(() => {
    if (mediaFolder !== currentFolder) {
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
        const fetchData = async () => {
          isFetching.current = true;
          rngPool.current = await fetchIndices(allMediaPaths.length);
          isFetching.current = false;
          playNext();
        };
        if (!isFetching.current) {
          fetchData();
        }
      }
    }
  }, [allMediaPaths, playNext]);

  useEffect(() => {
    if (isImage(currentMedia)) {
      if (!isPlaying) {
        imageTimer.current = clearTimeout(imageTimer.current) as undefined;
        console.log(`isPlaying: ${isPlaying}`, imageTimer.current);
        setImageSlideState((prev) => {
          const ellapsed = Date.now() - prev.initial;
          const remaining = prev.remaining - ellapsed;
          return { ...prev, remaining };
        });
      } else {
        console.log(`isPlaying: ${isPlaying}`, imageTimer.current);
        imageTimer.current = setTimeout(playNext, imageSlideState.remaining);
      }
    }

    return () => clearTimeout(imageTimer.current);
  }, [isPlaying, currentMedia, imageSlideState, playNext]);

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
            onEnded={() => playNext(true)}
            ref={playerRef as React.LegacyRef<ReactPlayer>}
          />
        )}
        {currentMedia && isImage(currentMedia) && (
          <div className={cls.imageFrame}>
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
