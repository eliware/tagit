import { jest } from "@jest/globals";
import { reportReleasePublicationLinks } from "../../../../../../src/commands/release-wait/verify/release/publication/links.mjs";

test("reports links for verified publications", () => {
  const log = { info: jest.fn() };
  reportReleasePublicationLinks(log, [
    { profile: "npm", publishJobs: [{ url: "npm-url" }] },
    { profile: "ghcr", publishJobs: [{ url: "ghcr-url" }] },
  ]);
  expect(log.info).toHaveBeenNthCalledWith(1, "npm: [npm-url](npm-url)");
  expect(log.info).toHaveBeenNthCalledWith(2, "ghcr: [ghcr-url](ghcr-url)");
});
