/** Login accepts a username or an e-mail: "admin" → admin@soulforge.local (accounts made by scripts/create-admin.mjs). */
export const loginEmail = (v: string) => { const t = v.trim().toLowerCase(); return t.includes('@') ? t : `${t}@soulforge.local`; };
