const CHECK_TIMEOUT_MS = 180000;

export function isCheckTimeout(error) {
  return error?.code === "ETIMEDOUT" || error?.signal === "SIGTERM";
}

export function timeoutFailureMessage(name) {
  return `BLOCKED: ${name} exceeded the ${CHECK_TIMEOUT_MS / 1000}-second limit and may be hanging. Action: inspect for unset timers, open handles, or waiting network/process operations, then rerun tagit preflight.`;
}
