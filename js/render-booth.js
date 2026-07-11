import { TEAM_ID, SEASON, API, abbr, short, teamColor } from './constants.js';
import { $, pad, setPulse, pulseEl, contrastText, stripZero, portrait, capLogoImg, KST_OFF, inZone, fmt12, zoneDateLabel, etDateLabel, etTime, fmtParts, ET_C } from './utils.js';
import { STORE, fetchJSON } from './store.js';
import { isFinalG, isLiveG, sides } from './game-helpers.js';
import { winProb, american, pctFrom } from './model.js';

let countdownTarget=0, countdownLive=false, liveScoreText='';
function tick(){
  const now=Date.now(), kst=inZone(now,KST_OFF);
  $('kst-clock').textContent=pad(kst.getUTCHours())+':'+pad(kst.getUTCMinutes())+':'+pad(kst.getUTCSeconds());
  const ec=fmtParts(ET_C,now);
  $('et-clock').textContent='ET · '+ec.hour+':'+ec.minute;
  const cd=$('countdown');
  if(countdownLive){cd.style.color='var(--red-bright)';if(cd.textContent!==(liveScoreText||'LIVE')){cd.textContent=liveScoreText||'LIVE';pulseEl(cd);}return;}
  if(!countdownTarget){cd.textContent='—';cd.style.color='var(--faint)';return;}
  let diff=Math.floor((countdownTarget-now)/1000);
  if(diff<=0){cd.textContent='LIVE';cd.style.color='var(--red-bright)';}
  else{const d=Math.floor(diff/86400);diff-=d*86400;const h=Math.floor(diff/3600);diff-=h*3600;const m=Math.floor(diff/60);const s=diff-m*60;cd.style.color='var(--led)';cd.innerHTML=(d>0?d+'d ':'')+pad(h)+':'+pad(m)+':<span class="cd-s">'+pad(s)+'</span>';}
}
tick(); setInterval(tick,1000);

let FORM_BY_ID={};

/* recent form */
function formatForm(w,l,code){if(w==null)return '';let s='';if(code){const ty=code.charAt(0)==='W'?'Winning':code.charAt(0)==='L'?'Losing':'';const n=code.slice(1);if(ty&&n)s='   '+n+' '+ty+' Streak';}return w+'-'+l+s;}
function phiFormCode(finals){const f10=finals.slice(-10),w=f10.filter(g=>sides(g).phi.isWinner).length;let st=0,t=null;for(let i=finals.length-1;i>=0;i--){const ww=sides(finals[i]).phi.isWinner?'W':'L';if(t===null){t=ww;st=1;}else if(ww===t)st++;else break;}return {w:w,l:f10.length-w,code:t?(t+st):''};}
export function buildForm(stand){FORM_BY_ID={};(stand.records||[]).forEach(r=>(r.teamRecords||[]).forEach(t=>{const lt=((t.records&&t.records.splitRecords)||[]).find(x=>x.type==='lastTen');FORM_BY_ID[t.team.id]={w:lt?lt.wins:null,l:lt?lt.losses:null,code:(t.streak&&t.streak.streakCode)||''};}));}
function sideLogoHTML(id){return capLogoImg(id,'team-logo','logo-fallback');}
function fillSide(pos,t){
  const id=t.team.id;
  $('side'+pos+'abbr').textContent=abbr(id);
  $('side'+pos+'logo').innerHTML=sideLogoHTML(id);
  $('side'+pos+'full').textContent=t.team.name||short(id);
  $('side'+pos+'rec').textContent=t.leagueRecord?(t.leagueRecord.wins+'–'+t.leagueRecord.losses+' · '+stripZero(t.leagueRecord.pct)):'';
  const f=(id===TEAM_ID)?STORE.phiForm:(FORM_BY_ID[id]||null);
  $('side'+pos+'form').textContent=f?formatForm(f.w,f.l,f.code):'';
}

