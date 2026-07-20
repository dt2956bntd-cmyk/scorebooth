import { TEAM_ID, abbr, short } from './constants.js';
import { $, headshot, portrait, logoImg, skelHTML, setPulse, localTime, etDateLabel, etTime } from './utils.js';
import { STORE, getBox } from './store.js';
import { isFinalG, isLiveG, isPostponedG, sides } from './game-helpers.js';
import { LEADERS_BY_ID } from './render-team.js';

let apOpen=false, ngOpen=false, apSel={team:null}, ngSel={team:null};

export function initGameTabToggles(){
  $('apToggle').addEventListener('click',()=>{apOpen=!apOpen;$('apBody').classList.toggle('hide',!apOpen);$('apToggle').classList.toggle('open',apOpen);});
  $('ngToggle').addEventListener('click',()=>{ngOpen=!ngOpen;$('ngBody').classList.toggle('hide',!ngOpen);$('ngToggle').classList.toggle('open',ngOpen);});
}

function renderLineScore(elId,g){const ls=g.linescore,el=$(elId);if(!(ls&&ls.innings&&ls.innings.length)){el.innerHTML='';return;}const head='<thead><tr><th></th>'+ls.innings.map(i=>'<th>'+i.num+'</th>').join('')+'<th class="rhe">R</th><th class="rhe">H</th><th class="rhe">E</th></tr></thead>';function rowFor(key,tid){const tot=(ls.teams&&ls.teams[key])||{};const cells=ls.innings.map(i=>{const c=i[key]||{};return '<td>'+(c.runs!=null?c.runs:'')+'</td>';}).join('');return '<tr class="'+(tid===TEAM_ID?'phi':'')+'"><td>'+abbr(tid)+'</td>'+cells+'<td class="rhe">'+(tot.runs!=null?tot.runs:'')+'</td><td class="rhe">'+(tot.hits!=null?tot.hits:'')+'</td><td class="rhe">'+(tot.errors!=null?tot.errors:'')+'</td></tr>';}el.innerHTML=head+'<tbody>'+rowFor('away',g.teams.away.team.id)+rowFor('home',g.teams.home.team.id)+'</tbody>';}
function lineupListHTML(players){if(!players||!players.length)return '<div class="muted-load">Lineup posts a few hours before first pitch.</div>';return players.map((p,i)=>'<div class="lu-row"><span class="n">'+(i+1)+'</span><span>'+(p.useName?p.useName+' '+(p.lastName||''):p.fullName)+'</span><span class="pos">'+((p.primaryPosition&&p.primaryPosition.abbreviation)||'')+'</span></div>').join('');}
function boxTeamBody(tBox){
  if(!tBox)return '<div class="muted-load">No data.</div>';const players=tBox.players||{};
  const batIds=(tBox.batters&&tBox.batters.length)?tBox.batters:Object.keys(players).filter(k=>players[k].stats&&players[k].stats.batting&&players[k].stats.batting.atBats!=null).map(k=>players[k].person.id);
  const pitIds=(tBox.pitchers&&tBox.pitchers.length)?tBox.pitchers:[];
  const brows=batIds.map(id=>{const p=players['ID'+id];if(!p)return '';const b=(p.stats&&p.stats.batting)||{};const pos=(p.position&&p.position.abbreviation)||'';return '<tr><td class="nm">'+(p.person.boxscoreName||p.person.fullName)+' <small>'+pos+'</small></td><td>'+(b.atBats!=null?b.atBats:'')+'</td><td>'+(b.runs!=null?b.runs:'')+'</td><td>'+(b.hits!=null?b.hits:'')+'</td><td>'+(b.rbi!=null?b.rbi:'')+'</td><td>'+(b.baseOnBalls!=null?b.baseOnBalls:'')+'</td><td>'+(b.strikeOuts!=null?b.strikeOuts:'')+'</td></tr>';}).join('');
  const prows=pitIds.map(id=>{const p=players['ID'+id];if(!p)return '';const q=(p.stats&&p.stats.pitching)||{};return '<tr><td class="nm">'+(p.person.boxscoreName||p.person.fullName)+'</td><td>'+(q.inningsPitched!=null?q.inningsPitched:'')+'</td><td>'+(q.hits!=null?q.hits:'')+'</td><td>'+(q.runs!=null?q.runs:'')+'</td><td>'+(q.earnedRuns!=null?q.earnedRuns:'')+'</td><td>'+(q.baseOnBalls!=null?q.baseOnBalls:'')+'</td><td>'+(q.strikeOuts!=null?q.strikeOuts:'')+'</td></tr>';}).join('');
  return '<table class="bx"><caption>Batting</caption><thead><tr><th>Batter</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>BB</th><th>K</th></tr></thead><tbody>'+(brows||'<tr><td class="nm">—</td><td colspan="6"></td></tr>')+'</tbody></table>'+(prows?('<table class="bx"><caption>Pitching</caption><thead><tr><th>Pitcher</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th></tr></thead><tbody>'+prows+'</tbody></table>'):'');
}
function playersBody(focus,phase,box,sel){
  const awayId=focus.teams.away.team.id, homeId=focus.teams.home.team.id;
  if(sel.team!=='away'&&sel.team!=='home')sel.team=sides(focus).phiHome?'home':'away';
  const tab=(side,id)=>'<button class="ap-tab'+(sel.team===side?' active':'')+(id===TEAM_ID?' phi':'')+'" data-side="'+side+'">'+logoImg(id,'logo-sm','logo-sm-fb')+short(id)+'</button>';
  const tabs='<div class="ap-tabs">'+tab('away',awayId)+'<span class="ap-div">|</span>'+tab('home',homeId)+'</div>';
  let content;
  if(phase==='pre'){const lu=focus.lineups||{};const players=sel.team==='home'?lu.homePlayers:lu.awayPlayers;content='<div class="ap-content">'+lineupListHTML(players)+'</div>';}
  else if(box&&box.teams){content='<div class="ap-content">'+boxTeamBody(box.teams[sel.team])+'</div>';}
  else content='<div class="muted-load">No player data.</div>';
  return tabs+content;
}
function renderPlayers(bodyId,focus,phase,box,sel,isOpen){
  const el=$(bodyId);if(!el)return;
  el.innerHTML=playersBody(focus,phase,box,sel);
  el.classList.toggle('hide',!isOpen());
  el.querySelectorAll('.ap-tab').forEach(b=>b.onclick=()=>{sel.team=b.dataset.side;renderPlayers(bodyId,focus,phase,box,sel,isOpen);});
}
function renderPerformers(box,s){
  const key=s.phiHome?'home':'away',t=box.teams&&box.teams[key];if(!t){$('gbPerf').innerHTML='';return;}
  const players=t.players||{};
  const bats=Object.values(players).filter(p=>p.stats&&p.stats.batting&&p.stats.batting.atBats!=null&&(p.stats.batting.atBats>0||p.stats.batting.baseOnBalls>0));
  bats.sort((a,b)=>{const A=a.stats.batting,B=b.stats.batting;return (B.hits-A.hits)||((B.homeRuns||0)-(A.homeRuns||0))||((B.rbi||0)-(A.rbi||0));});
  let html='';
  bats.slice(0,3).forEach(p=>{const b=p.stats.batting,bits=[];if(b.homeRuns)bits.push(b.homeRuns+' HR');if(b.rbi)bits.push(b.rbi+' RBI');if(b.runs)bits.push(b.runs+' R');if(b.stolenBases)bits.push(b.stolenBases+' SB');html+='<div class="perf">'+headshot(p.person.id,p.person.fullName,'hs-sm')+'<span class="who">'+p.person.fullName+'</span><span class="stat">'+b.hits+'-for-'+b.atBats+(bits.length?' · '+bits.join(', '):'')+'</span></div>';});
  const pits=Object.values(players).filter(p=>p.stats&&p.stats.pitching&&p.stats.pitching.inningsPitched!=null&&parseFloat(p.stats.pitching.inningsPitched)>0);
  const starter=pits.find(p=>p.stats.pitching.gamesStarted===1);
  if(starter){const q=starter.stats.pitching;html+='<div class="perf">'+headshot(starter.person.id,starter.person.fullName,'hs-sm')+'<span class="who">'+starter.person.fullName+' (SP)</span><span class="stat">'+q.inningsPitched+' IP · '+q.earnedRuns+' ER · '+q.strikeOuts+' K</span></div>';}
  $('gbPerf').innerHTML=html||'<div class="muted-load">No box score detail.</div>';
}
/* "detail stats competitors miss" — umpires/weather/attendance/duration come pre-formatted
   in boxscore.info; LOB comes from each team's teamStats.batting. All free, all from data
   we already fetch via getBox(), no extra API call needed. */
