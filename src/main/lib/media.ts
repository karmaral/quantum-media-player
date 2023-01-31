import fs from 'fs';
import path from 'path';

// eslint-disable-next-line import/prefer-default-export
export function cleanFilename(filename: string) {
  const split = filename.split('.');
  const ext = split.slice(-1);
  const name = split
    .slice(0, -1)
    .join('-')
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z0-9-_]+/g, '')
    .replace(/---+/g, '--');
  return `${name}.${ext}`;
}
