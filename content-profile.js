// Fieldwork content constitution. These values control depth and recurrence, not a visible curriculum.
const FIELDWORK_PROFILE={
  dimensions:{
    coding:1,
    apiArchitecture:2,
    analytics:3.5,
    softwareSystems:4,
    troubleshooting:4,
    technicalCommunication:4,
    productManagement:5,
    agencyStakeholders:5
  },
  // Transit is the setting threaded through the dimensions above, not a separate technical bar.
  rules:[
    'Prefer product decisions over implementation trivia.',
    'Use transit and agency contexts as the operating environment.',
    'Technical questions should test system tracing, failure modes, evidence and communication before code.',
    'API questions stay conceptual: inputs, outputs, errors, rate limits, freshness, latency, dependencies and fallback behaviour.',
    'Analytics questions require calculations plus interpretation, uncertainty and a next decision.',
    'Agency questions require expectation management, competing stakeholders, local constraints and rider impact.',
    'Coding is recognition-only and should not be required to complete an assignment.'
  ]
};

function quickContentWeight(q){
  const text=((q.s||'')+' '+(q.q||'')).toLowerCase();
  if(/\b(api|http|json|endpoint|429|rate limit|query parameter|authentication)\b/.test(text))return FIELDWORK_PROFILE.dimensions.apiArchitecture;
  if(q.skill==='Analytics')return FIELDWORK_PROFILE.dimensions.analytics;
  if(q.skill==='Systems')return FIELDWORK_PROFILE.dimensions.softwareSystems;
  if(q.skill==='Communication')return FIELDWORK_PROFILE.dimensions.technicalCommunication;
  if(q.skill==='Partner work')return FIELDWORK_PROFILE.dimensions.agencyStakeholders;
  if(q.skill==='Problem framing'||q.skill==='Judgment'||q.skill==='Delivery')return FIELDWORK_PROFILE.dimensions.productManagement;
  if(q.skill==='Transit domain')return 4; // domain fluency is contextual and should remain common.
  return 3;
}

function weightedSampleWithoutReplacement(items,count,weightFn,r){
  return items.map(item=>{
    const w=Math.max(.1,Number(weightFn(item))||1);
    return {item,key:-Math.log(Math.max(1e-9,r()))/w};
  }).sort((a,b)=>a.key-b.key).slice(0,count).map(x=>x.item);
}

function weightedQuickSet(bank,count,r){return weightedSampleWithoutReplacement(bank,count,quickContentWeight,r)}

const MIXED_MODE_WEIGHTS=[
  ['startQuick',5],
  ['startDecision',5],
  ['startRequirements',5],
  ['startInvestigation',4],
  ['startRelease',4],
  ['startData',3.5],
  ['startApi',2]
];
function weightedModeName(r){
  const total=MIXED_MODE_WEIGHTS.reduce((s,x)=>s+x[1],0);let n=r()*total;
  for(const [name,w] of MIXED_MODE_WEIGHTS){n-=w;if(n<=0)return name}
  return MIXED_MODE_WEIGHTS[0][0];
}

function interviewContentWeight(level,q){
  const t=(q.q+' '+(q.follow||[]).join(' ')).toLowerCase();
  let w=3;
  if(/agency|partner|stakeholder|customer|contract|kickoff|expect/.test(t))w=Math.max(w,5);
  if(/priorit|tradeoff|scope|requirement|roadmap|launch|product|decision|rider/.test(t))w=Math.max(w,5);
  if(/bug|failure|wrong|reproduce|integration|feed|real-time|system|dependency|staging|production/.test(t))w=Math.max(w,4);
  if(/engineering|developer|data analyst|design|qa|cross-functional|explain/.test(t))w=Math.max(w,4);
  if(/metric|analytics|sample|funnel|adoption|satisfaction|data/.test(t))w=Math.max(w,3.5);
  if(/api|json|http|endpoint/.test(t))w=Math.min(w,2.5);
  return w;
}
function weightedInterviewSet(level,r){return weightedSampleWithoutReplacement(level.questions,level.count,q=>interviewContentWeight(level,q),r)}