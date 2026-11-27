import cv2,numpy as np,sys
sys.path.insert(0,'/home/claude/env')
import mk
def quad_from_mask(m):
    cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);c=max(cs,key=cv2.contourArea)
    hull=cv2.convexHull(c);best=None
    for e in np.linspace(0.005,0.06,40):
        a=cv2.approxPolyDP(hull,e*cv2.arcLength(hull,True),True)
        if len(a)==4: best=a.reshape(4,2).astype(np.float32);break
    if best is None: return None,0
    q=mk.order(best)
    poly=np.zeros_like(m);cv2.fillConvexPoly(poly,q.astype(np.int32),255)
    inter=np.logical_and(poly>0,m>0).sum();uni=np.logical_or(poly>0,m>0).sum()
    return q,inter/uni
def refine(img,q):
    # snap each corner to nearest strong corner within small window
    g=cv2.cvtColor(img,cv2.COLOR_RGB2GRAY).astype(np.float32)
    pts=q.reshape(-1,1,2).copy()
    try: cv2.cornerSubPix(g,pts,(7,7),(-1,-1),(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,40,0.01))
    except Exception: return q
    d=np.linalg.norm(pts.reshape(4,2)-q,axis=1)
    return np.where(d[:,None]<6,pts.reshape(4,2),q).astype(np.float32)
def detect2(img,seed,tol=14):
    if len(seed)==8:
        H,W=img.shape[:2];q=np.array(seed,dtype=np.float32).reshape(4,2)*[W,H];q=mk.order(q)
        mm=np.zeros((H,W),np.uint8);cv2.fillConvexPoly(mm,q.astype(np.int32),255);return mm,q,1.0
    if len(seed)==4:
        H,W=img.shape[:2];x0,y0,x1,y1=seed[0]*W,seed[1]*H,seed[2]*W,seed[3]*H
        q=np.array([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],dtype=np.float32)
        mm=np.zeros((H,W),np.uint8);cv2.fillConvexPoly(mm,q.astype(np.int32),255);return mm,q,1.0
    m,_=mk.auto(img,seed,tol)
    q,iou=quad_from_mask(m)
    if q is None: return None,None,0
    q=refine(img,q)
    mm=np.zeros_like(m);cv2.fillConvexPoly(mm,q.astype(np.int32),255)
    return mm,q,iou
def aspect(q):
    w=(np.linalg.norm(q[1]-q[0])+np.linalg.norm(q[2]-q[3]))/2;h=(np.linalg.norm(q[3]-q[0])+np.linalg.norm(q[2]-q[1]))/2
    return w/h

def _fit(pts):
    vx,vy,x0,y0=cv2.fitLine(pts.astype(np.float32),cv2.DIST_HUBER,0,0.01,0.01).ravel();return np.array([x0,y0]),np.array([vx,vy])
def _inter(l1,l2):
    p1,d1=l1;p2,d2=l2;A=np.array([d1,-d2]).T
    t=np.linalg.solve(A,p2-p1);return p1+t[0]*d1
def lines_quad(m):
    cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);c=max(cs,key=cv2.contourArea).reshape(-1,2).astype(np.float32)
    box=mk.order(cv2.boxPoints(cv2.minAreaRect(c)));diag=np.linalg.norm(box[2]-box[0])
    lines=[]
    for i in range(4):
        a,b=box[i],box[(i+1)%4];d=(b-a)/np.linalg.norm(b-a);n=np.array([-d[1],d[0]])
        dist=np.abs((c-a)@n);along=(c-a)@d;L=np.linalg.norm(b-a)
        sel=c[(dist<0.06*diag)&(along>0.1*L)&(along<0.9*L)]
        if len(sel)<10: return None
        p,dd=_fit(sel)
        for _ in range(2):
            nn=np.array([-dd[1],dd[0]]);dist=np.abs((c-p)@nn);along=(c-a)@d
            sel=c[(dist<0.008*diag)&(along>0.05*L)&(along<0.95*L)]
            if len(sel)<10: break
            p,dd=_fit(sel)
        lines.append((p,dd))
    q=np.array([_inter(lines[i-1],lines[i]) for i in range(4)],dtype=np.float32)
    return mk.order(q)
def detect3(img,seed,tol=14):
    if len(seed) in (4,8): return detect2(img,seed,tol)
    m,_=mk.auto(img,seed,tol)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    q=lines_quad(m)
    if q is None: return None,None,0
    mm=np.zeros_like(m);cv2.fillConvexPoly(mm,q.astype(np.int32),255)
    inter=np.logical_and(mm>0,m>0).sum()/max(1,(mm>0).sum())
    return mm,q,inter
