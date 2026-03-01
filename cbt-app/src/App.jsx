import { useState, useMemo, useEffect } from "react";

const C = {
  bg:"#0F0F0F",sur:"#1A1A1A",bor:"#2E2E2E",
  blue:"#0078D4",lime:"#D1FF98",orange:"#FF8C00",
  w:"#F5F5F5",g3:"#A0A0A0",g5:"#666",g7:"#333",
  red:"#FF6B6B",green:"#4CAF82",gold:"#FFD700"
};
const STATUSES=["New Brief","In Progress","Needs Clarification","Closed"];
const SCOL={"New Brief":C.lime,"In Progress":C.blue,"Needs Clarification":C.orange,"Closed":C.g5};
const SNAMES=["","Ownership","Objective","Scope","Audience","Message","References","Direction","Guardrails","Criteria","Deliverables"];
const LIKE_OPTS=["First-frame clarity","Pacing","Visual hierarchy","Tone","Emotional payoff","Simplicity","Other"];

/* ─── CAMPAIGN TYPE OPTIONS ─── */
const CAMPAIGN_TYPE_OPTS = [
  { value:"Growth Campaign", desc:"Always‑on or time‑bound marketing designed to drive usage, adoption, or behavior change." },
  { value:"ABS", desc:"Targeted campaign tailored to specific accounts, segments, or customer cohorts." },
  { value:"Brand Campaign", desc:"Top‑of‑funnel work focused on brand perception, narrative, or emotional connection." },
  { value:"Product Launch / Release", desc:"Creative supporting a new product, feature, or major update going GA." },
  { value:"Seasonal / Moment‑Based Campaign", desc:"Time‑bound work tied to calendar moments like tax season, back‑to‑school, holidays." },
  { value:"Lifecycle / Retention Campaign", desc:"Messaging aimed at onboarding, re‑engagement, or increasing depth of usage." },
  { value:"Experiment / Test‑and‑Learn", desc:"Creative designed for learning, iteration, or performance testing over polish." },
  { value:"Integrated Campaign", desc:"Cross‑channel system spanning multiple placements, formats, and phases." },
  { value:"Internal / Enablement Campaign", desc:"Creative supporting internal teams, sales enablement, or education." },
  { value:"Other", desc:"" },
];

/* ─── EXISTING ASSETS LOGIC ─── */
// Show "Existing assets" section if campaign type is one of these:
const SHOW_ASSETS_TYPES = ["ABS","Lifecycle / Retention Campaign","Integrated Campaign","Iteration on existing work","Support existing campaign"];
// Optional toggle for these:
const OPTIONAL_ASSETS_TYPES = ["Seasonal / Moment‑Based Campaign"];
// Do NOT show for these:
const HIDE_ASSETS_TYPES = ["Brand Campaign","Product Launch / Release","Experiment / Test‑and‑Learn","Internal / Enablement Campaign"];

function showExistingAssets(campaignType) {
  if (!campaignType || campaignType === "Other") return null;
  if (SHOW_ASSETS_TYPES.includes(campaignType)) return "required";
  if (OPTIONAL_ASSETS_TYPES.includes(campaignType)) return "optional";
  if (HIDE_ASSETS_TYPES.includes(campaignType)) return null;
  return null;
}

/* ─── SUCCESS CRITERIA OPTIONS ─── */
const SUCCESS_CRITERIA_OPTS = [
  { value:"Clear value proposition", desc:"The audience immediately understands what this is and why it matters." },
  { value:"On‑brand and recognizable", desc:"Feels unmistakably Microsoft / aligned to the intended brand system." },
  { value:"Audience‑relevant", desc:"Resonates with the defined audience's needs, context, and mindset." },
  { value:"Simple and scannable", desc:"Works quickly; no over‑explaining." },
  { value:"Distinctive / ownable", desc:"Doesn't look generic or interchangeable with competitors." },
  { value:"Emotionally engaging", desc:"Creates confidence, momentum, curiosity, or reassurance." },
  { value:"Product truth is clear", desc:"Accurately reflects what the product actually does." },
  { value:"Flexible across placements", desc:"Can scale across formats, channels, or variations." },
  { value:"Supports the larger campaign/system", desc:"Fits into a broader narrative or design system." },
  { value:"Other", desc:"" },
];

/* ─── VIDEO DURATION + PURPOSE OPTIONS ─── */
const VIDEO_DURATION_OPTS = ["6s","15s","30s","60s","90s+","Multiple durations"];
const VIDEO_PURPOSE_OPTS  = [
  { value:"Concept exploration", desc:"For ideation and creative review only — not final production." },
  { value:"Final production",    desc:"Intended for live use across channels." },
];

/* ─── SENSITIVE CONSTRAINTS OPTIONS ─── */
const SENSITIVE_CONSTRAINT_OPTS = [
  { value:"Legal review required",       desc:"Creative must go through legal approval before use." },
  { value:"Regulatory / compliance",     desc:"Subject to industry, regional, or platform compliance rules." },
  { value:"Reputational sensitivity",    desc:"Topic requires extra care around brand or public perception." },
  { value:"None of the above",           desc:"No sensitive constraints apply to this brief." },
];

const FIELDS=[
  {id:"requestorName",s:1,q:"Who is submitting this brief?",t:"text",ph:"Your full name",req:true},
  {id:"requestorEmail",s:1,q:"Email address",t:"text",ph:"your@email.com",req:true},
  {id:"campaignName",s:1,q:"Campaign / Project Name",t:"text",ph:"e.g. Surface Pro Q3 Launch",req:true},
  {id:"campaignType",s:1,q:"Campaign Type",t:"campaignType",req:true},
  {id:"businessObjective",s:2,q:"Primary business objective?",t:"multi",req:true,opts:["Increase understanding","Change perception","Drive action","Support existing campaign","Other"],otherKey:"businessObjectiveOther"},
  {id:"problemStatement",s:2,q:"The Creative Request",t:"textarea",ph:"What gap, barrier, or tension are we resolving?",req:true},
  {id:"decisionType",s:3,q:"What decision is needed from Design?",t:"single",req:true,opts:["Exploratory concepts","Single recommended direction","Iteration on existing work","Execution of pre-approved direction","Resize / adapt existing assets"]},
  {id:"conceptCount",s:3,q:"How many concepts are expected?",t:"single",req:true,opts:["1 strong direction","2-3 distinct approaches","Iterations on 1 existing concept","Align in review"]},
  {id:"primaryAudience",s:4,q:"Who is the primary audience?",t:"text",ph:"e.g. SMB IT decision-makers, 35-54",req:true},
  {id:"audienceType",s:4,q:"How is this audience defined?",t:"single",req:true,
    opts:["Persona / segment-based (no hard demographic data)","Demographic data available (age range, income, etc.)","Both persona and demographic data available"],
    hint:"This helps us understand how grounded the audience definition is."},
  {id:"messageTypes",s:5,q:"What type of message is this?",t:"multi",req:true,opts:["Product capability","Benefit-led","Proof / credibility","Emotional / cultural","Mixed"]},
  {id:"productTruthSource",s:5,q:"What is the source of product truth?",t:"single",req:true,opts:["Approved product documentation","Existing campaign / system","PM or Marketing alignment","Other"],otherKey:"productTruthOther"},
  {id:"references",s:6,q:"Reference examples",t:"refs",req:false},
  {id:"lockedElements",s:7,q:"What is already decided and locked?",t:"multi",req:true,opts:["Messaging","Brand system","CTA","Product positioning","Other"],otherKey:"lockedElementsOther"},
  {id:"openForExploration",s:7,q:"What is open for creative exploration?",t:"multi",req:true,opts:["Visual approach","Tone","Narrative","Metaphor vs. literal","Other"],otherKey:"openForExplorationOther"},
  {id:"finalMustInclude",s:8,q:"What must appear in the final design?",t:"multi",req:true,opts:["Logo","Product name","CTA","Legal","Accessibility","Other"],otherKey:"finalMustIncludeOther"},
  {id:"mustAvoid",s:8,q:"What is explicitly off-limits?",t:"textarea",ph:"Styles, references, language, or approaches to avoid...",req:true},
  {id:"sensitiveConstraints",s:8,q:"Does this brief contain any sensitive constraints?",t:"sensitiveConstraints",req:true,
    hint:"Select all that apply. This replaces keyword guessing — be explicit so Design can route correctly."},
  {id:"successCriteria",s:9,q:"How will success be evaluated?",t:"successCriteria",req:true},
  {id:"assetTypes",s:10,q:"What asset types are needed?",t:"multi",req:true,opts:["Static","Carousel","Video","System","Other"],otherKey:"assetOther",systemHint:"Reusable visual or messaging architecture intended to scale across multiple formats, campaigns, or time periods — not a one-off asset set."},
  {id:"staticSizes",s:10,q:"Static sizes",t:"text",ph:"e.g. 1080x1080, 1200x628",req:true,showIf:f=>f.assetTypes?.includes("Static")},
  {id:"videoDuration",s:10,q:"Video duration(s)",t:"videoDuration",req:true,showIf:f=>f.assetTypes?.includes("Video")},
  {id:"videoPurpose",s:10,q:"Video purpose",t:"videoPurpose",req:true,showIf:f=>f.assetTypes?.includes("Video")},
  {id:"channels",s:10,q:"Which channels will this run on?",t:"channels",req:true},
];

const PLATFORMS=["Instagram","TikTok","X","YouTube","Other"];
const mkRef=()=>({id:Date.now()+Math.random(),type:"url",url:"",file:null,fileDataUrl:null,likeBecause:"",avoid:""});

