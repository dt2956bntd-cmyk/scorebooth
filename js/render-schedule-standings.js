import { TEAM_ID, abbr, short } from './constants.js';
import { $, LS, logoImg, stripZero, setHTMLIfChanged, etDateLabel, etTime } from './utils.js';
import { isFinalG, isLiveG, sides } from './game-helpers.js';

function renderScheduleList(games){
  const now=Date.now();
  const live=games.filter(isLiveG);
  const upcoming=games.filter(g=>!isFinalG(g)&&!isLiveG(g)&&Date.parse(g.gameDate)>=now-3*3600000);
  let html='';
  if(live.length)html+='<div class="sec-label">Live</div>'+live.map(g=>rowUpcoming(g,false)).join('');
  html+='<div class="sec-label">Upcoming — next first</div>';
  html+=upcoming.length?upcoming.map((g,i)=>rowUpcoming(g,i>=5)).join(''):'<div class="muted-load">No upcoming games scheduled.</div>';
  setHTMLIfChanged($('schedList'),html);
  const more=$('schedMore'),extra=upcoming.length-5;
  if(extra>0){more.style.display='';more.textContent=$('schedList').classList.contains('expanded')?'Show less':('Show '+extra+' more');}else more.style.display='none';
  $('schCount').textContent='· '+upcoming.length+' scheduled';
}
export { renderScheduleList };

const REVEALED=new Set();
function renderResults(games){
  const finals=games.filter(isFinalG).slice().reverse();
  const box=$('resultsList'),more=$('resultsMore');
  if(!finals.length){box.innerHTML='<div class="muted-load">No results yet.</div>';more.style.display='none';return;}
  const changed=setHTMLIfChanged(box,finals.map((g,i)=>rowFinal(g,i>=5)).join(''));
  const extras=finals.length-5;
  if(extras>0){more.style.display='';more.textContent=box.classList.contains('expanded')?'Show less':('Show '+extras+' more');}else more.style.display='none';
  if(changed){
    /* restore rows the user already revealed — a refresh must not re-hide them */
    box.querySelectorAll('.game-row[data-pk]').forEach(r=>{if(REVEALED.has(r.dataset.pk))r.classList.add('revealed');});
    bindCovers();
  }
  syncSpoiler();
}
export { renderResults };
function rowFinal(g,extra){const s=sides(g),oid=s.opp.team.id,ms=Date.parse(g.gameDate),res=s.phi.isWinner?'W':'L';return '<div class="game-row final'+(extra?' extra':'')+'" data-result="'+res+'" data-pk="'+g.gamePk+'"><span class="date">'+etDateLabel(ms)+'</span><span class="opp">'+logoImg(oid,'logo-sm','logo-sm-fb')+(s.phiHome?'vs ':'@ ')+short(oid)+'</span><span class="score">'+s.phi.score+' – '+s.opp.score+'</span><span class="result-tag '+res.toLowerCase()+'">'+res+'</span><button type="button" class="cover" aria-label="Reveal final score">▦ ▦ ▦ &nbsp; TAP TO REVEAL</button></div>';}
function rowUpcoming(g,extra){const s=sides(g),oid=s.opp.team.id,ms=Date.parse(g.gameDate),live=isLiveG(g);const when=live?('LIVE '+((g.linescore&&g.linescore.currentInningOrdinal)||'')):(etDateLabel(ms)+' · '+etTime(ms)+' ET');const pp=s.phi.probablePitcher;return '<div class="game-row'+(extra?' extra':'')+'"><span class="date">'+etDateLabel(ms)+'</span><span class="opp">'+logoImg(oid,'logo-sm','logo-sm-fb')+(s.phiHome?'vs ':'@ ')+short(oid)+(pp?' <small>'+pp.fullName+'</small>':'')+'</span><span class="when" style="grid-column:3/5">'+when+'</span></div>';}

