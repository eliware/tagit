import { npmExecutable } from "../../process/commands/npm-executable.mjs";
import { execFileCommand } from "../../process/async/exec-file.mjs";

function readNpmView(output, version) {
  const value = JSON.parse(output);
  return Array.isArray(value) ? value.includes(version) : value === version;
}

export async function verifyNpmPublication(
  execFile,
  log,
  { packageName, version, retries, retryMs, sleep },
) {
  if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName ?? ""))
    throw new Error("Package name is invalid for npm publication verification.");
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version ?? ""))
    throw new Error("Version is invalid for npm publication verification.");
  const npmArgs = ["view", `${packageName}@${version}`, "version", "--json"];
  const windows = process.platform === "win32";
  // execFile requires shell mode for Windows .cmd shims. Pass the fully quoted
  // command as the executable string (and no separate args) to avoid Node's
  // deprecated shell+args path; packageName and version are constrained above.
  const executable = windows
    ? `npm.cmd ${npmArgs.map((argument) => `"${argument}"`).join(" ")}`
    : npmExecutable();
  const args = windows ? [] : npmArgs;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      log.info?.(
        `Checking npm visibility for ${packageName}@${version} (attempt ${attempt + 1}/${retries})...`,
      );
      const output = await execFileCommand(execFile, executable, args, {
        encoding: "utf8",
        ...(windows ? { shell: true } : {}),
      });
      const visible = readNpmView(output, version);
      log.info?.(
        `npm visibility attempt ${attempt + 1}/${retries}: ${visible ? "published version is visible" : `registry returned ${output.trim()}`}.`,
      );
      if (visible) return;
    } catch (error) {
      const detail = String(error.stderr ?? error.stdout ?? error.message ?? "unknown error")
        .trim()
        .slice(0, 300);
      log.info?.(`npm visibility attempt ${attempt + 1}/${retries} failed: ${detail}`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} attempts.`;
  log.info?.(message);
  throw new Error(message);
}