/* ─── PERSISTENT STORAGE (localStorage) ─── */
function sanitiseForStorage(briefs){
  // File objects can't be JSON serialised — strip them but keep fileDataUrl (base64)
  return briefs.map(b=>({
    ...b,
    existingAssetsFile: undefined,
    references:(b.references||[]).map(r=>({...r, file:undefined})),
  }));
}
function loadBriefs(){
  try{const d=localStorage.getItem("cbt_briefs");return d?JSON.parse(d):[];}catch{return [];}
}
function saveBriefs(briefs){
  try{localStorage.setItem("cbt_briefs",JSON.stringify(sanitiseForStorage(briefs)));}catch{}
}

/* ─── CB NUMBER ─── */
function formatCB(n){ return "CB"+String(n).padStart(3,"0"); }

/* ─── DATA NORMALISATION HELPERS ─── */
function normaliseStr(v){ return (v||"").toString().trim(); }
function normaliseMaybeArr(v){ return Array.isArray(v)?v:(v?[v]:[]); }

/* ─── AI ELIGIBILITY — PRIORITY WATERFALL (v3) ─── */
function computeAIEligibility(form){

  // ── 1. NORMALISE + VALIDATE INPUT ────────────────────────────────────────
  const assets        = normaliseMaybeArr(form.assetTypes);
  const openFor       = normaliseMaybeArr(form.openForExploration);
  const locked        = normaliseMaybeArr(form.lockedElements);
  const refs          = normaliseMaybeArr(form.references);
  const msgTypes      = normaliseMaybeArr(form.messageTypes);
  const sensitiveC    = normaliseMaybeArr(form.sensitiveConstraints);
  const truthSource   = normaliseStr(form.productTruthSource);
  const decisionType  = normaliseStr(form.decisionType);
  const audienceType  = normaliseStr(form.audienceType);
  const videoDuration = normaliseStr(form.videoDuration);
  const videoPurpose  = normaliseStr(form.videoPurpose);

  const hasRefs       = refs.length > 0 && refs.some(r => normaliseStr(r.url) || r.file);
  const hasSystem     = assets.includes("System");
  const hasVideo      = assets.includes("Video");
  const hasNarrative  = openFor.includes("Narrative");
  const hasMetaphor   = openFor.includes("Metaphor vs. literal");

  // Channel count = distinct platforms with at least one handle entered
  const channels2     = form.channels2 || {};
  const platformCount = Object.entries(channels2).filter(([,handles])=>handles.some(h=>normaliseStr(h))).length;

  // ── 2. BLOCKED — any one trigger = immediate stop ─────────────────────────
  const blockedReasons = [];

  if(truthSource === "Other")
    blockedReasons.push("Source of product truth is unverified (Other)");
  if(truthSource === "PM or Marketing alignment")
    blockedReasons.push("Source of truth is PM / Marketing alignment only — no approved documentation");

  if(hasNarrative)
    blockedReasons.push("Narrative is open for exploration");
  if(hasMetaphor)
    blockedReasons.push("Metaphor vs. literal is open for exploration");

  // Explicit sensitive constraints field — no keyword scanning
  const hasSensitive = sensitiveC.some(c =>
    c === "Legal review required" || c === "Regulatory / compliance" || c === "Reputational sensitivity"
  );
  if(hasSensitive)
    blockedReasons.push("Sensitive constraints flagged: " + sensitiveC.filter(c=>c!=="None of the above").join(", "));

  if(hasSystem && !hasRefs)
    blockedReasons.push("System-level design with no reference examples provided");
  if(hasSystem && platformCount > 2 && !hasRefs)
    blockedReasons.push("Multi-channel system design (3+ platforms) with no references");

  if(blockedReasons.length > 0){
    return { level:"blocked", label:"Human-Only Design", tasks:[], reasons:[], blocks:blockedReasons };
  }

  // ── 3. FULL — all conditions must be true ────────────────────────────────
  const isResizeScope    = decisionType === "Resize / adapt existing assets";
  const isExecutionScope = decisionType === "Execution of pre-approved direction" || decisionType === "Iteration on existing work";
  const isApprovedTruth  = truthSource === "Approved product documentation" || truthSource === "Existing campaign / system";
  const hasSimpleAssets  = assets.some(a => ["Static","Carousel"].includes(a));

  // Video is Full-eligible only if short-form (6s/15s) AND final production intent
  const isShortForm      = ["6s","15s"].includes(videoDuration);
  const isVideoFull      = hasVideo && isShortForm && videoPurpose === "Final production";
  const isPredictableFull= (hasSimpleAssets || isVideoFull) && !hasSystem;

  // Resize scope bypasses locked-elements requirement — everything is already decided by definition
  const hasLockedElements= isResizeScope || locked.filter(l=>l!=="Other").length > 0;

  if((isExecutionScope || isResizeScope) && isApprovedTruth && isPredictableFull && hasLockedElements){
    const fullReasons = [
      isResizeScope ? "Resize / adapt scope (direction fully pre-decided)" : "Execution or iteration scope",
      "Approved source of truth",
      "Predictable asset types",
    ];
    if(!isResizeScope) fullReasons.push("Locked elements present");
    if(hasRefs) fullReasons.push("Reference examples provided (confidence boost)");
    return { level:"full", label:"Full AI Assist", tasks:["Layout options","Draft copy","Variant sizes"], reasons:fullReasons, blocks:[] };
  }

  // ── 4. PARTIAL — all conditions must be true ─────────────────────────────
  const isExploratoryScope   = decisionType === "Exploratory concepts" || decisionType === "Single recommended direction";
  const isBoundedExploration = (openFor.includes("Visual approach") || openFor.includes("Tone")) && !hasNarrative && !hasMetaphor;

  // PM alignment requires at least one reference as grounding proxy
  const isPMAlignment   = truthSource === "PM or Marketing alignment";
  const isGroundedTruth = truthSource !== "" && truthSource !== "Other" && !(isPMAlignment && !hasRefs);

  // Video for Partial: short-form OR explicit concept exploration purpose
  const isVideoPartial  = hasVideo && (isShortForm || videoPurpose === "Concept exploration");
  const isConceptAssets = assets.some(a=>["Static","Carousel"].includes(a)) || isVideoPartial;

  if(isExploratoryScope && isBoundedExploration && isGroundedTruth && isConceptAssets){
    const partialReasons = [
      "Exploratory or single-direction scope",
      "Bounded exploration (Visual / Tone only)",
      isPMAlignment && hasRefs ? "PM alignment grounded by reference examples" : "Grounded source of truth",
      "Asset types suitable for concepting",
    ];
    return { level:"partial", label:"Partial AI Assist", tasks:["Concept directions","Mood boards","Message framing","Copy variants"], reasons:partialReasons, blocks:[] };
  }

  // ── 5. GUARDED — all conditions must be true ─────────────────────────────
  const hasEmotionalMsg = msgTypes.includes("Emotional / cultural");
  const hasLockedBrand  = locked.includes("Brand system") || locked.includes("CTA");
  const isAbstractAudience = audienceType === "Persona / segment-based (no hard demographic data)";

  // Guarded is drafting-only — conflicts with Exploratory concepts decision type
  const guardedDecisionOk = decisionType !== "Exploratory concepts";

  if(hasEmotionalMsg && hasRefs && hasLockedBrand && guardedDecisionOk){
    const guardedReasons=[
      "Emotional / cultural message type",
      "Reference examples provided",
      "Brand system or CTA locked",
    ];
    if(isAbstractAudience) guardedReasons.push("Persona / segment-based audience (confidence boost)");
    return {
      level:"guarded",
      label:"AI-Assist with Guardrails",
      tasks:["Copy drafts","Structural layouts","Option expansion"],
      reasons:guardedReasons,
      blocks:[],
    };
  }

  // ── 6. DEFAULT — helpful diagnostic ──────────────────────────────────────
  const defaultBlocks = [];
  if(!decisionType)   defaultBlocks.push("No decision type selected");
  if(!truthSource || truthSource==="Other") defaultBlocks.push("No grounded source of product truth");
  if(!assets.length)  defaultBlocks.push("No asset types selected");
  if(defaultBlocks.length===0) defaultBlocks.push("Brief does not meet conditions for any AI-assist tier — review scope, exploration boundaries, and source of truth");

  return { level:"blocked", label:"Human-Only Design", tasks:[], reasons:[], blocks:defaultBlocks };
}

const AI_TIER_META={
  full:{   color:"#4CAF82", bg:"#0d2018", border:"#4CAF8244", label:"Full AI Assist",     icon:"✦", tagline:"This brief is well-suited for AI-assisted production workflows." },
  partial:{ color:"#50A8FF", bg:"#0d1a2e", border:"#50A8FF44", label:"Partial AI Assist",  icon:"✦", tagline:"This brief is a good candidate for AI-assisted concepting and drafting." },
  guarded:{ color:"#FFB300", bg:"#1a1300", border:"#FFB30044", label:"AI-Assist with Guardrails", icon:"◈", tagline:"AI can support drafting here, with designer oversight throughout." },
  blocked:{ color:"#A0A0A0", bg:"#141414", border:"#33333388", label:"Human-Only Design",  icon:"◇", tagline:"This brief requires human-led design based on the conditions below." },
};

