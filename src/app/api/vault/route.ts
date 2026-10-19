import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export async function POST(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!key||!secret)return NextResponse.json({error:'Vault backend not configured'},{status:503});
 const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return NextResponse.json({error:'Unauthorized'},{status:401});
 const publicClient=createClient(url,key,{auth:{persistSession:false}});const {data,error}=await publicClient.auth.getUser(token);
 if(error||!data.user)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>null);if(!body||!['start','claim'].includes(body.action))return NextResponse.json({error:'Invalid action'},{status:400});
 const admin=createClient(url,secret,{auth:{persistSession:false}});
 if(body.action==='start'){
  if(!['bronze','silver','gold','platinum'].includes(body.cardType)||!['ancient_ruins','shadow_forest','abyss_dungeon','soul_rift'].includes(body.zoneId))return NextResponse.json({error:'Invalid card or zone'},{status:400});
  const r=await admin.rpc('start_offline_vault',{p_player_id:data.user.id,p_card_type:body.cardType,p_zone_id:body.zoneId});return NextResponse.json(r.error?{error:r.error.message}:{jobId:r.data},{status:r.error?400:200});
 }
 const {data:jobs,error:jobsError}=await admin.from('offline_vault_jobs').select('id').eq('player_id',data.user.id).neq('status','claimed').lte('ends_at',new Date().toISOString()).order('ends_at',{ascending:false}).limit(1);
 if(jobsError||!jobs?.length)return NextResponse.json({error:'No completed jobs'},{status:404});
 const r=await admin.rpc('claim_offline_vault',{p_player_id:data.user.id,p_job_id:jobs[0].id});return NextResponse.json(r.error?{error:r.error.message}:{rewards:r.data},{status:r.error?400:200});
}
