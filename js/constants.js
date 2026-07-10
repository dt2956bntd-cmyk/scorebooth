export const TEAM_ID = 143;
export const API = 'https://statsapi.mlb.com/api/v1';
export const LOGO = id => 'https://www.mlbstatic.com/team-logos/'+id+'.svg';
export const LOGO_CAP = id => 'https://www.mlbstatic.com/team-logos/team-cap-on-light/'+id+'.svg';
export const HEAD = id => 'https://midfield.mlbstatic.com/v1/people/'+id+'/spots/120';
export const PORTRAIT = id => 'https://img.mlbstatic.com/mlb-photos/image/upload/w_213,q_auto:best/v1/people/'+id+'/headshot/67/current';

/* season = current year in ET; before March, still show last season (new one hasn't started) */
function seasonNow(){try{const o={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric'}).formatToParts(new Date()).forEach(x=>o[x.type]=x.value);const y=parseInt(o.year,10);return parseInt(o.month,10)<3?y-1:y;}catch(e){return (new Date()).getUTCFullYear();}}
export const SEASON = seasonNow();

export const TEAMS = {108:['LAA','Angels'],109:['AZ','D-backs'],110:['BAL','Orioles'],111:['BOS','Red Sox'],112:['CHC','Cubs'],113:['CIN','Reds'],114:['CLE','Guardians'],115:['COL','Rockies'],116:['DET','Tigers'],117:['HOU','Astros'],118:['KC','Royals'],119:['LAD','Dodgers'],120:['WSH','Nationals'],121:['NYM','Mets'],133:['ATH','Athletics'],134:['PIT','Pirates'],135:['SD','Padres'],136:['SEA','Mariners'],137:['SF','Giants'],138:['STL','Cardinals'],139:['TB','Rays'],140:['TEX','Rangers'],141:['TOR','Blue Jays'],142:['MIN','Twins'],143:['PHI','Phillies'],144:['ATL','Braves'],145:['CWS','White Sox'],146:['MIA','Marlins'],147:['NYY','Yankees'],158:['MIL','Brewers']};
export const TEAMCOLOR = {108:'#BA0021',109:'#A71930',110:'#DF4601',111:'#BD3039',112:'#0E3386',113:'#C6011F',114:'#0C2340',115:'#333366',116:'#0C2340',117:'#002D62',118:'#004687',119:'#005A9C',120:'#AB0003',121:'#002D72',133:'#003831',134:'#FDB827',135:'#2F241D',136:'#0C2C56',137:'#FD5A1E',138:'#C41E3A',139:'#092C5C',140:'#003278',141:'#134A8E',142:'#002B5C',143:'#E81828',144:'#CE1141',145:'#27251F',146:'#00A3E0',147:'#003087',158:'#12284B'};
export const abbr = id => (TEAMS[id]&&TEAMS[id][0])||'?';
export const short = id => (TEAMS[id]&&TEAMS[id][1])||'TBD';
export const teamColor = id => TEAMCOLOR[id]||'#7a8090';
export const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