function renderGameInfo(box,s){
  const el=$('gbInfo');if(!el)return;
  const info=box.info||[];
  const val=label=>{const f=info.find(x=>x.label===label);return f?f.value:null;};
  const weather=val('Weather'),wind=val('Wind'),att=val('Att'),dur=val('T'),umps=val('Umpires');
  const homeKey=s.phiHome?'home':'away',oppKey=s.phiHome?'away':'home';
  const phiBat=box.teams&&box.teams[homeKey]&&box.teams[homeKey].teamStats&&box.teams[homeKey].teamStats.batting;
  const oppBat=box.teams&&box.teams[oppKey]&&box.teams[oppKey].teamStats&&box.teams[oppKey].teamStats.batting;
  const rows=[];
  if(att)rows.push(['Attendance',att]);
  if(dur)rows.push(['Duration',dur]);
  if(weather)rows.push(['Weather',weather+(wind?' · '+wind:'')]);
  if(umps)rows.push(['Umpires',umps.replace(/\.\s*$/,'')]);
  if(phiBat&&phiBat.leftOnBase!=null)rows.push(['Left on base',abbr(TEAM_ID)+' '+phiBat.leftOnBase+' · '+abbr(s.opp.team.id)+' '+(oppBat&&oppBat.leftOnBase!=null?oppBat.leftOnBase:'—')]);
  el.innerHTML=rows.map(([k,v])=>'<div class="ginfo-row"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>').join('');
}
function renderGame(focus,phase){
  const s=sides(focus),oid=s.opp.team.id,ms=Date.parse(focus.gameDate),live=phase==='live';
  $('gameEyebrowTxt').textContent=live?"Today's Game":(phase==='pre'?'Next Game':'Last Game · Final');
  if(phase==='pre'){
    setPulse($('gbScore'),abbr(TEAM_ID)+' '+(s.phiHome?'vs':'@')+' '+abbr(oid));
    $('gbSub').textContent=etDateLabel(ms)+', '+etTime(ms)+' ET · '+((focus.venue&&focus.venue.name)||'');
    $('gbLs').innerHTML='';$('gbDecisions').innerHTML='<span>First pitch <b>'+etTime(ms)+' ET</b> · '+localTime(ms)+' local</span>';
    $('gbPerfHead').textContent='Probable Starters';
    const pp=s.phi.probablePitcher,op=s.opp.probablePitcher;
    $('gbPerf').innerHTML='<div class="perf">'+portrait(pp?pp.id:0,pp?pp.fullName:'TBA','por-sm')+'<span class="who">'+(pp?pp.fullName:'TBA')+'</span><span class="stat">'+abbr(TEAM_ID)+' starter</span></div><div class="perf">'+portrait(op?op.id:0,op?op.fullName:'TBA','por-sm')+'<span class="who">'+(op?op.fullName:'TBA')+'</span><span class="stat">'+abbr(oid)+' starter</span></div>';
    $('apToggle').textContent='Projected lineups';
    renderPlayers('apBody',focus,'pre',null,apSel,()=>apOpen);
    const shareBtn=$('shareGameBtn');if(shareBtn)shareBtn.classList.add('hide');
    const infoEl=$('gbInfo');if(infoEl)infoEl.innerHTML='';
    return;
  }
  const won=s.phi.isWinner;
  STORE.lastGameCard={oid:oid,phiScore:s.phi.score,oppScore:s.opp.score,live:live,won:won};
  const shareBtn=$('shareGameBtn');if(shareBtn)shareBtn.classList.remove('hide');
  setPulse($('gbScore'),abbr(TEAM_ID)+' '+(s.phi.score!=null?s.phi.score:0)+' – '+(s.opp.score!=null?s.opp.score:0)+' '+abbr(oid)+(live?'<span class="res live">LIVE</span>':'<span class="res '+(won?'w':'l')+'">'+(won?'WIN':'LOSS')+'</span>'));
  const ls=focus.linescore;
  $('gbSub').textContent=(live?((ls&&ls.inningState?ls.inningState+' ':'')+((ls&&ls.currentInningOrdinal)||'')):etDateLabel(ms))+' · '+((focus.venue&&focus.venue.name)||'');
  renderLineScore('gbLs',focus);
  const dec=focus.decisions||{};let dh='';if(!live){if(dec.winner)dh+='<span>W: <b>'+dec.winner.fullName+'</b></span>';if(dec.loser)dh+='<span>L: <b>'+dec.loser.fullName+'</b></span>';if(dec.save)dh+='<span>SV: <b>'+dec.save.fullName+'</b></span>';}
  $('gbDecisions').innerHTML=dh;
  $('gbPerfHead').textContent=live?'Top Performers · live':'Top Performers';
  $('apToggle').textContent=live?'Live box score (all players)':'Full box score (all players)';
  $('gbPerf').innerHTML=skelHTML(3);
  getBox(focus.gamePk,live).then(box=>{renderPerformers(box,s);renderGameInfo(box,s);renderPlayers('apBody',focus,phase,box,apSel,()=>apOpen);}).catch(()=>{$('gbPerf').innerHTML='';renderPlayers('apBody',focus,phase,null,apSel,()=>apOpen);});
}
export function renderGameTab(games){
  const live=games.find(isLiveG);
  const finals=games.filter(isFinalG);
  const lastFinal=finals[finals.length-1];
  const now=Date.now();
  const nextUp=games.find(g=>!isFinalG(g)&&!isLiveG(g)&&!isPostponedG(g)&&Date.parse(g.gameDate)>=now-3*3600000);
  STORE.liveActive=!!live;
  renderKeyPlayer(lastFinal||null);
  if(live){
    renderGame(live,'live');
    $('nextWrap').classList.add('hide');
  }else{
    if(lastFinal)renderGame(lastFinal,'post');
    else{$('gameEyebrowTxt').textContent='Last Game';$('gbScore').textContent='No completed games yet';$('gbSub').textContent='';$('gbLs').innerHTML='';$('gbDecisions').innerHTML='';$('gbPerfHead').textContent='';$('gbPerf').innerHTML='';}
    if(nextUp){renderNext(nextUp);$('nextWrap').classList.remove('hide');}
    else $('nextWrap').classList.add('hide');
  }
}
function renderNext(g){
  const s=sides(g),oid=s.opp.team.id,ms=Date.parse(g.gameDate);
  $('ngScore').innerHTML=abbr(TEAM_ID)+' '+(s.phiHome?'vs':'@')+' '+abbr(oid);
  $('ngSub').textContent=etDateLabel(ms)+', '+etTime(ms)+' ET · '+localTime(ms)+' local · '+((g.venue&&g.venue.name)||'');
  $('ngPitchers').innerHTML='<span>First pitch <b>'+etTime(ms)+' ET</b></span>';
  const pp=s.phi.probablePitcher,op=s.opp.probablePitcher;
  $('ngPerf').innerHTML='<div class="perf">'+portrait(pp?pp.id:0,pp?pp.fullName:'TBA','por-sm')+'<span class="who">'+(pp?pp.fullName:'TBA')+'</span><span class="stat">'+abbr(TEAM_ID)+' starter</span></div><div class="perf">'+portrait(op?op.id:0,op?op.fullName:'TBA','por-sm')+'<span class="who">'+(op?op.fullName:'TBA')+'</span><span class="stat">'+abbr(oid)+' starter</span></div>';
  $('ngToggle').textContent='Projected lineups';
  renderPlayers('ngBody',g,'pre',null,ngSel,()=>ngOpen);
}

