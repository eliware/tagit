import path from 'node:path';

export function isUpstreamCli(argv) {
  const executable = argv[1] ? path.basename(argv[1].replaceAll('\\', '/')) : '';
  return executable === 'upstream' || executable === 'upstream.mjs';
}
