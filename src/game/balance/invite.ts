// Closed-beta invite codes: XXXX-XXXX-XXXX-XXXX from a 32-letter alphabet without look-alikes (no I, O, 0, 1).
// 32^16 = 1.2e24 combinations: guessing is hopeless, and the register API is rate-limited on top.
export const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITE_PATTERN = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

/** Uppercase, strip spaces, accept codes typed without dashes. */
export function normalizeInvite(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length === 16 ? raw.match(/.{4}/g)!.join('-') : input.trim().toUpperCase();
}
export const isInviteFormat = (code: string) => INVITE_PATTERN.test(code);

/** Cryptographically random code (Web Crypto in browsers / Node 20+). 256 % 32 = 0, so there is no modulo bias. */
export function generateInvite(random: (n: number) => Uint8Array = n => crypto.getRandomValues(new Uint8Array(n))) {
  const bytes = random(16); let s = '';
  for (let i = 0; i < 16; i++) { s += INVITE_ALPHABET[bytes[i] % 32]; if (i % 4 === 3 && i < 15) s += '-'; }
  return s;
}
export function generateInvites(count: number, random?: (n: number) => Uint8Array) {
  const set = new Set<string>(); while (set.size < count) set.add(generateInvite(random)); return [...set];
}
