import { useState } from "react";

const C = {
  bg:"#0F0F0F",sur:"#1A1A1A",bor:"#2E2E2E",
  blue:"#0078D4",lime:"#D1FF98",orange:"#FF8C00",
  w:"#F5F5F5",g3:"#A0A0A0",g5:"#666",g7:"#333",
  red:"#FF6B6B",green:"#4CAF82"
};
const STATUSES=["New Brief","In Progress","Needs Clarification","Closed"];
const SCOL={"New Brief":C.lime,"In Progress":C.blue,"Needs Clarification":C.orange,"Closed":C.g5};
const SNAMES=["","Ownership","Objective","Scope","Audience","Message","References","Direction","Guardrails","Criteria","Deliverables"];
const TAKE_OPTS=["First-frame clarity","Pacing","Visual hierarchy","Tone","Emotional payoff","Simplicity","Other"];

const FIELDS=[
  {id:"requestorName",s:1,q:"Who is submitting this brief?",t:"text",ph:"Your full name",req:true},
  {id:"campaignName",s:1,q:"Campaign / project name",t:"text",ph:"e.g. Surface Pro Q3 Launch",req:true},
  {id:"briefOwner",s:1,q:"Who owns this brief?",hint:"Design will route questions here",t:"text",ph:"Name or role",req:true},
  {id:"creativeDecisionMaker",s:1,q:"Who is the creative decision-maker?",hint:"Final approver",t:"text",ph:"Name or role",req:true},
  {id:"businessObjective",s:2,q:"Primary business objective?",t:"multi",req:true,opts:["Increase understanding","Change perception","Drive action","Support existing campaign","Other"],otherKey:"businessObjectiveOther"},
  {id:"problemStatement",s:2,q:"What specific problem must this creative solve?",t:"textarea",ph:"What gap, barrier, or tension are we resolving?",req:true},
  {id:"decisionType",s:3,q:"What decision is needed from Design?",t:"single",req:true,opts:["Exploratory concepts","Single recommended direction","Iteration on existing work","Execution of pre-approved direction"]},
  {id:"conceptCount",s:3,q:"How many concepts are expected?",t:"single",req:true,opts:["1 strong direction","2-3 distinct approaches","Iterations on 1 existing concept","Align in review"]},
  {id:"primaryAudience",s:4,q:"Who is the primary audience?",t:"text",ph:"e.g. SMB IT decision-makers, 35-54",req:true},
  {id:"secondaryAudience",s:4,q:"Is there a secondary audience?",t:"text",ph:"Optional",req:false},
  {id:"audienceChallenge",s:4,q:"What is unclear or difficult for this audience today?",t:"textarea",ph:"Describe the tension or barrier...",req:true},
  {id:"primaryMessage",s:5,q:"If the audience remembers one thing, what should it be?",t:"textarea",ph:"The one thing...",req:true},
  {id:"messageTypes",s:5,q:"What type of message is this?",t:"multi",req:true,opts:["Product capability","Benefit-led","Proof / credibility","Emotional / cultural","Mixed"]},
  {id:"productTruthSource",s:5,q:"What is the source of product truth?",t:"single",req:true,opts:["Approved product documentation","Existing campaign / system","PM or Marketing alignment","Other"],otherKey:"productTruthOther"},
  {id:"references",s:6,q:"Reference examples",t:"refs",req:false},
  {id:"lockedElements",s:7,q:"What is already decided and locked?",t:"multi",req:true,opts:["Messaging","Brand system","CTA","Product positioning","None"]},
  {id:"openForExploration",s:7,q:"What is open for creative exploration?",t:"multi",req:true,opts:["Visual approach","Tone","Narrative","Metaphor vs. literal","Other"],otherKey:"openForExplorationOther"},
  {id:"finalMustInclude",s:8,q:"What must appear in the final design?",t:"multi",req:true,opts:["Logo","Product name","CTA","Legal","Accessibility","None"]},
  {id:"mustAvoid",s:8,q:"What is explicitly off-limits?",t:"textarea",ph:"Styles, references, language to avoid...",req:true},
  {id:"successCriteria",s:9,q:"How will success be evaluated?",t:"multi",req:true,opts:["Clear value proposition","On-brand","Audience-relevant","Simple and scannable","Distinctive","Emotionally engaging","Product truth is clear","Flexible across placements","Other"],otherKey:"successCriteriaOther"},
  {id:"assetTypes",s:10,q:"What asset types are needed?",t:"multi",req:true,opts:["Static","Carousel","Video","System","Other"],otherKey:"assetOther"},
  {id:"staticSizes",s:10,q:"Static sizes",t:"text",ph:"e.g. 1080x1080, 1200x628",req:true,showIf:f=>f.assetTypes?.includes("Static")},
  {id:"videoSizes",s:10,q:"Video sizes and durations",t:"text",ph:"e.g. 9:16 at 15s",req:true,showIf:f=>f.assetTypes?.includes("Video")},
  {id:"channels",s:10,q:"Which channels will this run on?",t:"channels",req:true},
];

const PLATFORMS=["Instagram","TikTok","X","YouTube","Other"];
const mkRef=()=>({id:Date.now()+Math.random(),type:"url",url:"",file:null,take:[],problem:"",avoid:""});

