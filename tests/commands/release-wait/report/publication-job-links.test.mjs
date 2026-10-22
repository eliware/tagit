import { jest } from "@jest/globals";
import { reportPublicationJobLinks } from "../../../../src/commands/release-wait/report/publication-job-links.mjs";

test("reports available publish and Windows job links", () => {
  const log = { info: jest.fn() };
  reportPublicationJobLinks(
    log,
    "ghcr",
    [{ url: "windows-url" }, {}],
    [{ url: "publish-url" }, {}],
  );
  expect(log.info).toHaveBeenNthCalledWith(1, "ghcr: [publish-url](publish-url)");
  expect(log.info).toHaveBeenNthCalledWith(2, "Windows: [windows-url](windows-url)");
});

test("does not report jobs without links", () => {
  const log = { info: jest.fn() };
  reportPublicationJobLinks(log, "npm", [{}], [{}]);
  expect(log.info).not.toHaveBeenCalled();
});
