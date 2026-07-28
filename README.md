# Portable Memory

Homepage for the Portable Memory initiative — a user-governed layer of personal
context that persists across interactions, moves across tools, and is shared
only by role, consent, and purpose.

Founding report: [The Future of Personal AI: Portable and Persistent Personal
Memory through a Unified Human Context
Protocol](https://digitaleconomy.stanford.edu/publication/the-future-of-personal-ai-portable-and-persistent-personal-memory-through-a-unified-human-context-protocol/)
— Stanford Digital Economy Lab, March 2026.

## Structure

```
index.html            single page
assets/css/styles.css all styling
assets/js/main.js     header state, reveal-on-scroll, subscribe form
assets/logos/         convening organisation marks (web-sized)
logo/                 original logo source files
```

No build step and no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 4321
```

## Connecting the subscribe form

The email field posts to a Google Form. Set both values at the top of
[`assets/js/main.js`](assets/js/main.js):

- `formAction` — your form's share link with `/viewform` replaced by
  `/formResponse`
- `emailEntryId` — the email question's input `name`, e.g. `entry.1234567890`

Until both are filled in, the form tells visitors it is not connected yet
rather than silently dropping addresses.

## Deploying

Pushing to `main` publishes to GitHub Pages.
