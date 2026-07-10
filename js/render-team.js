import { SEASON } from './constants.js';
import { $, headshot, stripZero, setHTMLIfChanged } from './utils.js';

let PLAYER_POS={};
export let LEADERS_BY_ID={};

export function renderRoster(data){
  const r=data.roster||[];if(!r.length){$('rosterPanel').innerHTML='<div class="muted-load">Roster unavailable.</div>';return;}
  PLAYER_POS={};
  const groups={Pitcher:[],Catcher:[],Infielder:[],Outfielder:[],Hitter:[]};
  r.forEach(p=>{const t=(p.position&&p.position.type)||(p.person.primaryPosition&&p.person.primaryPosition.type)||'Hitter';(groups[t]||groups.Hitter).push(p);PLAYER_POS[p.person.id]=(p.position&&p.position.abbreviation)||'';});
  const order=[['Pitcher','Pitchers'],['Catcher','Catchers'],['Infielder','Infielders'],['Outfielder','Outfielders'],['Hitter','Designated Hitter']];
  let html='';
  order.forEach(([k,label])=>{const list=groups[k];if(!list||!list.length)return;list.sort((a,b)=>(a.person.lastName||'').localeCompare(b.person.lastName||''));html+='<div class="rgroup"><h4>'+label+' · '+list.length+'</h4>';list.forEach(p=>{const per=p.person,bt=((per.batSide&&per.batSide.code)||'-')+'/'+((per.pitchHand&&per.pitchHand.code)||'-');html+='<div class="r-row">'+headshot(per.id,per.fullName,'hs-sm')+'<span class="num">'+(p.jerseyNumber||'')+'</span><span>'+per.fullName+'</span><span class="pos">'+((p.position&&p.position.abbreviation)||'')+'</span><span class="bt">B/T '+bt+'</span></div>';});html+='</div>';});
  setHTMLIfChanged($('rosterPanel'),html);$('rosterCount').textContent='· '+r.length+' players';
}

const LEAD_METRICS=[['homeRuns','hitting','Home Run Leaders','HR'],['battingAverage','hitting','Batting Average','AVG'],['runsBattedIn','hitting','RBI Leaders','RBI'],['earnedRunAverage','pitching','ERA Leaders','ERA'],['strikeouts','pitching','Strikeout Leaders','K'],['saves','pitching','Saves Leaders','SV']];
export function renderLeaders(data){
  const tl=data.teamLeaders||[];LEADERS_BY_ID={};
  [['homeRuns','hitting','HR'],['battingAverage','hitting','AVG'],['runsBattedIn','hitting','RBI'],['earnedRunAverage','pitching','ERA'],['strikeouts','pitching','K'],['saves','pitching','SV']].forEach(([cat,grp,lab])=>{const e=tl.find(x=>x.leaderCategory===cat&&x.statGroup===grp);(e&&e.leaders||[]).slice(0,6).forEach(l=>{const id=l.person.id;LEADERS_BY_ID[id]=LEADERS_BY_ID[id]||{name:l.person.fullName};if(LEADERS_BY_ID[id][lab]===undefined)LEADERS_BY_ID[id][lab]=l.value;});});
  let html='';
  LEAD_METRICS.forEach(([cat,grp,label,lab])=>{
    const e=tl.find(x=>x.leaderCategory===cat&&x.statGroup===grp);const leaders=(e&&e.leaders||[]).slice(0,6);if(!leaders.length)return;
    const cid='lead_'+cat,valCls=grp==='pitching'?'lval pit':'lval',total=leaders.length;
    const cards=leaders.map((l,i)=>'<div class="lcard">'+headshot(l.person.id,l.person.fullName,'hs-lg')+'<div class="l-mid"><div class="lrank">#'+(l.rank||i+1)+' of '+total+' · '+lab+'</div><div class="lname">'+l.person.fullName+'</div><div class="lpos">'+(PLAYER_POS[l.person.id]||'')+'</div></div><div class="'+valCls+'">'+l.value+'<span>'+lab+'</span></div></div>').join('');
    html+='<div class="lead-metric"><div class="lead-mlabel">'+label+' <span class="lead-hint">swipe ›</span></div><div class="panel carwrap"><button class="car-arrow left" data-car="'+cid+'" aria-label="prev">‹</button><div class="carousel" id="'+cid+'">'+cards+'</div><button class="car-arrow right" data-car="'+cid+'" aria-label="next">›</button></div></div>';
  });
  setHTMLIfChanged($('leadersWrap'),html||'<div class="muted-load">No leaders.</div>');
  const la=$('leadersAsOf');if(la)la.textContent=SEASON+' · #1 first, swipe →';
}

export function renderTeamStats(data){
  const st=data.stats||[];
  const h=((st.find(s=>s.group.displayName==='hitting')||{}).splits||[])[0];
  const p=((st.find(s=>s.group.displayName==='pitching')||{}).splits||[])[0];
  const hs=h&&h.stat,ps=p&&p.stat;
  const cells=pairs=>pairs.map(([k,v])=>'<div class="ts-cell"><div class="v">'+v+'</div><div class="k">'+k+'</div></div>').join('');
  if(hs)$('tsHit').innerHTML=cells([['AVG',stripZero(hs.avg)],['OBP',stripZero(hs.obp)],['SLG',stripZero(hs.slg)],['OPS',stripZero(hs.ops)],['Runs',hs.runs],['HR',hs.homeRuns],['RBI',hs.rbi],['SB',hs.stolenBases]]);
  if(ps)$('tsPit').innerHTML=cells([['ERA',ps.era],['WHIP',ps.whip],['SO',ps.strikeOuts],['BB',ps.baseOnBalls],['SV',ps.saves],['SHO',ps.shutouts],['IP',ps.inningsPitched],['OPP AVG',stripZero(ps.avg)]]);
}
