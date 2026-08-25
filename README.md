# The Grand — Modern Grand

Static marketing page for The Grand, an events venue by DOOLEYS (Lidcombe NSW, opening early 2027).
Extracted from a three-concept demo; this is the Modern Grand direction as a standalone build.

## Run

```bash
python3 -m http.server 8000
```

No build step, no dependencies.

## Import to Figma

Zip the folder and drop it into the **html.to.design** plugin's File tab. Install
**PP Eiko Light Italic** locally first, or the plugin will flag it as a missing font.

## Verify a change

```bash
pip install playwright pillow numpy && python3 -m playwright install chromium

python3 scripts/shoot.py reference    # baseline BEFORE your change (not committed)
# ...make the change...
python3 scripts/shoot.py out/after
python3 scripts/diff.py reference out/after
```

`reference/` is gitignored — the baselines are build artefacts, not source. Capture one
before you start editing, or you have nothing to diff against.

See `CLAUDE.md` for architecture notes, the CSS specificity gotcha inherited from the
extraction, and typography constraints.
