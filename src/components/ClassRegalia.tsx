import {CLASSES,type ClassId} from '@/game/content';
export default function ClassRegalia({cls}:{cls:ClassId}){
 const d=CLASSES[cls],gold='#aa8c59',long=cls==='Mage'||cls==='Priest'||cls==='Enchanter';
 return <group>
 {/* Separate skirt panels retain the open silhouette and leg clearance. */}
 {Array.from({length:long?7:4},(_,i)=>{const a=(i/(long?7:4))*Math.PI*2;return <group key={i} position={[Math.sin(a)*.29,1.16,Math.cos(a)*.2]} rotation={[0,a,.05*Math.sin(a)]}><mesh position={[0,long?-.48:-.23,.06]} rotation={[-.17,0,0]} castShadow><boxGeometry args={[long?.25:.23,long?.95:.45,.045]}/><meshStandardMaterial color={cls==='Priest'&&i%2===0?'#6b3542':d.cloth} roughness={.95}/></mesh><mesh position={[.115,long?-.48:-.23,.1]} rotation={[-.17,0,0]}><boxGeometry args={[.012,long?.93:.43,.012]}/><meshStandardMaterial color={gold} metalness={.75} roughness={.4}/></mesh></group>})}
 {/* Layered pauldrons and engraved crescent clasps. */}
 {[-1,1].map(side=><group key={side}>
 {[0,1,2].map(j=><mesh key={j} position={[side*(.43+j*.055),1.79-j*.09,.015]} rotation={[0,0,side*-.25]} scale={[.26,.13,.3]} castShadow><sphereGeometry args={[1,12,8,0,Math.PI*2,0,Math.PI*.7]}/><meshStandardMaterial color={j%2?gold:d.metal} metalness={.8} roughness={.38}/></mesh>)}
 <mesh position={[side*.28,1.7,.245]} rotation={[0,0,side*.4]}><torusGeometry args={[.075,.012,6,20,Math.PI*1.65]}/><meshStandardMaterial color={gold} metalness={.8}/></mesh>
 <mesh position={[side*.17,1.48,.252]} rotation={[0,0,side*.45]}><boxGeometry args={[.04,.52,.035]}/><meshStandardMaterial color="#48352b"/></mesh>
 {[0,1,2].map(i=><mesh key={i} position={[side*.24,1.12-i*.045,.24]}><boxGeometry args={[.23,.025,.035]}/><meshStandardMaterial color={i===1?gold:'#544132'}/></mesh>)}
 </group>)}
 {cls==='Enchanter'&&[-1,1].flatMap(side=>[0,1].map(i=><mesh key={`${side}-${i}`} position={[side*(.36+i*.07),.96,.05]}><cylinderGeometry args={[.025,.025,.2,8]}/><meshStandardMaterial color="#63b5b8" emissive="#21565d" metalness={.5}/></mesh>))}
 <mesh position={[0,1.15,.31]}><torusGeometry args={[.065,.018,6,16]}/><meshStandardMaterial color={gold} metalness={.9}/></mesh>
 {cls==='Priest'&&<group position={[0,1.53,.28]}><mesh><torusGeometry args={[.1,.012,6,24]}/><meshStandardMaterial color={gold}/></mesh>{Array.from({length:8},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/4)*.14,Math.sin(i*Math.PI/4)*.14,0]} rotation={[0,0,i*Math.PI/4]}><boxGeometry args={[.06,.012,.015]}/><meshStandardMaterial color={gold}/></mesh>)}</group>}
 </group>
}
