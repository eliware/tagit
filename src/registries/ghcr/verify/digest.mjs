export function imageDigest(image) {
  return /^sha256:[a-f0-9]{64}$/.test(image?.name ?? "") ? image.name : null;
}
