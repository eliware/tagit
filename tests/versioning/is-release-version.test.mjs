import { isReleaseVersion } from "../../src/versioning/is-release-version.mjs";

test.each(["0.0.0", "1.2.3", "12.30.400"])("accepts numeric release version %s", (version) => {
  expect(isReleaseVersion(version)).toBe(true);
});

test.each(["", "v1.2.3", "01.2.3", "1.2", "1.2.3-beta", null])(
  "rejects invalid release version %s",
  (version) => {
    expect(isReleaseVersion(version)).toBe(false);
  },
);
