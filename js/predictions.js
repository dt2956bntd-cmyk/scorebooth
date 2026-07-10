import { TEAM_ID, abbr } from './constants.js';
import { $, LS, setPulse } from './utils.js';
import { STORE, getBox } from './store.js';
import { isFinalG, sides } from './game-helpers.js';
import { LEADERS_BY_ID } from './render-team.js';

/* star props derive from live team leaders (was hardcoded player IDs — broke on trades/injuries) */
function getStars(){
  const ids=Object.keys(LEADERS_BY_ID);
  if(!ids.length)return null;
  const num=v=>{const n=parseFloat(v);return isNaN(n)?-1:n;};
  let hr=null,avg=null;
  ids.forEach(id=>{const s=LEADERS_BY_ID[id];if(s.HR!=null&&(!hr||num(s.HR)>num(LEADERS_BY_ID[hr].HR)))hr=id;if(s.AVG!=null&&(!avg||num(s.AVG)>num(LEADERS_BY_ID[avg].AVG)))avg=id;});
  const last=id=>{const n=LEADERS_BY_ID[id].name||'';return n.split(' ').slice(-1)[0]||n;};
  return {hr:hr?{id:+hr,name:last(hr)}:null, hit:avg?{id:+avg,name:last(avg)}:null};
}
let PROPS=[],state={},currentPhase='call',predKey='phbooth:pred:default';
function freshState(){const s={};PROPS.forEach(p=>s[p.id]={call:null,lock:false,result:null,auto:false});return s;}
export function rebuildProps(next){
  const s=sides(next),pp=s.phi.probablePitcher,spName=pp?pp.fullName:'the starter',spLast=pp?pp.fullName.split(' ').slice(-1)[0]:'starter';
  const stars=getStars()||{},hrStar=stars.hr,hitStar=stars.hit;
  PROPS=[
    {id:'phi_win',cat:'key',text:'Phillies win 🔔',line:'ring the bell',pts:2,grade:C=>C.win?'O':'X'},
    {id:'score_first',cat:'key',text:'Phillies score first',line:'open the scoring',pts:1,grade:C=>C.first==null?null:(C.first==='PHI'?'O':'X')},
    {id:'starter_qs',cat:'key',text:spName+' throws a quality start',line:'6+ IP, ≤3 ER',pts:2,grade:C=>{const q=C.starter;if(!q)return null;return (parseFloat(q.inningsPitched)>=6&&(q.earnedRuns!=null?q.earnedRuns:99)<=3)?'O':'X';}},
    {id:'starter_ks',cat:'key',text:spLast+' racks up 6+ strikeouts',line:'SP K total',pts:2,grade:C=>{const q=C.starter;if(!q)return null;return (q.strikeOuts>=6)?'O':'X';}},
    {id:'bullpen_clean',cat:'key',text:'Bullpen allows 0 runs',line:'scoreless relief',pts:3,grade:C=>C.bullpenRuns==null?null:(C.bullpenRuns===0?'O':'X')},
    hrStar?{id:'star_hr',cat:'fun',text:hrStar.name+' goes deep',line:'1+ HR',pts:2,grade:C=>{const b=C.bat(hrStar.id);return b?((b.homeRuns>0)?'O':'X'):null;}}:null,
    hitStar?{id:'star_multi',cat:'fun',text:hitStar.name+' multi-hit game',line:'2+ hits',pts:2,grade:C=>{const b=C.bat(hitStar.id);return b?((b.hits>=2)?'O':'X'):null;}}:null,
    {id:'team_sb',cat:'fun',text:'Phillies steal a base',line:'1+ SB',pts:2,grade:C=>C.teamBat?((C.teamBat.stolenBases>=1)?'O':'X'):null},
    {id:'team_hr2',cat:'fun',text:'Phillies hit 2+ homers',line:'team power',pts:3,grade:C=>C.teamBat?((C.teamBat.homeRuns>=2)?'O':'X'):null},
    {id:'margin3',cat:'key',text:'Phillies win by 3+',line:'cover the run line',pts:3,grade:C=>(!C.win)?'X':((C.phiR-C.oppR>=3)?'O':'X')}
  ].filter(Boolean);
  buildCallRows();
}
function buildCallRows(){
  const pl=$('predList');pl.innerHTML='';
  PROPS.forEach(p=>{const row=document.createElement('div');row.className='pred-item';row.innerHTML='<span class="pred-text"><span class="tagk '+p.cat+'">'+(p.cat==='fun'?'FUN':'KEY')+'</span>'+p.text+'<span class="ln">'+p.line+' · +'+p.pts+'</span></span><span class="pred-pts">+'+p.pts+'</span><span class="call-group"><button class="call o" data-id="'+p.id+'" data-call="O">O</button><button class="call x" data-id="'+p.id+'" data-call="X">X</button></span><button class="lock" data-id="'+p.id+'" title="Lock for double points">🔒</button>';pl.appendChild(row);});
  pl.querySelectorAll('.call').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.id,v=b.dataset.call;state[id].call=(state[id].call===v)?null:v;if(state[id].call===null)state[id].lock=false;reflectCallUI();savePredState();}));
  pl.querySelectorAll('.lock').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.id;if(state[id].call===null)return;state[id].lock=!state[id].lock;reflectCallUI();savePredState();}));
}
function reflectCallUI(){PROPS.forEach(p=>{document.querySelectorAll('.call[data-id="'+p.id+'"]').forEach(b=>b.classList.toggle('sel',state[p.id].call===b.dataset.call));const lk=document.querySelector('.lock[data-id="'+p.id+'"]');if(lk)lk.classList.toggle('on',!!state[p.id].lock);});}
function graded(p){const s=state[p.id];return s.call!==null&&s.result!==null;}
function isHit(p){const s=state[p.id];return graded(p)&&s.call===s.result;}
function renderGrade(){
  const gl=$('gradeList');gl.innerHTML='';
  PROPS.forEach(p=>{const s=state[p.id];const callLabel=s.call?('you called '+s.call):'no call';const actual=s.result?('actual: '+(s.result==='O'?'YES':'NO')):(STORE.next&&isFinalG(STORE.next)?'—':'awaiting result');let pill='<span class="res-pill pending">PENDING</span>';if(graded(p)){let base=isHit(p)?p.pts:0;if(s.lock)base=isHit(p)?p.pts*2:-p.pts;pill='<span class="res-pill '+(isHit(p)?'hit':'miss')+'">'+(isHit(p)?'HIT':'MISS')+' '+(base>=0?'+':'')+base+'</span>';}const row=document.createElement('div');row.className='pred-item';row.innerHTML='<span class="pred-text"><span class="tagk '+p.cat+'">'+(p.cat==='fun'?'FUN':'KEY')+'</span>'+p.text+'<span class="ln">'+callLabel+(s.lock?' · 🔒':'')+'</span><span class="grade-actual">'+actual+'</span></span><span></span><span class="call-group"><button class="call o" data-id="'+p.id+'" data-res="O">O</button><button class="call x" data-id="'+p.id+'" data-res="X">X</button></span>'+pill;gl.appendChild(row);});
  gl.querySelectorAll('.call').forEach(b=>{const id=b.dataset.id;b.classList.toggle('sel',state[id].result===b.dataset.res);b.addEventListener('click',()=>{state[id].result=(state[id].result===b.dataset.res)?null:b.dataset.res;state[id].auto=false;renderGrade();recalc();savePredState();});});
}
function recalc(){
  let total=0,best=0,cur=0,hits=0,decided=0;
  PROPS.forEach(p=>{const s=state[p.id];if(!graded(p)){cur=0;return;}decided++;if(isHit(p)){hits++;total+=s.lock?p.pts*2:p.pts;cur++;best=Math.max(best,cur);}else{if(s.lock)total-=p.pts;cur=0;}});
  setPulse($('predScore'),String(total));$('streakBadge').innerHTML=(best>0?'🔥 '+best:'—')+'<small>BEST STREAK</small>';$('accBadge').innerHTML=(decided?Math.round(100*hits/decided)+'% ('+hits+'/'+decided+')':'—')+'<small>ACCURACY</small>';
}
function activatePhase(phase,silent){currentPhase=phase;document.querySelectorAll('.phase-btn').forEach(x=>x.classList.toggle('active',x.dataset.phase===phase));const grade=phase==='grade';$('callPhase').classList.toggle('hide',grade);$('gradePhase').classList.toggle('hide',!grade);if(grade){renderGrade();recalc();}if(!silent)savePredState();}
document.querySelectorAll('.phase-btn').forEach(b=>b.addEventListener('click',()=>activatePhase(b.dataset.phase)));
function savePredState(){LS.set(predKey,{state:state,phase:currentPhase});const n=$('savedNote');if(n){n.textContent='saved ✓';clearTimeout(n._t);n._t=setTimeout(()=>n.textContent='',1400);}}
export function setPredKey(gamePk,gameObj){predKey='phbooth:pred:'+(gamePk||'default');
  /* prune saved cards older than 45 days so localStorage doesn't grow all season */
  try{const idx=LS.get('phbooth:predIndex')||{};if(gamePk)idx[gamePk]=Date.now();const cutoff=Date.now()-45*86400000;Object.keys(idx).forEach(k=>{if(idx[k]<cutoff){LS.del('phbooth:pred:'+k);delete idx[k];}});LS.set('phbooth:predIndex',idx);}catch(e){}
  const tag=$('predGameTag');if(tag&&gameObj){const s=sides(gameObj);tag.innerHTML='🔒 Card for <b>PHI '+(s.phiHome?'vs ':'@ ')+abbr(s.opp.team.id)+'</b> · auto-saves to this browser.';}loadPredState();}
