import { hashPassword, sha256 } from '@/utils/hash';

describe('sha256', () => {
  // Expected values come from Node's built-in crypto, so we know they are right
  it('hashes the empty string', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('hashes a short text', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('The quick brown fox jumps over the lazy dog')).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
    );
  });

  it('handles accents and emoji (UTF-8)', () => {
    expect(sha256('café ☕ 😀')).toBe('a628b9f24aa4b3e4b9b8132c1f35bffa61e955287a74432992790584fb51cbb9');
  });

  it('handles long text that needs several 64-byte blocks', () => {
    expect(sha256('a'.repeat(1000))).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
  });

  it('always returns 64 hex characters', () => {
    expect(sha256('anything')).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('hashPassword', () => {
  it('matches the known value for username:password', () => {
    expect(hashPassword('secret123', 'jlaw')).toBe(
      '1849e7a94daf027b6fd1dc61814a033c8fdc39e6fd3dc78fc723f50a7a8bbbf1'
    );
  });

  it('ignores upper/lower case and spaces around the username', () => {
    expect(hashPassword('secret123', '  JLaw ')).toBe(hashPassword('secret123', 'jlaw'));
  });

  it('gives different hashes for different usernames or passwords', () => {
    expect(hashPassword('secret123', 'jlaw')).not.toBe(hashPassword('secret123', 'emilys'));
    expect(hashPassword('secret123', 'jlaw')).not.toBe(hashPassword('Secret123', 'jlaw'));
  });

  it('does not crash when a value is missing', () => {
    expect(() => hashPassword(undefined as unknown as string, undefined as unknown as string)).not.toThrow();
  });
});
