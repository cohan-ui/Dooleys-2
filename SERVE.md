# Serving this build

Translation only works over a real HTTP origin. Opening `index.html` by double-clicking
uses `file://`, where the `googtrans` cookie GTranslate depends on cannot be set — the
language selector will open and change its label, but nothing will translate.

## Run it

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Any static server works — `npx serve`, `php -S localhost:8000`, Live Server in VS Code.
There is no build step.

## How the language selector works

The visible control in the header is custom. The actual translation is done by GTranslate,
loaded from `https://cdn.gtranslate.net/widgets/latest/dwf.js` into a hidden host element
(`.gtranslate_wrapper`), which is kept off-screen with `.translation-engine{display:none}`.

Selecting a language calls `doGTranslate('en|<code>')`. Selecting **English** cannot be done
that way — Google only clears a translation by removing the `googtrans` cookie — so
`resetTranslationToEnglish()` expires the cookie across every parent domain, stashes the
scroll position in `sessionStorage`, and reloads. The scroll position is restored on load so
the reload is not jarring.

Languages offered: English, Chinese (Simplified), Chinese (Traditional), Japanese, Korean,
Filipino, Vietnamese. To change the set, edit **both** `gtranslateSettings.languages` in
`script.js` and the buttons in the `#language-menu` markup.

## The gate

`script.js` sets:

```js
const TRANSLATION_ENABLED = Boolean(languageHost) && /^https?:$/.test(window.location.protocol);
```

So the engine activates only when the `.gtranslate_wrapper` host exists **and** the page is on
http(s). Everything else about the control — opening, keyboard navigation, the label, the flag,
`aria-checked`, `root.lang` — works regardless.

The Figma-import build ships without the host element, so the selector renders and behaves but
never loads the engine. That is deliberate: GTranslate reloads the page mid-capture, which
corrupts an html.to.design import.

## Note on the flags

Flag icons are loaded from `cdn.gtranslate.net`. They need network access; on a fully offline
machine they will not render, though everything else will.
