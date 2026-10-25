import { jest } from "@jest/globals";
import { lookupGhcrVisibleImage } from "../../../../src/registries/ghcr/verify/visibility-lookup.mjs";

test("requests and parses the image versions for the encoded owner and image name", async () => {
  const image = { name: "tagit", metadata: { container: { tags: ["v2.0.0"] } } };
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(null, JSON.stringify([image]), ""),
  );
  await expect(
    lookupGhcrVisibleImage(execFile, { owner: "eli ware", imageName: "tag/it", version: "2.0.0" }),
  ).resolves.toEqual(image);
  expect(execFile).toHaveBeenCalledWith(
    "gh",
    ["api", "--paginate", "--slurp", "/orgs/eli%20ware/packages/container/tag%2Fit/versions"],
    { encoding: "utf8" },
    expect.any(Function),
  );
});

test("uses the personal account endpoint when the organization endpoint returns 404", async () => {
  const image = { name: "tagit", metadata: { container: { tags: ["v2.0.0"] } } };
  const execFile = jest.fn((_command, args, _options, callback) => {
    if (args[3].startsWith("/orgs/")) {
      callback(Object.assign(new Error("HTTP 404"), { stderr: "" }), "", "");
      return;
    }
    callback(null, JSON.stringify([image]), "");
  });
  await expect(
    lookupGhcrVisibleImage(execFile, { owner: "eliware", imageName: "tagit", version: "2.0.0" }),
  ).resolves.toEqual(image);
  expect(execFile.mock.calls.map(([, args]) => args[3])).toEqual([
    "/orgs/eliware/packages/container/tagit/versions",
    ["", "users", "eliware", "packages", "container", "tagit", "versions"].join("/"),
  ]);
});

test("does not use the personal account endpoint for other organization errors", async () => {
  const error = Object.assign(new Error("HTTP 403"), { stderr: "HTTP 403" });
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(error, "", "HTTP 403"),
  );
  await expect(
    lookupGhcrVisibleImage(execFile, { owner: "eliware", imageName: "tagit", version: "2.0.0" }),
  ).rejects.toBe(error);
  expect(execFile).toHaveBeenCalledTimes(1);
});