const ORD=['','1st','2nd','3rd','4th','5th','6th'];
export let standingsLoaded=false;
export function renderStandings(data){
  const east=(data.records||[]).find(r=>r.division&&r.division.id===204);const tbody=$('divBody');
  if(!east){tbody.innerHTML='<tr><td colspan="5" class="muted-load">Standings unavailable.</td></tr>';return;}
  const rows=east.teamRecords.slice().sort((a,b)=>parseInt(a.divisionRank)-parseInt(b.divisionRank));
  tbody.innerHTML='';
  rows.forEach((t,i)=>{const id=t.team.id,isPhi=id===TEAM_ID,isLead=i===0,gb=(t.gamesBack==='-'?'—':t.gamesBack),pct=stripZero(t.winningPercentage||(t.leagueRecord&&t.leagueRecord.pct));const tr=document.createElement('tr');tr.className=(isPhi?'is-phi ':'')+(isLead?'is-lead':'');tr.innerHTML='<td>'+logoImg(id,'logo-sm','logo-sm-fb')+(t.team.name||short(id))+'</td><td>'+t.wins+'</td><td>'+t.losses+'</td><td>'+pct+'</td><td>'+gb+'</td>';tbody.appendChild(tr);});
  const phi=rows.find(t=>t.team.id===TEAM_ID),leader=rows[0];
  if(phi){const rank=parseInt(phi.divisionRank);$('divRankVal').textContent=ORD[rank]||(rank+'th');$('divRankVal').className='value '+(rank===1?'green':'red');$('divRankNote').textContent=(phi.gamesBack==='-')?'Leading the NL East':phi.gamesBack+' GB behind '+abbr(leader.team.id);const wcb=phi.wildCardGamesBack,wcEl=$('wcVal'),wcN=$('wcNote');if(wcb==='-'||(typeof wcb==='string'&&wcb.charAt(0)==='+')){wcEl.textContent=(wcb==='-'?'IN':wcb);wcEl.className='value green';wcN.textContent='Holding a wild card spot';}else{wcEl.textContent='−'+wcb;wcEl.className='value red';wcN.textContent=wcb+' back of the 3rd WC spot';}}
  const lu=east.lastUpdated?new Date(east.lastUpdated):null;$('divAsOf').textContent=lu?'· as of '+(lu.getUTCMonth()+1)+'/'+lu.getUTCDate():'';
  standingsLoaded=true;
}

const spoiler=$('spoilerToggle'),sStatus=$('spoiler-status');
function syncSpoiler(){document.body.classList.toggle('hide-spoiler',spoiler.checked);sStatus.textContent=spoiler.checked?'Spoiler guard ON — final scores hidden. Click a game to reveal it.':'Spoiler guard OFF — all scores shown.';if(!spoiler.checked){REVEALED.clear();document.querySelectorAll('.game-row').forEach(r=>r.classList.remove('revealed'));}}
function bindCovers(){document.querySelectorAll('.cover').forEach(c=>{c.onclick=()=>{const row=c.closest('.game-row');row.classList.add('revealed');if(row.dataset.pk)REVEALED.add(row.dataset.pk);};});}

export function initScheduleStandings(){
  const spoilerPref=LS.get('phbooth:spoiler');if(spoilerPref!==null&&spoilerPref!==undefined)spoiler.checked=spoilerPref;
  syncSpoiler();
  spoiler.addEventListener('change',()=>{LS.set('phbooth:spoiler',spoiler.checked);syncSpoiler();});
  $('resultsMore').addEventListener('click',()=>{const l=$('resultsList');const ex=l.classList.toggle('expanded');const n=l.querySelectorAll('.game-row.extra').length;$('resultsMore').textContent=ex?'Show less':('Show '+n+' more');});
  $('schedMore').addEventListener('click',()=>{const l=$('schedList');const ex=l.classList.toggle('expanded');const n=l.querySelectorAll('.game-row.extra').length;$('schedMore').textContent=ex?'Show less':('Show '+n+' more');});
}
