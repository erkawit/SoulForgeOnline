/** ground-v1 bake: a 4096² top-down base colour per field (scripts/export-ground-handoff.mts, docs/ground-v1).
 *  Pixel (0,0) is world (x=-120, z=-120); columns run +x, rows run +z. With TextureLoader flipY=true
 *  the matching UV is u=(x+120)/240, v=(120-z)/240. */
export const bakedGroundUrl=(id:string)=>`/art/ground-v1/${id}/ground-basecolor-4096.webp`;
export const bakedGroundUv=(x:number,z:number):[number,number]=>[(x+120)/240,(120-z)/240];
