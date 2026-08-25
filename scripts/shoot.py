#!/usr/bin/env python3
"""Render the page at each breakpoint and write full-page screenshots.

Usage:  python3 scripts/shoot.py [outdir]     (default: out/current)
"""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / 'index.html'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'out/current')

# Reveal transitions run 700ms and the map pin pulses forever; both produce
# false diffs unless frozen. See CLAUDE.md > Verification.
FREEZE = "*{transition:none!important;animation:none!important}"

BREAKPOINTS = [('desktop', 1440, 900), ('tablet', 834, 1100), ('mobile', 390, 844)]


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name, w, h in BREAKPOINTS:
            page = await browser.new_page(viewport={'width': w, 'height': h},
                                          device_scale_factor=1)
            await page.goto(PAGE.as_uri())
            await page.add_style_tag(content=FREEZE)
            await page.wait_for_timeout(1200)
            await page.evaluate(
                "document.querySelectorAll('.motion-reveal')"
                ".forEach(e => e.classList.add('is-visible'))")
            await page.wait_for_timeout(800)
            await page.screenshot(path=OUT / f'{name}.png', full_page=True)
            loaded = await page.evaluate(
                "document.fonts.check('300 italic 2rem \"PP Eiko\"')")
            height = await page.evaluate('document.body.scrollHeight')
            print(f'{name:8s} {w}x{h}  height={height}  PP Eiko={loaded}')
            await page.close()
        await browser.close()
    print(f'\nwrote to {OUT}')

asyncio.run(main())
