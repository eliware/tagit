import { releaseLinks } from "../../release/links.mjs";

export function reportReleaseCiLinks(log, repo, tag, run, windowsJobs) {
  const links = releaseLinks(run, windowsJobs, []);
  log.info(`Release CI verified for ${repo}@${tag}:`);
  links.forEach(([label, url]) => log.info(`${label}: [${url}](${url})`));
}
