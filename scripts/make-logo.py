#!/usr/bin/env python3
"""Builds every PENS logo asset from one cut-out source.

  python3 scripts/make-logo.py                 # rebuild from scripts/brand-src/pens-blocks-source.png
  python3 scripts/make-logo.py --cut <render>  # re-cut the blocks from a render first (needs rembg)

Source of truth: scripts/brand-src/pens-blocks-source.png (transparent cut-out of the three blocks).
Outputs (public/assets/): pens-blocks.png (1024), pens-blocks-512.png, pens-blocks-192.png,
pens-logo.svg (SVG wrapper embedding the 512 PNG as base64), pens-logo-512.png, pens-logo-1024.png,
pens-icon-192/512/1024.png (blocks on a cream rounded tile), pens-icon-maskable-512.png (full-bleed cream).
Needs: pillow, numpy, opencv-python-headless (and rembg only for --cut).
"""
import base64, io, sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "brand-src" / "pens-blocks-source.png"
OUT = ROOT / "public" / "assets"
CREAM = (255, 248, 236, 255)  # #FFF8EC
# Crop box of the blocks in the portrait render (1008x1792).
CUT_BOX = (150, 340, 860, 990)


def cut(render: str) -> None:
    from rembg import remove, new_session
    crop = Image.open(render).convert("RGB").crop(CUT_BOX)
    rgba = remove(crop, session=new_session("u2net"), post_process_mask=True)
    a = np.array(rgba)[:, :, 3]
    # Solid silhouette: threshold, keep the largest blob, fill holes, pull the edge in 1px, feather ~1px.
    m = (a > 140).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    m = (lab == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    solid = np.zeros_like(m)
    cv2.drawContours(solid, cnts, -1, 1, thickness=cv2.FILLED)
    solid = cv2.erode(solid, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
    alpha = cv2.GaussianBlur((solid * 255).astype(np.uint8), (0, 0), 0.8)
    rgb = np.array(crop)
    ys, xs = np.where(alpha > 8)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    out = Image.fromarray(np.dstack([rgb, alpha]), "RGBA").crop(box)
    SRC.parent.mkdir(parents=True, exist_ok=True)
    out.save(SRC)
    print("cut", SRC, out.size)


def fit(im: Image.Image, size: int, pad: float) -> Image.Image:
    """Blocks centered on a transparent square canvas with `pad` fraction of margin per side."""
    inner = int(round(size * (1 - 2 * pad)))
    s = min(inner / im.width, inner / im.height)
    r = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(r, ((size - r.width) // 2, (size - r.height) // 2))
    return canvas


def tile(im: Image.Image, size: int, radius: float, pad: float) -> Image.Image:
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size * ss - 1, size * ss - 1), radius=int(size * ss * radius), fill=255)
    bg = Image.new("RGBA", (size, size), CREAM)
    bg.putalpha(mask.resize((size, size), Image.LANCZOS))
    bg.alpha_composite(fit(im, size, pad))
    return bg


def main() -> None:
    if len(sys.argv) > 2 and sys.argv[1] == "--cut":
        cut(sys.argv[2])
    im = Image.open(SRC).convert("RGBA")
    OUT.mkdir(parents=True, exist_ok=True)
    blocks = {s: fit(im, s, 0.02) for s in (1024, 512, 192)}
    blocks[1024].save(OUT / "pens-blocks.png", optimize=True)
    blocks[512].save(OUT / "pens-blocks-512.png", optimize=True)
    blocks[192].save(OUT / "pens-blocks-192.png", optimize=True)
    # pens-logo-*.png keep their historic names (store / directory icons) and are the same cut-out.
    blocks[512].save(OUT / "pens-logo-512.png", optimize=True)
    blocks[1024].save(OUT / "pens-logo-1024.png", optimize=True)
    for s in (192, 512, 1024):
        tile(im, s, 0.22, 0.13).save(OUT / f"pens-icon-{s}.png", optimize=True)
    tile(im, 512, 0.0, 0.2).save(OUT / "pens-icon-maskable-512.png", optimize=True)
    # SVG wrapper: every existing reference to pens-logo.svg keeps working. 384px keeps widgets light.
    buf = io.BytesIO()
    fit(im, 384, 0.02).quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG).save(buf, "PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="PENS">\n'
        "  <title>PENS</title>\n"
        f'  <image width="512" height="512" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{b64}" xlink:href="data:image/png;base64,{b64}"/>\n'
        "</svg>\n"
    )
    (OUT / "pens-logo.svg").write_text(svg)
    print("svg bytes", len(svg))
    for p in sorted(OUT.glob("pens-*")):
        print(p.name, p.stat().st_size)


if __name__ == "__main__":
    main()