function loadPredState(){if(!PROPS.length)return;const saved=LS.get(predKey);state=freshState();let phase='call';if(saved){if(saved.state)PROPS.forEach(p=>{if(saved.state[p.id])state[p.id]=Object.assign({call:null,lock:false,result:null,auto:false},saved.state[p.id]);});if(saved.phase)phase=saved.phase;}reflectCallUI();activatePhase(phase,true);recalc();}
$('predReset').addEventListener('click',()=>{state=freshState();LS.del(predKey);reflectCallUI();renderGrade();recalc();activatePhase('call',true);});

export async function autoGrade(){
  const g=STORE.next;if(!g||!isFinalG(g))return;
  try{
    const box=await getBox(g.gamePk),s=sides(g),key=s.phiHome?'home':'away',t=box.teams&&box.teams[key];if(!t)return;
    const players=t.players||{};const ls=g.linescore;let first=null;
    if(ls&&ls.innings){for(const inn of ls.innings){const aw=inn.away&&inn.away.runs,ho=inn.home&&inn.home.runs;if(aw){first=(g.teams.away.team.id===TEAM_ID)?'PHI':'OPP';break;}if(ho){first=(g.teams.home.team.id===TEAM_ID)?'PHI':'OPP';break;}}}
    const pits=Object.values(players).filter(p=>p.stats&&p.stats.pitching&&p.stats.pitching.inningsPitched!=null);
    const starter=pits.find(p=>p.stats.pitching.gamesStarted===1);
    const rel=pits.filter(p=>p.stats.pitching.gamesStarted!==1&&parseFloat(p.stats.pitching.inningsPitched)>0);
    const bullpenRuns=(rel.length||starter)?rel.reduce((a,p)=>a+(p.stats.pitching.runs||0),0):null;
    const C={win:!!s.phi.isWinner,phiR:s.phi.score,oppR:s.opp.score,first:first,starter:starter?starter.stats.pitching:null,bullpenRuns:bullpenRuns,teamBat:(t.teamStats&&t.teamStats.batting)||null,bat:id=>{const pl=players['ID'+id];return pl&&pl.stats&&pl.stats.batting&&pl.stats.batting.atBats!=null?pl.stats.batting:null;}};
    let any=false;
    PROPS.forEach(p=>{if(!p.grade)return;const r=p.grade(C);if(r&&(state[p.id].result===null||state[p.id].auto)){state[p.id].result=r;state[p.id].auto=true;any=true;}});
    if(any){savePredState();if(currentPhase==='grade')renderGrade();recalc();}
    const banner=$('autoBanner');banner.classList.add('on');banner.innerHTML='✓ Auto-graded from the final box score — open <b style="margin:0 4px">Post-Game · Results</b> to see your calls vs. what happened. You can still adjust any result.';
  }catch(e){}
}