function AIBadge({eligibility,compact}){
  if(!eligibility)return null;
  const m=AI_TIER_META[eligibility.level]||AI_TIER_META.blocked;
  if(compact)return(
    <span title={m.label} style={{display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"11px",color:m.color,fontFamily:"monospace",border:`1px solid ${m.border}`,padding:"1px 7px",borderRadius:"2px",background:m.bg}}>
      {m.icon} {m.label}
    </span>
  );

  const isBlocked=eligibility.level==="blocked";

  return(
    <div style={{background:m.bg,border:`1.5px solid ${m.border}`,borderRadius:"6px",marginBottom:"24px",overflow:"hidden"}}>

      {/* Header row */}
      <div style={{padding:"16px 22px 14px",borderBottom:`1px solid ${C.bor}`}}>
        <div style={{fontSize:"9px",color:m.color,fontFamily:"monospace",letterSpacing:"0.14em",opacity:0.7,marginBottom:"6px"}}>DESIGNER RECOMMENDATION</div>
        <div style={{display:"flex",alignItems:"baseline",gap:"10px",flexWrap:"wrap"}}>
          <span style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.1em",flexShrink:0}}>AI ASSIST SCORE</span>
          <span style={{fontSize:"17px",fontWeight:"700",color:m.color,letterSpacing:"-0.01em"}}>{m.label}</span>
        </div>
        <div style={{fontSize:"12px",color:C.g3,marginTop:"5px",lineHeight:"1.55"}}>{m.tagline}</div>
      </div>

      {/* AI Suggested Tasks — only for non-blocked tiers */}
      {!isBlocked&&eligibility.tasks.length>0&&(
        <div style={{padding:"14px 22px",borderBottom:`1px solid ${C.bor}`}}>
          <div style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.12em",marginBottom:"9px"}}>AI SUGGESTED TASKS</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
            {eligibility.tasks.map(t=>(
              <span key={t} style={{background:`${m.color}15`,color:m.color,border:`1px solid ${m.color}30`,padding:"4px 10px",borderRadius:"3px",fontSize:"11px",fontFamily:"monospace"}}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* What's supporting this — reasons for non-blocked */}
      {!isBlocked&&eligibility.reasons.length>0&&(
        <div style={{padding:"14px 22px"}}>
          <div style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.12em",marginBottom:"9px"}}>WHAT'S SUPPORTING THIS</div>
          <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
            {eligibility.reasons.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                <span style={{color:m.color,fontSize:"10px",flexShrink:0,marginTop:"3px",opacity:0.7}}>✓</span>
                <span style={{fontSize:"12px",color:C.g3,lineHeight:"1.5"}}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why human-only — block reasons */}
      {isBlocked&&eligibility.blocks.length>0&&(
        <div style={{padding:"14px 22px"}}>
          <div style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.12em",marginBottom:"9px"}}>WHY THIS NEEDS HUMAN DESIGN</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {eligibility.blocks.map((b,i)=>(
              <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                <span style={{color:C.g5,fontSize:"10px",flexShrink:0,marginTop:"3px"}}>—</span>
                <span style={{fontSize:"12px",color:C.g3,lineHeight:"1.5"}}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{padding:"10px 22px",borderTop:`1px solid ${C.bor}`,background:"#111"}}>
        <p style={{fontSize:"10px",color:C.g5,lineHeight:"1.5",margin:0,fontStyle:"italic"}}>AI Assist recommendations reflect intake conditions at submission and do not replace Design judgment, brand standards, or Responsible AI requirements.</p>
      </div>

    </div>
  );
}

/* ─── WIZARD HOOK ─── */
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
    // Always validate refs section: any added ref must have likeBecause filled
    const refs=normaliseMaybeArr(form.references);
    if(refs.length>0 && cur.some(f=>f.t==="refs")){
      for(const r of refs){if(!r.likeBecause?.trim())return false;}
    }
    for(const f of cur){
      if(!f.req)continue;
      const v=form[f.id];
      if(f.t==="multi"){if(!Array.isArray(v)||!v.length)return false;if(f.otherKey&&v.includes("Other")&&!form[f.otherKey]?.trim())return false;}
      else if(f.t==="single"){if(!v)return false;if(f.otherKey&&v==="Other"&&!form[f.otherKey]?.trim())return false;}
      else if(f.t==="campaignType"){
        if(!form.campaignType)return false;
        if(form.campaignType==="Other"&&!form.campaignTypeOther?.trim())return false;
        // Validate existing assets sub-fields when mode is required
        const mode=showExistingAssets(form.campaignType);
        if(mode==="required"){
          if(!form.existingAssetsAvail)return false;
          if(form.existingAssetsAvail==="Yes — required to upload or link"){
            if(!form.existingAssetsUrl?.trim()&&!form.existingAssetsFile)return false;
            if(!form.existingAssetsNotes?.trim())return false;
          }
        }
      }
      else if(f.t==="successCriteria"){const sc=form.successCriteria||[];if(!sc.length)return false;if(sc.includes("Other")&&!form.successCriteriaOther?.trim())return false;}
      else if(f.t==="sensitiveConstraints"){const sc=normaliseMaybeArr(form.sensitiveConstraints);if(!sc.length)return false;}
      else if(f.t==="videoDuration"){if(!form.videoDuration)return false;}
      else if(f.t==="videoPurpose"){if(!form.videoPurpose)return false;}
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
const Ql=({q,req})=><div style={{fontSize:"18px",fontWeight:"700",color:C.w,marginBottom:"12px",lineHeight:"1.3"}}>{q}{req&&<span style={{color:C.lime,marginLeft:"4px"}}>*</span>}</div>;
const Qh=({hint})=>hint?<div style={{fontSize:"12px",color:C.g5,marginBottom:"10px",borderLeft:`2px solid ${C.blue}`,paddingLeft:"10px"}}>{hint}</div>:null;

function OptBtn({label,desc,sel,onClick,multi}){
  return<button type="button" onClick={onClick} style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"13px 18px",border:`1.5px solid ${sel?C.lime:C.bor}`,borderRadius:"4px",background:sel?"#D1FF9810":"transparent",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:"7px"}}>
    <div style={{width:"18px",height:"18px",borderRadius:multi?"3px":"50%",flexShrink:0,border:`2px solid ${sel?C.lime:C.g5}`,background:sel?C.lime:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginTop:"2px"}}>
      {sel&&<span style={{color:"#0F0F0F",fontSize:"11px",fontWeight:"900"}}>v</span>}
    </div>
    <div>
      <span style={{fontSize:"15px",color:sel?C.lime:C.w,fontWeight:sel?"600":"400"}}>{label}</span>
      {desc&&<div style={{fontSize:"12px",color:C.g5,fontStyle:"italic",marginTop:"3px",lineHeight:"1.4"}}>{desc}</div>}
    </div>
  </button>;
}

function InlOther({v,on,textarea}){
  if(textarea){return<div style={{marginLeft:"28px",marginBottom:"6px"}}><textarea value={v||""} onChange={e=>on(e.target.value)} placeholder="Please specify..." rows={3} style={{width:"100%",background:"#1a1a1a",border:`1.5px solid ${C.lime}55`,borderRadius:"3px",color:C.w,fontSize:"13px",padding:"8px 12px",outline:"none",resize:"vertical",lineHeight:"1.6"}}/></div>;}
  return<div style={{marginLeft:"28px",marginBottom:"6px"}}><input value={v||""} onChange={e=>on(e.target.value)} placeholder="Please specify..." style={{width:"100%",background:"#1a1a1a",border:`1.5px solid ${C.lime}55`,borderRadius:"3px",color:C.w,fontSize:"13px",padding:"8px 12px",outline:"none"}}/></div>;
}

/* ─── CAMPAIGN TYPE FIELD ─── */
function CampaignTypeField({form,set}){
  const v=form.campaignType;
  const assetsMode=showExistingAssets(v);
  const assetsVal=form.existingAssetsAvail;

  return<div>
    <Ql q="Campaign Type" req={true}/>
    {CAMPAIGN_TYPE_OPTS.map(o=><div key={o.value}>
      <OptBtn label={o.value} desc={o.desc} sel={v===o.value} onClick={()=>set("campaignType",o.value)} multi={false}/>
      {o.value==="Other"&&v==="Other"&&<InlOther v={form.campaignTypeOther} on={val=>set("campaignTypeOther",val)} textarea={false}/>}
    </div>)}

    {/* Existing Assets — conditional section */}
    {(assetsMode==="required"||assetsMode==="optional")&&(
      <div style={{marginTop:"24px",background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"20px"}}>
        <div style={{fontSize:"11px",color:C.blue,fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:"14px"}}>
          {assetsMode==="optional"?"EXISTING ASSETS (OPTIONAL)":"EXISTING ASSETS"}
        </div>
        <div style={{fontSize:"15px",fontWeight:"600",color:C.w,marginBottom:"10px"}}>Existing assets available?<span style={{color:C.lime,marginLeft:"4px"}}>*</span></div>
        {["Yes — required to upload or link","No — starting net new"].map(opt=><OptBtn key={opt} label={opt} sel={assetsVal===opt} onClick={()=>set("existingAssetsAvail",opt)} multi={false}/>)}
        {assetsVal==="Yes — required to upload or link"&&<div style={{marginTop:"16px",display:"flex",flexDirection:"column",gap:"14px"}}>
          <div>
            <div style={{fontSize:"11px",color:C.g5,fontFamily:"monospace",marginBottom:"6px"}}>UPLOAD OR LINK TO EXISTING ASSETS <span style={{color:C.lime}}>*</span></div>
            <input value={form.existingAssetsUrl||""} onChange={e=>set("existingAssetsUrl",e.target.value)} placeholder="https://..." style={{...ul(!!form.existingAssetsUrl),fontSize:"13px",marginBottom:"8px"}}/>
            <label style={{display:"flex",alignItems:"center",gap:"8px",border:`1.5px dashed ${form.existingAssetsFile?C.lime:C.bor}`,borderRadius:"3px",padding:"10px",cursor:"pointer"}}>
              <span style={{fontSize:"12px",color:form.existingAssetsFile?C.lime:C.g3}}>{form.existingAssetsFile?form.existingAssetsFile.name:"Or click to upload a file"}</span>
              <input type="file" onChange={e=>{if(e.target.files[0])set("existingAssetsFile",e.target.files[0]);}} style={{display:"none"}}/>
            </label>
          </div>
          <div>
            <div style={{fontSize:"11px",color:C.g5,fontFamily:"monospace",marginBottom:"6px"}}>WHAT SHOULD DESIGN UNDERSTAND FROM THESE ASSETS? <span style={{color:C.lime}}>*</span></div>
            <input value={form.existingAssetsNotes||""} onChange={e=>set("existingAssetsNotes",e.target.value)} placeholder="What's working, what's not, or what must be respected." style={ul(!!form.existingAssetsNotes)}/>
          </div>
        </div>}
      </div>
    )}
  </div>;
}

/* ─── SUCCESS CRITERIA FIELD ─── */
function SuccessCriteriaField({form,set}){
  const arr=Array.isArray(form.successCriteria)?form.successCriteria:[];
  const tog=opt=>{const next=arr.includes(opt)?arr.filter(o=>o!==opt):[...arr,opt];set("successCriteria",next);};
  return<div>
    <Ql q="How will success be evaluated?" req={true}/>
    {SUCCESS_CRITERIA_OPTS.map(o=><div key={o.value}>
      <OptBtn label={o.value} desc={o.desc} sel={arr.includes(o.value)} onClick={()=>tog(o.value)} multi={true}/>
      {o.value==="Other"&&arr.includes("Other")&&<InlOther v={form.successCriteriaOther} on={val=>set("successCriteriaOther",val)} textarea={false}/>}
    </div>)}
  </div>;
}

/* ─── REFS FIELD ─── */
function RefsField({form,set}){
  const refs=form.references||[];
  const add=()=>set("references",[...refs,mkRef()]);
  const upd=(id,p)=>set("references",refs.map(r=>r.id===id?{...r,...p}:r));
  const del=(id)=>set("references",refs.filter(r=>r.id!==id));
  const [expanded,setExpanded]=useState(null);

  return<div>
    <Ql q="Reference examples" req={false}/>
    <Qh hint="Optional. Add URLs or file uploads with notes on what you like."/>
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
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.pptx" onChange={e=>{
          if(e.target.files[0]){
            const file=e.target.files[0];
            const reader=new FileReader();
            reader.onload=ev=>upd(ref.id,{file,fileDataUrl:ev.target.result});
            reader.readAsDataURL(file);
          }
        }} style={{display:"none"}}/>
      </label>}
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        <div>
          <div style={{fontSize:"10px",color:C.g5,marginBottom:"4px",fontFamily:"monospace"}}>WHY I LIKE THIS <span style={{color:C.lime}}>*</span></div>
          <textarea value={ref.likeBecause||""} onChange={e=>upd(ref.id,{likeBecause:e.target.value})} placeholder="What draws you to this example..." rows={2} style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"6px",outline:"none",resize:"none"}}/>
        </div>
        <div>
          <div style={{fontSize:"10px",color:C.g5,marginBottom:"4px",fontFamily:"monospace"}}>DO NOT COPY</div>
          <input value={ref.avoid} onChange={e=>upd(ref.id,{avoid:e.target.value})} placeholder="Avoid replicating..." style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"6px",outline:"none"}}/>
        </div>
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
  return<div>
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

/* ─── SENSITIVE CONSTRAINTS FIELD ─── */
function SensitiveConstraintsField({form,set}){
  const arr=normaliseMaybeArr(form.sensitiveConstraints);
  const tog=opt=>{
    // "None of the above" is mutually exclusive with the others
    if(opt==="None of the above"){set("sensitiveConstraints",["None of the above"]);return;}
    const without=arr.filter(o=>o!=="None of the above");
    const next=without.includes(opt)?without.filter(o=>o!==opt):[...without,opt];
    set("sensitiveConstraints",next);
  };
  return<div>
    <Ql q="Does this brief contain any sensitive constraints?" req={true}/>
    <Qh hint="Select all that apply. This field directly informs AI routing — be explicit."/>
    {SENSITIVE_CONSTRAINT_OPTS.map(o=><OptBtn key={o.value} label={o.value} desc={o.desc} sel={arr.includes(o.value)} onClick={()=>tog(o.value)} multi={true}/>)}
  </div>;
}

/* ─── VIDEO DURATION FIELD ─── */
function VideoDurationField({form,set}){
  const v=form.videoDuration;
  return<div>
    <Ql q="Video duration(s)" req={true}/>
    <Qh hint="Select the primary duration. If multiple, select the longest or most complex."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginTop:"4px"}}>
      {VIDEO_DURATION_OPTS.map(d=><button key={d} type="button" onClick={()=>set("videoDuration",d)}
        style={{padding:"12px 8px",border:`1.5px solid ${v===d?C.lime:C.bor}`,borderRadius:"4px",background:v===d?"#D1FF9810":"transparent",color:v===d?C.lime:C.w,cursor:"pointer",fontSize:"14px",fontWeight:v===d?"700":"400",fontFamily:"monospace"}}>
        {d}
      </button>)}
    </div>
  </div>;
}

