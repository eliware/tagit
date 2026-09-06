import path from 'path';
export function isCli(argv) {
  const executable = argv[1] ? path.basename(argv[1].replaceAll('\\', '/')) : '';
  return executable === 'tagit' || executable === 'tagit.mjs';
}
