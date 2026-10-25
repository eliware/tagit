import { jest } from "@jest/globals";
import { pollGhcrVisibility } from "../../../src/registries/ghcr/poll-visibility.mjs";

function execWith(value) {
  return (command, args, options, callback) => callback(null, JSON.stringify(value), "");
}

test("finds the version-tagged image", async () => {
  const execFile = execWith([[{ metadata: { container: { tags: ["v2.0.0"] } }, name: "image" }]]);
  const info = jest.fn();
  const onVisible = jest.fn((image) => ({ finalized: image.name }));
  await expect(
    pollGhcrVisibility(
      execFile,
      { info },
      {
        owner: "eliware",
        imageName: "tagit",
        version: "2.0.0",
        retries: 1,
        retryMs: 0,
        sleep: async () => {},
        onVisible,
      },
    ),
  ).resolves.toEqual({ finalized: "image" });
  expect(onVisible).toHaveBeenCalledWith(expect.objectContaining({ name: "image" }));
  expect(info).toHaveBeenCalledWith("GHCR check 1/1 for eliware/tagit:2.0.0.");
});

test("returns the visible image when no finalizer is provided", async () => {
  const image = { metadata: { container: { tags: ["v2.0.0"] } }, name: "image" };
  await expect(
    pollGhcrVisibility(
      execWith([image]),
      { info: jest.fn() },
      {
        owner: "eliware",
        imageName: "tagit",
        version: "2.0.0",
        retries: 1,
        retryMs: 0,
        sleep: async () => {},
      },
    ),
  ).resolves.toMatchObject({ name: "image" });
});

test("reports unavailable images after the retry budget", async () => {
  const execFile = execWith([]);
  await expect(
    pollGhcrVisibility(
      execFile,
      { info: jest.fn() },
      {
        owner: "eliware",
        imageName: "tagit",
        version: "2.0.0",
        retries: 1,
        retryMs: 0,
        sleep: async () => {},
      },
    ),
  ).rejects.toThrow("does not expose");
});
