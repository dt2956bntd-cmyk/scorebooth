import { clamp } from './utils.js';

export function log5(a,b){const d=a+b-2*a*b;return d===0?0.5:(a-a*b)/d;}
export function winProb(p,o,home){return clamp(log5(p,o)+(home?0.035:-0.035),0.03,0.97);}
export function american(p){return p>=0.5?('−'+Math.round(100*p/(1-p))):('+'+Math.round(100*(1-p)/p));}
export function pctFrom(r){if(!r)return 0.5;const w=r.wins,l=r.losses;return (w+l)>0?w/(w+l):(parseFloat(r.pct)||0.5);}
