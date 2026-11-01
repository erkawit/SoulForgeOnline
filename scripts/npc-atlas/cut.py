import numpy as np, sys, json
from PIL import Image
from scipy import ndimage
def frames(path, nrows=8, nf=4):
    im=Image.open(path).convert('RGBA'); a=np.array(im); al=a[:,:,3]>24
    H,W=al.shape; rh=H/nrows; out=[]
    prof=al[:,int(W*0.1):].sum(1)
    cuts=[0]+[int(r*rh)-25+int(np.argmin(prof[int(r*rh)-25:int(r*rh)+25])) for r in range(1,nrows)]+[H]
    for r in range(nrows):
        y0,y1=cuts[r],cuts[r+1]; band=al[y0:y1]
        lab,n=ndimage.label(ndimage.binary_dilation(band,iterations=6))
        objs=ndimage.find_objects(lab); comps=[]
        for i,sl in enumerate(objs):
            area=(lab[sl]==i+1).sum(); h=sl[0].stop-sl[0].start; w=sl[1].stop-sl[1].start
            comps.append((area,sl,i+1,h,w))
        # characters: tall components (labels are short)
        comps=[c for c in comps if c[3]>rh*0.45]
        comps=sorted(comps,key=lambda c:-c[0])[:nf]; comps=sorted(comps,key=lambda c:c[1][1].start)
        row=[]
        for area,sl,li,h,w in comps:
            m=(lab[sl]==li)&band[sl]
            sub=a[y0+sl[0].start:y0+sl[0].stop, sl[1].start:sl[1].stop].copy(); sub[:,:,3]=np.where(m,sub[:,:,3],0)
            ys,xs=np.nonzero(m); bottom=ys.max()
            legs=xs[ys>bottom-0.25*h]; ax=float(np.median(legs))
            row.append((Image.fromarray(sub), ax, bottom))
        out.append(row)
    return out
if __name__=='__main__':
    for p in sys.argv[1:]:
        f=frames(p); print(p[:40], [len(r) for r in f], [ (r[0][0].size) for r in f][:3])
