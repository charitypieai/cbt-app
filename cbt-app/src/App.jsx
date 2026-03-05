import { useState, useMemo, useEffect } from "react";

const C = {
  bg:"#0F0F0F",sur:"#1A1A1A",bor:"#2E2E2E",
  blue:"#0078D4",lime:"#D1FF98",orange:"#FF8C00",
  w:"#F5F5F5",g3:"#A0A0A0",g5:"#666",g7:"#333",
  red:"#FF6B6B",green:"#4CAF82",gold:"#FFD700"
};
const STATUSES=["New Brief","In Progress","Needs Clarification","Archived"];
const SCOL={"New Brief":C.lime,"In Progress":C.blue,"Needs Clarification":C.orange,"Archived":C.g5};
const SNAMES=["","Who & What","Scope & Audience","Message & Direction","References","Deliverables"];
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
  // Screen 1 — Who & What
  {id:"requestorName",s:1,q:"Who is submitting this brief?",t:"text",ph:"Your full name",req:true},
  {id:"requestorTitle",s:1,q:"Title",t:"text",ph:"e.g. Senior Brand Manager",req:false},
  {id:"requestorEmail",s:1,q:"Email address",t:"text",ph:"your@email.com",req:true},
  {id:"campaignName",s:1,q:"Campaign / Project Name",t:"text",ph:"e.g. Surface Pro Q3 Launch",req:true},
  {id:"campaignType",s:1,q:"Campaign Type",t:"campaignType",req:true},
  {id:"businessObjective",s:1,q:"Primary business objective?",t:"multi",req:true,opts:["Increase understanding","Change perception","Drive action","Support existing campaign","Other"],otherKey:"businessObjectiveOther"},
  {id:"problemStatement",s:1,q:"The Creative Request",t:"textarea",ph:"What gap, barrier, or tension are we resolving?",req:true},
  // Screen 2 — Scope & Audience
  {id:"decisionType",s:2,q:"What decision is needed from Design?",t:"single",req:true,opts:["Exploratory concepts","Single recommended direction","Iteration on existing work","Execution of pre-approved direction","Resize / adapt existing assets"]},
  {id:"conceptCount",s:2,q:"How many concepts are expected?",t:"single",req:true,opts:["1 strong direction","2-3 distinct approaches","Iterations on 1 existing concept","Align in review"]},
  {id:"primaryAudience",s:2,q:"Who is the primary audience?",t:"text",ph:"e.g. SMB IT decision-makers, 35-54",req:true},
  {id:"audienceType",s:2,q:"How is this audience defined?",t:"single",req:true,
    opts:["Persona / segment-based (no hard demographic data)","Demographic data available (age range, income, etc.)","Both persona and demographic data available"],
    hint:"This helps us understand how grounded the audience definition is."},
  // Screen 3 — Message & Direction
  {id:"messageTypes",s:3,q:"What type of message is this?",t:"multi",req:true,opts:["Product capability","Benefit-led","Proof / credibility","Emotional / cultural","Mixed"]},
  {id:"productTruthSource",s:3,q:"What is the source of product truth?",t:"single",req:true,opts:["Approved product documentation","Existing campaign / system","PM or Marketing alignment","Other"],otherKey:"productTruthOther"},
  {id:"lockedElements",s:3,q:"What is already decided and locked?",t:"multi",req:true,opts:["Messaging","Brand system","CTA","Product positioning","Other"],otherKey:"lockedElementsOther"},
  {id:"openForExploration",s:3,q:"What is open for creative exploration?",t:"multi",req:true,opts:["Visual approach","Tone","Narrative","Metaphor vs. literal","Other"],otherKey:"openForExplorationOther"},
  {id:"finalMustInclude",s:3,q:"What must appear in the final design?",t:"multi",req:true,opts:["Logo","Product name","CTA","Legal","Accessibility","Other"],otherKey:"finalMustIncludeOther"},
  {id:"sensitiveConstraints",s:3,q:"Does this brief contain any sensitive constraints?",t:"sensitiveConstraints",req:true,
    hint:"Select all that apply. This field directly informs AI routing — be explicit."},
  // Screen 4 — References
  {id:"references",s:4,q:"Reference examples",t:"refs",req:false},
  // Screen 5 — Deliverables
  {id:"assetTypes",s:5,q:"What asset types are needed?",t:"multi",req:true,opts:["Static","Carousel","Video","System","Other"],otherKey:"assetOther",systemHint:"Reusable visual or messaging architecture intended to scale across multiple formats, campaigns, or time periods — not a one-off asset set."},
  {id:"staticSizes",s:5,q:"Static sizes",t:"staticSizes",req:true,showIf:f=>f.assetTypes?.includes("Static")},
  {id:"videoDuration",s:5,q:"Video duration(s)",t:"videoDuration",req:true,showIf:f=>f.assetTypes?.includes("Video")},
  {id:"videoPurpose",s:5,q:"Video purpose",t:"videoPurpose",req:true,showIf:f=>f.assetTypes?.includes("Video")},
  {id:"channels",s:5,q:"Which channels will this run on?",t:"channels",req:true},
];

