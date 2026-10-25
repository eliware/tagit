import { execFileCommand } from "../../process/async/exec-file-command.mjs";
import { reportNpmViewAttempt } from "./error/view/report-attempt.mjs";

export async function checkNpmPublicationAttempt(
  execFile,
  log,
  { command, packageName, version, attempt, retries },
) {
  const { executable, args, options } = command;
  const status = `npm view ${packageName}@${version} (${attempt + 1}/${retries})`;
  try {
    const output = await execFileCommand(execFile, executable, args, options);
    return reportNpmViewAttempt(log, status, { output, version });
  } catch (error) {
    return reportNpmViewAttempt(log, status, { error });
  }
}