/* ─── VIDEO PURPOSE FIELD ─── */
function VideoPurposeField({form,set}){
  const v=form.videoPurpose;
  return<div>
    <Ql q="Video purpose" req={true}/>
    {VIDEO_PURPOSE_OPTS.map(o=><OptBtn key={o.value} label={o.value} desc={o.desc} sel={v===o.value} onClick={()=>set("videoPurpose",o.value)} multi={false}/>)}
  </div>;
}

function Field({f,form,set}){
  const v=form[f.id];
  const setV=val=>set(f.id,val);
  const tog=opt=>setV(Array.isArray(v)?v.includes(opt)?v.filter(o=>o!==opt):[...v,opt]:[opt]);
  if(f.t==="text")return<><Ql q={f.q} req={f.req}/><Qh hint={f.hint}/><input value={v||""} onChange={e=>setV(e.target.value)} placeholder={f.ph} style={ul(!!v)}/></>;
  if(f.t==="textarea")return<><Ql q={f.q} req={f.req}/><Qh hint={f.hint}/><textarea value={v||""} onChange={e=>setV(e.target.value)} placeholder={f.ph} rows={3} style={{...ul(!!v),resize:"vertical",display:"block",lineHeight:"1.6",paddingTop:"8px"}}/></>;
  if(f.t==="single")return<><Ql q={f.q} req={f.req}/><Qh hint={f.hint}/>{f.opts.map(o=><div key={o}><OptBtn label={o} sel={v===o} onClick={()=>setV(o)} multi={false}/>{o==="Other"&&v==="Other"&&f.otherKey&&<InlOther v={form[f.otherKey]} on={val=>set(f.otherKey,val)} textarea={true}/>}</div>)}</>;
  if(f.t==="multi"){const arr=Array.isArray(v)?v:[];return<><Ql q={f.q} req={f.req}/><Qh hint={f.hint}/>{f.opts.map(o=><div key={o}><OptBtn label={o} desc={o==="System"&&f.systemHint?f.systemHint:undefined} sel={arr.includes(o)} onClick={()=>tog(o)} multi={true}/>{o==="Other"&&arr.includes("Other")&&f.otherKey&&<InlOther v={form[f.otherKey]} on={val=>set(f.otherKey,val)} textarea={true}/>}</div>)}</>;}

  if(f.t==="campaignType")return<CampaignTypeField form={form} set={set}/>;
  if(f.t==="successCriteria")return<SuccessCriteriaField form={form} set={set}/>;
  if(f.t==="sensitiveConstraints")return<SensitiveConstraintsField form={form} set={set}/>;
  if(f.t==="videoDuration")return<VideoDurationField form={form} set={set}/>;
  if(f.t==="videoPurpose")return<VideoPurposeField form={form} set={set}/>;
  if(f.t==="refs")return<RefsField form={form} set={set}/>;
  if(f.t==="channels")return<ChField form={form} set={set}/>;
  return null;
}

