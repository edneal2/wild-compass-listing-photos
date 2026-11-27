import json,sys,os,glob
sys.path.insert(0,'/home/claude/lp')
import gen
plan=json.load(open('plan.json'))
secs=sys.argv[1].split('|'); lim=int(sys.argv[2]) if len(sys.argv)>2 else 10**9
n=0
for r in plan:
    if r['section'] not in secs: continue
    if n>=lim: break
    art=f"/home/claude/hero/cache/{r['slug']}.jpg"
    if not os.path.exists(art): art=sorted(glob.glob(f"/home/claude/hero/cache/{r['slug']}__*.jpg"))[0]
    for fl,(k,fp) in r['slots'].items():
        out=f"{gen.OUT}{r['slug']}-{fl}.jpg"
        if os.path.exists(out): continue
        gen.render(k,fp,art,out+'.part.jpg','hero' if fl=='hero' else 'other'); os.replace(out+'.part.jpg',out)
    n+=1
print('done',n,flush=True)