function useWizard(){
  const [form,setForm]=useState({});
  const [sec,setSec]=useState(1);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const vis=FIELDS.filter(f=>!f.showIf||f.showIf(form));
  const secs=[...new Set(vis.map(f=>f.s))].sort((a,b)=>a-b);
  const cur=vis.filter(f=>f.s===sec);
  const pos=secs.indexOf(sec);
  const prog=secs.length>1?Math.round(pos/(secs.length-1)*100):0;
  const ok=()=>{
    for(const f of cur){
      if(!f.req)continue;
      const v=form[f.id];
      if(f.t==="multi"){if(!Array.isArray(v)||!v.length)return false;if(f.otherKey&&v.includes("Other")&&!form[f.otherKey]?.trim())return false;}
      else if(f.t==="single"){if(!v)return false;if(f.otherKey&&v==="Other"&&!form[f.otherKey]?.trim())return false;}
      else if(f.t==="refs"||f.t==="channels"){}
      else if(!v?.toString().trim())return false;
    }
    return true;
  };
  const isF=pos===0,isL=pos===secs.length-1;
  const next=()=>{if(!isL)setSec(secs[pos+1]);};
  const prev=()=>{if(!isF)setSec(secs[pos-1]);};
  return{form,set,sec,cur,secs,prog,ok,next,prev,isF,isL};
}

const ul=(has)=>({width:"100%",border:"none",borderBottom:`2px solid ${has?C.blue:C.bor}`,outline:"none",background:"transparent",color:C.w,fontSize:"15px",fontFamily:"'DM Sans',sans-serif",padding:"10px 0",caretColor:C.blue});
const Ql=({q,req})=><div style={{fontSize:"13px",fontWeight:"600",color:C.g3,marginBottom:"8px"}}>{q}{req&&<span style={{color:C.lime,marginLeft:"3px"}}>*</span>}</div>;
const Qh=({hint})=>hint?<div style={{fontSize:"11px",color:C.g5,marginBottom:"8px",borderLeft:`2px solid ${C.blue}`,paddingLeft:"8px"}}>{hint}</div>:null;

function OptBtn({label,sel,onClick,multi}){
  return <button type="button" onClick={onClick} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",border:`1.5px solid ${sel?C.lime:C.bor}`,borderRadius:"4px",background:sel?"#D1FF9810":"transparent",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:"5px"}}>
    <div style={{width:"16px",height:"16px",borderRadius:multi?"3px":"50%",flexShrink:0,border:`2px solid ${sel?C.lime:C.g5}`,background:sel?C.lime:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {sel&&<span style={{color:"#0F0F0F",fontSize:"10px",fontWeight:"900"}}>v</span>}
    </div>
    <span style={{fontSize:"13px",color:sel?C.lime:C.w,fontWeight:sel?"600":"400"}}>{label}</span>
  </button>;
}

function InlOther({v,on}){
  return <div style={{marginLeft:"28px",marginBottom:"6px"}}>
    <input value={v||""} onChange={e=>on(e.target.value)} placeholder="Please specify..."
      style={{width:"100%",background:"#1a1a1a",border:`1.5px solid ${C.lime}55`,borderRadius:"3px",color:C.w,fontSize:"13px",padding:"8px 12px",outline:"none"}}/>
  </div>;
}

function RefsField({form,set}){
  const refs=form.references||[];
  const add=()=>set("references",[...refs,mkRef()]);
  const upd=(id,p)=>set("references",refs.map(r=>r.id===id?{...r,...p}:r));
  const del=(id)=>set("references",refs.filter(r=>r.id!==id));
  return <div>
    <Ql q="Reference examples" req={false}/>
    <Qh hint="Optional. Add URLs or file uploads. Each reference has its own compact Q&A."/>
    {refs.map((ref,i)=><div key={ref.id} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"4px",padding:"12px",marginBottom:"8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
        <span style={{fontSize:"11px",color:C.g5,fontFamily:"monospace"}}>REF {i+1}</span>
        <button type="button" onClick={()=>del(ref.id)} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:"11px"}}>x remove</button>
      </div>
      <div style={{display:"flex",gap:"4px",marginBottom:"8px"}}>
        {["url","file"].map(t=><button key={t} type="button" onClick={()=>upd(ref.id,{type:t})} style={{background:ref.type===t?C.lime:"transparent",border:`1px solid ${ref.type===t?C.lime:C.bor}`,color:ref.type===t?"#0F0F0F":C.g3,padding:"4px 10px",borderRadius:"2px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",fontWeight:ref.type===t?"700":"400"}}>{t.toUpperCase()}</button>)}
      </div>
      {ref.type==="url"&&<input value={ref.url} onChange={e=>upd(ref.id,{url:e.target.value})} placeholder="https://..." style={{...ul(!!ref.url),fontSize:"13px",marginBottom:"8px"}}/>}
      {ref.type==="file"&&<label style={{display:"flex",alignItems:"center",gap:"8px",border:`1.5px dashed ${ref.file?C.lime:C.bor}`,borderRadius:"3px",padding:"10px",cursor:"pointer",marginBottom:"8px"}}>
        <span style={{fontSize:"12px",color:ref.file?C.lime:C.g3}}>{ref.file?ref.file.name:"Click to upload (max 10MB)"}</span>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.pptx" onChange={e=>{if(e.target.files[0])upd(ref.id,{file:e.target.files[0]});}} style={{display:"none"}}/>
      </label>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
        <div>
          <div style={{fontSize:"10px",color:C.g5,marginBottom:"4px",fontFamily:"monospace"}}>WHAT TO TAKE</div>
          <select value="" onChange={e=>{if(e.target.value&&!ref.take.includes(e.target.value))upd(ref.id,{take:[...ref.take,e.target.value]});}} style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.g3,fontSize:"11px",padding:"6px",outline:"none",cursor:"pointer"}}>
            <option value="">+ Add...</option>
            {TAKE_OPTS.filter(o=>!ref.take.includes(o)).map(o=><option key={o} value={o}>{o}</option>)}
          </select>
          <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginTop:"4px"}}>
            {ref.take.map(t=><span key={t} onClick={()=>upd(ref.id,{take:ref.take.filter(x=>x!==t)})} style={{background:`${C.lime}22`,color:C.lime,border:`1px solid ${C.lime}44`,borderRadius:"2px",padding:"2px 6px",fontSize:"10px",cursor:"pointer"}}>{t} x</span>)}
          </div>
        </div>
        <div>
          <div style={{fontSize:"10px",color:C.g5,marginBottom:"4px",fontFamily:"monospace"}}>PROBLEM IT SOLVES</div>
          <textarea value={ref.problem} onChange={e=>upd(ref.id,{problem:e.target.value})} placeholder="This works because..." rows={2} style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"6px",outline:"none",resize:"none"}}/>
        </div>
      </div>
      <div style={{marginTop:"6px"}}>
        <div style={{fontSize:"10px",color:C.g5,marginBottom:"4px",fontFamily:"monospace"}}>DO NOT COPY</div>
        <input value={ref.avoid} onChange={e=>upd(ref.id,{avoid:e.target.value})} placeholder="Avoid replicating..." style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"6px",outline:"none"}}/>
      </div>
    </div>)}
    <button type="button" onClick={add} style={{width:"100%",background:"transparent",border:`1.5px dashed ${C.bor}`,color:C.lime,padding:"10px",borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace"}}>+ ADD REFERENCE</button>
  </div>;
}

function ChField({form,set}){
  const ch=form.channels2||{Instagram:[],TikTok:[],X:[],YouTube:[],Other:[]};
  const add=p=>set("channels2",{...ch,[p]:[...ch[p],""]});
  const upd=(p,i,v)=>{const a=[...ch[p]];a[i]=v;set("channels2",{...ch,[p]:a});};
  const del=(p,i)=>set("channels2",{...ch,[p]:ch[p].filter((_,j)=>j!==i)});
  return <div>
    <Ql q="Which channels will this run on?" req={true}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginTop:"6px"}}>
      {PLATFORMS.map(p=><div key={p} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"4px",padding:"10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <span style={{fontSize:"11px",color:C.g5,fontFamily:"monospace"}}>{p.toUpperCase()}</span>
          <button type="button" onClick={()=>add(p)} style={{background:"transparent",border:`1px solid ${C.lime}55`,color:C.lime,padding:"2px 8px",borderRadius:"2px",cursor:"pointer",fontSize:"10px"}}>+ Add</button>
        </div>
        {ch[p].map((h,i)=><div key={i} style={{display:"flex",gap:"4px",marginBottom:"4px"}}>
          <input value={h} onChange={e=>upd(p,i,e.target.value)} placeholder="@handle" style={{flex:1,background:"transparent",border:"none",borderBottom:`1px solid ${C.bor}`,color:C.w,fontSize:"13px",padding:"4px 0",outline:"none"}}/>
          <button type="button" onClick={()=>del(p,i)} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:"11px"}}>x</button>
        </div>)}
        {!ch[p].length&&<div style={{fontSize:"11px",color:C.g7}}>No handles added</div>}
      </div>)}
    </div>
  </div>;
}

