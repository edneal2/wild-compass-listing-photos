import os
import sys,json,os,random,collections
sys.path.insert(0,'/home/claude/env');sys.path.insert(0,'/home/claude/lp')
import mk,cv2,numpy as np
from PIL import Image
from scenes import S
from det import detect
from det2 import detect3,aspect as qaspect
import zipfile,io,glob as _g
TOLX={'n08':22,'n06':22,'n27':22,'n32':22,'n35':30,'n52':22,'n56':30,'l01':30,'n45':22,'t01':22,'s_rack':30,'n13':22}
DROP={'l10','l34','l07','l35','n21','n22','n47','n20','n48','n14','n24','n31'}
for d in DROP: S.pop(d,None)
PERSP={'n14','n40'}
OUT='/home/claude/wild-compass-listing-photos/real/'
os.makedirs(OUT,exist_ok=True)
THEME={'Sports Wall Art':['sports'],'Christmas & Winter':['christmas'],'Travel Wall Art':['travel','city'],'City & Park Prints':['city','travel'],
 'Coastal & Summer':['coastal'],'Nature & Outdoors':['nature','dreamy'],'Dreamy Landscapes':['dreamy','nature'],
 'Nursery & Kids Wall Art':['kids']}
_cache={}
def scene(k):
    if k not in _cache:
        f,seed,fits,tol=S[k];img=mk.load(f,3000);m,q,_c=detect3(img,seed,TOLX.get(k,tol));_cache[k]=(img,m,q)
        if len(_cache)>6: _cache.pop(next(iter(_cache)))
    return _cache[k]
def hero_ok(k):
    img,m,q=scene(k);H,W=img.shape[:2]
    ch=min(H,W*3/4); fh=q[:,1].max()-q[:,1].min()
    return fh<=0.80*ch
RAT=[('2x3',2/3),('3x4',3/4),('4x5',4/5),('11x14',11/14),('ISO',1/1.4142)]
def art_for(slug,a,fallback):
    z=f'/home/claude/wild-compass-download-files/f/{slug}_all-sizes.zip'
    try:
        zf=zipfile.ZipFile(z);names=zf.namelist()
        best=min([r for r in RAT if any('_'+r[0]+'_' in n or n.endswith('_'+r[0]+'.jpg') for n in names)],key=lambda r:abs(r[1]-a))
        n=[n for n in names if '_'+best[0]+'_' in n or n.endswith('_'+best[0]+'.jpg')][0]
        im=Image.open(io.BytesIO(zf.read(n)));im.draft('RGB',(1800,1800));im=im.convert('RGB');im.thumbnail((1800,1800));return im
    except Exception: return Image.open(fallback).convert('RGB')
def render(k,flip,art_path,out,aspect):
    img,m,q=scene(k)
    if flip:
        img=np.ascontiguousarray(img[:,::-1]); m=np.ascontiguousarray(m[:,::-1]); q=q.copy(); q[:,0]=img.shape[1]-1-q[:,0]; q=mk.order(q)
    slug=os.path.basename(art_path).split('__')[0].rsplit('.',1)[0]
    art=art_for(slug,qaspect(q),art_path)
    comp=mk.place(img.copy(),m,q,art,fit='cover',shade=(k not in ('s_den',)))
    H,W=comp.shape[:2]; cx=q[:,0].mean(); cy=q[:,1].mean()
    fh=q[:,1].max()-q[:,1].min(); fw=q[:,0].max()-q[:,0].min()
    a=W/H
    ta=4/3 if aspect=='hero' else min(max(a,4/5),4/3)
    ft=0.62 if aspect=='hero' else 0.5
    chh=max(fh/ft, fw/ft/ta, 1100)
    chh=min(chh,H,W/ta); cw=chh*ta
    x0=min(max(cx-cw/2,0),W-cw); y0=min(max(cy-chh/2,0),H-chh)
    crop=comp[int(y0):int(y0+chh),int(x0):int(x0+cw)]
    im=Image.fromarray(crop); tw=2400 if ta>=1 else 1920
    im=im.resize((tw,int(round(tw/ta))),Image.LANCZOS); im.save(out,quality=82)
