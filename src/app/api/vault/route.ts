import {NextResponse} from 'next/server';
// Round 10: the offline vault is closed. It paid into the old server inventory (inventory_items / player_wallets),
// which no longer belongs to any character since the realm owns characters (round 9), and its zone ids predate the
// current maps. It returns when it is rebuilt on the realm with its own daily limits (see docs/ROUND10_TH.md).
export async function POST(){return NextResponse.json({error:'Offline vault is closed until it is rebuilt on the realm'},{status:410});}
