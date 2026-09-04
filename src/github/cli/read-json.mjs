import { execFileCommand as releaseCommand } from '../../process/async/exec-file.mjs';

export async function readGithubJson(execFile, executable, args) {
  return JSON.parse(await releaseCommand(execFile, executable, args, { encoding: 'utf8', timeout: 10000 }));
}
