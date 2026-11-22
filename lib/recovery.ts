/** Kurtarma kodu: girişsiz defteri başka cihaza taşımak için. Kod = kimlik (8) + gizli (8) karakter. */
export const RECOVERY_DOMAIN = "kurtarma.aeternum.app";
export const RECOVERY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function normalizeCode(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/[O]/g, "0").replace(/[IL]/g, "1");
}

export function formatCode(c: string) {
  return c.match(/.{1,4}/g)?.join("-") ?? c;
}

export function codeToCredentials(code: string) {
  const c = normalizeCode(code);
  return { email: `${c.slice(0, 8).toLowerCase()}@${RECOVERY_DOMAIN}`, password: `ae:${c}` };
}

export function hasRecoveryEmail(email?: string | null) {
  return !!email && email.endsWith(`@${RECOVERY_DOMAIN}`);
}
