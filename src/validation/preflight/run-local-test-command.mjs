import { failureMessage } from '../../output/errors/failure-message.mjs';
import { processCommand } from '../local/process-command.mjs';
import { processOptions } from '../local/process-options.mjs';

export function runLocalTestCommand(execFileSync, check, timeoutMs) {
  const [executable, args] = check[1];
  try {
    const [command, commandArgs] = processCommand(executable, args);
    execFileSync(command, commandArgs, processOptions(command, timeoutMs));
    return { result: { passed: true }, failure: null };
  } catch (error) {
    return {
      result: { passed: false },
      failure: failureMessage('test', error, `${error.stdout ?? ''}\n${error.stderr ?? ''}`),
    };
  }
}