const PLATFORMS=["Instagram","TikTok","X","YouTube","LinkedIn","Other"];
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
    // Always validate refs section: any added ref must have likeBecause and avoid filled
    const refs=normaliseMaybeArr(form.references);
    if(refs.length>0 && cur.some(f=>f.t==="refs")){
      for(const r of refs){if(!r.likeBecause?.trim()||!r.avoid?.trim())return false;}
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
      else if(f.t==="sensitiveConstraints"){const sc=normaliseMaybeArr(form.sensitiveConstraints);if(!sc.length)return false;}
      else if(f.t==="staticSizes"){const ss=Array.isArray(form.staticSizes)?form.staticSizes:[];if(!ss.length)return false;if(ss.includes("Other")&&!form.staticSizesOther?.trim())return false;}
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
    {refs.map((ref,i)=><div key={ref.id} style={{background:"#151515",border:`1px solid ${C.bor}`,borderRadius:"6px",padding:"24px",marginBottom:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"14px"}}>
        <span style={{fontSize:"13px",color:C.g3,fontFamily:"monospace",fontWeight:"600"}}>REF {i+1}</span>
        <button type="button" onClick={()=>del(ref.id)} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:"13px"}}>× remove</button>
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
        {["url","file"].map(t=><button key={t} type="button" onClick={()=>upd(ref.id,{type:t})} style={{background:ref.type===t?C.lime:"transparent",border:`1.5px solid ${ref.type===t?C.lime:C.bor}`,color:ref.type===t?"#0F0F0F":C.g3,padding:"6px 16px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace",fontWeight:ref.type===t?"700":"400"}}>{t.toUpperCase()}</button>)}
      </div>
      {ref.type==="url"&&<input value={ref.url} onChange={e=>upd(ref.id,{url:e.target.value})} placeholder="https://..." style={{...ul(!!ref.url),fontSize:"15px",marginBottom:"14px"}}/>}
      {ref.type==="file"&&<label style={{display:"flex",alignItems:"center",gap:"10px",border:`1.5px dashed ${ref.file?C.lime:C.bor}`,borderRadius:"4px",padding:"14px",cursor:"pointer",marginBottom:"14px"}}>
        <span style={{fontSize:"14px",color:ref.file?C.lime:C.g3}}>{ref.file?ref.file.name:"Click to upload (max 10MB)"}</span>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.pptx" onChange={e=>{
          if(e.target.files[0]){
            const file=e.target.files[0];
            const reader=new FileReader();
            reader.onload=ev=>upd(ref.id,{file,fileDataUrl:ev.target.result});
            reader.readAsDataURL(file);
          }
        }} style={{display:"none"}}/>
      </label>}
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div>
          <div style={{fontSize:"12px",color:C.g3,marginBottom:"8px",fontWeight:"600"}}>WHY I LIKE THIS <span style={{color:C.lime}}>*</span></div>
          <textarea value={ref.likeBecause||""} onChange={e=>upd(ref.id,{likeBecause:e.target.value})} placeholder="What draws you to this example..." rows={3} style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"4px",color:C.w,fontSize:"15px",padding:"10px 12px",outline:"none",resize:"none",lineHeight:"1.6"}}/>
        </div>
        <div>
          <div style={{fontSize:"12px",color:C.g3,marginBottom:"8px",fontWeight:"600"}}>DO NOT COPY <span style={{color:C.lime}}>*</span></div>
          <input value={ref.avoid||""} onChange={e=>upd(ref.id,{avoid:e.target.value})} placeholder="Avoid replicating..." style={{width:"100%",background:"#0F0F0F",border:`1px solid ${C.bor}`,borderRadius:"4px",color:C.w,fontSize:"15px",padding:"10px 12px",outline:"none"}}/>
        </div>
      </div>
    </div>)}
    <button type="button" onClick={add} style={{width:"100%",background:"transparent",border:`1.5px dashed ${C.bor}`,color:C.lime,padding:"14px",borderRadius:"4px",cursor:"pointer",fontSize:"14px",fontFamily:"monospace"}}>+ ADD REFERENCE</button>
  </div>;
}

