import sys;sys.path.insert(0,'/home/claude/env')
import mk,cv2,numpy as np
def detect(img,seed,tol,persp=False):
    if len(seed)==4:
        H,W=img.shape[:2];x0,y0,x1,y1=seed[0]*W,seed[1]*H,seed[2]*W,seed[3]*H
        q=np.array([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],dtype=np.float32);mm=np.zeros((H,W),np.uint8);cv2.fillConvexPoly(mm,q.astype(np.int32),255);return mm,q
    m,q=mk.auto(img,seed,tol)
    if persp: return m,q
    cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);c=max(cs,key=cv2.contourArea)
    # robust axis-aligned: use percentiles of mask pixels
    ys,xs=np.nonzero(m)
    x0,x1=np.percentile(xs,[1.5,98.5]);y0,y1=np.percentile(ys,[1.5,98.5])
    q=np.array([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],dtype=np.float32)
    mm=np.zeros_like(m);cv2.fillConvexPoly(mm,q.astype(np.int32),255)
    return mm,q
