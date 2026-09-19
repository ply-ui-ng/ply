/** UTF-8 byte length without Node `Buffer` (Workers / browsers). */
export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}
