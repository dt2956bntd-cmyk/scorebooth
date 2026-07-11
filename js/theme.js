import { TEAM_ID, teamColor, teamColor2, abbr } from './constants.js';
import { $, LS, capLogoImg, contrastText } from './utils.js';

/* ===== team brand: header logo + --team-primary/--team-secondary/--red* CSS vars =====
   identity comes from the team colors themselves (contrast + saturation), not translucency effects.
   --red/--red-bright drive most of the app's accent text (active tab, "our team" row highlights,
   hover states, etc) — retinting them to the team color re-themes all of that without touching each
   CSS rule. --loss stays a fixed red (see index.html) for win/loss badges, which must stay universal. */
function hexToRgba(hex,alpha){
  hex=String(hex).replace('#','');
  const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
  return 'rgba('+r+','+g+','+b+','+alpha+')';
}
function hexToHsl(hex){
  hex=String(hex).replace('#','');
  const r=parseInt(hex.slice(0,2),16)/255,g=parseInt(hex.slice(2,4),16)/255,b=parseInt(hex.slice(4,6),16)/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;const l=(max+min)/2;
  if(max!==min){
    const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
    if(max===r)h=(g-b)/d+(g<b?6:0); else if(max===g)h=(b-r)/d+2; else h=(r-g)/d+4;
    h*=60;
  }
  return [h,s*100,l*100];
}
function hslToHex(h,s,l){
  s/=100;l/=100;
  const k=n=>(n+h/30)%12;
  const a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  const toHex=x=>Math.round(255*x).toString(16).padStart(2,'0');
  return '#'+toHex(f(0))+toHex(f(8))+toHex(f(4));
}
/* a text-legible variant of a team color for the current theme: dark enough to read on light
   panels, or light enough to read on dark panels, without losing its hue (grayscale colors like
   the White Sox' black stay grayscale — there's no hue to preserve) */
function textSafeShade(hex,dark){
  const [h,s,l]=hexToHsl(hex);
  return hslToHex(h,Math.max(s,45),dark?Math.max(l,68):Math.min(l,42));
}
export function applyTeamBrand(){
  const primary=teamColor(TEAM_ID),secondary=teamColor2(TEAM_ID);
  const dark=document.documentElement.getAttribute('data-theme')==='dark',r=document.documentElement.style;
  r.setProperty('--team-primary',primary);
  r.setProperty('--team-secondary',secondary);
  r.setProperty('--red',primary);
  r.setProperty('--red-bright',textSafeShade(primary,dark));
  r.setProperty('--red-dim',hexToRgba(primary,dark?0.14:0.10));
  const b=$('brandLogo');
  if(b)b.innerHTML=capLogoImg(TEAM_ID,'brand-logo-img','logo-fallback');
  if(typeof updateThemeColor==='function')updateThemeColor();
}

/* ===== theme: auto (system) / light / dark, cycled by the header button ===== */
const THEME_KEY='scorebooth:theme';
let themePref='auto';
const mqDark=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function resolvedTheme(){return themePref==='auto'?((mqDark&&mqDark.matches)?'dark':'light'):themePref;}
function updateThemeColor(){const m=document.querySelector('meta[name="theme-color"]');if(m){const v=getComputedStyle(document.documentElement).getPropertyValue('--bg-b').trim();if(v)m.content=v;}}
function applyTheme(){
  document.documentElement.setAttribute('data-theme',resolvedTheme());
  const b=$('themeBtn');
  if(b)b.innerHTML=themePref==='auto'?'&#9681; Auto':(themePref==='dark'?'&#9790; Dark':'&#9728; Light');
  applyTeamBrand(); /* re-resolve the team accent shades + theme-color meta for the new light/dark theme */
}
export function initTheme(){
  const saved=LS.get(THEME_KEY);
  if(saved==='light'||saved==='dark'||saved==='auto')themePref=saved;
  if(mqDark){const onMq=()=>{if(themePref==='auto')applyTheme();};if(mqDark.addEventListener)mqDark.addEventListener('change',onMq);else if(mqDark.addListener)mqDark.addListener(onMq);}
  const b=$('themeBtn');
  if(b)b.addEventListener('click',()=>{themePref=themePref==='auto'?'dark':(themePref==='dark'?'light':'auto');LS.set(THEME_KEY,themePref);applyTheme();});
  applyTheme();
}

/* ===== PWA: runtime manifest + icon (installable on phone home screens) =====
   icon/theme_color follow the selected team; re-callable on team switch (reuses <link> elements,
   revokes the previous manifest Blob URL so switching teams repeatedly doesn't leak them) */
function teamIconDataURI(){
  const primary=teamColor(TEAM_ID),label=abbr(TEAM_ID),ink=contrastText(primary);
  const fontSize=label.length>2?30:38;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="'+primary+'"/><text x="50" y="54" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="'+fontSize+'" fill="'+ink+'">'+label+'</text></svg>';
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
let manifestLink=null, appleLink=null, manifestBlobUrl=null;
export function setupManifest(){
  try{
    const icon=teamIconDataURI();
    const man={name:'ScoreBooth',short_name:'ScoreBooth',start_url:'.',scope:'.',display:'standalone',background_color:'#e9edf4',theme_color:teamColor(TEAM_ID),icons:[{src:icon,sizes:'any',type:'image/svg+xml',purpose:'any'},{src:icon,sizes:'any',type:'image/svg+xml',purpose:'maskable'}]};
    if(manifestBlobUrl)URL.revokeObjectURL(manifestBlobUrl);
    manifestBlobUrl=URL.createObjectURL(new Blob([JSON.stringify(man)],{type:'application/manifest+json'}));
    if(!manifestLink){manifestLink=document.createElement('link');manifestLink.rel='manifest';document.head.appendChild(manifestLink);}
    manifestLink.href=manifestBlobUrl;
    if(!appleLink){appleLink=document.createElement('link');appleLink.rel='apple-touch-icon';document.head.appendChild(appleLink);}
    appleLink.href=icon;
  }catch(e){}
}
