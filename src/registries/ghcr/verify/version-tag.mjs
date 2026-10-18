export function hasVersionTag(image, tag) {
  const tags = image?.metadata?.container?.tags;
  return Array.isArray(tags) && tags.includes(tag);
}
