import releaseCommand from "../../process/async/exec-file-command.mjs";

export default async function readGithubJson(execFile, executable, args) {
  return JSON.parse(
    await releaseCommand(execFile, executable, args, { encoding: "utf8", timeout: 10000 }),
  );
}
