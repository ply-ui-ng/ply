import crypto from 'crypto';

/**
 * Ed25519 public keys trusted to sign the registry index.
 *
 * Generate with `node scripts/generate-registry-key.mjs`, which appends the
 * public half here and prints the private half once for the
 * REGISTRY_SIGNING_KEY GitHub Actions secret. Keep old keys listed during a
 * rotation so CLIs that shipped before the new key still verify.
 */
export const TRUSTED_SIGNING_KEYS: { keyId: string; publicKey: string }[] = [];

/**
 * Canonical digest for a registry item. MUST stay byte-identical to
 * `computeItemDigest` in scripts/registry-digest.js — integrity.test.ts pins
 * the shared vector.
 *
 * @example
 * computeItemDigest({ name: 'button', files: [{ name: 'index.ts', content: '' }] });
 */
export function computeItemDigest(item: {
  name: string;
  files: { name: string; content: string }[];
}): string {
  const hash = crypto.createHash('sha256');
  hash.update(item.name, 'utf8');
  hash.update('\0');
  const sorted = [...item.files].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const file of sorted) {
    hash.update(file.name, 'utf8');
    hash.update('\0');
    hash.update(file.content, 'utf8');
    hash.update('\0');
  }
  return hash.digest('hex');
}

export interface IndexSignature {
  alg: string;
  keyId: string;
  sha256: string;
  signature: string;
}

export type SignatureVerdict =
  /** Signature present, key trusted, bytes match. */
  | { status: 'verified'; keyId: string }
  /** No signature published, or no trusted key shipped in this CLI. */
  | { status: 'unsigned'; reason: string }
  /** Signature present but wrong — the bytes are not what the signer approved. */
  | { status: 'invalid'; reason: string };

function isIndexSignature(value: unknown): value is IndexSignature {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.alg === 'string' &&
    typeof v.keyId === 'string' &&
    typeof v.sha256 === 'string' &&
    typeof v.signature === 'string'
  );
}

/**
 * Verify a detached Ed25519 signature over the raw index bytes.
 *
 * Signing happens in CI with a key held in GitHub Actions secrets, so an
 * attacker who takes over the web origin alone cannot forge a valid index.
 *
 * @example
 * const verdict = verifyIndexSignature(rawIndexText, sig);
 * if (verdict.status === 'invalid') throw new Error(verdict.reason);
 */
export function verifyIndexSignature(rawIndex: string, signature: unknown): SignatureVerdict {
  if (!TRUSTED_SIGNING_KEYS.length) {
    return { status: 'unsigned', reason: 'this CLI build ships no trusted signing key' };
  }
  if (signature === undefined || signature === null) {
    return { status: 'unsigned', reason: 'the registry published no index signature' };
  }
  if (!isIndexSignature(signature)) {
    return { status: 'invalid', reason: 'the index signature is malformed' };
  }
  if (signature.alg !== 'ed25519') {
    return { status: 'invalid', reason: `unsupported signature algorithm '${signature.alg}'` };
  }

  const key = TRUSTED_SIGNING_KEYS.find((k) => k.keyId === signature.keyId);
  if (!key) {
    return { status: 'invalid', reason: `index was signed with an untrusted key '${signature.keyId}'` };
  }

  const actualSha = crypto.createHash('sha256').update(rawIndex, 'utf8').digest('hex');
  if (actualSha !== signature.sha256) {
    return { status: 'invalid', reason: 'the index contents do not match the signed digest' };
  }

  try {
    const publicKey = crypto.createPublicKey({
      key: Buffer.from(key.publicKey, 'base64'),
      format: 'der',
      type: 'spki',
    });
    const ok = crypto.verify(
      null,
      Buffer.from(rawIndex, 'utf8'),
      publicKey,
      Buffer.from(signature.signature, 'base64')
    );
    return ok
      ? { status: 'verified', keyId: signature.keyId }
      : { status: 'invalid', reason: 'the index signature failed verification' };
  } catch (err: any) {
    return { status: 'invalid', reason: `could not verify the index signature (${err.message})` };
  }
}

/**
 * npm package specifier grammar. Registry payloads name the npm packages a
 * component needs, and those names reach a child process — anything outside
 * this shape is refused rather than forwarded to the package manager.
 *
 * @example
 * isSafeNpmDependency('@angular/cdk'); // true
 */
export function isSafeNpmDependency(spec: string): boolean {
  return /^(?:@[a-z0-9][a-z0-9-._~]*\/)?[a-z0-9][a-z0-9-._~]*$/.test(spec) && spec.length <= 214;
}
