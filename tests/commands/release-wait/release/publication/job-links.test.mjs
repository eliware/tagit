import { jest } from "@jest/globals";
import {
  reportPublicationJobLinks,
  reportVerifiedPublicationJobLinks,
} from "../../../../../src/commands/release-wait/release/publication/job-links.mjs";

test("reports available publish job links", () => {
  const log = { info: jest.fn() };
  reportPublicationJobLinks(log, "ghcr", [{ url: "publish-url" }, {}]);
  expect(log.info).toHaveBeenCalledWith("ghcr: [publish-url](publish-url)");
});

test("does not report jobs without links", () => {
  const log = { info: jest.fn() };
  reportPublicationJobLinks(log, "npm", [{}]);
  expect(log.info).not.toHaveBeenCalled();
});

test("reports links for each verified publication", () => {
  const log = { info: jest.fn() };
  reportVerifiedPublicationJobLinks(log, [
    { profile: "npm", publishJobs: [{ url: "npm-url" }] },
    { profile: "ghcr", publishJobs: [{ url: "ghcr-url" }] },
  ]);
  expect(log.info).toHaveBeenNthCalledWith(1, "npm: [npm-url](npm-url)");
  expect(log.info).toHaveBeenNthCalledWith(2, "ghcr: [ghcr-url](ghcr-url)");
});
