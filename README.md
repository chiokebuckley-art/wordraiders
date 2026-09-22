# WORDRAIDERS — playable build

A word quest for kids: nine chapters of word powers, chapter bosses, a Daily Raid that turns stars gold, and a
certificate ending, plus a Word Arcade and Crystal Clash versus mode for playing with friends, player accounts
with PINs, flashcards with a study box, and a Sentence Academy (5 units, 24 lessons, unit tests and a Sentence
Master certificate) on how words, sentences, paragraphs and chapters are built, and a Sentence Arcade (tap the part of
speech: Blitz, Mississippi Stud, Millionaire, Weakest Link, online Sentence Clash, and a Mastery Drill over 58 grammar
kinds, all nine pronoun kinds included) with statistics. Also inside: illustrated grammar lessons on a guided path,
a Phonics & Decoding Academy, a Picture Academy, a Syntax Arcade and Conjugation Lab, Word Fishing, StoryForge, and a
Word Forms & Adjectives arcade (plurals, irregular verbs, count and mass nouns, 300 adjectives, determiners, nine tenses, picture match) with an
untimed Practice mode in every arcade.

**Play:** https://chiokebuckley-art.github.io/wordraiders/

This repository holds the built, static game. GitHub Pages publishes the `gh-pages` branch; `main` mirrors the
same files. The source lives in the `wordraiders/` folder of the `command-center` repository. To ship a new
build, run `WORDS_BASE=/wordraiders/ npm run build:static` there and push `dist-static/` (plus `.nojekyll` and a
`404.html` copy of `index.html`) to `gh-pages`. Progress is saved in your browser (use Settings → Export inside
the game to move it between devices). On a phone, open the link and choose "Add to Home Screen" to install it
like an app.

**Sync across devices:** `sync/README.md` explains the one-time setup (a free Cloudflare account and two repository
secrets, then run the *Cloud sync* workflow). After that, players link their devices with a sync code from Settings.
