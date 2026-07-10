import { SEASON, API, TEAM_ID } from './constants.js';
import { $, LS, pad } from './utils.js';
import { STORE, fetchJSON } from './store.js';
import { isFinalG } from './game-helpers.js';
import { buildForm, renderSchedule, renderPitchers } from './render-booth.js';
import { renderGameTab } from './render-game.js';
import { renderScheduleList, renderResults, renderStandings, standingsLoaded } from './render-schedule-standings.js';
import { renderRoster, renderLeaders, renderTeamStats } from './render-team.js';
import { autoGrade } from './predictions.js';

function nowHMS(){const t=new Date();return pad(t.getHours())+':'+pad(t.getMinutes())+':'+pad(t.getSeconds());}
function setStatus(s,extra){
  const dot=$('ds-dot'),txt=$('ds-text'),foot=$('footStatus');
  if(s==='loading'){dot.className='dot loading';txt.textContent='Connecting to MLB live feed…';}
  else if(s==='live'){const t=nowHMS();dot.className='dot live';txt.textContent=(STORE.liveActive?'Live game · auto-refresh · ':'Live · MLB Stats API · ')+'updated '+t;foot.textContent='Live data · MLB Stats API · updated '+t;}
  else if(s==='partial'){const t=nowHMS();dot.className='dot live';txt.textContent='Live · stale: '+extra+' · updated '+t;foot.textContent='Live data (partial) · updated '+t;}
  else if(s==='snapshot'){dot.className='dot off';const when=extra?new Date(extra):null;txt.textContent='Snapshot from '+(when?(when.getMonth()+1)+'/'+when.getDate()+' '+pad(when.getHours())+':'+pad(when.getMinutes()):'last visit')+' — refreshing…';foot.textContent='Snapshot · refreshing…';}
  else{dot.className='dot off';txt.textContent='Offline — Booth shows the last good snapshot';foot.textContent='Offline snapshot · reconnect and hit Refresh';if(!standingsLoaded){$('divLoad')&&($('divLoad').textContent='Live standings need a connection — hit Refresh.');$('divRankNote').textContent='needs a connection';$('wcNote').textContent='needs a connection';}}
}

const CACHE_KEY='phbooth:cache:v1';
const FEED_KEYS=['season','detail','stand','roster','leaders','tstats'];
let LAST_PAYLOAD=null;
/* render whatever feeds we have; order matters — leaders before schedule (star props), before game tab (key player) */
function renderAll(p){
  if(p.stand){buildForm(p.stand);renderStandings(p.stand);}
  if(p.roster)renderRoster(p.roster);
  if(p.leaders)renderLeaders(p.leaders);
  if(p.tstats)renderTeamStats(p.tstats);
  let next=null;
  if(p.season){
    const allGames=[];(p.season.dates||[]).forEach(d=>(d.games||[]).forEach(g=>allGames.push(g)));allGames.sort((a,b)=>Date.parse(a.gameDate)-Date.parse(b.gameDate));
    STORE.season=allGames;
    next=renderSchedule(allGames,allGames.filter(isFinalG));
    renderScheduleList(allGames);
    renderResults(allGames);
  }
  if(p.detail){
    const detailGames=[];(p.detail.dates||[]).forEach(d=>(d.games||[]).forEach(g=>detailGames.push(g)));detailGames.sort((a,b)=>Date.parse(a.gameDate)-Date.parse(b.gameDate));
    STORE.detail=detailGames;
    renderGameTab(detailGames);
  }
  return next;
}
let inFlight=false;
async function loadAll(){
  if(inFlight)return;inFlight=true;
  const btn=$('refreshBtn');if(btn)btn.classList.add('spin');setStatus('loading');
  try{
    const now=new Date(),fmt=d=>d.toISOString().slice(0,10);
    const dStart=fmt(new Date(now.getTime()-12*86400000)),dEnd=fmt(new Date(now.getTime()+6*86400000));
    const urls=[
      API+'/schedule?sportId=1&teamId='+TEAM_ID+'&season='+SEASON+'&hydrate=probablePitcher',
      API+'/schedule?sportId=1&teamId='+TEAM_ID+'&startDate='+dStart+'&endDate='+dEnd+'&hydrate=probablePitcher,linescore,decisions,lineups',
      API+'/standings?leagueId=103,104&season='+SEASON+'&standingsTypes=regularSeason',
      API+'/teams/'+TEAM_ID+'/roster?rosterType=active&hydrate=person(pitchHand,batSide)',
      API+'/teams/'+TEAM_ID+'/leaders?leaderCategories=homeRuns,battingAverage,runsBattedIn,earnedRunAverage,strikeouts,saves&season='+SEASON+'&leaderGameTypes=R',
      API+'/teams/'+TEAM_ID+'/stats?stats=season&group=hitting,pitching&season='+SEASON
    ];
    /* allSettled: one failing feed no longer blanks the whole dashboard */
    const results=await Promise.allSettled(urls.map(fetchJSON));
    const fresh={},failed=[];
    results.forEach((r,i)=>{if(r.status==='fulfilled')fresh[FEED_KEYS[i]]=r.value;else failed.push(FEED_KEYS[i]);});
    if(failed.length===FEED_KEYS.length)throw new Error(results[0].reason?results[0].reason.message:'all feeds failed');
    /* merge fresh feeds over the last good payload so stale sections keep their previous data */
    const base=LAST_PAYLOAD||((LS.get(CACHE_KEY)||{}).p)||{};
    const payload=Object.assign({},base,fresh);
    LAST_PAYLOAD=payload;
    LS.set(CACHE_KEY,{t:Date.now(),p:payload});
    const next=renderAll(payload);
    if(next)await renderPitchers(next);
    if(STORE.next&&isFinalG(STORE.next))autoGrade();else $('autoBanner').classList.remove('on');
    if(failed.length)setStatus('partial',failed.join(', '));else setStatus('live');
  }catch(e){setStatus('offline');console.warn('Phils Booth live fetch failed —',e.message);}
  finally{if(btn)btn.classList.remove('spin');inFlight=false;}
}
let refreshTimer=null;
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(runLoad,STORE.liveActive?30000:60000);}
async function runLoad(){await loadAll();scheduleRefresh();}

export function initDataLoader(){
  const cachedBoot=LS.get(CACHE_KEY);
  if(cachedBoot&&cachedBoot.p){try{LAST_PAYLOAD=cachedBoot.p;const n=renderAll(cachedBoot.p);if(n)renderPitchers(n);setStatus('snapshot',cachedBoot.t);}catch(e){console.warn('snapshot render failed —',e.message);}}
  runLoad();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){clearTimeout(refreshTimer);runLoad();}});
  $('refreshBtn').addEventListener('click',()=>{clearTimeout(refreshTimer);runLoad();});
}
