'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Group, Mesh, Color, MathUtils } from 'three';

// Reusable low-poly stylized props for Hollow Reach (The Iron & Soul Fortress)
function StoneDais() {
  return (
    <group position={[0, 0, 0]}>
      {/* Tier 1 - Outer circular stone ring */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[5.2, 5.5, 0.1, 32]} />
        <meshStandardMaterial color="#38363b" roughness={0.85} />
      </mesh>
      {/* Outer Runic Inlay */}
      <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.4, 4.65, 36]} />
        <meshBasicMaterial color="#62d7cb" transparent opacity={0.65} side={2} />
      </mesh>
      {/* Tier 2 - Inner raised stone platform */}
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[3.4, 3.6, 0.24, 24]} />
        <meshStandardMaterial color="#47444b" roughness={0.8} />
      </mesh>
      {/* Inner Runic Seal */}
      <mesh position={[0, 0.345, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.7, 32]} />
        <meshBasicMaterial color="#70e5d9" transparent opacity={0.85} side={2} />
      </mesh>
      {/* Cardinal Stone Steps */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0, 0.06, 4.2]} receiveShadow>
            <boxGeometry args={[1.8, 0.12, 0.8]} />
            <meshStandardMaterial color="#504c54" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EternalSoulForge() {
  const crystalRef = useRef<Mesh>(null);
  const flameLightRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.position.y = 2.4 + Math.sin(t * 2.2) * 0.12;
      crystalRef.current.rotation.y = t * 0.7;
    }
    if (flameLightRef.current) {
      const flicker = 1 + Math.sin(t * 12) * 0.15 + Math.cos(t * 17) * 0.1;
      flameLightRef.current.scale.setScalar(flicker);
    }
  });

  return (
    <group position={[0, 0.34, 0]}>
      {/* Forge Base: Heavy octagonal obsidian plinth */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.65, 1.9, 0.9, 8]} />
        <meshStandardMaterial color="#222026" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Iron Reinforcement Straps */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <torusGeometry args={[1.72, 0.08, 6, 8]} />
        <meshStandardMaterial color="#6a6358" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Forge Basin (The Crucible) */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[1.35, 1.45, 0.25, 16]} />
        <meshStandardMaterial color="#1a1820" roughness={0.9} />
      </mesh>
      {/* Molten Soul Fire Coals in the basin */}
      <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshBasicMaterial color="#ff7a45" />
      </mesh>
      {/* The Master Soul Anvil resting in the center */}
      <group position={[0, 1.15, 0]}>
        {/* Anvil Base */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.5, 0.3, 8]} />
          <meshStandardMaterial color="#30353c" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Anvil Horn and Face */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.95, 0.2, 0.42]} />
          <meshStandardMaterial color="#424952" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0.55, 0.38, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.18, 0.35, 8]} />
          <meshStandardMaterial color="#424952" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* Floating Soul Energy Crystal */}
      <mesh ref={crystalRef} position={[0, 2.4, 0]} castShadow>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#62d7cb"
          emissive="#62d7cb"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Rising Soul Sparkles & Embers */}
      <Sparkles count={35} position={[0, 2.2, 0]} scale={[2.2, 3.2, 2.2]} color="#70e5d9" size={2.4} speed={0.8} />
      <Sparkles count={20} position={[0, 1.4, 0]} scale={[1.8, 1.5, 1.8]} color="#ff9554" size={1.8} speed={0.6} />

      {/* Soft warm soul light */}
      <group ref={flameLightRef}>
        <pointLight position={[0, 2.2, 0]} color="#62d7cb" intensity={18} distance={12} />
        <pointLight position={[0, 1.2, 0]} color="#ff8547" intensity={14} distance={8} />
      </group>
    </group>
  );
}

