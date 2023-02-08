import { protocol } from 'electron';

export function registerMediaProtocol() {
  protocol.registerFileProtocol('media', (request, callback) => {
    const filePath = request.url.substring(7);
    callback({ path: filePath });
  });
}

export function cleanFilename(filename: string) {
  const split = filename.split('.');
  const ext = split.slice(-1);
  const name = split
    .slice(0, -1)
    .join('-')
    .replace(/[^a-zA-Z0-9-_ ]+/g, '');
  return `${name}.${ext}`;
}
