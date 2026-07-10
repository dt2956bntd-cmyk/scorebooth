import { TEAM_ID, LOGO, LOGO_CAP } from './constants.js';
import { $, LS, BELL_INNER } from './utils.js';

/* ===== header uniform badge ===== */
function ccBell(){return '<svg viewBox="0 0 100 100" aria-label="City Connect"><g fill="#ffffff"><rect x="44" y="10" width="12" height="7" rx="1.5"/><path d="M40 17 h20 a3 3 0 0 1 3 3 v3 H37 v-3 a3 3 0 0 1 3-3 z"/><path d="M37 24 C 30 30, 25 44, 22 62 C 21 68, 19 72, 16 76 h68 C 81 72, 79 68, 78 62 C 75 44, 70 30, 63 24 z"/><rect x="13" y="78" width="74" height="7" rx="2"/><circle cx="50" cy="89" r="4.5"/></g><path d="M54 30 l -4 12 l 5 6 l -6 9 l 5 7 l -4 5 l 2.5 2 l 4.5 -6 l -5 -7 l 6 -9 l -5 -6 l 4 -13 z" fill="#ffd24d"/></svg>';}
// try your own image at logos/<uniform>.(png|svg|jpg|webp); else official CDN logo; else bell
// referenced from a generated onerror="" attribute (global scope) — must live on window
window.__imgChain=function(img){let list=[];try{list=JSON.parse(img.getAttribute('data-chain')||'[]');}catch(e){}if(list.length){const n=list.shift();img.setAttribute('data-chain',JSON.stringify(list));img.src=n;return;}img.outerHTML=img.getAttribute('data-cc')?ccBell():window.BELL_HTML('');};
function uniImg(key,cdnSrc,isCity){const base='logos/'+key;const chain=[base+'.svg',base+'.jpg',base+'.jpeg',base+'.webp'];if(cdnSrc)chain.push(cdnSrc);return '<img src="'+base+'.png" data-chain=\''+JSON.stringify(chain)+'\''+(isCity?' data-cc="1"':'')+' alt="Phillies uniform" onerror="window.__imgChain(this)">';}
const UNIFORMS={
  home:{label:'Home (white pinstripe)', sw:'#f3f4f8', bg:'linear-gradient(180deg,rgba(255,255,255,0.32),rgba(238,241,247,0.16))', bgA:'#f4f6fb', bgB:'#e8ecf4', glow:'rgba(228,0,43,0.20)', dbgA:'#171a24', dbgB:'#101320', dglow:'rgba(228,0,43,0.30)', logo:()=>uniImg('home',LOGO(TEAM_ID),false)},
  road:{label:'Road (gray)', sw:'#9aa1ab', bg:'linear-gradient(180deg,rgba(190,196,206,0.36),rgba(150,157,168,0.22))', bgA:'#e6e9f1', bgB:'#d4d8e2', glow:'rgba(228,0,43,0.32)', dbgA:'#181a21', dbgB:'#111318', dglow:'rgba(228,0,43,0.36)', logo:()=>uniImg('road',LOGO_CAP(TEAM_ID),false)},
  alt:{label:'Alternate (red / blue)', sw:'#2a4aa0', bg:'linear-gradient(180deg,rgba(43,74,160,0.34),rgba(28,53,118,0.22))', bgA:'#eef2f9', bgB:'#e2e8f1', glow:'rgba(20,62,165,0.24)', dbgA:'#141a2c', dbgB:'#0e1322', dglow:'rgba(64,110,255,0.26)', logo:()=>uniImg('alt',LOGO(TEAM_ID),false)},
  powder:{label:'Powder blue', sw:'#9ec7e8', bg:'linear-gradient(180deg,rgba(170,205,238,0.40),rgba(140,180,222,0.26))', bgA:'#e4eefb', bgB:'#cfe0f4', glow:'rgba(150,33,40,0.26)', dbgA:'#132030', dbgB:'#0d1622', dglow:'rgba(126,180,235,0.22)', logo:()=>uniImg('powder',LOGO(TEAM_ID),false)},
  city:{label:'City Connect', sw:'linear-gradient(135deg,#16266b,#ffd24d)', bg:'linear-gradient(135deg,rgba(11,31,94,0.44),rgba(37,82,176,0.30))', bgA:'#dce7fb', bgB:'#c6d6f2', glow:'rgba(245,200,60,0.34)', dbgA:'#0f1c38', dbgB:'#0a1226', dglow:'rgba(245,200,60,0.30)', logo:()=>uniImg('city',null,true)}
};
let curUni='home';
export let uniManual=null;
export function applyUniform(key){
  if(!UNIFORMS[key])key='home';curUni=key;
  const u=UNIFORMS[key],dark=document.documentElement.getAttribute('data-theme')==='dark',r=document.documentElement.style;
  const a=dark?u.dbgA:u.bgA, bb=dark?u.dbgB:u.bgB, gl=dark?(u.dglow||u.glow):u.glow;
  if(a)r.setProperty('--bg-a',a);if(bb)r.setProperty('--bg-b',bb);if(gl)r.setProperty('--glow',gl);
  const b=$('brandLogo');if(b){b.style.background=u.bg;b.innerHTML=u.logo();}
  buildUniPicker();
  if(typeof updateThemeColor==='function')updateThemeColor();
}
function buildUniPicker(){const p=$('uniPicker');if(!p)return;p.innerHTML='';Object.keys(UNIFORMS).forEach(k=>{const u=UNIFORMS[k],sw=document.createElement('button');sw.type='button';sw.className='uni-sw'+(curUni===k?' active':'');sw.title=u.label;sw.setAttribute('aria-label',u.label);sw.setAttribute('aria-pressed',curUni===k?'true':'false');sw.style.background=u.sw;sw.onclick=()=>{uniManual=k;LS.set('phbooth:uni',k);applyUniform(k);};p.appendChild(sw);});}

