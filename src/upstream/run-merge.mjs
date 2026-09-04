import { execFileSync as defaultExecFileSync } from 'node:child_process';
import { mergeMessage } from './merge-message.mjs';
import { resolveUpstreamBranch } from './branch.mjs';
import { parseUpstreamArguments } from './parse-upstream-arguments.mjs';
import { mergeUpstream } from './merge-upstream.mjs';

export function runUpstream(args = [], execFileSync = defaultExecFileSync, now = new Date(), log = console) {
  const message = mergeMessage(parseUpstreamArguments(args), now);
  execFileSync('git', ['fetch', 'upstream'], { stdio: 'inherit' });
  const upstreamBranch = resolveUpstreamBranch(execFileSync);
  if (!mergeUpstream(execFileSync, upstreamBranch, message, log)) return false;
  execFileSync('git', ['push'], { stdio: 'inherit' });
  return true;
}