/* ─── BRIEF ME (print/PDF popup) ─── */
function openBriefMeTab(brief){
  const refs=brief.references||[];
  const objs=Array.isArray(brief.businessObjective)?brief.businessObjective:[brief.businessObjective].filter(Boolean);

  const refCards=refs.map((r,i)=>{
    let mediaSection="";
    if(r.type==="file"&&r.fileDataUrl){
      const isImg=/\.(png|jpg|jpeg|gif|webp)/i.test(r.file?.name||"");
      mediaSection=isImg
        ?`<div style="border-radius:8px;overflow:hidden;margin-bottom:16px;cursor:pointer;" onclick="document.getElementById('img-expand-${i}').style.display='flex'"><img src="${r.fileDataUrl}" style="width:100%;border-radius:8px;"/></div>
           <div id="img-expand-${i}" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;align-items:center;justify-content:center;cursor:pointer;" onclick="this.style.display='none'"><img src="${r.fileDataUrl}" style="max-width:90%;max-height:90%;border-radius:8px;"/></div>`
        :`<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:8px;padding:24px;margin-bottom:16px;display:flex;align-items:center;gap:12px;aspect-ratio:16/9;justify-content:center;"><span style="font-size:40px;">📎</span><span style="color:#D1FF98;font-family:monospace;font-size:13px;">${r.file?.name||"Uploaded file"}</span></div>`;
    } else if(r.type==="url"&&r.url){
      mediaSection=`<div style="background:#f0f0f0;border-radius:8px;overflow:hidden;margin-bottom:16px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">
        <img src="https://api.microlink.io/?url=${encodeURIComponent(r.url)}&screenshot=true&meta=false&embed=screenshot.url" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.parentElement.innerHTML='<a href=\\'${r.url.replace(/'/g,"&#39;")}\\'target=\\'_blank\\' style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-decoration:none;color:#0078D4;font-size:13px;font-family:monospace;padding:16px;text-align:center;word-break:break-all;\\'>${r.url}</a>'"/>
      </div>`;
    }
    return`<div style="break-inside:avoid;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-bottom:28px;">
      <div style="padding:20px 24px 0;">${mediaSection}</div>
      <div style="padding:16px 24px 24px;">
        <div style="font-size:11px;color:#999;font-family:monospace;letter-spacing:0.1em;margin-bottom:10px;">REFERENCE ${i+1}</div>
        ${r.likeBecause?`<div style="margin-bottom:10px;"><div style="font-size:10px;color:#999;font-family:monospace;letter-spacing:0.08em;margin-bottom:4px;">I LIKES THIS BECAUSE</div><p style="font-size:14px;color:#333;line-height:1.6;margin:0;">${r.likeBecause}</p></div>`:""}
        ${r.avoid?`<div><div style="font-size:10px;color:#FF6B6B;font-family:monospace;letter-spacing:0.08em;margin-bottom:4px;">DO NOT COPY</div><p style="font-size:13px;color:#666;line-height:1.6;margin:0;">${r.avoid}</p></div>`:""}
        ${r.url?`<a href="${r.url}" target="_blank" style="display:inline-block;margin-top:12px;font-size:11px;color:#0078D4;font-family:monospace;word-break:break-all;">${r.url}</a>`:""}
      </div>
    </div>`;
  }).join("");

  const locked=(brief.lockedElements||[]).map(e=>{
    const label=e==="Other"&&brief.lockedElementsOther?brief.lockedElementsOther:e;
    return`<div style="background:#fff0f0;border:1px solid #ffcccc;border-radius:8px;padding:10px 14px;font-size:13px;color:#cc4444;margin-bottom:6px;">🔒 ${label}</div>`;
  }).join("");
  const open=(brief.openForExploration||[]).map(e=>{
    const label=e==="Other"&&brief.openForExplorationOther?brief.openForExplorationOther:e;
    return`<div style="background:#f0fff4;border:1px solid #b2f5c8;border-radius:8px;padding:10px 14px;font-size:13px;color:#2d7d4f;margin-bottom:6px;">✦ ${label}</div>`;
  }).join("");
  const criteria=(brief.successCriteria||[]).map(s=>`<div style="background:#f5f5ff;border:1px solid #d0d0ff;border-radius:8px;padding:10px 14px;font-size:13px;color:#5555cc;margin-bottom:6px;">${s}</div>`).join("");
  const assets=(brief.assetTypes||[]).map(a=>`<span style="background:#0078D415;border:1px solid #0078D455;color:#0078D4;padding:5px 14px;border-radius:20px;font-size:12px;font-family:monospace;">${a}</span>`).join(" ");
  const objTags=objs.map(o=>`<span style="background:#D1FF9820;border:1px solid #D1FF9866;color:#2a6a00;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;">${o}</span>`).join(" ");
  const aiEl=computeAIEligibility(brief);
  const aiTierColors={full:"#4CAF82",partial:"#50A8FF",guarded:"#FFB300",blocked:"#A0A0A0"};
  const aiTierTaglines={
    full:"This brief is well-suited for AI-assisted production workflows.",
    partial:"This brief is a good candidate for AI-assisted concepting and drafting.",
    guarded:"AI can support drafting here, with designer oversight throughout.",
    blocked:"This brief requires human-led design based on the conditions below."
  };
  const aiTierColor=aiTierColors[aiEl.level];
  const aiSection=`<div style="background:#f8f8f8;border:1.5px solid #e0e0e0;border-left:4px solid ${aiTierColor};border-radius:12px;padding:24px;margin-bottom:24px;">
    <div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:8px;">AI ROUTING RECOMMENDATION</div>
    <div style="font-size:18px;font-weight:800;color:${aiTierColor};margin-bottom:6px;">${aiEl.label}</div>
    <div style="font-size:13px;color:#555;margin-bottom:${aiEl.tasks.length||aiEl.blocks.length?'16px':'0'};">${aiTierTaglines[aiEl.level]}</div>
    ${aiEl.tasks.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;">${aiEl.tasks.map(t=>`<span style="background:${aiTierColor}22;border:1px solid ${aiTierColor}55;color:#1a1a1a;padding:4px 10px;border-radius:4px;font-size:11px;font-family:'DM Mono',monospace;">${t}</span>`).join("")}</div>`:""}
    ${aiEl.blocks.length?`<div style="margin-top:12px;"><div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">WHY THIS BRIEF REQUIRES HUMAN DESIGN</div>${aiEl.blocks.map(b=>`<div style="font-size:13px;color:#555;margin-bottom:5px;">— ${b}</div>`).join("")}</div>`:""}
    ${aiEl.reasons.length&&aiEl.level!=="blocked"?`<div style="margin-top:12px;font-size:11px;color:#aaa;font-family:'DM Mono',monospace;">Signals: ${aiEl.reasons.join(" · ")}</div>`:""}
  </div>`;

  const html=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${brief.campaignName} — Brief</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;background:#F4F3EF;color:#1a1a1a;-webkit-print-color-adjust:exact;}.page{max-width:900px;margin:0 auto;padding:40px 32px 80px;}@media print{.no-print{display:none!important;}body{background:white;}}</style>
</head><body>
<div class="no-print" style="background:#0F0F0F;padding:12px 32px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;">
  <span style="color:#D1FF98;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.1em;">${brief.campaignName}</span>
  <button onclick="window.print()" style="background:#D1FF98;color:#0F0F0F;border:none;padding:8px 20px;border-radius:4px;cursor:pointer;font-weight:700;font-size:12px;font-family:'DM Mono',monospace;">DOWNLOAD PDF</button>
</div>
<div class="page">
  <div style="background:linear-gradient(135deg,#0F0F0F 0%,#0d2340 100%);border-radius:24px;padding:56px 52px;margin-bottom:32px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-60px;right:-60px;width:280px;height:280px;background:#D1FF9812;border-radius:50%;"></div>
    <div style="position:relative;">
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">${objTags}</div>
      <h1 style="font-size:clamp(32px,5vw,52px);font-weight:800;color:white;line-height:1.1;letter-spacing:-0.02em;margin-bottom:28px;">${brief.campaignName}</h1>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-left:4px solid #0078D4;border-radius:0 12px 12px 0;padding:20px 24px;">
        <div style="font-size:10px;color:#50A8FF;font-family:'DM Mono',monospace;letter-spacing:0.14em;margin-bottom:8px;">THE CREATIVE REQUEST</div>
        <p style="font-size:18px;color:rgba(255,255,255,0.92);line-height:1.7;font-weight:400;">${brief.problemStatement||""}</p>
      </div>
    </div>
  </div>
  ${aiSection}
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
    ${[["REQUESTOR",brief.requestorName,"#D1FF98"],["CAMPAIGN TYPE",brief.campaignType||"—","#0078D4"],["DECISION TYPE",brief.decisionType,"#FF8C00"]].map(([l,v,c])=>`<div style="background:white;border-radius:16px;padding:22px;box-shadow:0 2px 12px rgba(0,0,0,0.06);"><div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">${l}</div><div style="font-size:15px;font-weight:700;color:${c};line-height:1.3;">${v||"—"}</div></div>`).join("")}
  </div>
  <div style="background:white;border-radius:20px;padding:36px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="font-size:11px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #eee;">AUDIENCE</div>
    <div style="background:linear-gradient(135deg,#D1FF9815,#D1FF9830);border:1px solid #D1FF9866;border-radius:12px;padding:20px;">
      <div style="font-size:10px;color:#2a6a00;font-family:'DM Mono',monospace;letter-spacing:0.1em;margin-bottom:8px;">PRIMARY</div>
      <div style="font-size:18px;font-weight:700;color:#1a1a1a;">${brief.primaryAudience||"—"}</div>
    </div>
  </div>
  <div style="background:white;border-radius:20px;padding:36px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="font-size:11px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #eee;">MESSAGE</div>
    ${(brief.messageTypes||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:8px;">${(brief.messageTypes||[]).map(t=>`<span style="background:#0078D415;border:1px solid #0078D455;color:#0078D4;padding:5px 14px;border-radius:20px;font-size:12px;">${t}</span>`).join("")}</div>`:""}
  </div>
  ${(brief.lockedElements?.length||brief.openForExploration?.length)?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#cc4444;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #ffcccc;">LOCKED IN</div>${locked}
    </div>
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#2d7d4f;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #b2f5c8;">OPEN TO EXPLORE</div>${open}
    </div>
  </div>`:""}
  ${brief.mustAvoid?`<div style="background:#fff0f0;border:1px solid #ffcccc;border-radius:20px;padding:28px;margin-bottom:24px;"><div style="font-size:10px;color:#cc4444;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:12px;">MUST AVOID</div><p style="font-size:15px;color:#551a1a;line-height:1.7;">${brief.mustAvoid}</p></div>`:""}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #eee;">SUCCESS CRITERIA</div>
      ${criteria||"<p style='color:#ccc;font-size:13px;'>None specified</p>"}
    </div>
    <div style="background:white;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="font-size:10px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #eee;">ASSET TYPES</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${assets||"<p style='color:#ccc;font-size:13px;'>None specified</p>"}</div>
      ${brief.staticSizes?`<div style="margin-top:14px;font-size:12px;color:#666;">Static: ${brief.staticSizes}</div>`:""}
      ${brief.videoDuration?`<div style="margin-top:6px;font-size:12px;color:#666;">Video: ${brief.videoDuration}${brief.videoPurpose?" · "+brief.videoPurpose:""}</div>`:""}
    </div>
  </div>
  ${refs.length?`<div style="margin-bottom:24px;">
    <div style="font-size:11px;color:#999;font-family:'DM Mono',monospace;letter-spacing:0.12em;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #eee;">REFERENCE EXAMPLES</div>
    <div style="display:grid;grid-template-columns:repeat(${refs.length===1?"1":"2"},1fr);gap:20px;">${refCards}</div>
  </div>`:""}
  <div style="border-top:1px solid #ddd;padding-top:20px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;color:#999;font-family:'DM Mono',monospace;">Submitted by ${brief.requestorName||""} · ${new Date(brief.submittedAt).toLocaleDateString()}</span>
    <span style="font-size:11px;color:#ccc;font-family:'DM Mono',monospace;">CREATIVE BRIEF TRANSLATOR (CBT)</span>
  </div>
</div></body></html>`;
  const blob=new Blob([html],{type:"text/html"});
  window.open(URL.createObjectURL(blob),"_blank");
}

/* ─── SEND EMAIL via mailto ─── */
function sendBriefEmail(brief, toEmail) {
  const subject=encodeURIComponent(`Creative Brief: ${brief.campaignName}`);
  const body=encodeURIComponent(
`Creative Brief — ${brief.campaignName}
Submitted by: ${brief.requestorName} (${brief.requestorEmail||""})
Campaign Type: ${brief.campaignType||""}
Submitted: ${new Date(brief.submittedAt).toLocaleString()}

THE CREATIVE REQUEST:
${brief.problemStatement||""}

Business Objective: ${Array.isArray(brief.businessObjective)?brief.businessObjective.join(", "):brief.businessObjective||""}
Audience: ${brief.primaryAudience||""}
Decision Type: ${brief.decisionType||""}

---
Open the CBT dashboard to view the full brief.`
  );
  window.location.href=`mailto:${toEmail}?cc=${encodeURIComponent(brief.requestorEmail||"")}&subject=${subject}&body=${body}`;
}

/* ─── WIZARD VIEW ─── */
function WizardView({onSubmit,briefCount,isDesigner}){
  const w=useWizard();
  const [done,setDone]=useState(false);
  const [brief,setBrief]=useState(null);
  const [vis,setVis]=useState(true);
  const go=fn=>{setVis(false);setTimeout(()=>{fn();setVis(true);},150);};
  const submit=()=>{
    const el=computeAIEligibility(w.form);
    const cbNumber=briefCount+1;
    const b={...w.form,id:Date.now(),cbNumber,submittedAt:new Date().toISOString(),status:"New Brief",clarifications:{},aiEligibility:el};
    setBrief(b);setDone(true);onSubmit(b);
  };
  if(done&&brief){
    return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 59px)"}}>
      <div style={{textAlign:"center",maxWidth:"480px",padding:"0 24px"}}>
        <div style={{display:"inline-block",background:"#0d1a2e",border:`1.5px solid ${C.blue}44`,borderRadius:"6px",padding:"12px 28px",marginBottom:"28px"}}>
          <div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.14em",marginBottom:"6px"}}>YOUR BRIEF NUMBER</div>
          <div style={{fontSize:"42px",fontWeight:"800",color:C.blue,letterSpacing:"-0.02em",fontFamily:"monospace"}}>{formatCB(brief.cbNumber)}</div>
        </div>
        <h2 style={{fontSize:"36px",fontWeight:"800",color:C.w,marginBottom:"10px",letterSpacing:"-0.02em"}}>Thank you, {(brief.requestorName||"").split(" ")[0]}.</h2>
        <div style={{marginBottom:"24px"}}>
          <div style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.12em",marginBottom:"4px"}}>CAMPAIGN / PROJECT</div>
          <div style={{fontSize:"16px",fontWeight:"600",color:C.g3}}>{brief.campaignName}</div>
        </div>
        <p style={{fontSize:"13px",color:C.g5,marginBottom:"32px",lineHeight:"1.6"}}>The design team has received your brief and will follow up with next steps. Reference <span style={{color:C.w,fontFamily:"monospace"}}>{formatCB(brief.cbNumber)}</span> in any follow-up conversations.</p>
        {isDesigner&&<button onClick={()=>onSubmit(brief,true)} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"14px 40px",fontSize:"14px",fontWeight:"700",cursor:"pointer",borderRadius:"3px"}}>View Dashboard</button>}
      </div>
    </div>);
  }
  return(<div style={{display:"flex",height:"calc(100vh - 59px)",overflow:"hidden"}}>
    <div style={{width:"210px",flexShrink:0,background:"#111",borderRight:`1px solid ${C.bor}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"32px 20px",gap:"24px",height:"100%",overflowY:"auto"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"monospace",fontSize:"96px",lineHeight:"0.9",color:C.lime,letterSpacing:"-0.03em",userSelect:"none"}}>{String(w.sec).padStart(2,"0")}</div>
        <div style={{fontSize:"11px",color:C.blue,fontFamily:"monospace",letterSpacing:"0.14em",textTransform:"uppercase",marginTop:"10px"}}>{SNAMES[w.sec]}</div>
      </div>
      <div style={{width:"100%"}}>
        <div style={{fontSize:"12px",color:C.lime,fontFamily:"monospace",marginBottom:"14px",textAlign:"center"}}>{w.secs.indexOf(w.sec)+1} <span style={{color:`${C.lime}44`}}>/ {w.secs.length}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {w.secs.map(s=>{const a=s===w.sec,p=w.secs.indexOf(s)<w.secs.indexOf(w.sec);return(
            <div key={s} style={{display:"flex",alignItems:"center",gap:"9px"}}>
              <div style={{width:"6px",height:"6px",borderRadius:"50%",flexShrink:0,background:C.lime,opacity:a?1:p?0.5:0.18}}/>
              <span style={{fontSize:"12px",fontFamily:"monospace",color:a?C.lime:p?`${C.lime}77`:`${C.lime}33`,whiteSpace:"nowrap"}}>{SNAMES[s]}</span>
            </div>
          );})}
        </div>
      </div>

    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 48px 14px",borderBottom:`1px solid ${C.bor}`,flexShrink:0}}>
        <div style={{display:"flex",gap:"4px",marginBottom:"8px"}}>
          {w.secs.map(s=>{const p=w.secs.indexOf(s),cp=w.secs.indexOf(w.sec);return<div key={s} style={{flex:1,height:"3px",borderRadius:"2px",background:p<cp?C.lime:s===w.sec?`${C.lime}55`:C.bor}}/>;})}</div>
        <div style={{fontSize:"11px",fontFamily:"monospace",color:C.g5}}>{Math.round(w.prog)}% COMPLETE</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"36px 48px 16px"}}>
        <div style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",transition:"all 0.2s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:C.blue,color:"#fff",padding:"5px 14px",fontSize:"12px",fontFamily:"monospace",marginBottom:"28px",borderRadius:"2px"}}>
            SECTION {w.sec} — {SNAMES[w.sec].toUpperCase()}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"32px",maxWidth:"640px"}}>
            {w.cur.map(f=>(<div key={f.id}><Field f={f} form={w.form} set={w.set}/></div>))}
          </div>
        </div>
      </div>
      <div style={{padding:"14px 48px 20px",borderTop:`1px solid ${C.bor}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
        <button onClick={()=>go(w.prev)} disabled={w.isF} style={{background:"transparent",border:`1.5px solid ${w.isF?C.bor:`${C.lime}55`}`,color:w.isF?C.g7:C.lime,padding:"12px 28px",cursor:w.isF?"not-allowed":"pointer",fontSize:"14px",fontWeight:"600",borderRadius:"3px"}}>Back</button>
        {w.isL
          ?<button onClick={submit} disabled={!w.ok()} style={{background:w.ok()?C.lime:C.g7,color:w.ok()?"#0F0F0F":C.g5,border:"none",padding:"13px 40px",fontSize:"15px",fontWeight:"700",cursor:w.ok()?"pointer":"not-allowed",borderRadius:"3px"}}>Submit Brief</button>
          :<button onClick={()=>go(w.next)} disabled={!w.ok()} style={{background:w.ok()?C.lime:C.g7,color:w.ok()?"#0F0F0F":C.g5,border:"none",padding:"13px 36px",fontSize:"15px",fontWeight:"700",cursor:w.ok()?"pointer":"not-allowed",borderRadius:"3px"}}>Continue</button>
        }
      </div>
    </div>
  </div>);
}

function StatusToggle({cur,onChange}){
  const [open,setOpen]=useState(false);
  return<div style={{position:"relative"}}>
    <button type="button" onClick={e=>{e.stopPropagation();setOpen(o=>!o);}} style={{background:"transparent",border:`1px solid ${C.bor}`,color:C.g3,padding:"4px 10px",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",display:"flex",alignItems:"center",gap:"5px"}}>
      <span style={{width:"6px",height:"6px",borderRadius:"50%",background:SCOL[cur]||C.g5}}/>{cur} ▾
    </button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 3px)",right:0,background:"#1A1A1A",border:`1px solid ${C.bor}`,borderRadius:"4px",zIndex:50,minWidth:"160px"}} onClick={e=>e.stopPropagation()}>
      {STATUSES.map(s=><button key={s} type="button" onClick={()=>{onChange(s);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:"7px",width:"100%",background:s===cur?`${SCOL[s]}15`:"transparent",border:"none",color:s===cur?SCOL[s]:C.g3,padding:"8px 12px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace",textAlign:"left",borderBottom:`1px solid ${C.bor}`}}>
        <span style={{width:"6px",height:"6px",borderRadius:"50%",background:SCOL[s]}}/>{s}
      </button>)}
    </div>}
  </div>;
}

/* ─── SEND MODAL ─── */
function SendModal({brief,onClose}){
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const send=()=>{
    if(!email.trim())return;
    sendBriefEmail(brief,email.trim());
    setSent(true);
  };
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.sur,border:`1.5px solid ${C.bor}`,borderRadius:"8px",padding:"32px",width:"400px",maxWidth:"90vw"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:"14px",fontWeight:"700",color:C.w,marginBottom:"6px"}}>Send Brief via Email</div>
      <div style={{fontSize:"12px",color:C.g5,marginBottom:"20px"}}>A summary will be sent to the recipient. {brief.requestorEmail?`${brief.requestorEmail} will be CC'd.`:""}</div>
      {sent?<div style={{color:C.lime,fontSize:"13px",fontFamily:"monospace",textAlign:"center",padding:"12px"}}>✓ Email client opened — check your draft.</div>:<>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="recipient@email.com" style={{width:"100%",background:"#0F0F0F",border:`1.5px solid ${C.bor}`,borderRadius:"4px",color:C.w,fontSize:"14px",padding:"10px 14px",outline:"none",marginBottom:"16px"}}/>
        <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.bor}`,color:C.g3,padding:"8px 18px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace"}}>CANCEL</button>
          <button onClick={send} disabled={!email.trim()} style={{background:email.trim()?C.blue:C.g7,color:email.trim()?"#fff":C.g5,border:"none",padding:"8px 22px",borderRadius:"3px",cursor:email.trim()?"pointer":"not-allowed",fontSize:"12px",fontFamily:"monospace",fontWeight:"700"}}>SEND</button>
        </div>
      </>}
    </div>
  </div>;
}

/* ─── BRIEF DETAIL ─── */
function BriefDetail({brief,onBack,onUpdate,isDesigner}){
  const [clarifs,setClarifs]=useState(brief.clarifications||{});
  const [active,setActive]=useState(null);
  const [draft,setDraft]=useState("");
  const [showSend,setShowSend]=useState(false);
  const [expandedImg,setExpandedImg]=useState(null);
  const [clarLogOpen,setClarLogOpen]=useState(false);
  const aiEligibility=useMemo(()=>brief.aiEligibility||computeAIEligibility(brief),[brief]);

  const send=(fid)=>{
    if(!draft.trim())return;
    const n={id:Date.now(),q:draft,ts:new Date().toISOString(),answered:false,answer:"",answerTs:null};
    const up={...clarifs,[fid]:[...(clarifs[fid]||[]),n]};
    setClarifs(up);setActive(null);setDraft("");
    onUpdate({...brief,clarifications:up});
  };
  const answer=(fid,nid,ans)=>{
    const up={...clarifs,[fid]:(clarifs[fid]||[]).map(n=>n.id===nid?{...n,answered:true,answer:ans,answerTs:new Date().toISOString()}:n)};
    setClarifs(up);onUpdate({...brief,clarifications:up});
  };

  // "The Creative Request" clarification — collapsible log
  const CrCl=()=>{
    const fid="problemStatement";
    const ex=clarifs[fid]||[];
    const open=active===fid;
    return<div style={{marginTop:"8px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <button type="button" onClick={()=>{setActive(open?null:fid);setDraft("");}} style={{background:"transparent",border:"none",color:C.orange,cursor:"pointer",fontSize:"11px",fontFamily:"monospace",padding:0}}>
          {open?"cancel":"request clarification"}
        </button>
        {ex.length>0&&<button type="button" onClick={()=>setClarLogOpen(l=>!l)} style={{background:"transparent",border:"none",color:C.g5,cursor:"pointer",fontSize:"10px",fontFamily:"monospace",padding:0}}>
          {clarLogOpen?"▾ hide log":"▸ show log"} ({ex.length})
        </button>}
      </div>
      {open&&<div style={{marginTop:"8px",background:"#1A1000",border:`1px solid ${C.orange}44`,borderRadius:"4px",padding:"10px"}}>
        <div style={{fontSize:"10px",color:C.orange,fontFamily:"monospace",marginBottom:"6px"}}>QUESTION FOR {brief.requestorName?.toUpperCase()}</div>
        <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="What needs clarification?" rows={2} style={{width:"100%",background:"transparent",border:`1px solid ${C.orange}44`,borderRadius:"3px",color:C.w,fontSize:"13px",padding:"7px",outline:"none",resize:"none",marginBottom:"7px"}}/>
        <button type="button" onClick={()=>send(fid)} style={{background:C.orange,color:"#0F0F0F",border:"none",padding:"6px 14px",borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace",fontWeight:"700"}}>SEND + NOTIFY</button>
      </div>}
      {clarLogOpen&&ex.length>0&&<div style={{marginTop:"8px"}}>
        {ex.map(n=><div key={n.id} style={{background:"#151500",border:`1px solid ${C.orange}33`,borderRadius:"3px",padding:"10px",marginBottom:"6px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
            <div style={{fontSize:"11px",color:C.orange}}>Q: {n.q}</div>
            <span style={{fontSize:"9px",color:C.g5,fontFamily:"monospace"}}>{new Date(n.ts).toLocaleDateString()}</span>
          </div>
          {n.answered
            ?<div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:"11px",color:C.lime}}>A: {n.answer}</div>
                {n.answerTs&&<span style={{fontSize:"9px",color:C.g5,fontFamily:"monospace"}}>{new Date(n.answerTs).toLocaleDateString()}</span>}
              </div>
            :<div style={{display:"flex",gap:"5px",marginTop:"4px"}}>
              <input id={"ans-"+n.id} placeholder="Enter answer..." style={{flex:1,background:"transparent",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"5px 8px",outline:"none"}}/>
              <button type="button" onClick={()=>answer(fid,n.id,document.getElementById("ans-"+n.id).value)} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"5px 10px",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",fontWeight:"700"}}>OK</button>
            </div>}
        </div>)}
      </div>}
    </div>;
  };

  const R=({label,val,fid})=>{
    if(!val||(Array.isArray(val)&&!val.length))return null;
    return<div style={{marginBottom:"14px",paddingBottom:"14px",borderBottom:`1px solid ${C.bor}`}}>
      <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:"12px"}}>
        <span style={{fontSize:"12px",color:C.g5,fontFamily:"monospace"}}>{label}</span>
        <span style={{fontSize:"13px",color:C.g3,lineHeight:"1.65"}}>{Array.isArray(val)?val.join(", "):val}</span>
      </div>
    </div>;
  };
  const S=({t,children})=><div style={{marginBottom:"32px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
      <div style={{width:"20px",height:"2px",background:C.lime}}/>
      <span style={{fontSize:"11px",color:C.lime,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase"}}>{t}</span>
    </div>
    {children}
  </div>;

  return<>
    {showSend&&<SendModal brief={brief} onClose={()=>setShowSend(false)}/>}
    {expandedImg&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>setExpandedImg(null)}>
      <img src={expandedImg} style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:"8px"}} onClick={e=>e.stopPropagation()}/>
    </div>}
    <div style={{maxWidth:"800px",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.lime,cursor:"pointer",fontSize:"12px",fontFamily:"monospace"}}>← Back to All Briefs</button>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>openBriefMeTab(brief)} style={{background:C.blue,color:"#fff",border:"none",padding:"9px 20px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace",fontWeight:"700",letterSpacing:"0.05em"}}>SAVE</button>
          <button onClick={()=>setShowSend(true)} style={{background:"transparent",border:`1.5px solid ${C.blue}`,color:C.blue,padding:"9px 20px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace",fontWeight:"700",letterSpacing:"0.05em"}}>SEND</button>
        </div>
      </div>
      <div style={{borderBottom:`1px solid ${C.bor}`,paddingBottom:"20px",marginBottom:"28px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px",flexWrap:"wrap"}}>
          {brief.cbNumber&&<span style={{fontSize:"11px",color:C.g5,fontFamily:"monospace"}}>{formatCB(brief.cbNumber)}</span>}
          <h1 style={{fontSize:"32px",fontWeight:"800",color:C.w,letterSpacing:"-0.01em"}}>{brief.campaignName}</h1>
        </div>
        <p style={{color:C.g5,fontSize:"12px",fontFamily:"monospace"}}>Submitted by {brief.requestorName} · {new Date(brief.submittedAt).toLocaleString()}</p>
        {brief.campaignType&&<span style={{marginTop:"8px",display:"inline-block",background:`${C.blue}22`,border:`1px solid ${C.blue}55`,color:C.blue,padding:"3px 10px",borderRadius:"3px",fontSize:"11px",fontFamily:"monospace"}}>{brief.campaignType}</span>}
      </div>
      {isDesigner&&<AIBadge eligibility={aiEligibility}/>}

      {/* THE CREATIVE REQUEST — with clarification */}
      <div style={{background:`${C.blue}12`,borderLeft:`4px solid ${C.blue}`,padding:"18px 22px",marginBottom:"32px",borderRadius:"0 4px 4px 0"}}>
        <div style={{fontSize:"10px",color:C.blue,fontFamily:"monospace",marginBottom:"6px"}}>THE CREATIVE REQUEST</div>
        <p style={{fontSize:"16px",color:C.w,lineHeight:"1.7",margin:0,fontWeight:"500"}}>{brief.problemStatement}</p>
        <CrCl/>
      </div>

      <S t="Ownership">
        <R label="Requestor" val={brief.requestorName}/>
        <R label="Email" val={brief.requestorEmail}/>
      </S>
      <S t="Objective"><R label="Business Objective" val={brief.businessObjective}/></S>
      <S t="Decision Scope"><R label="Decision Needed" val={brief.decisionType}/><R label="Concepts Expected" val={brief.conceptCount}/></S>
      <S t="Audience"><R label="Primary" val={brief.primaryAudience}/></S>
      <S t="Core Message"><R label="Message Type" val={brief.messageTypes}/><R label="Product Truth" val={brief.productTruthSource==="Other"?brief.productTruthOther:brief.productTruthSource}/></S>

      {/* References — with image preview */}
      {brief.references?.length>0&&<S t="References">{brief.references.map((r,i)=><div key={r.id} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"4px",padding:"12px",marginBottom:"8px"}}>
        <div style={{fontSize:"11px",color:C.g5,fontFamily:"monospace",marginBottom:"8px"}}>REF {i+1}</div>
        {r.type==="file"&&r.fileDataUrl&&/\.(png|jpg|jpeg|gif|webp)/i.test(r.file?.name||"")&&(
          <img src={r.fileDataUrl} onClick={()=>setExpandedImg(r.fileDataUrl)} style={{width:"100%",maxHeight:"180px",objectFit:"cover",borderRadius:"4px",marginBottom:"8px",cursor:"pointer"}}/>
        )}
        {r.type==="file"&&r.file&&!/\.(png|jpg|jpeg|gif|webp)/i.test(r.file?.name||"")&&(
          <div style={{color:C.lime,fontSize:"12px",marginBottom:"6px"}}>📎 {r.file.name}</div>
        )}
        {r.type==="url"&&r.url&&<a href={r.url} target="_blank" rel="noreferrer" style={{color:"#50A8FF",fontSize:"12px",fontFamily:"monospace",display:"block",marginBottom:"6px"}}>{r.url}</a>}
        {r.likeBecause&&<div style={{fontSize:"11px",color:C.g3}}>Likes: {r.likeBecause}</div>}
      </div>)}</S>}

      <S t="Direction"><R label="Locked" val={brief.lockedElements}/><R label="Open" val={brief.openForExploration}/></S>
      <S t="Guardrails">
        <R label="Must Include" val={brief.finalMustInclude}/>
        <R label="Must Avoid" val={brief.mustAvoid}/>
        <R label="Sensitive Constraints" val={normaliseMaybeArr(brief.sensitiveConstraints).join(", ")||"None specified"}/>
      </S>
      <S t="Success Criteria"><R label="Evaluated by" val={brief.successCriteria}/></S>
      <S t="Deliverables">
        <R label="Assets" val={brief.assetTypes}/>
        <R label="Static Sizes" val={brief.staticSizes}/>
        {brief.assetTypes?.includes("Video")&&<>
          <R label="Video Duration" val={brief.videoDuration}/>
          <R label="Video Purpose" val={brief.videoPurpose}/>
        </>}
      </S>
    </div>
  </>;
}

/* ─── DASHBOARD ─── */
function Dashboard({briefs,onNew,onView,onStatus,role,setRole}){
  const isDesigner=role==="designer";
  const cnt=s=>briefs.filter(b=>b.status===s).length;
  const stats=[["New Briefs","New Brief",C.lime],["In Progress","In Progress",C.blue],["Needs Clarification","Needs Clarification",C.orange],["Closed","Closed",C.g5]];
  return<div style={{maxWidth:"900px",margin:"0 auto"}}>
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
        const aiEl=b.aiEligibility||computeAIEligibility(b);
        const tierMeta=AI_TIER_META[aiEl?.level]||AI_TIER_META.blocked;
        return<div key={b.id} onClick={()=>onView(b)} style={{background:C.sur,border:`1.5px solid ${C.bor}`,borderRadius:"4px",padding:"18px 22px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"stretch",gap:"20px"}}>
          {/* LEFT */}
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:"7px"}}>
            {/* Row 1: CB# + Campaign Name */}
            <div style={{display:"flex",alignItems:"baseline",gap:"9px"}}>
              {b.cbNumber&&<span style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",flexShrink:0,letterSpacing:"0.05em"}}>{formatCB(b.cbNumber)}</span>}
              <span style={{fontSize:"16px",fontWeight:"700",color:C.w,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.campaignName}</span>
            </div>
            {/* Row 2: Campaign Type */}
            {b.campaignType&&<div>
              <span style={{fontSize:"10px",color:C.blue,fontFamily:"monospace",border:`1px solid ${C.blue}33`,padding:"2px 8px",borderRadius:"2px",background:`${C.blue}0A`}}>{b.campaignType}</span>
            </div>}
            {/* Row 3: One-line description */}
            <p style={{fontSize:"12px",color:C.g3,lineHeight:"1.5",margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{b.problemStatement}</p>
            {/* Row 4: Deliverables */}
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
              {b.assetTypes?.slice(0,5).map(a=><span key={a} style={{background:C.g7,color:C.g5,padding:"2px 7px",fontSize:"10px",fontFamily:"monospace",borderRadius:"2px"}}>{a}</span>)}
            </div>
          </div>
          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"space-between",flexShrink:0,gap:"10px"}} onClick={e=>e.stopPropagation()}>
            <StatusToggle cur={b.status||"New Brief"} onChange={s=>onStatus(b.id,s)}/>
            {isDesigner&&<div style={{textAlign:"right"}}>
              <div style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:"3px"}}>AI ASSIST SCORE</div>
              <div style={{fontSize:"11px",fontWeight:"700",color:tierMeta.color,fontFamily:"monospace"}}>{aiEl.label}</div>
            </div>}
            <span style={{fontSize:"10px",color:C.g5,fontFamily:"monospace"}}>{new Date(b.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

/* ─── APP ROOT ─── */
export default function App(){
  const [screen,setScreen]=useState("form");
  const [briefs,setBriefs]=useState(()=>loadBriefs());
  const [sel,setSel]=useState(null);
  const [role,setRole]=useState("requestor"); // "requestor" | "designer"

  // Persist briefs to localStorage whenever they change
  useEffect(()=>{saveBriefs(briefs);},[briefs]);

  const submit=(b,dash)=>{setBriefs(p=>p.find(x=>x.id===b.id)?p:[b,...p]);if(dash){setScreen("dashboard");setSel(null);}};
  const onStatus=(id,s)=>setBriefs(p=>p.map(b=>b.id===id?{...b,status:s}:b));
  const onUpdate=u=>{setBriefs(p=>p.map(b=>b.id===u.id?u:b));setSel(u);};

  return<>
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
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          {/* Role toggle — always visible */}
          <div style={{background:C.sur,border:`1px solid ${C.bor}`,borderRadius:"3px",display:"inline-flex",padding:"2px",gap:"1px"}}>
            {[["requestor","Requestor"],["designer","Designer"]].map(([r,l])=>(
              <button key={r} onClick={()=>{setRole(r);if(r==="requestor"&&screen==="dashboard"){setScreen("form");setSel(null);}}} style={{background:role===r?"#2a2a2a":"transparent",border:"none",color:role===r?C.w:C.g5,padding:"4px 12px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",letterSpacing:"0.08em",borderRadius:"2px",fontWeight:role===r?"600":"400"}}>{l.toUpperCase()}</button>
            ))}
          </div>
          {/* Dashboard nav — designer only */}
          {role==="designer"&&<nav style={{display:"flex",gap:"2px"}}>
            {[["form","New Brief"],["dashboard","Dashboard"]].map(([id,l])=>(
              <button key={id} onClick={()=>{setScreen(id);setSel(null);}} style={{background:screen===id?C.lime:"transparent",border:"none",color:screen===id?"#0F0F0F":C.lime,padding:"6px 14px",cursor:"pointer",fontFamily:"monospace",fontSize:"11px",letterSpacing:"0.08em",fontWeight:screen===id?"700":"400",borderRadius:"3px"}}>{l.toUpperCase()}</button>
            ))}
          </nav>}
        </div>
      </header>
      <div style={{height:"3px",background:`linear-gradient(90deg,${C.blue},#50A8FF,${C.blue})`}}/>
      <div style={{minHeight:"calc(100vh - 55px)"}}>
        {screen==="form"&&<WizardView onSubmit={submit} briefCount={briefs.length} isDesigner={role==="designer"}/>}
        {screen==="dashboard"&&!sel&&<div style={{padding:"44px 36px"}}><Dashboard briefs={briefs} onNew={()=>setScreen("form")} onView={b=>setSel(b)} onStatus={onStatus} role={role} setRole={setRole}/></div>}
        {screen==="dashboard"&&sel&&<div style={{padding:"44px 36px"}}><BriefDetail brief={sel} onBack={()=>setSel(null)} onUpdate={onUpdate} isDesigner={role==="designer"}/></div>}
      </div>
    </div>
  </>;
}