// 4 Plaza Braziers
function PlazaBraziers() {
  const braziers = [
    [2.8, 2.8],
    [-2.8, 2.8],
    [2.8, -2.8],
    [-2.8, -2.8],
  ];

  return (
    <group>
      {braziers.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Stone Pillar */}
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.28, 1.2, 8]} />
            <meshStandardMaterial color="#3c3840" roughness={0.8} />
          </mesh>
          {/* Iron Bowl */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.2, 0.2, 8]} />
            <meshStandardMaterial color="#2a282e" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Fire ember */}
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.16, 8, 6]} />
            <meshStandardMaterial color="#ffaa54" emissive="#ff8533" emissiveIntensity={2} />
          </mesh>
          <pointLight position={[0, 1.5, 0]} color="#ffaa54" intensity={3} distance={5} />
        </group>
      ))}
    </group>
  );
}

// Zone B: Commercial & Crafting District Props
function BlacksmithWorkshopProps() {
  return (
    <group position={[-17.5, 0, -7.5]}>
      {/* Stone Chimney & Hearth */}
      <mesh position={[2.4, 1.8, -1.2]} castShadow>
        <boxGeometry args={[1.2, 3.6, 1.2]} />
        <meshStandardMaterial color="#302d33" roughness={0.9} />
      </mesh>
      {/* Glowing Coals in hearth */}
      <mesh position={[2.4, 0.6, -0.4]}>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#ff5722" emissive="#ff6e40" emissiveIntensity={1.8} />
      </mesh>
      <Sparkles count={12} position={[2.4, 1.8, -0.4]} scale={[0.8, 2, 0.8]} color="#ffaa44" size={1.8} speed={0.9} />

      {/* Heavy Work Anvil */}
      <mesh position={[1.2, 0.35, 0.8]} castShadow>
        <boxGeometry args={[0.8, 0.7, 0.4]} />
        <meshStandardMaterial color="#444b54" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Weapon Rack */}
      <group position={[-1.2, 0, 1.5]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[1.4, 1.3, 0.2]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
        {/* Swords on rack */}
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 0.65, 0.12]} rotation={[0, 0, 0.1 * (i - 1)]}>
            <boxGeometry args={[0.08, 1.1, 0.04]} />
            <meshStandardMaterial color="#a0b2be" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* Water Quenching Trough */}
      <mesh position={[0.2, 0.3, 1.6]} castShadow>
        <boxGeometry args={[1.1, 0.6, 0.5]} />
        <meshStandardMaterial color="#383028" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Marketplace Stalls & Crates in Zone B
function MarketStallsProps() {
  return (
    <group>
      {/* Stall near General Store (-14, 0, 15) */}
      <group position={[-12.2, 0, 11.5]} rotation={[0, 0.4, 0]}>
        {/* Wooden Counter */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.2, 1.0, 0.9]} />
          <meshStandardMaterial color="#543d2b" roughness={0.85} />
        </mesh>
        {/* Canopy Posts */}
        {[-0.95, 0.95].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.0, 6]} />
            <meshStandardMaterial color="#3d2a1c" roughness={0.9} />
          </mesh>
        ))}
        {/* Striped Fabric Canopy Awning */}
        <mesh position={[0, 2.3, 0.1]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[2.4, 0.06, 1.4]} />
          <meshStandardMaterial color="#b23a3a" roughness={0.9} />
        </mesh>
        {/* Potion Bottles on Counter */}
        {[-0.6, -0.3, 0.1, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 1.08, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 0.22, 6]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ff4d6d' : '#4cc9f0'}
              emissive={i % 2 === 0 ? '#ff4d6d' : '#4cc9f0'}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Stacked Crates & Barrels near Warehouse (-21.5, 0, 4) */}
      <group position={[-18.5, 0, 2.8]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#5a422e" roughness={0.85} />
        </mesh>
        <mesh position={[0.7, 0.35, 0.3]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#4e3826" roughness={0.85} />
        </mesh>
        <mesh position={[0.1, 1.25, 0]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#543d2b" roughness={0.85} />
        </mesh>
        {/* Ale Barrel */}
        <mesh position={[-0.75, 0.48, 0.2]} castShadow>
          <cylinderGeometry args={[0.38, 0.42, 0.95, 10]} />
          <meshStandardMaterial color="#402e20" roughness={0.8} />
        </mesh>
      </group>

      {/* Merchant Scale & Rug near Buyback (-2.5, 0, 20) */}
      <group position={[-1.2, 0, 17.5]} rotation={[0, -0.3, 0]}>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 1.4]} />
          <meshStandardMaterial color="#6a4c38" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.4, 0.8, 0.7]} />
          <meshStandardMaterial color="#443224" roughness={0.85} />
        </mesh>
        {/* Brass Balance Scale */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.02, 0.04, 0.35, 6]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Zone C: Adventurer & Class Guild Quarter Props
