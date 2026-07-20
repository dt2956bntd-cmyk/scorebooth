import { abbr } from './constants.js';
import { $, LS, etDateLabel } from './utils.js';
import { STORE, getBox } from './store.js';
import { sides } from './game-helpers.js';

/* Personal viewing archive + digital scorecard — both entirely client-side (localStorage),
   free, no accounts. Per MONETIZATION.md: user's own data, not MLB content, so no gating
   concerns either way — this MVP just keeps everything free and local-only (no cross-device
   sync, since that would need a backend we don't have). */

const ARCHIVE_KEY='scorebooth:archive';
const OUTCOMES=['','1B','2B','3B','HR','BB','K','HBP','GO','FO','LO','DP','E','SF','SAC'];
const INNINGS=9;

function loadArchive(){const a=LS.get(ARCHIVE_KEY);return a&&typeof a==='object'?a:{};}
function saveArchive(a){LS.set(ARCHIVE_KEY,a);}

export function renderArchive(){
  const wrap=$('archiveWrap');if(!wrap)return;
  const games=(STORE.finals||[]).slice().reverse().slice(0,20);
  if(!games.length){wrap.innerHTML='<div class="muted-load">No recent games yet.</div>';return;}
  const archive=loadArchive();
  wrap.innerHTML=games.map(g=>{
    const s=sides(g),oid=s.opp.team.id,ms=Date.parse(g.gameDate),pk=g.gamePk;
    const rec=archive[pk]||{};
    const label=(s.phiHome?'vs ':'@ ')+abbr(oid)+' · '+(s.phi.score!=null?s.phi.score:'—')+'–'+(s.opp.score!=null?s.opp.score:'—');
    const noteEsc=(rec.note||'').replace(/</g,'&lt;');
    return '<div class="archive-row">'+
      '<input type="checkbox" class="archive-check" data-pk="'+pk+'"'+(rec.watched?' checked':'')+' aria-label="Mark watched">'+
      '<div class="archive-main"><div class="opp">'+label+'</div><div class="date">'+etDateLabel(ms)+'</div></div>'+
      '<textarea class="archive-note" data-pk="'+pk+'" placeholder="Notes — the decisive play, who you watched with, anything worth remembering">'+noteEsc+'</textarea>'+
      '</div>';
  }).join('');
}

function bindArchive(){
  const wrap=$('archiveWrap');if(!wrap)return;
  wrap.addEventListener('change',e=>{
    const cb=e.target.closest('.archive-check');if(!cb)return;
    const archive=loadArchive();archive[cb.dataset.pk]=Object.assign({},archive[cb.dataset.pk],{watched:cb.checked});saveArchive(archive);
  });
  wrap.addEventListener('input',e=>{
    const ta=e.target.closest('.archive-note');if(!ta)return;
    const archive=loadArchive();archive[ta.dataset.pk]=Object.assign({},archive[ta.dataset.pk],{note:ta.value});saveArchive(archive);
  });
}

/* --- scorecard --- */
function scorecardKey(pk){return 'scorebooth:scorecard:'+pk;}
function loadScorecard(pk){const s=LS.get(scorecardKey(pk));return s&&typeof s==='object'?s:{};}
function saveScorecard(pk,data){LS.set(scorecardKey(pk),data);}

export function renderScorecardPicker(){
  const sel=$('scorecardPicker');if(!sel)return;
  const games=[];
  if(STORE.next)games.push(STORE.next);
  (STORE.finals||[]).slice().reverse().slice(0,15).forEach(g=>games.push(g));
  const prevVal=sel.value;
  sel.innerHTML='<option value="">Pick a game…</option>'+games.map(g=>{
    const s=sides(g),oid=s.opp.team.id,ms=Date.parse(g.gameDate);
    return '<option value="'+g.gamePk+'">'+etDateLabel(ms)+' '+(s.phiHome?'vs':'@')+' '+abbr(oid)+'</option>';
  }).join('');
  if(prevVal&&games.some(g=>String(g.gamePk)===prevVal))sel.value=prevVal;
}

async function renderScorecardGrid(gamePk){
  const wrap=$('scorecardWrap');if(!wrap)return;
  if(!gamePk){wrap.innerHTML='<div class="muted-load">Pick a game above to start scoring.</div>';return;}
  wrap.innerHTML='<div class="muted-load">Loading lineup…</div>';
  let box;
  try{box=await getBox(gamePk);}catch(e){wrap.innerHTML='<div class="muted-load">Could not load this game’s lineup yet.</div>';return;}
  /* STORE.detail (not .finals) is the one hydrated with linescore — that's how we know if a
     game actually went to extra innings. .finals/.next only tell us who's home/away. */
  const detailGame=(STORE.detail||[]).find(g=>String(g.gamePk)===String(gamePk));
  const game=detailGame||(STORE.finals||[]).find(g=>String(g.gamePk)===String(gamePk))||(STORE.next&&String(STORE.next.gamePk)===String(gamePk)?STORE.next:null);
  const phiHome=game?sides(game).phiHome:true;
  const key=phiHome?'home':'away';
  const team=box.teams&&box.teams[key];
  const order=(team&&team.battingOrder)||[];
  if(!order.length){wrap.innerHTML='<div class="muted-load">Lineup not posted yet — check back closer to first pitch.</div>';return;}
  const players=team.players||{};
  const data=loadScorecard(gamePk);
  /* however many innings were actually played, at least INNINGS, and never fewer than any
     inning number the user already has data in (in case linescore isn't hydrated for this game) */
  const linescoreInnings=(detailGame&&detailGame.linescore&&detailGame.linescore.innings&&detailGame.linescore.innings.length)||0;
  const dataMaxInning=Object.values(data).reduce((m,row)=>Math.max(m,...Object.keys(row||{}).map(Number)),0);
  const inningsCount=Math.max(INNINGS,linescoreInnings,dataMaxInning);
  let html=(inningsCount>INNINGS?'<div class="muted-load" style="text-align:left;padding:0 0 8px">Extra innings — '+inningsCount+' total, scroll the table right to see them all.</div>':'')+'<div style="overflow-x:auto"><table class="sc-table"><thead><tr><th>Batter</th>';
  for(let i=1;i<=inningsCount;i++)html+='<th>'+i+'</th>';
  html+='</tr></thead><tbody>';
  order.forEach(pid=>{
    const p=players['ID'+pid],name=p?(p.person.boxscoreName||p.person.fullName):('#'+pid);
    html+='<tr><td>'+name+'</td>';
    for(let i=1;i<=inningsCount;i++){
      const val=(data[pid]&&data[pid][i])||'';
      html+='<td><select data-pid="'+pid+'" data-inn="'+i+'">'+OUTCOMES.map(o=>'<option value="'+o+'"'+(o===val?' selected':'')+'>'+(o||'—')+'</option>').join('')+'</select></td>';
    }
    html+='</tr>';
  });
  html+='</tbody></table></div>';
  wrap.innerHTML=html;
  wrap.querySelectorAll('select').forEach(sel=>{
    sel.addEventListener('change',()=>{
      const d=loadScorecard(gamePk),pid=sel.dataset.pid,inn=sel.dataset.inn;
      d[pid]=d[pid]||{};
      if(sel.value)d[pid][inn]=sel.value;else delete d[pid][inn];
      saveScorecard(gamePk,d);
    });
  });
}

export function initMyGames(){
  bindArchive();
  renderScorecardPicker();
  const picker=$('scorecardPicker');
  if(picker)picker.addEventListener('change',()=>renderScorecardGrid(picker.value));
}