function Field({f,form,set}){
  const v=form[f.id];
  const setV=val=>set(f.id,val);
  const tog=opt=>setV(Array.isArray(v)?v.includes(opt)?v.filter(o=>o!==opt):[...v,opt]:[opt]);
  if(f.t==="text")return<><Ql q={f.q} req={f.req}/><Qh hint={f.hint}/><input value={v||""} onChange={e=>setV(e.target.value)} placeholder={f.ph} style={ul(!!v)}/></>;
  if(f.t==="textarea")return<><Ql q={f.q} req={f.req}/><Qh hint={f.hint}/><textarea value={v||""} onChange={e=>setV(e.target.value)} placeholder={f.ph} rows={3} style={{...ul(!!v),resize:"vertical",display:"block",lineHeight:"1.6",paddingTop:"8px"}}/></>;
  if(f.t==="single")return<><Ql q={f.q} req={f.req}/>{f.opts.map(o=><div key={o}><OptBtn label={o} sel={v===o} onClick={()=>setV(o)} multi={false}/>{o==="Other"&&v==="Other"&&f.otherKey&&<InlOther v={form[f.otherKey]} on={val=>set(f.otherKey,val)}/>}</div>)}</>;
  if(f.t==="multi"){const arr=Array.isArray(v)?v:[];return<><Ql q={f.q} req={f.req}/>{f.opts.map(o=><div key={o}><OptBtn label={o} sel={arr.includes(o)} onClick={()=>tog(o)} multi={true}/>{o==="Other"&&arr.includes("Other")&&f.otherKey&&<InlOther v={form[f.otherKey]} on={val=>set(f.otherKey,val)}/>}</div>)}</>;}
  if(f.t==="refs")return<RefsField form={form} set={set}/>;
  if(f.t==="channels")return<ChField form={form} set={set}/>;
  return null;
}

