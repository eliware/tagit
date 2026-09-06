export function validateCurrentHead(head, tag) {
  const currentHead = String(head ?? '').trim();
  if (!/^[0-9a-f]{3,64}$/i.test(currentHead)) throw new Error('Cannot release without a valid current HEAD SHA.');
  const existingTagHead = tag === null ? null : String(tag).trim();
  if (existingTagHead !== null && !/^[0-9a-f]{3,64}$/i.test(existingTagHead))
    throw new Error('Cannot verify existing release tag.');
  return { currentHead, existingTagHead };
}
