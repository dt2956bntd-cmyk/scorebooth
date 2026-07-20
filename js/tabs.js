import { $, LS } from './utils.js';

const TAB_ORDER=['booth','game','schedule','standings','team','mygames'];
let currentTab='booth';
function positionIndicator(){const b=document.querySelector('.tab-btn.active');const ind=$('tabInd');if(!b||!ind)return;ind.style.width=b.offsetWidth+'px';ind.style.height=b.offsetHeight+'px';ind.style.transform='translate('+b.offsetLeft+'px,'+b.offsetTop+'px)';}
function activateTab(name){
  const dir=TAB_ORDER.indexOf(name)>=TAB_ORDER.indexOf(currentTab)?1:-1;currentTab=name;
  document.querySelectorAll('.tab-btn').forEach(b=>{const on=b.dataset.tab===name;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
  positionIndicator();
  const panel=document.querySelector('.tab-panel[data-panel="'+name+'"]');
  if(panel){panel.style.transition='none';panel.style.transform='translateX('+(dir*26)+'px)';panel.style.opacity='0';requestAnimationFrame(()=>{panel.style.transition='transform .32s cubic-bezier(.4,0,.2,1),opacity .32s';panel.style.transform='';panel.style.opacity='';});}
  LS.set('scorebooth:tab',name);
}

export function initTabs(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.tab)));
  $('tabs').addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();
    let i=TAB_ORDER.indexOf(currentTab);
    if(e.key==='ArrowLeft')i=(i-1+TAB_ORDER.length)%TAB_ORDER.length;
    else if(e.key==='ArrowRight')i=(i+1)%TAB_ORDER.length;
    else if(e.key==='Home')i=0; else i=TAB_ORDER.length-1;
    activateTab(TAB_ORDER[i]);
    const btn=document.querySelector('.tab-btn[data-tab="'+TAB_ORDER[i]+'"]');if(btn)btn.focus();
  });
  document.addEventListener('click',e=>{const a=e.target.closest('.car-arrow');if(!a)return;const c=$(a.dataset.car);if(c)c.scrollBy({left:(a.classList.contains('left')?-1:1)*(c.clientWidth||220),behavior:'smooth'});});
  window.addEventListener('resize',positionIndicator);
  window.addEventListener('load',positionIndicator);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(positionIndicator);
  const savedTab=LS.get('scorebooth:tab');activateTab(savedTab||'booth');
  setTimeout(positionIndicator,300);
}
