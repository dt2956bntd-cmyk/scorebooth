import { initTheme, initUniform, setupManifest } from './theme.js';
import { initTabs } from './tabs.js';
import { initScheduleStandings } from './render-schedule-standings.js';
import { initGameTabToggles } from './render-game.js';
import { initDataLoader } from './data-loader.js';

/* init */
initScheduleStandings();
initGameTabToggles();
initTheme();
initUniform();
setupManifest();
initTabs();
initDataLoader();
