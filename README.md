# WORDRAIDERS — playable build

A word quest for kids: nine chapters of word powers, chapter bosses, a Daily Raid that turns stars gold, and a
certificate ending, plus a Word Arcade and Crystal Clash versus mode for playing with friends, player accounts
with PINs, flashcards with a study box, and a Sentence Academy (5 units, 24 lessons, unit tests and a Sentence
Master certificate) on how words, sentences, paragraphs and chapters are built, and a Sentence Arcade (tap the part of
speech: Blitz, Mississippi Stud, Millionaire, Weakest Link) with statistics.

**Play:** https://chiokebuckley-art.github.io/wordraiders/

This repository holds the built, static game. GitHub Pages publishes the `gh-pages` branch; `main` mirrors the
same files. The source lives in the `wordraiders/` folder of the `command-center` repository. To ship a new
build, run `WORDS_BASE=/wordraiders/ npm run build:static` there and push `dist-static/` (plus `.nojekyll` and a
`404.html` copy of `index.html`) to `gh-pages`. Progress is saved in your browser (use Settings → Export inside
the game to move it between devices). On a phone, open the link and choose "Add to Home Screen" to install it
like an app.
