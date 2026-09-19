/**
 * Derive 1–2 letter initials from an alt/label string for broken-image fallbacks.
 *
 * @example
 * lightboxInitialsFromAlt('Vintage camera') // 'VC'
 * lightboxInitialsFromAlt('Coast') // 'CO'
 * lightboxInitialsFromAlt('') // '?'
 */
export function lightboxInitialsFromAlt(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) {
    const word = parts[0];
    return word.slice(0, Math.min(2, word.length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
