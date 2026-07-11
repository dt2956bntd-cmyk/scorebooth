# ScoreBooth

A personal, single-page MLB dashboard: live win probability, game tracking, schedule, standings, roster, and team leaders for any of the 30 MLB teams — installable as a PWA. No build step, no framework, no backend.

> Started as a Phillies-only side project called "Phils Booth" and grew into a team-switchable dashboard for all 30 teams — renamed to ScoreBooth to match.

## ⚠️ Legal / Attribution — read before you fork this

This project is **personal and non-commercial**. It works by calling MLB's public `statsapi.mlb.com` endpoint and pulling team logos / player images from `mlbstatic.com`. Both belong to **MLB Advanced Media, L.P. and the respective clubs**:

- The Stats API is **unofficial and undocumented** — there is no license agreement covering its use, it can change or stop working at any time, and it is not intended for commercial products.
- Team logos, player photos, and names are the **copyrighted property of MLB and its clubs**.

**Do not use this project, or a fork of it, for anything commercial** (ads, subscriptions, paid distribution, etc.) without your own license from MLB. The MIT license below covers only the source code written for this project — it grants no rights to MLB's data, names, or imagery.

## Features

- Live win probability (log5 model + home-field adjustment) and a no-vig moneyline for the next/current game
- Live game tracking: line score, decisions, top performers, full box score
- Schedule, recent results (with a spoiler guard), and division standings — auto-detected for whichever team you pick
- Team leaders carousel, active roster, season hitting/pitching stats
- Pick any of the 30 MLB teams; the whole app (colors, logos, PWA icon, API calls) re-themes to match
- Installable as a PWA (manifest + icon generated at runtime per team)
- Light / dark / auto theme
- Works offline-ish: last good data is cached in `localStorage` and shown as a snapshot while it refreshes

## Running it locally

No build step — it's plain HTML/CSS and ES modules. Any static file server works:

```bash
python3 -m http.server
# then open http://localhost:8000
```

or `npx serve`, or just open `index.html` via a local server of your choice (opening the file directly with `file://` will not work, since ES modules require `http(s)://`).

## How it's built

- Vanilla JS, ES modules (`js/*.js`), no dependencies, no bundler
- `js/constants.js` — team data, colors, API/CDN URL builders
- `js/store.js` / `js/data-loader.js` — fetch + cache MLB Stats API data
- `js/render-*.js` — DOM rendering per section (booth/game/schedule/standings/team)
- `js/theme.js` — light/dark theme + per-team color and PWA manifest generation
- `js/team-select.js` — team picker UI + persistence (`localStorage`)

The code favors terse, single-file-style JS (long one-liners, no framework) to keep the whole app dependency-free and easy to drop anywhere. If you're used to a more conventional style, that's a deliberate tradeoff for this project, not an oversight.

## Known limitations

- Relies on an unofficial MLB API with no uptime/format guarantees (see Legal section above)
- No automated tests or CI
- DOM is built via `innerHTML` string concatenation throughout; safe given the trusted data source (MLB's API), but worth knowing if you extend it with any user-supplied input
- No `logos/` directory is bundled — team logos load from MLB's CDN, with a plain letter-abbreviation fallback if that ever fails

## License

Source code is [MIT licensed](./LICENSE). MLB team names, logos, and data are not — see Legal/Attribution above.
