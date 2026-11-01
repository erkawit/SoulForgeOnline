// The fashion catalog the wardrobe / cash shop shows: built-in pieces + back-office rows (fashion_items).
import { anonDb } from '@/lib/server/supa';
export const revalidate = 60;
export async function GET() {
  const db = anonDb(); if (!db) return Response.json({ items: [] });
  const { data, error } = await db.from('fashion_items').select('*').order('sort');
  if (error) return Response.json({ items: [] });
  const items = (data ?? []).map(r => ({ id: r.id, slot: r.slot, name: r.name, th: r.th, description: r.description ?? undefined, priceTHB: r.price_thb, priceSG: r.price_sg,
    sprite: r.sprite ?? undefined, art: r.art ?? undefined, anchor: r.anchor ?? undefined, scale: r.scale ?? undefined, behind: r.behind, active: r.active, tag: r.tag ?? undefined }));
  return Response.json({ items });
}
