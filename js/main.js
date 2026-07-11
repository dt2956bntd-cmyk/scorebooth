import { initTheme, setupManifest } from './theme.js';
import { initTabs } from './tabs.js';
import { initTeamSelect } from './team-select.js';
import { initScheduleStandings } from './render-schedule-standings.js';
import { initGameTabToggles } from './render-game.js';
import { initDataLoader } from './data-loader.js';

/* one-time cleanup: remove leftover prediction-game keys from the removed Call It feature */
function cleanupLegacyPredictionData(){
  try{
    Object.keys(localStorage).forEach(k=>{if(k.indexOf('phbooth:pred')===0)localStorage.removeItem(k);});
  }catch(e){}
}

/* init */
cleanupLegacyPredictionData();
initScheduleStandings();
initGameTabToggles();
initTeamSelect(); /* resolve saved TEAM_ID before theme/branding reads it */
initTheme();
setupManifest();
initTabs();
initDataLoader();
