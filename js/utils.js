import { TEAM_ID, LOGO, LOGO_CAP, HEAD, PORTRAIT, abbr, WD } from './constants.js';

export const $ = id => document.getElementById(id);
export const pad = n => String(n).padStart(2,'0');
export const clamp = (x,lo,hi)=>Math.max(lo,Math.min(hi,x));
export const stripZero = s => s==null?'':String(s).replace(/^0(?=\.)/,'');

export function contrastText(hex){hex=String(hex).replace('#','');const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);const L=(0.299*r+0.587*g+0.114*b)/255;return L>0.62?'#15161a':'#ffffff';}
export function initials(n){const p=String(n).replace(/[^A-Za-zÀ-ÿ .'-]/g,'').split(/\s+/).filter(Boolean);return ((p[0]?p[0][0]:'')+(p.length>1?p[p.length-1][0]:'')).toUpperCase();}
export function headshot(id,name,cls){const ini=initials(name);return '<img class="hs '+cls+'" loading="lazy" src="'+HEAD(id)+'" alt="'+String(name).replace(/"/g,'')+'" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'hs hs-fb '+cls+'\',textContent:\''+ini+'\'}))">';}
export function portrait(id,name,cls){const ini=initials(name);return '<img class="por '+cls+'" loading="lazy" src="'+PORTRAIT(id)+'" alt="'+String(name).replace(/"/g,'')+'" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'por hs-fb '+cls+'\',textContent:\''+ini+'\'}))">';}
export function logoImg(id,cls,fb){const ab=abbr(id);return '<img class="'+cls+'" src="'+LOGO_CAP(id)+'" alt="'+ab+'" data-id="'+id+'" onerror="if(!this.dataset.t){this.dataset.t=1;this.src=\'https://www.mlbstatic.com/team-logos/\'+this.dataset.id+\'.svg\';}else{this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\''+fb+'\',textContent:\''+ab+'\'}));}">';}
export function capLogoImg(id,cls,fb){return logoImg(id,cls,fb);}

export const BELL_INNER='<rect x="44" y="10" width="12" height="7" rx="1.5"/><path d="M40 17 h20 a3 3 0 0 1 3 3 v3 H37 v-3 a3 3 0 0 1 3-3 z"/><path d="M37 24 C 30 30, 25 44, 22 62 C 21 68, 19 72, 16 76 h68 C 81 72, 79 68, 78 62 C 75 44, 70 30, 63 24 z"/><rect x="13" y="78" width="74" height="7" rx="2"/><circle cx="50" cy="89" r="4.5"/><path d="M54 30 l -4 12 l 5 6 l -6 9 l 5 7 l -4 5 l 2.5 2 l 4.5 -6 l -5 -7 l 6 -9 l -5 -6 l 4 -13 z" fill="rgba(255,255,255,0.92)"/>';
/* referenced from generated onerror="" HTML attributes, which run in global scope — must live on window, not just module scope */
window.BELL_HTML = cls => '<svg class="'+cls+'" viewBox="0 0 100 100" fill="#e4002b" aria-label="Phillies">'+BELL_INNER+'</svg>';
export function phiLogoHTML(cls,variant){const src=variant==='cap'?LOGO_CAP(TEAM_ID):LOGO(TEAM_ID);return '<img class="'+cls+'" src="'+src+'" alt="Phillies" onerror="this.outerHTML=window.BELL_HTML(\''+cls+'\')">';}

export const KST_OFF=9;
export function inZone(ms,off){return new Date(ms+off*3600000);}
export function fmt12(d){let h=d.getUTCHours();const m=d.getUTCMinutes();const ap=h<12?'AM':'PM';h=h%12;if(h===0)h=12;return h+':'+pad(m)+' '+ap;}
export function zoneDateLabel(ms,off){const d=inZone(ms,off);return WD[d.getUTCDay()]+' '+(d.getUTCMonth()+1)+'/'+d.getUTCDate();}
/* Eastern Time via Intl — DST-safe (was a fixed -4 offset before, wrong Nov–Mar) */
export const ET_D=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'numeric',day:'numeric'});
export const ET_T=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit',hour12:true});
export const ET_C=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hour12:false});
export function fmtParts(f,ms){const p={};f.formatToParts(ms).forEach(x=>p[x.type]=x.value);return p;}
export function etDateLabel(ms){const p=fmtParts(ET_D,ms);return p.weekday+' '+p.month+'/'+p.day;}
export function etTime(ms){const p=fmtParts(ET_T,ms);return p.hour+':'+p.minute+' '+(p.dayPeriod||'');}

export const REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export function pulseEl(el){if(REDUCED||!el)return;el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');}
export function setPulse(el,html){if(!el)return;if(el.innerHTML!==html){el.innerHTML=html;pulseEl(el);}}
export function skelHTML(n){let h='<div class="skel">';for(let i=0;i<n;i++)h+='<div class="skel-bar" style="width:'+(50+((i*17)%38))+'%"></div>';return h+'</div>';}
/* skip DOM rewrites when markup is unchanged — keeps carousel scroll, revealed rows, etc. */
export function setHTMLIfChanged(el,html){if(!el)return false;if(el.__lastHTML===html)return false;el.__lastHTML=html;el.innerHTML=html;return true;}

export const LS = {get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
