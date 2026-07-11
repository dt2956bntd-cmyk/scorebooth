import { TEAM_ID } from './constants.js';

export const isFinalG = g => g.status.abstractGameState==='Final'||g.status.codedGameState==='F';
export const isLiveG  = g => g.status.abstractGameState==='Live'||g.status.codedGameState==='I'||/progress|in progress|live|delayed|manager challenge/i.test(g.status.detailedState||'');
/* postponed/suspended/cancelled — not live, not really "final" either, and must never be
   treated as a normal upcoming game (was counting down to games that were never happening) */
export const isPostponedG = g => /postponed|suspended|cancelled|canceled/i.test(g.status.detailedState||'');
export function sides(g){const h=g.teams.home,a=g.teams.away,phiHome=h.team.id===TEAM_ID;return{phi:phiHome?h:a,opp:phiHome?a:h,phiHome};}
