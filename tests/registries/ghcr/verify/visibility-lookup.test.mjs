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