function BriefMe({brief,onClose}){
  const Tag=({l,c=C.lime})=><span style={{background:`${c}18`,border:`1px solid ${c}44`,color:c,padding:"3px 10px",borderRadius:"2px",fontSize:"11px",fontFamily:"monospace"}}>{l}</span>;
  const Sec=({title,children})=><div style={{marginBottom:"40px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",paddingBottom:"12px",borderBottom:`1px solid ${C.bor}`}}>
      <span style={{fontSize:"11px",color:C.lime,fontFamily:"monospace",letterSpacing:"0.12em"}}>{title.toUpperCase()}</span>
    </div>
    {children}
  </div>;
  const objs=Array.isArray(brief.businessObjective)?brief.businessObjective:[brief.businessObjective].filter(Boolean);
  return <div style={{position:"fixed",inset:0,background:C.bg,zIndex:1000,overflowY:"auto",fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{background:"#111",borderBottom:`1px solid ${C.bor}`,padding:"0 40px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
      <span style={{fontSize:"13px",fontWeight:"700",color:C.w}}>{brief.campaignName} <span style={{color:C.lime,fontSize:"11px",fontFamily:"monospace"}}>BRIEF ME</span></span>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={()=>window.print()} style={{background:"transparent",border:`1px solid ${C.lime}55`,color:C.lime,padding:"6px 16px",borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace"}}>Download PDF</button>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.bor}`,color:C.g3,padding:"6px 16px",borderRadius:"3px",cursor:"pointer",fontSize:"11px"}}>Close</button>
      </div>
    </div>
    <div style={{maxWidth:"860px",margin:"0 auto",padding:"48px 40px"}}>
      <div style={{marginBottom:"48px"}}>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"16px"}}>{objs.map(o=><Tag key={o} l={o} c={C.blue}/>)}</div>
        <h1 style={{fontSize:"48px",fontWeight:"800",color:C.w,letterSpacing:"-0.02em",lineHeight:"1.1",marginBottom:"24px"}}>{brief.campaignName}</h1>
        <div style={{background:`${C.blue}15`,borderLeft:`4px solid ${C.blue}`,padding:"20px 24px",borderRadius:"0 4px 4px 0"}}>
          <div style={{fontSize:"10px",color:C.blue,fontFamily:"monospace",letterSpacing:"0.12em",marginBottom:"8px"}}>THE CREATIVE PROBLEM</div>
          <p style={{fontSize:"18px",color:C.w,lineHeight:"1.7",margin:0,fontWeight:"500"}}>{brief.problemStatement}</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"48px"}}>
        {[["DECISION TYPE",brief.decisionType,C.blue],["CONCEPTS",brief.conceptCount,C.lime],["TRUTH SOURCE",brief.productTruthSource==="Other"?brief.productTruthOther:brief.productTruthSource,C.orange]].map(([l,v,c])=>(
          <div key={l} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"18px",textAlign:"center"}}>
            <div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",marginBottom:"6px"}}>{l}</div>
            <div style={{fontSize:"13px",fontWeight:"700",color:c||C.w,lineHeight:"1.3"}}>{v||"—"}</div>
          </div>
        ))}
      </div>
      <Sec title="Audience">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
          <div style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"16px"}}>
            <div style={{fontSize:"10px",color:C.lime,fontFamily:"monospace",marginBottom:"6px"}}>PRIMARY</div>
            <div style={{fontSize:"15px",fontWeight:"700",color:C.w}}>{brief.primaryAudience||"—"}</div>
          </div>
          {brief.secondaryAudience&&<div style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"16px"}}>
            <div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",marginBottom:"6px"}}>SECONDARY</div>
            <div style={{fontSize:"15px",fontWeight:"700",color:C.w}}>{brief.secondaryAudience}</div>
          </div>}
        </div>
        {brief.audienceChallenge&&<div style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"16px"}}>
          <div style={{fontSize:"10px",color:C.orange,fontFamily:"monospace",marginBottom:"6px"}}>AUDIENCE CHALLENGE</div>
          <p style={{color:C.g3,fontSize:"14px",lineHeight:"1.65",margin:0}}>{brief.audienceChallenge}</p>
        </div>}
      </Sec>
      <Sec title="Core Message">
        <div style={{background:`${C.lime}0A`,border:`1px solid ${C.lime}33`,borderRadius:"6px",padding:"20px",marginBottom:"14px"}}>
          <div style={{fontSize:"10px",color:C.lime,fontFamily:"monospace",marginBottom:"8px"}}>PRIMARY MESSAGE</div>
          <p style={{fontSize:"18px",fontWeight:"700",color:C.w,lineHeight:"1.5",margin:0}}>{brief.primaryMessage||"—"}</p>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{(brief.messageTypes||[]).map(t=><Tag key={t} l={t}/>)}</div>
      </Sec>
      <Sec title="Creative Direction">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          <div><div style={{fontSize:"10px",color:C.red,fontFamily:"monospace",marginBottom:"8px"}}>LOCKED</div>
            {(brief.lockedElements||[]).map(e=><div key={e} style={{background:"#2D1010",border:`1px solid ${C.red}33`,borderRadius:"3px",padding:"8px 12px",fontSize:"12px",color:C.g3,marginBottom:"4px"}}>{e}</div>)}</div>
          <div><div style={{fontSize:"10px",color:C.lime,fontFamily:"monospace",marginBottom:"8px"}}>OPEN TO EXPLORE</div>
            {(brief.openForExploration||[]).map(e=><div key={e} style={{background:"#0F2D0F",border:`1px solid ${C.lime}33`,borderRadius:"3px",padding:"8px 12px",fontSize:"12px",color:C.g3,marginBottom:"4px"}}>{e}</div>)}</div>
        </div>
      </Sec>
      <Sec title="Success & Deliverables">
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>{(brief.successCriteria||[]).map(s=><Tag key={s} l={s} c={C.blue}/>)}</div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{(brief.assetTypes||[]).map(a=><Tag key={a} l={a} c={C.orange}/>)}</div>
      </Sec>
      {brief.mustAvoid&&<Sec title="Guardrails">
        <div style={{background:"#1A0A0A",border:`1px solid ${C.red}33`,borderRadius:"6px",padding:"18px"}}>
          <div style={{fontSize:"10px",color:C.red,fontFamily:"monospace",marginBottom:"8px"}}>MUST AVOID</div>
          <p style={{color:C.g3,fontSize:"14px",lineHeight:"1.65",margin:0}}>{brief.mustAvoid}</p>
        </div>
      </Sec>}
      {brief.references?.length>0&&<Sec title="References">
        {brief.references.map((r,i)=><div key={r.id} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"16px",marginBottom:"8px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
          <div>
            <div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",marginBottom:"6px"}}>REF {i+1}</div>
            {r.url&&<a href={r.url} target="_blank" rel="noreferrer" style={{color:"#50A8FF",fontSize:"12px",fontFamily:"monospace",wordBreak:"break-all"}}>{r.url}</a>}
            {r.file&&<span style={{color:C.lime,fontSize:"12px"}}>{r.file.name}</span>}
            {r.take?.length>0&&<div style={{marginTop:"8px",display:"flex",gap:"4px",flexWrap:"wrap"}}>{r.take.map(t=><Tag key={t} l={t} c={"#50A8FF"}/>)}</div>}
          </div>
          <div>
            {r.problem&&<><div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",marginBottom:"4px"}}>SOLVES</div><p style={{color:C.g3,fontSize:"12px",margin:"0 0 8px",lineHeight:"1.5"}}>{r.problem}</p></>}
            {r.avoid&&<><div style={{fontSize:"10px",color:C.red,fontFamily:"monospace",marginBottom:"4px"}}>DO NOT COPY</div><p style={{color:C.g3,fontSize:"12px",margin:0,lineHeight:"1.5"}}>{r.avoid}</p></>}
          </div>
        </div>)}
      </Sec>}
      <div style={{borderTop:`1px solid ${C.bor}`,paddingTop:"20px",display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:"11px",color:C.g5,fontFamily:"monospace"}}>By {brief.requestorName} · {new Date(brief.submittedAt).toLocaleDateString()}</span>
        <span style={{fontSize:"11px",color:C.g5,fontFamily:"monospace"}}>CREATIVE BRIEF TRANSLATOR (CBT)</span>
      </div>
    </div>
  </div>;
}

