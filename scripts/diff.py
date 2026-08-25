#!/usr/bin/env python3
"""Pixel-diff two screenshot sets produced by shoot.py.

Usage:  python3 scripts/diff.py <before_dir> <after_dir>

Writes diff-<name>.png into the after dir for any breakpoint that differs.
Anti-aliasing noise floor on identical renders is ~250px on desktop; anything
materially above that in a region you didn't touch is a real regression.
"""
import pathlib, sys
import numpy as np
from PIL import Image

before, after = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])

for name in ('desktop', 'tablet', 'mobile'):
    fa, fb = before / f'{name}.png', after / f'{name}.png'
    if not (fa.exists() and fb.exists()):
        print(f'{name:8s} missing screenshot, skipped')
        continue
    a = np.asarray(Image.open(fa).convert('RGB')).astype(int)
    b = np.asarray(Image.open(fb).convert('RGB')).astype(int)
    if a.shape != b.shape:
        print(f'{name:8s} HEIGHT CHANGED  {a.shape[0]} -> {b.shape[0]}px')
        n = min(a.shape[0], b.shape[0])
        a, b = a[:n], b[:n]
    d = np.abs(a - b).max(axis=2)
    n32 = int((d > 32).sum())
    if n32 == 0:
        print(f'{name:8s} identical')
        continue
    ys, xs = np.where(d > 32)
    print(f'{name:8s} {n32}px differ  rows {ys.min()}-{ys.max()}  cols {xs.min()}-{xs.max()}')
    Image.fromarray((d > 32).astype('uint8') * 255).save(after / f'diff-{name}.png')
