# StoryForge — The Short Film Quest

A standalone, dependency-free companion to WordRaiders. Play at:
https://chiokebuckley-art.github.io/wordraiders/storyforge/

## What it does
- 24 missions across six acts: explanation, original worked example, two practice questions, and a writing assignment with self-review.
- 48 distinct concept questions used in learning and shuffled arcade rounds; seen questions are deprioritized across rounds, not claimed to be infinite.
- Four arcade modes, including four causal sequencing stories, plus all five handbook writing drills with optional timers.
- Multiple local writer profiles and film projects; editable blueprint; reorderable screenplay scene cards; draft snapshots; evidence-based final project review.
- Full JSON backup/import (imports add profiles), Markdown workbook and Fountain screenplay export, and a printable reading preview.
- Original complete worked example, glossary, sources, and mobile layout.

No paid services or API keys. No AI writing assessment. No automatic artistic readiness certification. The completion gate records demonstrated process and self-review; outside reading and repeated projects develop craft.

## Run and verify
Requires Node for tests and Python for a local server. The game itself is plain HTML/CSS/JavaScript.

```sh
npm test
python3 -m http.server 4173
```

Open http://localhost:4173/ . Do not open index.html as a file URL: browser ES modules need HTTP.

## Storage
One namespaced localStorage key, `storyforge.v1`. This is separate from WordRaiders saves. Writer profiles are local convenience profiles, not secure accounts or cloud sync. Back up before clearing browser data. Invalid saved data is not silently overwritten; recovery export is offered. Imports are validated before appending profiles.

## Repository workflow
Authoritative source is `wordraiders/public/storyforge/` in `chiokebuckley-art/command-center`. Vite public assets preserve this folder during future WordRaiders static builds. The same files are published under `storyforge/` on both `main` and `gh-pages` of the public `wordraiders` repository. Deploy with additive Git tree updates based on the current branch tree; do not replace unrelated game files. GitHub Pages serves the existing `gh-pages` deployment.

The supplied handbook is not republished. `SOURCES.md` maps all chapters to original game lessons and explains instructional adaptations. The user's personal ideas and drafts are never committed to GitHub by the app.

## Limits
The reading preview is not a full Fountain parser or professional pagination engine. Use exported Fountain in compatible screenplay software for final submission formatting. Runtime is not calculated from words. Final checks need a timed read/staging and human judgment. Story scores reward concept practice; they do not grade creative writing.

## Connected Story Studio (September 2026)

The original 24 writing missions remain intact. My film now includes:
- **Notes → Story**: collect editable copies of mission answers, coach notes, and profile practice pages; arrange them; append to a prose draft; preserve versions; send selected passages to private scene notes or action. Originals are not overwritten.
- **Storyboard**: scene-owned frames with ordering, size/angle/perspective/movement, duration, transitions, captions, dialogue, cast reference, 28 original SVG planning assets, and optional local images.
- **Dialogue & cast**: voice sheets, want/tactic/subtext tags, original and revised lines, silent alternatives, explicit append-to-screenplay controls.
- **Ask me**: six coach packs, eight entry questions each, with linked pressure/evidence follow-ups.
- **Camera lessons**: four parallel lessons, paired diagrams, two concept checks per lesson, and application notes. Shot Choice and Dialogue Tactics are also available in the arcade.
- Shot-list and image-prompt Markdown, printable storyboard/PDF, prose story download, expanded workbook, and complete JSON backup.

A Spare Key study copy includes an editable eight-frame sample board. Screening now asks for coverage and tactic evidence (12 items). Camera lessons remain a parallel track, not a replacement for the writing certificate.

### Storage and portability
The browser key remains `storyforge.v1` to find existing writing; the backup schema is **version 2**. Version-1 saves and imports gain empty studio collections without losing prior fields. Version-2 JSON includes images, frames, cast, dialogue beats, story versions, and source notes. Older app versions cannot import v2 backups.

Uploads accept PNG/JPEG/WebP up to 2 MB, decode and redraw locally to strip metadata, and resize to a maximum 800px edge. At most 12 uploaded images and 1.6 million encoded characters per project; overall browser quota can still be reached. The app reports save failures and offers full backup. No server receives images and no paid image API is called. Loading the static site initially requires connectivity; this update does not add a service worker.

Shareable routes: `#lesson/1` through `#lesson/24`, `#studio/story`, `#studio/storyboard`, and other studio tabs. Links open a workspace on the recipient's own local project; they do not share private writing.

`assets/*.svg` is original geometric planning artwork created for this project, released under CC0. It is intentionally schematic, not production photography.
