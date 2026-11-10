import test from 'node:test';
import assert from 'node:assert/strict';
import { DUNGEON_IDS, ZONE_IDS, WORLD_LIMIT, arrivalPoint, homePoint, portalsOf, safePosition, walkable } from '../src/game/content';
import { spawnPoints } from '../src/game/spawns';
import { natureLayout } from '../src/game/world/layout';
import { mapRoute } from '../src/game/world/mapRoute';
import { lineClear } from '../src/game/monsterAI';

test('expanded farming fields and dungeons connect their entrances, spawns and outer districts', () => {
  for (const city of [...ZONE_IDS,...DUNGEON_IDS]) {
    assert.equal(WORLD_LIMIT[city],120);
    assert.ok(!walkable(city,120.1,0));
    assert.ok(!walkable(city,0,-120.1));
    const start=homePoint(city);
    assert.ok(walkable(city,...start),city+' arrival');
    for (const gate of portalsOf(city)) {
      assert.ok(Math.max(Math.abs(gate.x),Math.abs(gate.z))>50,city+' gate moved out');
      const arrival=arrivalPoint(gate.to,city);
      assert.ok(walkable(city,...arrival),city+' safe return');
      assert.ok(Math.hypot(arrival[0]-gate.x,arrival[1]-gate.z)>2.7);
      assert.ok(mapRoute(city,start,[gate.x,gate.z],1.6),city+' gate reachable');
    }
    const monsters=spawnPoints(city);
    assert.ok(monsters.some(m=>Math.max(...m.position.map(Math.abs))>50),city+' outer farming area populated');
    for (const m of monsters) {
      assert.ok(walkable(city,...m.position),m.id+' clear spawn');
      const route=mapRoute(city,start,m.position,.1);
      assert.ok(route,m.id+' reachable spawn');
      let last=start;
      for(const point of route){ assert.ok(lineClear(city,last,point),m.id+' route avoids obstacles'); last=point; }
    }
    const layout=natureLayout(city);
    assert.ok(layout.trees.some(p=>Math.max(Math.abs(p.x),Math.abs(p.z))>40),city+' outer foliage');
    assert.ok(layout.backdrop.every(p=>Math.max(Math.abs(p.x),Math.abs(p.z))>70),city+' backdrop outside boundary');
    if(walkable(city,30,0))assert.deepEqual(safePosition(city,[30,0]),[30,0],city+' saved coordinates preserved');
  }
});
