import { outputText } from './format-output.mjs';

const CHECK_TIMEOUT_MS = 120000;

export function failureMessage(name, error, output) {
  const timedOut = error?.code === 'ETIMEDOUT' || error?.signal === 'SIGTERM';
  if (timedOut)
    return `BLOCKED: ${name} exceeded the ${CHECK_TIMEOUT_MS / 1000}-second limit and may be hanging. Action: inspect for unset timers, open handles, or waiting network/process operations, then rerun tagit preflight.`;
  return `BLOCKED: ${name} failed. Action: fix the reported issue, rerun it successfully, then rerun tagit preflight.${outputText(output)}`;
}
