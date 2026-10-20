"""Regenerates favicon-32.png, apple-touch-icon.png and og-image.png from assets/logo-mark-clear.png."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

assets = Path(__file__).resolve().parent.parent / "assets"
logo = Image.open(assets / "logo-mark-clear.png").convert("RGBA")


def square_icon(size, pad, bg=None):
    canvas = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    inner = size - pad * 2
    mark = logo.copy()
    mark.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return canvas


square_icon(32, 1).save(assets / "favicon-32.png", optimize=True)
square_icon(180, 26, (255, 255, 255, 255)).convert("RGB").save(assets / "apple-touch-icon.png", optimize=True)

W, H = 1200, 630
og = Image.new("RGB", (W, H), (7, 12, 26))
glow = Image.new("RGB", (W, H), (0, 0, 0))
d = ImageDraw.Draw(glow)
d.ellipse((620, -180, 1380, 520), fill=(26, 90, 220))
d.ellipse((-260, 330, 520, 960), fill=(20, 120, 200))
og = Image.blend(og, glow.filter(ImageFilter.GaussianBlur(160)), 0.55)

grid = ImageDraw.Draw(og)
for x in range(0, W, 60):
    grid.line([(x, 0), (x, H)], fill=(22, 32, 54), width=1)
for y in range(0, H, 60):
    grid.line([(0, y), (W, y)], fill=(22, 32, 54), width=1)

og = og.convert("RGBA")
mark = logo.copy()
mark.thumbnail((150, 110), Image.LANCZOS)
og.alpha_composite(mark, (90, 88))

draw = ImageDraw.Draw(og)
bold = r"C:\Windows\Fonts\segoeuib.ttf"
reg = r"C:\Windows\Fonts\segoeui.ttf"
draw.text((90 + mark.width + 6, 88 + mark.height - 92), "ebzuno", font=ImageFont.truetype(bold, 84), fill=(255, 255, 255))
draw.text((90, 270), "Websites built for", font=ImageFont.truetype(bold, 72), fill=(255, 255, 255))
draw.text((90, 356), "local businesses.", font=ImageFont.truetype(bold, 72), fill=(90, 212, 255))
draw.text((90, 476), "Fast  ·  Secured  ·  Made to bring you customers", font=ImageFont.truetype(reg, 34), fill=(176, 192, 220))
draw.text((90, 540), "webzuno.com", font=ImageFont.truetype(bold, 30), fill=(120, 150, 255))
og.convert("RGB").save(assets / "og-image.png", optimize=True)
print("ok")
