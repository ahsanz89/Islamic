// Stable file key for a lesson sound: FNV-1a over the text, so web and mobile use the same recording names.
export function soundKey(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return 't' + h.toString(16).padStart(8, '0');
}
