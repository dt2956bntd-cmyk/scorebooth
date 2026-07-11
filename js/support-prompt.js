import { $, LS } from './utils.js';

/* App-store-rating-style nag: shows a couple times at most, well after someone has
   actually used the app a few times — never on a first visit, never every visit. */
const KEY = 'scorebooth:supportPrompt';
const MIN_VISITS = 3;
const REMIND_AFTER_MS = 14 * 86400000; /* 14 days */
const SHOW_DELAY_MS = 5000;

function load(){
  const s = LS.get(KEY);
  return s && typeof s === 'object' ? s : { visits: 0, lastShown: null, state: 'pending' };
}
function save(s){ LS.set(KEY, s); }

function shouldShow(s){
  if (s.state === 'never' || s.state === 'clicked') return false;
  if (s.visits < MIN_VISITS) return false;
  if (s.state === 'later' && s.lastShown && (Date.now() - s.lastShown) < REMIND_AFTER_MS) return false;
  return true;
}

function openModal(){
  const bd = $('supportModalBackdrop');
  if (bd) bd.classList.remove('hide');
}
function closeModal(){
  const bd = $('supportModalBackdrop');
  if (bd) bd.classList.add('hide');
}

export function initSupportPrompt(){
  const s = load();
  s.visits = (s.visits || 0) + 1;
  save(s);

  if (!shouldShow(s)) return;

  setTimeout(() => {
    /* re-check state at fire time in case something changed it meanwhile */
    const cur = load();
    if (!shouldShow(cur)) return;
    openModal();
  }, SHOW_DELAY_MS);

  const yes = $('supportModalYes');
  if (yes) yes.addEventListener('click', () => {
    const cur = load(); cur.state = 'clicked'; save(cur);
    closeModal();
  });
  const later = $('supportModalLater');
  if (later) later.addEventListener('click', () => {
    const cur = load(); cur.state = 'later'; cur.lastShown = Date.now(); save(cur);
    closeModal();
  });
  const never = $('supportModalNever');
  if (never) never.addEventListener('click', () => {
    const cur = load(); cur.state = 'never'; save(cur);
    closeModal();
  });
}
