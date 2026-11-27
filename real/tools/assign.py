import json,random,collections,sys
sys.path.insert(0,'/home/claude/lp')
import gen
A={s:(sec,f) for s,sec,f in json.load(open('/tmp/affected.json'))}
inv={i['sku']:i for i in json.load(open('/home/claude/hero/inv.json'))}
order=[x['sku'] for x in json.load(open('/home/claude/wild-compass-listing-photos/listings.json'))]
HOK={k:gen.hero_ok(k) for k in gen.S}
SECS=['Christmas & Winter','Travel Wall Art','City & Park Prints','Coastal & Summer','Nature & Outdoors','Dreamy Landscapes','Nursery & Kids Wall Art']
random.seed(7);plan=[]
for sec in SECS:
    th=gen.THEME[sec]
    pool=[k for k in gen.S if th[0] in gen.S[k][2]]
    if len(pool)<10: pool+=[k for k in gen.S if len(th)>1 and th[1] in gen.S[k][2] and k not in pool]
    items=[s for s in order if s in A and A[s][0]==sec and inv[s]['kind'] in('single','set')]
    slots=sum(len(A[s][1]) for s in items)
    cap=-(-slots//(2*len(pool)))+1
    use=collections.Counter();recent=[]
    for s in items:
        flags=A[s][1];row={'sku':s,'slug':inv[s]['slug'],'kind':inv[s]['kind'],'section':sec,'slots':{}}
        taken=set()
        for fl in flags:
            cands=[(k,fp) for k in pool for fp in (0,1) if use[(k,fp)]<cap and k not in taken and k not in recent[-4:] and (fl!='hero' or HOK[k])]
            if not cands: cands=[(k,fp) for k in pool for fp in (0,1) if k not in taken and (fl!='hero' or HOK[k])]
            mn=min(use[c] for c in cands); cands=[c for c in cands if use[c]==mn]
            k,fp=random.choice(cands);use[(k,fp)]+=1;taken.add(k);recent.append(k)
            row['slots'][fl]=[k,fp]
        plan.append(row)
    print(sec,len(items),'slots',slots,'pool',len(pool),'max use',max(use.values()))
json.dump(plan,open('plan.json','w'),indent=0)
print(len(plan))