function WizardView({onSubmit}){
  const w=useWizard();
  const [done,setDone]=useState(false);
  const [brief,setBrief]=useState(null);
  const [vis,setVis]=useState(true);
  const go=fn=>{setVis(false);setTimeout(()=>{fn();setVis(true);},150);};
  const submit=()=>{const b={...w.form,id:Date.now(),submittedAt:new Date().toISOString(),status:"New Brief",clarifications:{}};setBrief(b);setDone(true);onSubmit(b);};
  if(done&&brief)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 59px)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"13px",color:C.g5,fontFamily:"monospace",marginBottom:"8px"}}>{brief.campaignName} — {brief.requestorName}</div>
        <h2 style={{fontSize:"42px",fontWeight:"800",color:C.w,marginBottom:"32px",letterSpacing:"-0.02em"}}>Brief Submitted.</h2>
        <button onClick={()=>onSubmit(brief,true)} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"14px 36px",fontSize:"14px",fontWeight:"700",cursor:"pointer",borderRadius:"3px"}}>View Dashboard</button>
      </div>
    </div>
  );
  return(
    <div style={{display:"flex",minHeight:"calc(100vh - 59px)"}}>
      <div style={{width:"196px",flexShrink:0,background:"#111",borderRight:`1px solid ${C.bor}`,padding:"36px 22px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"monospace",fontSize:"88px",lineHeight:"0.85",color:C.lime,letterSpacing:"-0.03em",userSelect:"none",marginBottom:"14px"}}>{String(w.sec).padStart(2,"0")}</div>
          <div style={{fontSize:"10px",color:C.blue,fontFamily:"monospace",letterSpacing:"0.12em",textTransform:"uppercase"}}>{SNAMES[w.sec]}</div>
        </div>
        <div>
          <div style={{fontSize:"13px",color:C.lime,fontFamily:"monospace",marginBottom:"14px"}}>{w.secs.indexOf(w.sec)+1} <span style={{color:`${C.lime}44`}}>/ {w.secs.length}</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {w.secs.map(s=>{const a=s===w.sec,p=w.secs.indexOf(s)<w.secs.indexOf(w.sec);return(
              <div key={s} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:C.lime,opacity:a?1:p?0.5:0.18}}/>
                <span style={{fontSize:"12px",fontFamily:"monospace",color:a?C.lime:p?`${C.lime}77`:`${C.lime}33`}}>{SNAMES[s]}</span>
              </div>
            );})}
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",maxWidth:"760px"}}>
        <div style={{padding:"22px 44px 18px",borderBottom:`1px solid ${C.bor}`}}>
          <div style={{display:"flex",gap:"4px",marginBottom:"8px"}}>
            {w.secs.map(s=>{const p=w.secs.indexOf(s),cp=w.secs.indexOf(w.sec);return<div key={s} style={{flex:1,height:"3px",borderRadius:"2px",background:p<cp?C.lime:s===w.sec?`${C.lime}55`:C.bor}}/>;})}</div>
          <div style={{fontSize:"11px",fontFamily:"monospace",color:C.g5}}>{Math.round(w.prog)}% COMPLETE</div>
        </div>
        <div style={{flex:1,padding:"36px 44px 24px",overflowY:"auto"}}>
          <div style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"all 0.22s ease"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:C.blue,color:"#fff",padding:"4px 12px",fontSize:"11px",fontFamily:"monospace",marginBottom:"28px",borderRadius:"2px"}}>
              SECTION {w.sec} — {SNAMES[w.sec].toUpperCase()}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"32px"}}>
              {w.cur.map(f=><div key={f.id}><Field f={f} form={w.form} set={w.set}/></div>)}
            </div>
          </div>
        </div>
        <div style={{padding:"18px 44px 28px",borderTop:`1px solid ${C.bor}`,display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>go(w.prev)} disabled={w.isF} style={{background:"transparent",border:`1.5px solid ${w.isF?C.bor:`${C.lime}55`}`,color:w.isF?C.g7:C.lime,padding:"10px 22px",cursor:w.isF?"not-allowed":"pointer",fontSize:"13px",fontWeight:"600",borderRadius:"3px"}}>Back</button>
          {w.isL
            ?<button onClick={submit} disabled={!w.ok()} style={{background:w.ok()?C.lime:C.g7,color:w.ok()?"#0F0F0F":C.g5,border:"none",padding:"12px 32px",fontSize:"14px",fontWeight:"700",cursor:w.ok()?"pointer":"not-allowed",borderRadius:"3px"}}>Submit Brief</button>
            :<button onClick={()=>go(w.next)} disabled={!w.ok()} style={{background:w.ok()?C.lime:C.g7,color:w.ok()?"#0F0F0F":C.g5,border:"none",padding:"12px 28px",fontSize:"14px",fontWeight:"700",cursor:w.ok()?"pointer":"not-allowed",borderRadius:"3px"}}>Continue</button>
          }
        </div>
      </div>
    </div>
  );
}

