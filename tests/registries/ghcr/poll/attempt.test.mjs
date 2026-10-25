import { jest } from "@jest/globals";

const lookupGhcrVisibleImage = jest.fn();
jest.unstable_mockModule("../../../../src/registries/ghcr/verify/visibility-lookup.mjs", () => ({
  lookupGhcrVisibleImage,
}));
const { readGhcrVisibilityAttempt } =
  await import("../../../../src/registries/ghcr/poll/attempt.mjs");

beforeEach(() => jest.clearAllMocks());

test("logs and returns a visible image", async () => {
  const image = { name: "image" };
  lookupGhcrVisibleImage.mockResolvedValue(image);
  const log = { info: jest.fn(), debug: jest.fn() };
  await expect(
    readGhcrVisibilityAttempt(jest.fn(), log, {
      owner: "eliware",
      imageName: "tagit",
      version: "2.0.0",
      attempt: 0,
      retries: 2,
    }),
  ).resolves.toBe(image);
  expect(log.info).toHaveBeenCalledWith("GHCR check 1/2 for eliware/tagit:2.0.0.");
});

test("logs lookup failures and returns no image", async () => {
  lookupGhcrVisibleImage.mockRejectedValue(new Error("registry unavailable"));
  const log = { info: jest.fn(), debug: jest.fn() };
  await expect(
    readGhcrVisibilityAttempt(jest.fn(), log, {
      owner: "eliware",
      imageName: "tagit",
      version: "2.0.0",
      attempt: 1,
      retries: 3,
    }),
  ).resolves.toBeNull();
  expect(log.debug).toHaveBeenCalledWith("GHCR check 2/3 failed: Error: registry unavailable");
});

test("handles lookup failures when debug logging is unavailable", async () => {
  lookupGhcrVisibleImage.mockRejectedValue(new Error("registry unavailable"));
  await expect(
    readGhcrVisibilityAttempt(
      jest.fn(),
      { info: jest.fn() },
      {
        owner: "eliware",
        imageName: "tagit",
        version: "2.0.0",
        attempt: 0,
        retries: 1,
      },
    ),
  ).resolves.toBeNull();
});
