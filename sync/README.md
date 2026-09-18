# WORDRAIDERS cloud sync

Progress normally lives in each phone's browser. Cloud sync keeps one copy per player in a tiny
database so the same player is up to date on every device. It runs on a free Cloudflare account
that you own; the game only needs to know the worker's address (`sync.json` next to the game).

## One-time setup (about 10 minutes)

1. Make a free account at https://dash.cloudflare.com (no domain or card needed).
2. **Account ID**: in the dashboard open *Workers & Pages*; the Account ID is on the right-hand side.
3. **API token**: *My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template*.
   Under *Permissions* add a row **Account · D1 · Edit**, then *Continue → Create Token* and copy it.
4. In the GitHub repository that serves the game (`chiokebuckley-art/wordraiders`):
   *Settings → Secrets and variables → Actions → New repository secret*, twice:
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. *Actions → Cloud sync → Run workflow*. It creates the database, deploys the worker, and writes
   `sync.json` so the game finds it. Two minutes later the game's Settings show
   **Sync across devices**.

## Using it

- On the phone that has the progress: *Settings → Sync across devices → Turn on*. The game shows a
  sync code such as `WR4K-9TQ2-MHB7`.
- On any other device: on the *Who's playing?* screen tap *Link a player from another device* and
  enter the code. The player appears with all their progress. From then on both devices sync
  automatically: when the game opens, when it comes back to the front, and as you play.
- The code is a secret: anyone who has it can load that player. Turning sync off on a device only
  unlinks that device; the cloud copy stays until it is overwritten.

## How it works

`worker.mjs` stores one JSON save per code with a revision number. A device pushes with the
revision it last saw; if the cloud has moved on (another device played), the worker answers with
the newer save instead of overwriting, and the game keeps whichever copy was saved later. Bodies
are capped at 400 KB and there are no accounts, cookies or analytics. Free-tier limits (100,000
writes a day) are far above a family's use: the game pushes at most every 15 seconds while playing.

Self-hosting elsewhere: any server that implements the three routes at the top of `worker.mjs`
works; put its address in `localStorage["wordraiders.sync.url"]` or in `sync.json`.
