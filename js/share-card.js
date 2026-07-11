import { TEAM_ID, teamColor, abbr } from './constants.js';
import { $, contrastText } from './utils.js';
import { STORE } from './store.js';

const W = 1080, H = 1080;

function drawCard(ctx, cfg) {
  const { leftAbbr, rightAbbr, leftColor, rightColor, headline, subline } = cfg;

  ctx.fillStyle = leftColor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(W * 0.55, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(W * 0.45, H);
  ctx.closePath();
  ctx.fill();

  /* dark scrim across the seam so the headline reads regardless of team colors */
  ctx.fillStyle = 'rgba(10,12,18,0.38)';
  ctx.fillRect(0, H * 0.40, W, H * 0.22);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = contrastText(leftColor);
  ctx.font = '800 128px Arial, Helvetica, sans-serif';
  ctx.fillText(leftAbbr, W * 0.25, H * 0.28);

  ctx.fillStyle = contrastText(rightColor);
  ctx.font = '800 128px Arial, Helvetica, sans-serif';
  ctx.fillText(rightAbbr, W * 0.75, H * 0.28);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 58px Arial, Helvetica, sans-serif';
  ctx.fillText(headline, W / 2, H * 0.505);
  ctx.font = '500 26px Arial, Helvetica, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillText(subline, W / 2, H * 0.505 + 46);

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '800 32px Arial, Helvetica, sans-serif';
  ctx.fillText('ScoreBooth', 44, H - 56);
  ctx.font = '400 18px Arial, Helvetica, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fillText('free & open-source · not affiliated with MLB', 44, H - 26);
}

function shareCanvas(canvas, filename, title, text) {
  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title, text }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  return c;
}

function shareWinProbCard() {
  const wpData = STORE.lastWinProb;
  if (!wpData) return;
  const { wp, oid } = wpData;
  const op = 1 - wp;
  const canvas = makeCanvas();
  drawCard(canvas.getContext('2d'), {
    leftAbbr: abbr(TEAM_ID),
    rightAbbr: abbr(oid),
    leftColor: teamColor(TEAM_ID),
    rightColor: teamColor(oid),
    headline: (wp * 100).toFixed(1) + '% vs ' + (op * 100).toFixed(1) + '%',
    subline: 'ScoreBooth win probability model'
  });
  shareCanvas(canvas, 'scorebooth-winprob.png', 'ScoreBooth', abbr(TEAM_ID) + ' win probability');
}

function shareGameCard() {
  const g = STORE.lastGameCard;
  if (!g) return;
  const canvas = makeCanvas();
  drawCard(canvas.getContext('2d'), {
    leftAbbr: abbr(TEAM_ID),
    rightAbbr: abbr(g.oid),
    leftColor: teamColor(TEAM_ID),
    rightColor: teamColor(g.oid),
    headline: (g.phiScore != null ? g.phiScore : 0) + ' – ' + (g.oppScore != null ? g.oppScore : 0),
    subline: g.live ? 'LIVE' : (g.won ? 'WIN' : 'LOSS')
  });
  shareCanvas(canvas, 'scorebooth-score.png', 'ScoreBooth', abbr(TEAM_ID) + ' ' + (g.live ? 'live score' : (g.won ? 'win' : 'loss')));
}

export function initShareCard() {
  const wpBtn = $('shareWpBtn');
  if (wpBtn) wpBtn.addEventListener('click', shareWinProbCard);
  const gameBtn = $('shareGameBtn');
  if (gameBtn) gameBtn.addEventListener('click', shareGameCard);
}
