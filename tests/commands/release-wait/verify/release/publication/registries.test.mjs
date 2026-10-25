import { jest } from "@jest/globals";

const verifyPublicationRegistries = jest.fn();
jest.unstable_mockModule(
  "../../../../../../src/commands/release-wait/release/publication/registries.mjs",
  () => ({ verifyPublicationRegistries }),
);
const { verifyReleasePublicationRegistries } =
  await import("../../../../../../src/commands/release-wait/verify/release/publication/registries.mjs");

const options = {
  fs: {},
  execFile: jest.fn(),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  tag: "v1.0.0",
  headSha: "abc",
  version: "1.0.0",
  release: {},
  publication: { applicable: true, packageName: "demo", isPrivate: false },
};

beforeEach(() => jest.clearAllMocks());

test("returns CI results when no publication registry applies", () => {
  expect(verifyReleasePublicationRegistries(options, { applicable: false })).toEqual({
    repo: options.repo,
    tag: options.tag,
    headSha: options.headSha,
    ci: true,
    npm: false,
    ghcr: false,
  });
  expect(verifyPublicationRegistries).not.toHaveBeenCalled();
});

test("passes publication policy to the registry verification boundary", () => {
  verifyReleasePublicationRegistries(options, { applicable: true, ghcrApplicable: true });
  expect(verifyPublicationRegistries).toHaveBeenCalledWith({
    ...options,
    applicable: true,
    packageName: "demo",
    isPrivate: false,
    ghcrApplicable: true,
  });
});
