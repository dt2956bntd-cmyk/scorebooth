import { API } from './constants.js';

export const STORE={detail:[],finals:[],next:null,season:[],boxCache:{},liveActive:false,phiForm:null};
export function resetStore(){STORE.detail=[];STORE.finals=[];STORE.next=null;STORE.season=[];STORE.boxCache={};STORE.liveActive=false;STORE.phiForm=null;}

export async function fetchJSON(u){const opt={cache:'no-store'};if(typeof AbortSignal!=='undefined'&&AbortSignal.timeout)opt.signal=AbortSignal.timeout(12000);const r=await fetch(u,opt);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}
export async function getBox(pk,force){if(!force&&STORE.boxCache[pk])return STORE.boxCache[pk];const d=await fetchJSON(API+'/game/'+pk+'/boxscore');STORE.boxCache[pk]=d;return d;}
