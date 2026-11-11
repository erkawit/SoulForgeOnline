/** Painted sheets are served with a 7-day browser cache under the same file names, so a repainted or cleaned sheet would
 *  keep showing the old picture for a week. Bump ART_REV whenever files in public/art/anim or public/art/fx change:
 *  the new query string makes every browser fetch the new files once. */
export const ART_REV = '20261111b';
export const artUrl = (path: string) => `${path}?v=${ART_REV}`;
