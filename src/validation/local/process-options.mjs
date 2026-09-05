export function processOptions(command, timeout) {
  return { stdio: 'pipe', timeout, ...(command === 'cmd.exe' ? { windowsVerbatimArguments: true } : {}) };
}
