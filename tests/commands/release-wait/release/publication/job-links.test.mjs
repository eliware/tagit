import { jest } from "@jest/globals";
import { reportPublicationJobLinks } from "../../../../../src/commands/release-wait/release/publication/job-links.mjs";

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
