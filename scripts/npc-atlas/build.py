import sys, json, numpy as np
sys.path.insert(0,'/home/claude/npc'); from cut import frames
from PIL import Image
S='/home/claude/npc/src/'; OUT='/home/claude/npc/out/'
MAP={ # npc name slug: (idle sheet, talk sheet)
 'elder-corvin':('Eight-Direction Idle NPC Sprite Sheet-21.png','Grey-Moustached Tinkerer Sprite Sheet-12.png'),
 'mira-ashvale':(None,'Potion Shopkeeper Talking Sprite Sheet-8.png'),
 'brannoc-ironhand':('Eight-direction NPC idle sprite sheet-19.png','Dark fantasy smith dialogue spritesheet-6.png'),
 'quartermaster-hale':('Eight-direction NPC idle animation sheet-20.png','Isometric quartermaster dialogue spritesheet-10.png'),
 'old-jessa':(None,'Teal-cloaked cartographer dialogue spritesheet-2.png'),
 'sister-lumen':('Eight-direction idle companion sprite sheet-23.png','Silver-haired cleric dialogue spritesheet-16.png'),
 'silas-vane':('Eight-direction NPC idle sprite sheet-22.png','Isometric Ledgerkeeper NPC Sprite Sheet-14.png'),
 'master-ysolde':('Eight-Direction Idle Companion Sprite Sheet-24.png','Crimson-caped knight dialogue spritesheet-18.png'),
 'gatewarden-orrin':('Veteran Instructor Idle Animation Sheet-3.png','Dark fantasy veteran instructor spritesheet-4.png'),
 'ranger-kestrel':('Isometric quartermaster idle spritesheet-9.png',None),
}
meta={}
for slug,(idle,talk) in MAP.items():
    I=frames(S+idle) if idle else None; T=frames(S+talk) if talk else None
    if I is None: I=[[r[0]]*4 for r in T]
    if T is None: T=I
    def hmed(F): return float(np.median([f[0].size[1] for row in F for f in row]))
    k=hmed(I)/hmed(T)
    T=[[(im.resize((max(1,round(im.width*k)),max(1,round(im.height*k))),Image.LANCZOS),ax*k,b*k) for im,ax,b in row] for row in T]
    allf=[f for F in (I,T) for row in F for f in row]
    L=max(ax for im,ax,b in allf); R=max(im.width-ax for im,ax,b in allf); Hh=max(b+1 for im,ax,b in allf)
    pad=4; half=int(max(L,R))+pad; cw=2*half; ch=int(Hh)+2*pad
    cols=16; n=64; rows=4
    sheet=Image.new('RGBA',(cols*cw,rows*ch),(0,0,0,0))
    for ci,F in enumerate((I,T)):
        for d in range(8):
            for f in range(4):
                im,ax,b=F[d][f]; idx=ci*32+d*4+f; c,r=idx%cols,idx//cols
                sheet.alpha_composite(im,(int(c*cw+half-ax), int(r*ch+ch-pad-1-b)))
    sheet.save(OUT+f'npc-{slug}.webp',quality=90,method=6)
    meta['npc-'+slug]={'cw':cw,'ch':ch,'cols':cols,'n':n,'fx':0.5,'fy':round(pad/ch,4),'bodyPx':round(hmed(I),1),'clips':{'idle':[0,4],'talk':[32,4]},'dirs':8}
    print(slug, sheet.size, cw, ch)
json.dump(meta,open(OUT+'meta.json','w'),indent=0)
