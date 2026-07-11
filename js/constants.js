export let TEAM_ID = 143;
export function setTeamId(id){TEAM_ID=id;}
export const API = 'https://statsapi.mlb.com/api/v1';
export const LOGO = id => 'https://www.mlbstatic.com/team-logos/'+id+'.svg';
export const LOGO_CAP = id => 'https://www.mlbstatic.com/team-logos/team-cap-on-light/'+id+'.svg';
export const HEAD = id => 'https://midfield.mlbstatic.com/v1/people/'+id+'/spots/120';
export const PORTRAIT = id => 'https://img.mlbstatic.com/mlb-photos/image/upload/w_213,q_auto:best/v1/people/'+id+'/headshot/67/current';

/* season = current year in ET; before March, still show last season (new one hasn't started) */
function seasonNow(){try{const o={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric'}).formatToParts(new Date()).forEach(x=>o[x.type]=x.value);const y=parseInt(o.year,10);return parseInt(o.month,10)<3?y-1:y;}catch(e){return (new Date()).getUTCFullYear();}}
export const SEASON = seasonNow();

export const TEAMS = {108:['LAA','Angels'],109:['AZ','D-backs'],110:['BAL','Orioles'],111:['BOS','Red Sox'],112:['CHC','Cubs'],113:['CIN','Reds'],114:['CLE','Guardians'],115:['COL','Rockies'],116:['DET','Tigers'],117:['HOU','Astros'],118:['KC','Royals'],119:['LAD','Dodgers'],120:['WSH','Nationals'],121:['NYM','Mets'],133:['ATH','Athletics'],134:['PIT','Pirates'],135:['SD','Padres'],136:['SEA','Mariners'],137:['SF','Giants'],138:['STL','Cardinals'],139:['TB','Rays'],140:['TEX','Rangers'],141:['TOR','Blue Jays'],142:['MIN','Twins'],143:['PHI','Phillies'],144:['ATL','Braves'],145:['CWS','White Sox'],146:['MIA','Marlins'],147:['NYY','Yankees'],158:['MIL','Brewers']};
/* [primary, secondary] official-ish hex pairs, per team */
export const TEAMCOLOR = {
  108:['#BA0021','#003263'], 109:['#A71930','#000000'], 110:['#DF4601','#000000'], 111:['#BD3039','#0C2340'],
  112:['#0E3386','#CC3433'], 113:['#C6011F','#000000'], 114:['#0C2340','#E31937'], 115:['#333366','#C4CED4'],
  116:['#0C2340','#FA4616'], 117:['#002D62','#EB6E1F'], 118:['#004687','#BD9B60'], 119:['#005A9C','#EF3E42'],
  120:['#AB0003','#14225A'], 121:['#002D72','#FF5910'], 133:['#003831','#EFB21E'], 134:['#FDB827','#27251F'],
  135:['#2F241D','#FFC425'], 136:['#0C2C56','#005C5C'], 137:['#FD5A1E','#27251F'], 138:['#C41E3A','#0C2340'],
  139:['#092C5C','#8FBCE6'], 140:['#003278','#C0111F'], 141:['#134A8E','#E8291C'], 142:['#002B5C','#D31145'],
  143:['#E81828','#002D72'], 144:['#CE1141','#13274F'], 145:['#27251F','#C4CED4'], 146:['#00A3E0','#EF3340'],
  147:['#003087','#C4CED4'], 158:['#12284B','#FFC52F']
};
/* standard MLB Stats API division ids — the standings feed only returns division.id, not a name */
export const DIVISIONS = {200:'AL West',201:'AL East',202:'AL Central',203:'NL West',204:'NL East',205:'NL Central'};
export const abbr = id => (TEAMS[id]&&TEAMS[id][0])||'?';
export const short = id => (TEAMS[id]&&TEAMS[id][1])||'TBD';
export const teamColor = id => (TEAMCOLOR[id]&&TEAMCOLOR[id][0])||'#7a8090';
export const teamColor2 = id => (TEAMCOLOR[id]&&TEAMCOLOR[id][1])||'#4a4f5c';
export const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
