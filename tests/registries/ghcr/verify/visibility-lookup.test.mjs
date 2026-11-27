import { jest } from "@jest/globals";
import lookupGhcrVisibleImage from "../../../../src/registries/ghcr/verify/visibility-lookup.mjs";

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

test("uses a fallback endpoint and parses its response", async () => {
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
  expect(execFile).toHaveBeenCalledTimes(2);
});
