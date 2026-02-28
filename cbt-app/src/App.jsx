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

const ul=(has)=>({width:"100%",border:"none",borderBottom:`2px solid ${has?C.blue:C.bor}`,outline:"none",background:"transparent",color:C.w,fontSize:"17px",fontFamily:"'DM Sans',sans-serif",padding:"12px 0",caretColor:C.blue});
const Ql=({q,req})=><div style={{fontSize:"15px",fontWeight:"600",color:C.g3,marginBottom:"10px"}}>{q}{req&&<span style={{color:C.lime,marginLeft:"3px"}}>*</span>}</div>;
const Qh=({hint})=>hint?<div style={{fontSize:"12px",color:C.g5,marginBottom:"10px",borderLeft:`2px solid ${C.blue}`,paddingLeft:"10px"}}>{hint}</div>:null;

function OptBtn({label,sel,onClick,multi}){
  return <button type="button" onClick={onClick} style={{display:"flex",alignItems:"center",gap:"14px",padding:"13px 18px",border:`1.5px solid ${sel?C.lime:C.bor}`,borderRadius:"4px",background:sel?"#D1FF9810":"transparent",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:"7px"}}>
    <div style={{width:"18px",height:"18px",borderRadius:multi?"3px":"50%",flexShrink:0,border:`2px solid ${sel?C.lime:C.g5}`,background:sel?C.lime:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {sel&&<span style={{color:"#0F0F0F",fontSize:"11px",fontWeight:"900"}}>v</span>}
    </div>
    <span style={{fontSize:"15px",color:sel?C.lime:C.w,fontWeight:sel?"600":"400"}}>{label}</span>
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

function openBriefMeTab(brief){
  const refs=brief.references||[];
  const objs=Array.isArray(brief.businessObjective)?brief.businessObjective:[brief.businessObjective].filter(Boolean);

  // Build reference cards HTML - try to embed images for URLs
  const refCards=refs.map((r,i)=>{
    const imgSection = r.type==="url" && r.url
      ? `<div style="background:#f0f0f0;border-radius:8px;overflow:hidden;margin-bottom:16px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;position:relative;">
           <img src="https://api.microlink.io/?url=${encodeURIComponent(r.url)}&screenshot=true&meta=false&embed=screenshot.url" 
                style="width:100%;height:100%;object-fit:cover;border-radius:8px;" 
                onerror="this.parentElement.innerHTML='<a href=\\'${r.url.replace(/'/g,"&#39;")}\\'  target=\\'_blank\\' style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-decoration:none;color:#0078D4;font-size:13px;font-family:monospace;padding:16px;text-align:center;word-break:break-all;\\'>${r.url}</a>'"/>
         </div>`
      : r.file ? `<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:8px;padding:24px;margin-bottom:16px;display:flex;align-items:center;gap:12px;aspect-ratio:16/9;justify-content:center;">
           <span style="font-size:40px;">📎</span><span style="color:#D1FF98;font-family:monospace;font-size:13px;">${r.file.name||"Uploaded file"}</span>
         </div>` : "";

    const tags=(r.take||[]).map(t=>`<span style="background:#0078D415;border:1px solid #0078D455;color:#0078D4;padding:3px 10px;border-radius:20px;font-size:11px;font-family:monospace;">${t}</span>`).join(" ");
    return `
      <div style="break-inside:avoid;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-bottom:28px;">
        <div style="padding:20px 24px 0;">${imgSection}</div>
        <div style="padding:16px 24px 24px;">
          <div style="font-size:11px;color:#999;font-family:monospace;letter-spacing:0.1em;margin-bottom:10px;">REFERENCE ${i+1}</div>
          ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">${tags}</div>` : ""}
          ${r.problem?`<div style="margin-bottom:10px;"><div style="font-size:10px;color:#999;font-family:monospace;letter-spacing:0.08em;margin-bottom:4px;">SOLVES</div><p style="font-size:14px;color:#333;line-height:1.6;margin:0;">${r.problem}</p></div>`:""}
          ${r.avoid?`<div><div style="font-size:10px;color:#FF6B6B;font-family:monospace;letter-spacing:0.08em;margin-bottom:4px;">DO NOT COPY</div><p style="font-size:13px;color:#666;line-height:1.6;margin:0;">${r.avoid}</p></div>`:""}
          ${r.url?`<a href="${r.url}" target="_blank" style="display:inline-block;margin-top:12px;font-size:11px;color:#0078D4;font-family:monospace;word-break:break-all;">${r.url}</a>`:""}
        </div>
      </div>`;
  }).join("");

  const locked=(brief.lockedElements||[]).map(e=>`<div style="background:#fff0f0;border:1px solid #ffcccc;border-radius:8px;padding:10px 14px;font-size:13px;color:#cc4444;margin-bottom:6px;">🔒 ${e}</div>`).join("");
  const open=(brief.openForExploration||[]).map(e=>`<div style="background:#f0fff4;border:1px solid #b2f5c8;border-radius:8px;padding:10px 14px;font-size:13px;color:#2d7d4f;margin-bottom:6px;">✦ ${e}</div>`).join("");
  const criteria=(brief.successCriteria||[]).map(s=>`<div style="background:#f5f5ff;border:1px solid #d0d0ff;border-radius:8px;padding:10px 14px;font-size:13px;color:#5555cc;margin-bottom:6px;">${s}</div>`).join("");
  const assets=(brief.assetTypes||[]).map(a=>`<span style="background:#0078D415;border:1px solid #0078D455;color:#0078D4;padding:5px 14px;border-radius:20px;font-size:12px;font-family:monospace;">${a}</span>`).join(" ");
  const objTags=objs.map(o=>`<span style="background:#D1FF9820;border:1px solid #D1FF9866;color:#2a6a00;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;">${o}</span>`).join(" ");

  const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${brief.campaignName} — Brief Me</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#F4F3EF;color:#1a1a1a;-webkit-print-color-adjust:exact;}
  .page{max-width:900px;margin:0 auto;padding:40px 32px 80px;}
  .pill{display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:600;}
  @media print{.no-print{display:none!important;}body{background:white;}}
</style>
</head>
<body>
<div class="no-print" style="background:#0F0F0F;padding:12px 32px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;">
  <span style="color:#D1FF98;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.1em;">BRIEF ME — ${brief.campaignName}</span>
  <button onclick="window.print()" style="background:#D1FF98;color:#0F0F0F;border:none;padding:8px 20px;border-radius:4px;cursor:pointer;font-weight:700;font-size:12px;font-family:'DM Mono',monospace;">DOWNLOAD PDF</button>
</div>
<div class="page">

  <!-- HERO -->
  <div style="background:linear-gradient(135deg,#0F0F0F 0%,#0d2340 100%);border-radius:24px;padding:56px 52px;margin-bottom:32px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-60px;right:-60px;width:280px;height:280px;background:#D1FF9812;border-radius:50%;"></div>
    <div style="position:absolute;bottom:-40px;left:-40px;width:180px;height:180px;background:#0078D408;border-radius:50%;"></div>
    <div style="position:relative;">
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">${objTags}</div>
      <h1 style="font-size:clamp(32px,5vw,52px);font-weight:800;color:white;line-height:1.1;letter-spacing:-0.02em;margin-bottom:28px;">${brief.campaignName}</h1>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-left:4px solid #0078D4;border-radius:0 12px 12px 0;padding:20px 24px;">
        <div style="font-size:10px;color:#50A8FF;font-family:'DM Mono',monospace;letter-spacing:0.14em;margin-bottom:8px;">THE CREATIVE PROBLEM</div>
        <p style="font-size:18px;color:rgba(255,255,255,0.92);line-height:1.7;font-weight:400;">${brief.problemStatement||""}</p>
      </div>
    </div>
  </div>

  <!-- STATS ROW -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
    ${[["DECISION TYPE",brief.decisionType,"#0078D4"],["CONCEPTS EXPECTED",brief.conceptCount,"#D1FF98"],["PRODUCT TRUTH SOURCE",brief.productTruthSource==="Other"?brief.productTruthOther:brief.productTruthSource,"#FF8C00"]].map(([l,v,c])=>`
    <div style="background:white;border-radius:16px;padding:22px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">${l}</div>
      <div style="font-size:15px;font-weight:700;color:${c};line-height:1.3;">${v||"—"}</div>
    </div>`).join("")}
  </div>

  <!-- AUDIENCE -->
  <div style="background:white;border-radius:20px;padding:36px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="font-size:11px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #eee;">AUDIENCE</div>
    <div style="display:grid;grid-template-columns:${brief.secondaryAudience?"1fr 1fr":"1fr"};gap:20px;margin-bottom:${brief.audienceChallenge?"20px":"0"}">
      <div style="background:linear-gradient(135deg,#D1FF9815,#D1FF9830);border:1px solid #D1FF9866;border-radius:12px;padding:20px;">
        <div style="font-size:10px;color:#2a6a00;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">PRIMARY</div>
        <div style="font-size:18px;font-weight:700;color:#1a1a1a;">${brief.primaryAudience||"—"}</div>
      </div>
      ${brief.secondaryAudience?`<div style="background:#f8f8f8;border:1px solid #eee;border-radius:12px;padding:20px;"><div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">SECONDARY</div><div style="font-size:18px;font-weight:700;color:#1a1a1a;">${brief.secondaryAudience}</div></div>`:""}
    </div>
    ${brief.audienceChallenge?`<div style="background:#fff8f0;border:1px solid #ffe0b2;border-radius:12px;padding:20px;"><div style="font-size:10px;color:#FF8C00;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">AUDIENCE CHALLENGE</div><p style="font-size:14px;color:#444;line-height:1.7;">${brief.audienceChallenge}</p></div>`:""}
  </div>

  <!-- PRIMARY MESSAGE -->
  <div style="background:linear-gradient(135deg,#0F0F0F,#111827);border-radius:20px;padding:40px;margin-bottom:24px;">
    <div style="font-size:10px;color:#D1FF98;font-family:'DM Mono',monospace;letter-spacing:0.14em;margin-bottom:14px;">PRIMARY MESSAGE</div>
    <p style="font-size:24px;font-weight:700;color:white;line-height:1.5;">${brief.primaryMessage||"—"}</p>
    ${(brief.messageTypes||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:20px;">${(brief.messageTypes||[]).map(t=>`<span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.8);padding:5px 14px;border-radius:20px;font-size:12px;">${t}</span>`).join("")}</div>`:""}
  </div>

  <!-- DIRECTION: LOCKED vs OPEN -->
  ${(brief.lockedElements?.length||brief.openForExploration?.length)?`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#cc4444;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #ffcccc;">LOCKED IN</div>
      ${locked}
    </div>
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#2d7d4f;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #b2f5c8;">OPEN TO EXPLORE</div>
      ${open}
    </div>
  </div>`:""}

  <!-- GUARDRAILS -->
  ${brief.mustAvoid?`
  <div style="background:#fff0f0;border:1px solid #ffcccc;border-radius:20px;padding:28px;margin-bottom:24px;">
    <div style="font-size:10px;color:#cc4444;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:12px;">MUST AVOID</div>
    <p style="font-size:15px;color:#551a1a;line-height:1.7;">${brief.mustAvoid}</p>
  </div>`:""}

  <!-- SUCCESS + DELIVERABLES -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #eee;">SUCCESS CRITERIA</div>
      ${criteria||"<p style='color:#ccc;font-size:13px;'>None specified</p>"}
    </div>
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #eee;">ASSET TYPES</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${assets||"<p style='color:#ccc;font-size:13px;'>None specified</p>"}</div>
      ${brief.staticSizes?`<div style="margin-top:14px;font-size:12px;color:#666;">Static: ${brief.staticSizes}</div>`:""}
      ${brief.videoSizes?`<div style="margin-top:6px;font-size:12px;color:#666;">Video: ${brief.videoSizes}</div>`:""}
    </div>
  </div>

  <!-- REFERENCES -->
  ${refs.length?`
  <div style="margin-bottom:24px;">
    <div style="font-size:11px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #eee;">REFERENCE EXAMPLES</div>
    <div style="display:grid;grid-template-columns:repeat(${refs.length===1?"1":"2"},1fr);gap:20px;">
      ${refCards}
    </div>
  </div>`:""}

  <!-- FOOTER -->
  <div style="border-top:1px solid #ddd;padding-top:20px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;color:#999;font-family:'DM Mono',monospace;">Submitted by ${brief.requestorName||""} · ${new Date(brief.submittedAt).toLocaleDateString()}</span>
    <span style="font-size:11px;color:#ccc;font-family:'DM Mono',monospace;">CREATIVE BRIEF TRANSLATOR (CBT)</span>
  </div>
</div>
</body>
</html>`;

  const blob=new Blob([html],{type:"text/html"});
  const url=URL.createObjectURL(blob);
  window.open(url,"_blank");
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
        <div style={{fontSize:"15px",color:C.g5,fontFamily:"monospace",marginBottom:"10px"}}>{brief.campaignName} — {brief.requestorName}</div>
        <h2 style={{fontSize:"52px",fontWeight:"800",color:C.w,marginBottom:"36px",letterSpacing:"-0.02em"}}>Brief Submitted.</h2>
        <button onClick={()=>onSubmit(brief,true)} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"16px 44px",fontSize:"16px",fontWeight:"700",cursor:"pointer",borderRadius:"3px"}}>View Dashboard</button>
      </div>
    </div>
  );
  return(
    <div style={{display:"flex",minHeight:"calc(100vh - 59px)"}}>
      {/* Sidebar */}
      <div style={{width:"220px",flexShrink:0,background:"#111",borderRight:`1px solid ${C.bor}`,padding:"40px 24px",display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"monospace",fontSize:"96px",lineHeight:"0.85",color:C.lime,letterSpacing:"-0.03em",userSelect:"none",marginBottom:"10px"}}>{String(w.sec).padStart(2,"0")}</div>
          <div style={{fontSize:"11px",color:C.blue,fontFamily:"monospace",letterSpacing:"0.14em",textTransform:"uppercase",textAlign:"center"}}>{SNAMES[w.sec]}</div>
        </div>
        <div>
          <div style={{fontSize:"13px",color:C.lime,fontFamily:"monospace",marginBottom:"16px",textAlign:"center"}}>{w.secs.indexOf(w.sec)+1} <span style={{color:`${C.lime}44`}}>/ {w.secs.length}</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
            {w.secs.map(s=>{const a=s===w.sec,p=w.secs.indexOf(s)<w.secs.indexOf(w.sec);return(
              <div key={s} style={{display:"flex",alignItems:"center",gap:"9px"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",flexShrink:0,background:C.lime,opacity:a?1:p?0.5:0.18}}/>
                <span style={{fontSize:"12px",fontFamily:"monospace",color:a?C.lime:p?`${C.lime}77`:`${C.lime}33`,whiteSpace:"nowrap"}}>{SNAMES[s]}</span>
              </div>
            );})}
          </div>
        </div>
      </div>
      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"24px 60px 20px",borderBottom:`1px solid ${C.bor}`}}>
          <div style={{display:"flex",gap:"5px",marginBottom:"10px"}}>
            {w.secs.map(s=>{const p=w.secs.indexOf(s),cp=w.secs.indexOf(w.sec);return<div key={s} style={{flex:1,height:"3px",borderRadius:"2px",background:p<cp?C.lime:s===w.sec?`${C.lime}55`:C.bor}}/>;})}</div>
          <div style={{fontSize:"12px",fontFamily:"monospace",color:C.g5}}>{Math.round(w.prog)}% COMPLETE</div>
        </div>
        <div style={{flex:1,padding:"48px 60px 28px",overflowY:"auto"}}>
          <div style={{maxWidth:"720px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"all 0.22s ease"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:C.blue,color:"#fff",padding:"5px 14px",fontSize:"12px",fontFamily:"monospace",marginBottom:"36px",borderRadius:"2px"}}>
              SECTION {w.sec} — {SNAMES[w.sec].toUpperCase()}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"44px"}}>
              {w.cur.map(f=><div key={f.id}><Field f={f} form={w.form} set={w.set}/></div>)}
            </div>
          </div>
        </div>
        <div style={{padding:"22px 60px 36px",borderTop:`1px solid ${C.bor}`,display:"flex",justifyContent:"space-between",maxWidth:"840px"}}>
          <button onClick={()=>go(w.prev)} disabled={w.isF} style={{background:"transparent",border:`1.5px solid ${w.isF?C.bor:`${C.lime}55`}`,color:w.isF?C.g7:C.lime,padding:"13px 28px",cursor:w.isF?"not-allowed":"pointer",fontSize:"15px",fontWeight:"600",borderRadius:"3px"}}>Back</button>
          {w.isL
            ?<button onClick={submit} disabled={!w.ok()} style={{background:w.ok()?C.lime:C.g7,color:w.ok()?"#0F0F0F":C.g5,border:"none",padding:"14px 40px",fontSize:"16px",fontWeight:"700",cursor:w.ok()?"pointer":"not-allowed",borderRadius:"3px"}}>Submit Brief</button>
            :<button onClick={()=>go(w.next)} disabled={!w.ok()} style={{background:w.ok()?C.lime:C.g7,color:w.ok()?"#0F0F0F":C.g5,border:"none",padding:"14px 36px",fontSize:"16px",fontWeight:"700",cursor:w.ok()?"pointer":"not-allowed",borderRadius:"3px"}}>Continue</button>
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
    <div style={{maxWidth:"800px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.lime,cursor:"pointer",fontSize:"12px",fontFamily:"monospace"}}>Back to All Briefs</button>
        <button onClick={()=>openBriefMeTab(brief)} style={{background:C.blue,color:"#fff",border:"none",padding:"9px 20px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace",fontWeight:"700"}}>BRIEF ME</button>
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