function GuildQuarterProps() {
  return (
    <group position={[9.5, 0, -16.5]}>
      {/* Training Dummy 1 */}
      <group position={[-1.8, 0, 1.8]} rotation={[0, 0.5, 0]}>
        {/* Wood Post */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 1.8, 8]} />
          <meshStandardMaterial color="#503c2a" roughness={0.9} />
        </mesh>
        {/* Straw Body */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.28, 0.8, 8]} />
          <meshStandardMaterial color="#c8b070" roughness={0.95} />
        </mesh>
        {/* Crossbar Arms */}
        <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.2, 6]} />
          <meshStandardMaterial color="#503c2a" roughness={0.9} />
        </mesh>
        {/* Target Helmet */}
        <mesh position={[0, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#636c75" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Training Dummy 2 */}
      <group position={[1.5, 0, 2.2]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 1.8, 8]} />
          <meshStandardMaterial color="#503c2a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.26, 0.8, 8]} />
          <meshStandardMaterial color="#bfa767" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.1, 6]} />
          <meshStandardMaterial color="#503c2a" roughness={0.9} />
        </mesh>
      </group>

      {/* Guild Crest Banner Pole */}
      <group position={[-2.5, 0, -1.0]}>
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 4.4, 8]} />
          <meshStandardMaterial color="#302a24" roughness={0.8} />
        </mesh>
        {/* Gold Finial Spearhead */}
        <mesh position={[0, 4.5, 0]}>
          <coneGeometry args={[0.16, 0.45, 6]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Hanging Guild Banner */}
        <mesh position={[0.45, 3.4, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial color="#2d3b50" roughness={0.85} side={2} />
        </mesh>
      </group>
    </group>
  );
}

// Zone D: Main Departure & Gateposts
function GateDistrictProps() {
  return (
    <group position={[14, 0, 14]}>
      {/* Stone Gate Pillar East */}
      <mesh position={[1.8, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 4.4, 0.9]} />
        <meshStandardMaterial color="#3a373d" roughness={0.85} />
      </mesh>
      {/* Glowing Soul Lantern atop pillar */}
      <mesh position={[1.8, 4.7, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#62d7cb" emissive="#62d7cb" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[1.8, 4.7, 0]} color="#62d7cb" intensity={4} distance={7} />

      {/* Directional Signpost */}
      <group position={[-2.2, 0, -1.5]} rotation={[0, 0.6, 0]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 2.2, 6]} />
          <meshStandardMaterial color="#4a3625" roughness={0.9} />
        </mesh>
        {/* Planks pointing in different directions */}
        <mesh position={[0.4, 1.8, 0]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.85, 0.2, 0.05]} />
          <meshStandardMaterial color="#705238" roughness={0.85} />
        </mesh>
        <mesh position={[-0.4, 1.5, 0]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.85, 0.2, 0.05]} />
          <meshStandardMaterial color="#644830" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * SoulForgePlaza: High-quality, authentic 2.5D Isometric environment for Hollow Reach
 * Brings the Soul Forge theme and clear functional zoning to life in Three.js WebGL!
 */
export default function SoulForgePlaza() {
  return (
    <group name="soulforge-plaza-environment">
      {/* Central Plaza (Zone A) */}
      <StoneDais />
      <EternalSoulForge />
      <PlazaBraziers />

      {/* Commercial & Crafting District (Zone B) */}
      <BlacksmithWorkshopProps />
      <MarketStallsProps />

      {/* Adventurer & Guild Quarter (Zone C) */}
      <GuildQuarterProps />

      {/* Departure & Gate District (Zone D) */}
      <GateDistrictProps />
    </group>
  );
}