export function renderSchedule(games,finals){
  const now=Date.now();
  const next=games.find(isLiveG)||games.find(g=>!isFinalG(g)&&Date.parse(g.gameDate)>=now-3*3600000)||games.filter(g=>!isFinalG(g)).slice(-1)[0]||null;
  STORE.next=next; STORE.finals=finals; STORE.phiForm=phiFormCode(finals);
  if(!next){countdownTarget=0;countdownLive=false;$('vsLabel').textContent='No game scheduled';return null;}
  const {phi,opp,phiHome}=sides(next),oid=opp.team.id;
  // away on left, home on right
  fillSide('L',next.teams.away); fillSide('R',next.teams.home);
  $('sideL').classList.toggle('phi',next.teams.away.team.id===TEAM_ID);
  $('sideR').classList.toggle('phi',next.teams.home.team.id===TEAM_ID);
  const ms=Date.parse(next.gameDate),venue=(next.venue&&next.venue.name)||'';
  countdownLive=isLiveG(next);countdownTarget=ms;
  $('vsLabel').textContent=countdownLive?'In progress':'Remaining';
  $('venueLine').innerHTML='📍 <b>'+venue+'</b>';
  $('kstLine').innerHTML='🕒 <b>'+zoneDateLabel(ms,KST_OFF)+', '+fmt12(inZone(ms,KST_OFF))+' KST</b>';
  $('etLine').innerHTML='🇺🇸 <b>'+etDateLabel(ms)+', '+etTime(ms)+' ET</b>';
  if(countdownLive){const ps=phi.score!=null?phi.score:0,os=opp.score!=null?opp.score:0;let inn='';if(next.linescore&&next.linescore.currentInningOrdinal)inn=' · '+(next.linescore.inningState?next.linescore.inningState.slice(0,3)+' ':'')+next.linescore.currentInningOrdinal;liveScoreText=abbr(TEAM_ID)+' '+ps+'–'+os+' '+abbr(oid)+inn;}
  const rec=finals.length?sides(finals[finals.length-1]).phi.leagueRecord:phi.leagueRecord;
  renderModel(pctFrom(rec||phi.leagueRecord),pctFrom(opp.leagueRecord),phiHome,oid);
  return next;
}
function renderModel(pPhi,pOpp,phiHome,oid){
  const wp=winProb(pPhi,pOpp,phiHome),op=1-wp,ab=abbr(oid);
  const phiC=teamColor(TEAM_ID),oppC=teamColor(oid);
  const wpP=$('wpPhi'),wpO=$('wpOpp');
  const phiTxt=abbr(TEAM_ID)+' '+(wp*100).toFixed(1)+'%',oppTxt=(op*100).toFixed(1)+'% '+ab;
  const narrowP=wp<0.18,narrowO=op<0.18;
  wpP.style.width=(wp*100).toFixed(1)+'%';wpP.textContent=narrowP?'':phiTxt;wpP.classList.toggle('narrow',narrowP);wpP.style.background=phiC;wpP.style.color=contrastText(phiC);
  wpO.style.width=(op*100).toFixed(1)+'%';wpO.textContent=narrowO?'':oppTxt;wpO.classList.toggle('narrow',narrowO);wpO.style.background=oppC;wpO.style.color=contrastText(oppC);
  const oL=$('wpOutL'),oR=$('wpOutR');
  if(oL){oL.textContent=phiTxt;oL.classList.toggle('show',narrowP);}
  if(oR){oR.textContent=oppTxt;oR.classList.toggle('show',narrowO);}
  setPulse($('mlPhi'),abbr(TEAM_ID)+' moneyline <b>'+american(wp)+'</b>');
  setPulse($('mlOpp'),ab+' moneyline <b>'+american(op)+'</b>');
  $('oddsNote').innerHTML='Computed live from each team’s win% (log5 / Bradley–Terry) with a home-field bump '+(phiHome?'for Philadelphia':'for '+ab)+', then converted to a no-vig American line. For fun and reference only — not real sportsbook odds, no betting.';
}

function setPitcherName(side,pp){const n=$(side+'PName');if(pp&&pp.fullName){n.textContent=pp.fullName;$(side+'PLine').textContent='loading season line…';$(side+'PHead').innerHTML=portrait(pp.id,pp.fullName,'por-pit');}else{n.textContent='TBA';$(side+'PHand').textContent='';$(side+'PLine').textContent='not yet announced';$(side+'PHead').innerHTML=portrait(0,'TBA','por-pit');}}
export async function renderPitchers(g){
  const s=sides(g);setPitcherName('phi',s.phi.probablePitcher);setPitcherName('opp',s.opp.probablePitcher);
  const jobs=[];
  if(s.phi.probablePitcher&&s.phi.probablePitcher.id)jobs.push(loadPitcherStat('phi',s.phi.probablePitcher.id));
  if(s.opp.probablePitcher&&s.opp.probablePitcher.id)jobs.push(loadPitcherStat('opp',s.opp.probablePitcher.id));
  try{await Promise.all(jobs);}catch(e){}
}
async function loadPitcherStat(side,id){
  try{const d=await fetchJSON(API+'/people/'+id+'?hydrate=stats(group=[pitching],type=[season],season='+SEASON+')');const p=d.people&&d.people[0];if(!p)return;const hand=p.pitchHand&&p.pitchHand.code,num=p.primaryNumber;$(side+'PHand').textContent=(hand==='L'?'LHP':hand==='R'?'RHP':'P')+(num?' · #'+num:'');const st=p.stats&&p.stats[0]&&p.stats[0].splits&&p.stats[0].splits[0]&&p.stats[0].splits[0].stat;$(side+'PLine').textContent=st?(st.wins+'–'+st.losses+' · '+st.era+' ERA · '+st.strikeOuts+' K · '+st.whip+' WHIP'):('no '+SEASON+' line yet');}catch(e){$(side+'PLine').textContent='';}
}
