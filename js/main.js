import { initTheme, setupManifest } from './theme.js';
import { initTabs } from './tabs.js';
import { initTeamSelect } from './team-select.js';
import { initScheduleStandings } from './render-schedule-standings.js';
import { initGameTabToggles } from './render-game.js';
import { initDataLoader } from './data-loader.js';

/* one-time cleanup: the app was renamed from Phils Booth to ScoreBooth and its localStorage
   keys moved from the "phbooth:" prefix to "scorebooth:" — drop the whole old namespace
   (this also covers the old Call It prediction-game keys, which lived under phbooth:pred*) */
function cleanupLegacyKeys(){
  try{
    Object.keys(localStorage).forEach(k=>{if(k.indexOf('phbooth:')===0)localStorage.removeItem(k);});
  }catch(e){}
}

/* init */
cleanupLegacyKeys();
initScheduleStandings();
initGameTabToggles();
initTeamSelect(); /* resolve saved TEAM_ID before theme/branding reads it */
initTheme();
setupManifest();
initTabs();
initDataLoader();
