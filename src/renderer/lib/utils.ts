// eslint-disable-next-line import/prefer-default-export
export const joinClasses = (arr: string[]) => arr.filter(Boolean).join(' ');

function isFileType(path: string, formats: string[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const fmt of formats) {
    if (path?.endsWith(`.${fmt}`)) return true;
  }
  return false;
}

export const isImage = (path: string) => {
  return isFileType(path, ['jpg', 'jpeg', 'png']);
};
export const isVideo = (path: string) => isFileType(path, ['mp4']);
