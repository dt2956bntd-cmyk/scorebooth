import { TEAM_ID, abbr } from './constants.js';
import { $, LS } from './utils.js';

/* Opt-in, local-only game-start notification. No backend/push server exists for this app, so
   this only fires while the tab/PWA is open (or recently backgrounded) — never when fully
   closed. Permission is requested only on explicit click, never on page load. */
const PREF_KEY = 'scorebooth:notify';

function isEnabled(){ return LS.get(PREF_KEY) === true; }

function updateBtn(){
  const b = $('notifyBtn');
  if (!b) return;
  if (!('Notification' in window)) { b.classList.add('hide'); return; }
  const on = isEnabled() && Notification.permission === 'granted';
  b.textContent = on ? '🔔 Notify: On' : '🔔 Notify';
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
}

export function initGameNotify(){
  const b = $('notifyBtn');
  if (!b || !('Notification' in window)) { if (b) b.classList.add('hide'); return; }
  updateBtn();
  b.addEventListener('click', async () => {
    if (isEnabled()) { LS.set(PREF_KEY, false); updateBtn(); return; }
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm === 'granted') LS.set(PREF_KEY, true);
    updateBtn();
  });
}

let notifiedForMs = 0;
export function notifyGameStart(targetMs, oppAbbr){
  if (!('Notification' in window)) return;
  if (!isEnabled() || Notification.permission !== 'granted') return;
  if (notifiedForMs === targetMs) return;
  notifiedForMs = targetMs;
  try {
    new Notification('ScoreBooth', { body: abbr(TEAM_ID) + ' vs ' + oppAbbr + ' is starting now!' });
  } catch (e) {}
}