/* ===== theme: auto (system) / light / dark, cycled by the header button ===== */
const THEME_KEY='phbooth:theme';
let themePref='auto';
const mqDark=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function resolvedTheme(){return themePref==='auto'?((mqDark&&mqDark.matches)?'dark':'light'):themePref;}
function updateThemeColor(){const m=document.querySelector('meta[name="theme-color"]');if(m){const v=getComputedStyle(document.documentElement).getPropertyValue('--bg-b').trim();if(v)m.content=v;}}
function applyTheme(){
  document.documentElement.setAttribute('data-theme',resolvedTheme());
  const b=$('themeBtn');
  if(b)b.innerHTML=themePref==='auto'?'&#9681; Auto':(themePref==='dark'?'&#9790; Dark':'&#9728; Light');
  applyUniform(curUni); /* re-resolve uniform bg tints + theme-color meta for the new theme */
}
export function initTheme(){
  const saved=LS.get(THEME_KEY);
  if(saved==='light'||saved==='dark'||saved==='auto')themePref=saved;
  if(mqDark){const onMq=()=>{if(themePref==='auto')applyTheme();};if(mqDark.addEventListener)mqDark.addEventListener('change',onMq);else if(mqDark.addListener)mqDark.addListener(onMq);}
  const b=$('themeBtn');
  if(b)b.addEventListener('click',()=>{themePref=themePref==='auto'?'dark':(themePref==='dark'?'light':'auto');LS.set(THEME_KEY,themePref);applyTheme();});
  applyTheme();
}

export function initUniform(){
  uniManual=LS.get('phbooth:uni');
  applyUniform(uniManual||'home');
}

/* ===== PWA: runtime manifest + icon (installable on phone home screens) ===== */
export function setupManifest(){
  try{
    const bell=BELL_INNER.replace('rgba(255,255,255,0.92)','#e4002b');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#e4002b"/><g fill="#ffffff">'+bell+'</g></svg>';
    const icon='data:image/svg+xml,'+encodeURIComponent(svg);
    const man={name:'Phils Booth',short_name:'Phils Booth',start_url:'.',scope:'.',display:'standalone',background_color:'#e9edf4',theme_color:'#e4002b',icons:[{src:icon,sizes:'any',type:'image/svg+xml',purpose:'any'},{src:icon,sizes:'any',type:'image/svg+xml',purpose:'maskable'}]};
    const link=document.createElement('link');link.rel='manifest';link.href=URL.createObjectURL(new Blob([JSON.stringify(man)],{type:'application/manifest+json'}));document.head.appendChild(link);
    const apple=document.createElement('link');apple.rel='apple-touch-icon';apple.href=icon;document.head.appendChild(apple);
  }catch(e){}
}
