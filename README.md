# Quantum Media Player

This is a simple media player that uses _true_ randomization to play the selected files.
Its intended use was for leaving it as a background filler in any social gathering, hoping the quantum randomness would add an extra pinch of queue-spice.

It leverages the [ANU API](https://qrng.anu.edu.au/contact/api-documentation/) for getting quantum random numbers. It will fallback to pseudorandom if no internet connection is available.



https://user-images.githubusercontent.com/39108635/222503799-0b8377a8-0599-4f79-aa7c-1211ae1da71f.mp4

_Videos are from [Almargen](https://www.youtube.com/@almargen5131)_

## Features

- [x] Select any folder as the media source
- [x] Play `.mp4` files
- [x] Play `.jpg/png` files (fixed-length slideshow)
- [x] Toggle audio
- [x] Play/pause
- [x] Skip current file
- [x] Auto-hide UI

## Usage/Behavior

The app will play any `.mp4` from a specified folder.  
You can choose to skip the current video and jump to the next, but it will attempt to play all the videos in the pool before repeating them.  
If the media file's length is (somewhat) shorter than a minute, it will loop until around that span.  
However, if the media file is smaller than 5 seconds it will just play it 3 times.

**Beware:** The names of the files in the source folder will be 'clamped' and will get most symbols removed.

## Installation

You can download the packaged version or clone the repo and build it yourself.
