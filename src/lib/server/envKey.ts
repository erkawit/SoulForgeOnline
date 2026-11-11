/** A key pasted into a hosting dashboard often carries a newline, spaces or quotes; Supabase then answers 401
 *  "Invalid API key (bad_length)". Clean it before use — never log or return the value. */
export function cleanKey(v: string | undefined): string | undefined {
  if (!v) return v;
  const t = v.replace(/\s+/g, '').replace(/^["'`]+|["'`]+$/g, '');
  return t || undefined;
}
/** the server-only secret key, cleaned */
export const secretKey = () => cleanKey(process.env.SUPABASE_SECRET_KEY);