function ChField({form,set}){
  const ch=form.channels2||{Instagram:[],TikTok:[],X:[],YouTube:[],LinkedIn:[],Other:[]};
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

/* ─── STATIC SIZES FIELD ─── */
const STATIC_SIZE_OPTS=["300x250","300x300","300x600","728x90","Other"];
function StaticSizesField({form,set}){
  const sel=Array.isArray(form.staticSizes)?form.staticSizes:form.staticSizes?[form.staticSizes]:[];
  const tog=opt=>{
    const next=sel.includes(opt)?sel.filter(o=>o!==opt):[...sel,opt];
    set("staticSizes",next);
  };
  return<div>
    <Ql q="Static sizes" req={true}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"4px"}}>
      {STATIC_SIZE_OPTS.map(o=><button key={o} type="button" onClick={()=>tog(o)}
        style={{padding:"14px 12px",border:`1.5px solid ${sel.includes(o)?C.lime:C.bor}`,borderRadius:"4px",background:sel.includes(o)?"#D1FF9810":"transparent",color:sel.includes(o)?C.lime:C.w,cursor:"pointer",fontSize:"15px",fontWeight:sel.includes(o)?"700":"400",textAlign:"left",display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{width:"16px",height:"16px",borderRadius:"3px",border:`2px solid ${sel.includes(o)?C.lime:C.g5}`,background:sel.includes(o)?C.lime:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {sel.includes(o)&&<span style={{color:"#0F0F0F",fontSize:"10px",fontWeight:"900",lineHeight:1}}>✓</span>}
        </div>
        {o}
      </button>)}
    </div>
    {sel.includes("Other")&&<div style={{marginTop:"12px"}}>
      <input value={form.staticSizesOther||""} onChange={e=>set("staticSizesOther",e.target.value)} placeholder="e.g. 1080x1080, 1200x628" style={{...ul(!!form.staticSizesOther),fontSize:"15px"}}/>
    </div>}
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

  if(f.t==="staticSizes")return<StaticSizesField form={form} set={set}/>;
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
  const aiEl=computeAIEligibility(brief);

  const row=(label,val)=>val?`<tr><td style="width:180px;padding:8px 16px 8px 0;vertical-align:top;font-size:13px;font-weight:700;color:#555;">${label}</td><td style="padding:8px 0;font-size:14px;color:#111;line-height:1.6;">${Array.isArray(val)?val.join(", "):val}</td></tr>`:"";

  const refBlocks=refs.map((r,i)=>{
    let media="";
    if(r.type==="file"&&r.fileDataUrl&&/\.(png|jpg|jpeg|gif|webp)/i.test(r.file?.name||"")){
      media=`<img src="${r.fileDataUrl}" style="width:100%;max-height:260px;object-fit:cover;margin-bottom:12px;border:1px solid #eee;"/>`;
    } else if(r.type==="url"&&r.url){
      media=`<div style="font-size:13px;color:#0078D4;margin-bottom:12px;word-break:break-all;">${r.url}</div>`;
    }
    return`<div style="border:1px solid #ddd;padding:20px;margin-bottom:16px;break-inside:avoid;">
      <div style="font-size:11px;font-weight:700;color:#999;letter-spacing:0.1em;margin-bottom:12px;">REFERENCE ${i+1}</div>
      ${media}
      ${r.likeBecause?`<div style="margin-bottom:10px;"><div style="font-size:11px;font-weight:700;color:#555;margin-bottom:4px;">WHY I LIKE THIS</div><div style="font-size:14px;color:#111;line-height:1.6;">${r.likeBecause}</div></div>`:""}
      ${r.avoid?`<div><div style="font-size:11px;font-weight:700;color:#c00;margin-bottom:4px;">DO NOT COPY</div><div style="font-size:14px;color:#333;line-height:1.6;">${r.avoid}</div></div>`:""}
    </div>`;
  }).join("");

  const aiBlock=`<div style="border-left:3px solid #000;padding:14px 18px;margin-bottom:24px;break-inside:avoid;">
    <div style="font-size:11px;font-weight:700;color:#999;letter-spacing:0.1em;margin-bottom:6px;">AI ASSIST RECOMMENDATION</div>
    <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:6px;">${aiEl.label}</div>
    ${aiEl.tasks.length?`<div style="font-size:13px;color:#555;margin-bottom:8px;">Suggested tasks: ${aiEl.tasks.join(" · ")}</div>`:""}
    ${aiEl.blocks.length?`<div style="font-size:13px;color:#555;">${aiEl.blocks.map(b=>`<div style="margin-bottom:3px;">— ${b}</div>`).join("")}</div>`:""}
    ${aiEl.reasons.length&&aiEl.level!=="blocked"?`<div style="font-size:12px;color:#999;margin-top:6px;">${aiEl.reasons.join(" · ")}</div>`:""}
  </div>`;

  const html=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${brief.campaignName} — Brief</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Georgia,serif;background:#fff;color:#111;font-size:14px;line-height:1.6;}
  .page{max-width:800px;margin:0 auto;padding:48px 40px 80px;}
  h1{font-size:28px;font-weight:700;line-height:1.2;margin-bottom:6px;}
  h2{font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#555;border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:16px;margin-top:32px;}
  table{width:100%;border-collapse:collapse;}
  .no-print{background:#111;padding:12px 32px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;}
  @media print{.no-print{display:none!important;}.page{padding:32px 32px 60px;}}
</style>
</head><body>
<div class="no-print">
  <span style="color:#D1FF98;font-size:12px;letter-spacing:0.1em;">${brief.campaignName}</span>
  <button onclick="window.print()" style="background:#D1FF98;color:#111;border:none;padding:8px 20px;cursor:pointer;font-weight:700;font-size:12px;">DOWNLOAD PDF</button>
</div>
<div class="page">
  <div style="border-bottom:2px solid #111;padding-bottom:20px;margin-bottom:28px;">
    <div style="font-size:12px;font-weight:700;color:#999;letter-spacing:0.12em;margin-bottom:8px;">${brief.cbNumber?"CB"+String(brief.cbNumber).padStart(3,"0"):""}</div>
    <h1>${brief.campaignName}</h1>
    <div style="font-size:13px;color:#777;margin-top:6px;">Submitted by ${brief.requestorName||""}${brief.requestorTitle?" · "+brief.requestorTitle:""} · ${new Date(brief.submittedAt).toLocaleDateString()}</div>
    ${brief.campaignType?`<div style="margin-top:10px;font-size:13px;font-weight:700;color:#555;">${brief.campaignType}</div>`:""}
  </div>

  <div style="border-left:3px solid #000;padding:14px 18px;margin-bottom:28px;background:#fafafa;">
    <div style="font-size:11px;font-weight:700;color:#999;letter-spacing:0.1em;margin-bottom:8px;">THE CREATIVE REQUEST</div>
    <div style="font-size:16px;line-height:1.7;color:#111;">${brief.problemStatement||""}</div>
  </div>

  ${aiBlock}

  <h2>Ownership</h2>
  <table>${row("Requestor",brief.requestorName)}${row("Title",brief.requestorTitle)}${row("Email",brief.requestorEmail)}</table>

  <h2>Objective</h2>
  <table>${row("Business Objective",brief.businessObjective)}</table>

  <h2>Scope</h2>
  <table>${row("Decision Needed",brief.decisionType)}${row("Concepts Expected",brief.conceptCount)}</table>

  <h2>Audience</h2>
  <table>${row("Primary Audience",brief.primaryAudience)}${row("Audience Type",brief.audienceType)}</table>

  <h2>Message</h2>
  <table>${row("Message Type",brief.messageTypes)}${row("Source of Truth",brief.productTruthSource==="Other"?brief.productTruthOther:brief.productTruthSource)}</table>

  <h2>Direction</h2>
  <table>${row("Locked Elements",brief.lockedElements)}${row("Open for Exploration",brief.openForExploration)}</table>

  <h2>Guardrails</h2>
  <table>${row("Must Include",brief.finalMustInclude)}${row("Sensitive Constraints",normaliseMaybeArr(brief.sensitiveConstraints).filter(s=>s!=="None of the above").join(", ")||"None")}</table>

  <h2>Deliverables</h2>
  <table>
    ${row("Asset Types",brief.assetTypes)}
    ${row("Static Sizes",Array.isArray(brief.staticSizes)?brief.staticSizes.map(s=>s==="Other"&&brief.staticSizesOther?brief.staticSizesOther:s).join(", "):brief.staticSizes||"")}
    ${brief.assetTypes?.includes("Video")?row("Video Duration",brief.videoDuration):""}
    ${brief.assetTypes?.includes("Video")?row("Video Purpose",brief.videoPurpose):""}
  </table>

  ${refs.length?`<h2>References</h2>${refBlocks}`:""}

  <div style="border-top:1px solid #ddd;padding-top:16px;margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#999;">
    <span>Creative Brief Translator (CBT)</span>
    <span>Confidential — Internal Use Only</span>
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
  useEffect(()=>{
    const handler=e=>{
      if(e.key!=="Enter")return;
      const tag=(e.target||{}).tagName;
      if(tag==="TEXTAREA"||tag==="BUTTON")return;
      if(!w.ok())return;
      if(w.isL){submit();}else{go(w.next);}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  });
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
  const [answerDrafts,setAnswerDrafts]=useState({});
  const [showSend,setShowSend]=useState(false);
  const [expandedImg,setExpandedImg]=useState(null);
  const [clarLogOpen,setClarLogOpen]=useState(false);
  const aiEligibility=useMemo(()=>brief.aiEligibility||computeAIEligibility(brief),[brief]);

  const MAX_ROUNDS=3;
  const fid="problemStatement";
  const ex=clarifs[fid]||[];
  const roundCount=ex.length;
  const allAnswered=ex.length>0&&ex.every(n=>n.answered);
  const canAskMore=roundCount<MAX_ROUNDS;

  const send=(fid)=>{
    if(!draft.trim())return;
    // Determine who is sending: designer asks, requestor answers (simplified: use role)
    const from=isDesigner?"Design Team":brief.requestorName||"Requestor";
    const n={id:Date.now(),q:draft,from,ts:new Date().toISOString(),answered:false,answer:"",answerFrom:"",answerTs:null};
    const up={...clarifs,[fid]:[...(clarifs[fid]||[]),n]};
    setClarifs(up);setActive(null);setDraft("");
    // Auto-change status to Needs Clarification
    onUpdate({...brief,clarifications:up,status:"Needs Clarification"});
  };

  const answer=(fid,nid)=>{
    const ans=answerDrafts[nid]||"";
    if(!ans.trim())return;
    const answerFrom=isDesigner?"Design Team":brief.requestorName||"Requestor";
    const up={...clarifs,[fid]:(clarifs[fid]||[]).map(n=>n.id===nid?{...n,answered:true,answer:ans,answerFrom,answerTs:new Date().toISOString()}:n)};
    setClarifs(up);
    setAnswerDrafts(d=>{const nd={...d};delete nd[nid];return nd;});
    onUpdate({...brief,clarifications:up});
  };

  const markInProgress=()=>{
    onUpdate({...brief,status:"In Progress"});
  };

  // "The Creative Request" clarification — collapsible log
  const CrCl=()=>{
    const open=active===fid;
    return<div style={{marginTop:"8px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        {canAskMore&&<button type="button" onClick={()=>{setActive(open?null:fid);setDraft("");}} style={{background:"transparent",border:"none",color:C.orange,cursor:"pointer",fontSize:"11px",fontFamily:"monospace",padding:0}}>
          {open?"cancel":"request clarification"}
        </button>}
        {!canAskMore&&<span style={{fontSize:"10px",color:C.g5,fontFamily:"monospace"}}>Max {MAX_ROUNDS} rounds reached</span>}
        {ex.length>0&&<button type="button" onClick={()=>setClarLogOpen(l=>!l)} style={{background:"transparent",border:"none",color:C.g5,cursor:"pointer",fontSize:"10px",fontFamily:"monospace",padding:0}}>
          {clarLogOpen?"▾ hide log":"▸ show log"} ({ex.length})
        </button>}
        {allAnswered&&brief.status==="Needs Clarification"&&<button type="button" onClick={markInProgress} style={{background:C.blue,color:"#fff",border:"none",padding:"4px 12px",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",fontWeight:"700"}}>Mark In Progress</button>}
      </div>
      {open&&<div style={{marginTop:"8px",background:"#1A1000",border:`1px solid ${C.orange}44`,borderRadius:"4px",padding:"10px"}}>
        <div style={{fontSize:"10px",color:C.orange,fontFamily:"monospace",marginBottom:"6px"}}>
          QUESTION FROM {isDesigner?"DESIGN TEAM":"YOU"} → {isDesigner?brief.requestorName?.toUpperCase():"DESIGN TEAM"} · Round {roundCount+1} of {MAX_ROUNDS}
        </div>
        <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="What needs clarification?" rows={2} style={{width:"100%",background:"transparent",border:`1px solid ${C.orange}44`,borderRadius:"3px",color:C.w,fontSize:"13px",padding:"7px",outline:"none",resize:"none",marginBottom:"7px"}}/>
        <button type="button" onClick={()=>send(fid)} style={{background:C.orange,color:"#0F0F0F",border:"none",padding:"6px 14px",borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontFamily:"monospace",fontWeight:"700"}}>SEND + NOTIFY</button>
      </div>}
      {clarLogOpen&&ex.length>0&&<div style={{marginTop:"8px"}}>
        {ex.map((n,idx)=><div key={n.id} style={{background:"#151500",border:`1px solid ${C.orange}33`,borderRadius:"3px",padding:"10px",marginBottom:"6px"}}>
          <div style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",marginBottom:"4px"}}>ROUND {idx+1} OF {MAX_ROUNDS}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px",gap:"8px"}}>
            <div>
              <div style={{fontSize:"9px",color:C.orange,fontFamily:"monospace",marginBottom:"2px"}}>FROM: {n.from||"Design Team"}</div>
              <div style={{fontSize:"12px",color:C.w}}>{n.q}</div>
            </div>
            <span style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",flexShrink:0}}>{new Date(n.ts).toLocaleDateString()}</span>
          </div>
          {n.answered
            ?<div style={{marginTop:"6px",paddingTop:"6px",borderTop:`1px solid ${C.bor}`}}>
                <div style={{fontSize:"9px",color:C.lime,fontFamily:"monospace",marginBottom:"2px"}}>FROM: {n.answerFrom||"Requestor"}</div>
                <div style={{display:"flex",justifyContent:"space-between",gap:"8px"}}>
                  <div style={{fontSize:"12px",color:C.lime}}>{n.answer}</div>
                  {n.answerTs&&<span style={{fontSize:"9px",color:C.g5,fontFamily:"monospace",flexShrink:0}}>{new Date(n.answerTs).toLocaleDateString()}</span>}
                </div>
              </div>
            :<div style={{marginTop:"6px",paddingTop:"6px",borderTop:`1px solid ${C.bor}`}}>
              <div style={{fontSize:"9px",color:C.lime,fontFamily:"monospace",marginBottom:"4px"}}>FROM: {isDesigner?brief.requestorName||"Requestor":"Design Team"}</div>
              <div style={{display:"flex",gap:"5px"}}>
                <input
                  value={answerDrafts[n.id]||""}
                  onChange={e=>setAnswerDrafts(d=>({...d,[n.id]:e.target.value}))}
                  placeholder="Enter answer..."
                  style={{flex:1,background:"transparent",border:`1px solid ${C.bor}`,borderRadius:"3px",color:C.w,fontSize:"12px",padding:"5px 8px",outline:"none"}}
                />
                <button type="button" onClick={()=>answer(fid,n.id)} style={{background:C.lime,color:"#0F0F0F",border:"none",padding:"5px 10px",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",fontWeight:"700"}}>OK</button>
              </div>
            </div>}
        </div>)}
      </div>}
    </div>;
  };

  const R=({label,val})=>{
    if(!val||(Array.isArray(val)&&!val.length))return null;
    return<div style={{marginBottom:"16px",paddingBottom:"16px",borderBottom:`1px solid ${C.bor}`}}>
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:"16px"}}>
        <span style={{fontSize:"13px",color:C.g5,fontFamily:"monospace",paddingTop:"2px"}}>{label}</span>
        <span style={{fontSize:"15px",color:C.w,lineHeight:"1.65"}}>{Array.isArray(val)?val.join(", "):val}</span>
      </div>
    </div>;
  };
  const S=({t,children})=><div style={{marginBottom:"36px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
      <div style={{width:"24px",height:"2px",background:C.lime}}/>
      <span style={{fontSize:"13px",color:C.lime,fontFamily:"monospace",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:"700"}}>{t}</span>
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
        <p style={{color:C.g3,fontSize:"14px",fontFamily:"monospace"}}>Submitted by {brief.requestorName}{brief.requestorTitle?` · ${brief.requestorTitle}`:""} · {new Date(brief.submittedAt).toLocaleString()}</p>
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
        {brief.requestorTitle&&<R label="Title" val={brief.requestorTitle}/>}
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
        {r.avoid&&<div style={{fontSize:"11px",color:C.red,marginTop:"3px"}}>Do not copy: {r.avoid}</div>}
      </div>)}</S>}

      <S t="Direction"><R label="Locked" val={brief.lockedElements}/><R label="Open" val={brief.openForExploration}/></S>
      <S t="Guardrails">
        <R label="Must Include" val={brief.finalMustInclude}/>
        <R label="Sensitive Constraints" val={normaliseMaybeArr(brief.sensitiveConstraints).join(", ")||"None specified"}/>
      </S>
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
function Dashboard({briefs,onNew,onView,onStatus,role}){
  const isDesigner=role==="designer";
  const [filter,setFilter]=useState("all"); // "all"|"New Brief"|"In Progress"|"Needs Clarification"|"Archived"
  const [showArchived,setShowArchived]=useState(false);

  const active=briefs.filter(b=>b.status!=="Archived");
  const archived=briefs.filter(b=>b.status==="Archived");

  const cnt=s=>briefs.filter(b=>b.status===s).length;
  const stats=[
    {label:"New Briefs",key:"New Brief",color:C.lime},
    {label:"In Progress",key:"In Progress",color:C.blue},
    {label:"Needs Clarification",key:"Needs Clarification",color:C.orange},
    {label:"Archived",key:"Archived",color:C.g5},
  ];

  const displayed=showArchived
    ? archived
    : filter==="all" ? active : active.filter(b=>b.status===filter);

  return<div style={{maxWidth:"900px",margin:"0 auto"}}>
    {/* Stat boxes — clickable filters */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"28px"}}>
      {stats.map(({label,key,color})=>{
        const isArchived=key==="Archived";
        const active2=isArchived?showArchived:(filter===key&&!showArchived);
        return<div key={key} onClick={()=>{
          if(isArchived){setShowArchived(s=>!s);setFilter("all");}
          else{setShowArchived(false);setFilter(f=>f===key?"all":key);}
        }} style={{background:active2?`${color}18`:C.sur,border:`1.5px solid ${active2?color:C.bor}`,borderRadius:"4px",padding:"16px 18px",cursor:"pointer",transition:"all 0.15s"}}>
          <div style={{fontSize:"28px",fontWeight:"800",color,marginBottom:"3px",fontFamily:"monospace"}}>{cnt(key)}</div>
          <div style={{fontSize:"10px",color:active2?color:C.g5,fontFamily:"monospace",letterSpacing:"0.08em"}}>{label.toUpperCase()}</div>
        </div>;
      })}
    </div>

    {/* Section header */}
    <div style={{display:"flex",alignItems:"center",marginBottom:"16px",gap:"10px"}}>
      <h2 style={{fontSize:"15px",fontWeight:"700",color:C.w,fontFamily:"monospace"}}>
        {showArchived?"ARCHIVED BRIEFS":filter==="all"?"ALL BRIEFS":filter.toUpperCase()}
      </h2>
      <span style={{fontSize:"11px",color:C.g5,fontFamily:"monospace"}}>({displayed.length})</span>
      {(filter!=="all"||showArchived)&&<button onClick={()=>{setFilter("all");setShowArchived(false);}} style={{background:"transparent",border:"none",color:C.g5,cursor:"pointer",fontSize:"10px",fontFamily:"monospace"}}>clear ×</button>}
    </div>

    {displayed.length===0
      ?<div style={{border:`2px dashed ${C.bor}`,borderRadius:"4px",padding:"60px",textAlign:"center"}}>
        <p style={{color:C.g5,fontSize:"13px",fontFamily:"monospace"}}>{showArchived?"No archived briefs.":"No briefs in this state."}</p>
      </div>
      :<div style={{display:"flex",flexDirection:"column",gap:"1px",border:`1px solid ${C.bor}`,borderRadius:"4px",overflow:"hidden"}}>
        {displayed.map(b=>{
          const aiEl=b.aiEligibility||computeAIEligibility(b);
          const tierMeta=AI_TIER_META[aiEl?.level]||AI_TIER_META.blocked;
          const statusColor=SCOL[b.status||"New Brief"]||C.g5;
          return<div key={b.id} onClick={()=>onView(b)} style={{background:C.sur,padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"16px",borderBottom:`1px solid ${C.bor}`}}>
            {/* CB# */}
            <span style={{fontSize:"10px",color:C.g5,fontFamily:"monospace",flexShrink:0,width:"40px"}}>{b.cbNumber?formatCB(b.cbNumber):""}</span>
            {/* Status dot */}
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:statusColor,flexShrink:0}}/>
            {/* Main content */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"baseline",gap:"10px",marginBottom:"4px"}}>
                <span style={{fontSize:"16px",fontWeight:"700",color:C.w,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.campaignName}</span>
                {b.campaignType&&<span style={{fontSize:"12px",color:C.blue,flexShrink:0}}>{b.campaignType}</span>}
              </div>
              <p style={{fontSize:"13px",color:C.g3,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.problemStatement}</p>
            </div>
            {/* Right side */}
            <div style={{display:"flex",alignItems:"center",gap:"16px",flexShrink:0}} onClick={e=>e.stopPropagation()}>
              {b.assetTypes?.length>0&&<div style={{display:"flex",gap:"6px"}}>
                {b.assetTypes.slice(0,3).map(a=><span key={a} style={{fontSize:"12px",color:C.g3,fontFamily:"monospace"}}>{a}</span>)}
              </div>}
              {isDesigner&&<span style={{fontSize:"12px",color:tierMeta.color,fontFamily:"monospace",width:"90px",textAlign:"right"}}>{aiEl.label.replace(" AI Assist","").replace("Human-Only Design","Human")}</span>}
              <span style={{fontSize:"12px",color:C.g3,fontFamily:"monospace",width:"44px",textAlign:"right"}}>{new Date(b.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
              <StatusToggle cur={b.status||"New Brief"} onChange={s=>onStatus(b.id,s)}/>
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
        {screen==="dashboard"&&!sel&&<div style={{padding:"44px 36px"}}><Dashboard briefs={briefs} onNew={()=>setScreen("form")} onView={b=>setSel(b)} onStatus={onStatus} role={role}/></div>}
        {screen==="dashboard"&&sel&&<div style={{padding:"44px 36px"}}><BriefDetail brief={sel} onBack={()=>setSel(null)} onUpdate={onUpdate} isDesigner={role==="designer"}/></div>}
      </div>
    </div>
  </>;
}
