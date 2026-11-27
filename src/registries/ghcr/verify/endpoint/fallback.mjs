export default function resolvePersonalGhcrVersionsPath(owner, imageName, error) {
  const details = `${error.stderr}\n${error.message}`;
  if (!/\b404\b/.test(details)) throw error;
  return [
    "",
    "users",
    encodeURIComponent(owner),
    "packages",
    "container",
    encodeURIComponent(imageName),
    "versions",
  ].join("/");
}