function kpCard(id,name,sub,reason){return '<div class="kp-card">'+portrait(id,name,'por-xl')+'<div class="kp-info"><div class="kp-tag">★ Today\'s Key Player</div><div class="kp-name">'+name+'</div><div class="kp-sub">'+sub+'</div><div class="kp-reason">'+reason+'</div></div></div>';}
function renderKeyPlayer(lastFinal){
  const el=$('keyPlayer');if(!el)return;
  function seasonStr(id){const s=LEADERS_BY_ID[id];if(!s)return '';return [s.HR&&s.HR+' HR',s.AVG&&s.AVG+' AVG',s.RBI&&s.RBI+' RBI'].filter(Boolean).join(' · ');}
  function fallback(){const ids=Object.keys(LEADERS_BY_ID);if(!ids.length){el.innerHTML='<div class="muted-load">Key player loads with live data.</div>';return;}let best=ids[0];ids.forEach(id=>{const s=LEADERS_BY_ID[id];if(s.HR!=null&&(LEADERS_BY_ID[best].HR==null||parseInt(s.HR)>parseInt(LEADERS_BY_ID[best].HR)))best=id;});const s=LEADERS_BY_ID[best];el.innerHTML=kpCard(best,s.name,'Why · team leader this season',seasonStr(best)||'Team offensive leader');}
  if(!lastFinal){fallback();return;}
  const s=sides(lastFinal),key=s.phiHome?'home':'away';
  el.innerHTML=skelHTML(2);
  getBox(lastFinal.gamePk).then(box=>{
    const t=box.teams&&box.teams[key];if(!t){fallback();return;}
    const players=t.players||{};
    const bats=Object.values(players).filter(p=>p.stats&&p.stats.batting&&p.stats.batting.atBats>0);
    bats.sort((a,b)=>{const A=a.stats.batting,B=b.stats.batting;return ((B.homeRuns||0)-(A.homeRuns||0))||(B.hits-A.hits)||((B.rbi||0)-(A.rbi||0));});
    const top=bats[0];if(!top){fallback();return;}
    const b=top.stats.batting,id=top.person.id,bits=[];if(b.homeRuns)bits.push(b.homeRuns+' HR');if(b.rbi)bits.push(b.rbi+' RBI');if(b.runs)bits.push(b.runs+' R');if(b.stolenBases)bits.push(b.stolenBases+' SB');
    const lastLine=b.hits+'-for-'+b.atBats+(bits.length?', '+bits.join(', '):'');
    const ss=seasonStr(id);
    el.innerHTML=kpCard(id,top.person.fullName,'Why · led the bats last game','Last game: '+lastLine+(ss?' · season '+ss:''));
  }).catch(fallback);
}
