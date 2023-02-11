function isFileType(path: string, formats: string[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const fmt of formats) {
    if (path?.endsWith(`.${fmt}`)) return true;
  }
  return false;
}

const IMAGE_FORMATS = ['jpg', 'jpeg', 'png'];
const VIDEO_FORMATS = ['mp4'];

export const isImage = (path: string) => isFileType(path, IMAGE_FORMATS);
export const isVideo = (path: string) => isFileType(path, VIDEO_FORMATS);
