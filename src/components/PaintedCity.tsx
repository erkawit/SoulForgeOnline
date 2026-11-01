'use client';
// A painted capital (world/paintedCity.ts): one camera-facing quad that follows the view and shows the painting, writing
// each pixel's depth from the blockout depth map so players, NPCs and monsters walk behind the buildings. The camera yaw is
// locked to 45° for these maps (GameWorld FollowCamera), the angle the picture was painted from.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, LinearFilter, LinearMipmapLinearFilter, Mesh, NearestFilter, NoColorSpace, ShaderMaterial, TextureLoader, Vector2, Vector3, type Texture } from 'three';
import { CITIES, type CityId } from '@/game/content';
import { PAINTED } from '@/game/world/paintedCity';
import { useGameStore } from '@/store/useGameStore';

const DIR = new Vector3(1, 1, 1).normalize(), RIGHT = new Vector3(1, 0, -1).normalize(), UP = new Vector3(-1, 2, -1).normalize();
const VERT = /* glsl */`varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FRAG = /* glsl */`uniform mat4 projectionMatrix; uniform sampler2D uColor; uniform sampler2D uDepth; uniform float uHasColor; uniform float uHasDepth; uniform float uBias;
uniform vec3 uDir; uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uSky; uniform vec2 uSize;
varying vec3 vW;
void main(){
  vec3 p0 = vW - dot(vW, uDir) * uDir;                       // same view ray, on the plane through the origin
  vec2 uv = vec2(dot(p0, uRight) / uSize.x + 0.5, dot(p0, uUp) / uSize.y + 0.5);
  float fd = 0.99999;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || uHasColor < 0.5) { gl_FragColor = vec4(uSky, 1.0); gl_FragDepth = fd; return; }
  gl_FragColor = vec4(texture2D(uColor, uv).rgb, 1.0);
  if (uHasDepth > 0.5) {
    vec4 d = texture2D(uDepth, uv);
    float t = (floor(d.r * 255.0 + 0.5) + d.g) / 255.0 * 256.0 - 128.0 - uBias;   // toward the camera from that plane
    vec4 c = projectionMatrix * viewMatrix * vec4(p0 + t * uDir, 1.0);
    fd = clamp(c.z / c.w * 0.5 + 0.5, 0.0, 0.99999);
  }
  gl_FragDepth = fd;
}`;

export default function PaintedCity({ city }: { city: CityId }) {
  const p = PAINTED[city]!;
  const mesh = useRef<Mesh>(null);
  const mat = useMemo(() => {
    const sky = new Color(CITIES[city].sky).convertLinearToSRGB();
    return new ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, side: 2, depthWrite: true, depthTest: true, fog: false,
      uniforms: {
        uColor: { value: null }, uDepth: { value: null }, uHasColor: { value: 0 }, uHasDepth: { value: 0 }, uBias: { value: 0.35 },
        uDir: { value: DIR }, uRight: { value: RIGHT }, uUp: { value: UP }, uSky: { value: new Vector3(sky.r, sky.g, sky.b) },
        uSize: { value: new Vector2(p.width, p.width * p.aspect) },
      },
    });
  }, [city, p]);
  useEffect(() => {
    const loader = new TextureLoader(); let alive = true; const got: Texture[] = [];
    loader.load(p.color, t => {
      if (!alive) return t.dispose(); got.push(t);
      t.colorSpace = NoColorSpace; t.minFilter = LinearMipmapLinearFilter; t.magFilter = LinearFilter; t.anisotropy = 4;
      mat.uniforms.uColor.value = t; mat.uniforms.uHasColor.value = 1;
    });
    loader.load(p.depth, t => {
      if (!alive) return t.dispose(); got.push(t);
      t.colorSpace = NoColorSpace; t.minFilter = NearestFilter; t.magFilter = NearestFilter; t.generateMipmaps = false;
      mat.uniforms.uDepth.value = t; mat.uniforms.uHasDepth.value = 1;
    }, undefined, () => console.warn('[painted city] no depth map yet:', p.depth, '(run CITY_DEPTH.bat) — drawing the picture flat'));
    return () => { alive = false; got.forEach(t => t.dispose()); mat.dispose(); };
  }, [mat, p]);
  // the quad sits on the camera target, facing the camera, big enough to fill the widest zoom
  const three = useThree();
  useEffect(() => { if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__painted = { mat, mesh, three }; }, [mat, three]); // dev inspection
  useFrame(() => {
    const m = mesh.current; if (!m) return; const [x, z] = useGameStore.getState().player.position;
    m.position.set(x, 0, z); m.lookAt(x + DIR.x, DIR.y, z + DIR.z);
  });
  return <mesh ref={mesh} material={mat} frustumCulled={false} renderOrder={-10}><planeGeometry args={[220, 220]} /></mesh>;
}