function StatusToggle({cur,onChange}){
  const [open,setOpen]=useState(false);
  return <div style={{position:"relative"}}>
    <button type="button" onClick={e=>{e.stopPropagation();setOpen(o=>!o);}} style={{background:"transparent",border:`1px solid ${C.bor}`,color:C.g3,padding:"4px 10px",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",display:"flex",alignItems:"center",gap:"5px"}}>
      <span style={{width:"6px",height:"6px",borderRadius:"50%",background:SCOL[cur]||C.g5}}/>{cur} v
    </button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 3px)",right:0,background:"#1A1A1A",border:`1px solid ${C.bor}`,borderRadius:"4px",zIndex:50,minWidth:"160px"}} onClick={e=>e.stopPropagation()}>
      {STATUSES.map(s=><button key={s} type="button" onClick={()=>{onChange(s);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",background:s===cur?`${SCOL[s]}15`:"transparent",border:"none",color:s===cur?SCOL[s]:C.g3,padding:"8px 12px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace",textAlign:"left",borderBottom:`1px solid ${C.bor}`}}>
        <span style={{width:"6px",height:"6px",borderRadius:"50%",background:SCOL[s]}}/>{s}
      </button>)}
    </div>}
  </div>;
}

function BriefDetail({brief,onBack,onUpdate}){
  const [showBM,setShowBM]=useState(false);
  const [clarifs,setClarifs]=useState(brief.clarifications||{});
  const [active,setActive]=useState(null);
  const [draft,setDraft]=useState("");
  const send=(fid)=>{
    if(!draft.trim())return;
    const n={id:Date.now(),q:draft,answered:false,answer:""};
    const up={...clarifs,[fid]:[...(clarifs[fid]||[]),n]};
    setClarifs(up);setActive(null);setDraft("");
    onUpdate({...brief,clarifications:up});
    alert("In production: email sent to " + (brief.requestorName||"brief owner") + " for clarification.");
  };
  const answer=(fid,nid,ans)=>{
    const up={...clarifs,[fid]:(clarifs[fid]||[]).map(n=>n.id===nid?{...n,answered:true,answer:ans}:n)};
    setClarifs(up);onUpdate({...brief,clarifications:up});
  };
  const Cl=({fid})=>{
    const ex=clarifs[fid]||[];
    const open=active===fid;
    return <div style={{marginTop:"6px"}}>
      <button type="button" onClick={()=>{setActive(open?null:fid);setDraft("");}} style={{background:"transparent",border:"none",color:C.orange,cursor:"pointer",fontSize:"11px",fontFamily:"monospace",padding:0}}>
        {open?"cancel":"request clarification"}
      </button>
      {ex.length>0&&<span style={{marginLeft:"10px",fontSize:"10px",color:C.orange,fontFamily:"monospace"}}>{ex.length} question{ex.length>1?"s":""}</span>}
      {open&&<div style={{marginTop:"6px",background:"#1A1000",border:`1px solid ${C.orange}44`,borderRadius:"4px",padding:"10px"}}>
        <div style={{fontSize:"10px",color:C.orange,fontFamily:"monospace",marginBottom:"6px"}}>QUESTION FOR {brief.requestorName?.toUpperCase()}</div>
        <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="What needs clarification?" rows={2} style={{width:"100%",background:"transparent",border:`1px solid ${C.orange}44`,borderRadius:"3px",color:C.w,fontSize:"13px",padding:"7px",outline:"none",resize:"none",marginBottom:"7px"}}/>
        <button type="button" onClick={()=>send(fid)} style={{background:C.orange,color:"#0F0F0F",border:"none",padding:"6px 14px",borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace",fontWeight:"700"}}>SEND + NOTIFY</button>
      </div>}
      {ex.map(n=><div key={n.id} style={{marginTop:"6px",background:"#151500",border:`1px solid ${C.orange}33`,borderRadius:"3px",padding:"10px"}}>
        <div style={{fontSize:"11px",color:C.orange,marginBottom:"4px"}}>Q: {n.q}</div>
        {n.answered?<div style={{fontSize:"11px",color:C.lime}}>A: {n.answer}</div>
        :<div style={{display:"flex",gap:"5px"}}>
          <input id={"ans-"+n.id} placeholder="Enter answer..." style={{flex:1,background:"transparent",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"5px 8px",outline:"none"}}/>
          <button type="button" onClick={()=>answer(fid,n.id,document.getElementById("ans-"+n.id).value)} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"5px 10px",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",fontWeight:"700"}}>OK</button>
        </div>}
      </div>)}
    </div>;
  };
  const R=({label,val,fid})=>{
    if(!val||(Array.isArray(val)&&!val.length))return null;
    return <div style={{marginBottom:"14px",paddingBottom:"14px",borderBottom:`1px solid ${C.bor}`}}>
      <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:"12px"}}>
        <span style={{fontSize:"12px",color:C.g5,fontFamily:"monospace"}}>{label}</span>
        <span style={{fontSize:"13px",color:C.g3,lineHeight:"1.65"}}>{Array.isArray(val)?val.join(", "):val}</span>
      </div>
      {fid&&<div style={{paddingLeft:"202px"}}><Cl fid={fid}/></div>}
    </div>;
  };
  const S=({t,children})=><div style={{marginBottom:"32px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
      <div style={{width:"20px",height:"2px",background:C.lime}}/>
      <span style={{fontSize:"11px",color:C.lime,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase"}}>{t}</span>
    </div>
    {children}
  </div>;
  return <>
    {showBM&&<BriefMe brief={brief} onClose={()=>setShowBM(false)}/>}
    <div style={{maxWidth:"800px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.lime,cursor:"pointer",fontSize:"12px",fontFamily:"monospace"}}>Back to All Briefs</button>
        <button onClick={()=>setShowBM(true)} style={{background:C.blue,color:"#fff",border:"none",padding:"9px 20px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace",fontWeight:"700"}}>BRIEF ME</button>
      </div>
      <div style={{borderBottom:`1px solid ${C.bor}`,paddingBottom:"20px",marginBottom:"28px"}}>
        <h1 style={{fontSize:"32px",fontWeight:"800",color:C.w,letterSpacing:"-0.01em",marginBottom:"6px"}}>{brief.campaignName}</h1>
        <p style={{color:C.g5,fontSize:"12px",fontFamily:"monospace"}}>Submitted by {brief.requestorName} · {new Date(brief.submittedAt).toLocaleString()}</p>
      </div>
      <div style={{background:`${C.blue}12`,borderLeft:`4px solid ${C.blue}`,padding:"18px 22px",marginBottom:"32px",borderRadius:"0 4px 4px 0"}}>
        <div style={{fontSize:"10px",color:C.blue,fontFamily:"monospace",marginBottom:"6px"}}>THE CREATIVE PROBLEM</div>
        <p style={{fontSize:"16px",color:C.w,lineHeight:"1.7",margin:0,fontWeight:"500"}}>{brief.problemStatement}</p>
        <Cl fid="problemStatement"/>
      </div>
      <S t="Ownership"><R label="Brief Owner" val={brief.briefOwner} fid="briefOwner"/><R label="Decision Maker" val={brief.creativeDecisionMaker} fid="creativeDecisionMaker"/></S>
      <S t="Objective"><R label="Business Objective" val={brief.businessObjective} fid="businessObjective"/></S>
      <S t="Decision Scope"><R label="Decision Needed" val={brief.decisionType} fid="decisionType"/><R label="Concepts Expected" val={brief.conceptCount}/></S>
      <S t="Audience"><R label="Primary" val={brief.primaryAudience} fid="primaryAudience"/><R label="Secondary" val={brief.secondaryAudience}/><R label="Challenge" val={brief.audienceChallenge} fid="audienceChallenge"/></S>
      <S t="Core Message"><R label="Primary Message" val={brief.primaryMessage} fid="primaryMessage"/><R label="Message Type" val={brief.messageTypes} fid="messageTypes"/><R label="Product Truth" val={brief.productTruthSource==="Other"?brief.productTruthOther:brief.productTruthSource} fid="productTruthSource"/></S>
      {brief.references?.length>0&&<S t="References">{brief.references.map((r,i)=><div key={r.id} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"4px",padding:"12px",marginBottom:"8px"}}>
        <div style={{fontSize:"11px",color:C.g5,fontFamily:"monospace",marginBottom:"4px"}}>REF {i+1}</div>
        {r.url&&<a href={r.url} target="_blank" rel="noreferrer" style={{color:"#50A8FF",fontSize:"12px",fontFamily:"monospace"}}>{r.url}</a>}
        {r.file&&<span style={{color:C.lime,fontSize:"12px"}}>{r.file.name}</span>}
        {r.take?.length>0&&<div style={{marginTop:"4px",fontSize:"11px",color:C.g3}}>{r.take.join(", ")}</div>}
        {r.problem&&<div style={{marginTop:"4px",fontSize:"11px",color:C.g3}}>Solves: {r.problem}</div>}
      </div>)}</S>}
      <S t="Direction"><R label="Locked" val={brief.lockedElements} fid="lockedElements"/><R label="Open" val={brief.openForExploration} fid="openForExploration"/></S>
      <S t="Guardrails"><R label="Must Include" val={brief.finalMustInclude} fid="finalMustInclude"/><R label="Must Avoid" val={brief.mustAvoid} fid="mustAvoid"/></S>
      <S t="Success Criteria"><R label="Evaluated by" val={brief.successCriteria} fid="successCriteria"/></S>
      <S t="Deliverables"><R label="Assets" val={brief.assetTypes} fid="assetTypes"/><R label="Static Sizes" val={brief.staticSizes}/><R label="Video Sizes" val={brief.videoSizes}/></S>
    </div>
  </>;
}

function Dashboard({briefs,onNew,onView,onStatus}){
  const cnt=s=>briefs.filter(b=>b.status===s).length;
  const stats=[["New Briefs","New Brief",C.lime],["In Progress","In Progress",C.blue],["Needs Clarification","Needs Clarification",C.orange],["Closed","Closed",C.g5]];
  return <div style={{maxWidth:"900px",margin:"0 auto"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"32px"}}>
      {stats.map(([l,k,c])=><div key={k} style={{background:C.sur,border:`1.5px solid ${C.bor}`,borderRadius:"4px",padding:"18px 20px"}}>
        <div style={{fontSize:"26px",fontWeight:"800",color:c,marginBottom:"4px"}}>{cnt(k)}</div>
        <div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.08em"}}>{l.toUpperCase()}</div>
      </div>)}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <h2 style={{fontSize:"18px",fontWeight:"700",color:C.w}}>All Briefs</h2>
      <button onClick={onNew} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"10px 22px",fontSize:"13px",fontWeight:"700",cursor:"pointer",borderRadius:"3px"}}>+ New Brief</button>
    </div>
    {briefs.length===0?<div style={{border:`2px dashed ${C.bor}`,borderRadius:"4px",padding:"80px",textAlign:"center"}}>
      <div style={{fontSize:"36px",marginBottom:"12px"}}>📋</div>
      <p style={{color:C.g5,fontSize:"13px",fontFamily:"monospace",marginBottom:"20px"}}>No briefs yet.</p>
      <button onClick={onNew} style={{background:"transparent",border:`1.5px solid ${C.lime}`,color:C.lime,padding:"10px 24px",cursor:"pointer",fontSize:"13px",fontWeight:"600",borderRadius:"3px"}}>Start a Brief</button>
    </div>
    :<div style={{display:"grid",gap:"8px"}}>
      {briefs.map(b=>{
        const obj=Array.isArray(b.businessObjective)?b.businessObjective.join(", "):b.businessObjective;
        return <div key={b.id} style={{background:C.sur,border:`1.5px solid ${C.bor}`,borderRadius:"4px",padding:"18px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px",marginBottom:"6px"}}>
            <div style={{cursor:"pointer",flex:1}} onClick={()=>onView(b)}>
              <div style={{fontSize:"16px",fontWeight:"700",color:C.w,marginBottom:"2px"}}>{b.campaignName}</div>
              <span style={{color:C.lime,fontSize:"11px",fontFamily:"monospace"}}>{obj?.toUpperCase()}</span>
            </div>
            <StatusToggle cur={b.status||"New Brief"} onChange={s=>onStatus(b.id,s)}/>
          </div>
          <p onClick={()=>onView(b)} style={{fontSize:"12px",color:C.g3,lineHeight:"1.55",margin:"8px 0 12px",cursor:"pointer"}}>{b.problemStatement?.slice(0,130)}{b.problemStatement?.length>130?"...":""}</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{b.assetTypes?.slice(0,4).map(a=><span key={a} style={{background:C.g7,color:C.g3,padding:"2px 7px",fontSize:"10px",fontFamily:"monospace",borderRadius:"2px"}}>{a}</span>)}</div>
            <span style={{fontSize:"10px",color:C.g5,fontFamily:"monospace"}}>{new Date(b.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

export default function App(){
  const [screen,setScreen]=useState("form");
  const [briefs,setBriefs]=useState([]);
  const [sel,setSel]=useState(null);
  const submit=(b,dash)=>{setBriefs(p=>p.find(x=>x.id===b.id)?p:[b,...p]);if(dash){setScreen("dashboard");setSel(null);}};
  const onStatus=(id,s)=>setBriefs(p=>p.map(b=>b.id===id?{...b,status:s}:b));
  const onUpdate=u=>{setBriefs(p=>p.map(b=>b.id===u.id?u:b));setSel(u);};
  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;} body{background:#0F0F0F;}
      ::placeholder{color:#444;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
      button:hover:not(:disabled){opacity:0.82;} select option{background:#1A1A1A;color:#F5F5F5;}
      @media print{header,nav{display:none!important;}}
    `}</style>
    <div style={{minHeight:"100vh",background:C.bg,color:C.w,fontFamily:"'DM Sans',sans-serif"}}>
      <header style={{background:"#111",borderBottom:`1px solid ${C.bor}`,height:"52px",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px",width:"14px",height:"14px"}}>
            <div style={{background:"#F35325",borderRadius:"1px"}}/><div style={{background:"#81BC06",borderRadius:"1px"}}/>
            <div style={{background:"#05A6F0",borderRadius:"1px"}}/><div style={{background:"#FFBA08",borderRadius:"1px"}}/>
          </div>
          <div style={{width:"1px",height:"16px",background:C.bor}}/>
          <span style={{fontSize:"12px",fontWeight:"600",color:C.g3,letterSpacing:"0.1em",fontFamily:"monospace"}}>
            CREATIVE BRIEF TRANSLATOR <span style={{color:C.lime}}>(CBT)</span>
          </span>
        </div>
        <nav style={{display:"flex",gap:"2px"}}>
          {[["form","New Brief"],["dashboard","Dashboard"]].map(([id,l])=>(
            <button key={id} onClick={()=>{setScreen(id);setSel(null);}} style={{background:screen===id?C.lime:"transparent",border:"none",color:screen===id?"#0F0F0F":C.lime,padding:"6px 14px",cursor:"pointer",fontFamily:"monospace",fontSize:"11px",letterSpacing:"0.08em",fontWeight:screen===id?"700":"400",borderRadius:"3px"}}>{l.toUpperCase()}</button>
          ))}
        </nav>
      </header>
      <div style={{height:"3px",background:`linear-gradient(90deg,${C.blue},#50A8FF,${C.blue})`}}/>
      <div style={{minHeight:"calc(100vh - 55px)"}}>
        {screen==="form"&&<WizardView onSubmit={submit}/>}
        {screen==="dashboard"&&!sel&&<div style={{padding:"44px 36px"}}><Dashboard briefs={briefs} onNew={()=>setScreen("form")} onView={b=>setSel(b)} onStatus={onStatus}/></div>}
        {screen==="dashboard"&&sel&&<div style={{padding:"44px 36px"}}><BriefDetail brief={sel} onBack={()=>setSel(null)} onUpdate={onUpdate}/></div>}
      </div>
    </div>
  </>;
}
