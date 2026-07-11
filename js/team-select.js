import { TEAM_ID, TEAMS, setTeamId, LOGO_CAP, abbr } from './constants.js';
import { $, LS } from './utils.js';
import { resetStore } from './store.js';
import { reloadAllData } from './data-loader.js';
import { applyTeamBrand, setupManifest } from './theme.js';

const TEAM_KEY='scorebooth:team';

function updateTeamBtn(){
  const b=$('teamBtn');
  if(b)b.innerHTML='&#9918; '+abbr(TEAM_ID);
}

function buildGrid(){
  const g=$('teamGrid');
  if(!g)return;
  g.innerHTML='';
  Object.keys(TEAMS).map(Number).sort((a,b)=>TEAMS[a][1].localeCompare(TEAMS[b][1])).forEach(id=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='team-opt'+(id===TEAM_ID?' active':'');
    btn.innerHTML='<img src="'+LOGO_CAP(id)+'" alt="'+TEAMS[id][1]+'" loading="lazy" onerror="this.style.visibility=\'hidden\'"><span>'+TEAMS[id][1]+'</span>';
    btn.addEventListener('click',()=>selectTeam(id));
    g.appendChild(btn);
  });
}

function openModal(){
  const bd=$('teamModalBackdrop');
  if(!bd)return;
  buildGrid();
  bd.classList.remove('hide');
  document.body.style.overflow='hidden'; /* stop the page behind the modal from scrolling with it */
}
function closeModal(){
  const bd=$('teamModalBackdrop');
  if(bd)bd.classList.add('hide');
  document.body.style.overflow='';
}

function selectTeam(id){
  if(id===TEAM_ID){closeModal();return;}
  setTeamId(id);
  LS.set(TEAM_KEY,id);
  resetStore();
  updateTeamBtn();
  applyTeamBrand();
  setupManifest();
  closeModal();
  reloadAllData();
}

export function initTeamSelect(){
  const saved=LS.get(TEAM_KEY);
  const isFirstVisit=!(saved&&TEAMS[saved]);
  if(!isFirstVisit)setTeamId(saved);
  updateTeamBtn();
  applyTeamBrand(); /* correct the brand logo/accent colors before initTheme's own applyTeamBrand() call runs */

  const btn=$('teamBtn');
  if(btn)btn.addEventListener('click',openModal);
  const close=$('teamModalClose');
  if(close)close.addEventListener('click',closeModal);
  const backdrop=$('teamModalBackdrop');
  if(backdrop)backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  if(isFirstVisit)openModal();
}
