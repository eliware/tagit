import { jest } from "@jest/globals";
import { reportVerifiedPublicationJobLinks } from "../../../../../src/commands/release-wait/release/publication/verified-links.mjs";

test("reports links for each verified publication", () => {
  const log = { info: jest.fn() };
  reportVerifiedPublicationJobLinks(log, [
    { profile: "npm", publishJobs: [{ url: "npm-url" }] },
    { profile: "ghcr", publishJobs: [{ url: "ghcr-url" }] },
  ]);
  expect(log.info).toHaveBeenNthCalledWith(1, "npm: [npm-url](npm-url)");
  expect(log.info).toHaveBeenNthCalledWith(2, "ghcr: [ghcr-url](ghcr-url)");
});
