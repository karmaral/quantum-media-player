import './slideshow.css';
import ReactPlayer from 'react-player';
import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { joinClasses } from '../lib/utils';
import SlideShowActions from './slideshow-actions';
import DataContext from '../lib/context';

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

function isImage(path: string) {
  const formats = ['jpg', 'jpeg', 'png'];
  // eslint-disable-next-line no-restricted-syntax
  for (const fmt of formats) {
    if (path?.endsWith(`.${fmt}`)) return true;
  }
  return false;
}
function isVideo(path: string) {
  const formats = ['mp4'];
  // eslint-disable-next-line no-restricted-syntax
  for (const fmt of formats) {
    if (path?.endsWith(`.${fmt}`)) return true;
  }
  return false;
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
 * [ ] refetch rng on depleted
 */

export default function SlideShow() {
  const { mediaFiles, mediaFolder } = useContext(DataContext);

  const [allMediaPaths, setAllMediaPaths] = useState(mediaFiles);
  const [queuedMediaPaths, setQueuedMediaPaths] = useState(mediaFiles);
  const [currentMedia, setCurrentMedia] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopTimes, setLoopTimes] = useState(0);

  const playerRef = useRef<ReactPlayer>();
  const rawRNG = useRef<number[]>([]);
  const nextIndices = useRef<number[]>([]);

  const classes = joinClasses(['slideshow', !isPlaying ? 'paused' : '']);

  const playNext = useCallback(async (): Promise<void> => {
    console.log('playNext', {
      rawRNGLen: rawRNG.current.length,
      queuedMediaPaths,
      allMediaPaths,
    });
    if (rawRNG.current.length < 2) {
      rawRNG.current = await fetchIndices(allMediaPaths.length);
    }
    const nextIndex = rawRNG.current[0] % queuedMediaPaths.length || 0;
    const nextMedia = queuedMediaPaths[nextIndex];

    if (!nextMedia) return undefined;

    rawRNG.current.shift();

    console.log({ nextIndex, nextMedia });
    if (!isImage(nextMedia) && !isVideo(nextMedia)) {
      return playNext();
    }
    setQueuedMediaPaths(queuedMediaPaths.filter((p) => p !== nextMedia));
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
    if (mediaFiles.length) {
      setAllMediaPaths(mediaFiles);
      setQueuedMediaPaths(mediaFiles);
    }
  }, [mediaFiles]);

  useEffect(() => {
    if (allMediaPaths.length && !rawRNG.current.length) {
      console.log('init rawRNG');
      const fetchData = async () => {
        rawRNG.current = await fetchIndices(mediaFiles.length);
        playNext();
      };
      fetchData();
    }
  }, [allMediaPaths, mediaFiles.length, playNext]);

  return (
    <div className={classes}>
      <div className="content">
        {!currentMedia && (
          <p className="media-placeholder">Media not yet loaded</p>
        )}
        {currentMedia && isVideo(currentMedia) && (
          <ReactPlayer
            width="100%"
            height="100%"
            url={src}
            muted
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
        <SlideShowActions
          currentMedia={currentMedia}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playNext={playNext}
        />
      </div>
    </div>
  );
}
