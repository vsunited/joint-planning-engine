"""Joint Planning Engine — one-page capability sheet (US Letter portrait).

Writes JPE_Capability_Sheet.pdf next to this script, so the output lands in the
same place wherever it is run from.

Needs reportlab, which is not installed system-wide here:

    python3 -m venv .venv && .venv/bin/pip install reportlab
    .venv/bin/python scripts/marketing/jpe_onepager.py

Every figure on the sheet is counted from the shipping product. If a doctrinal
constant set is added or a staff product is added, re-count before claiming a
new number — the sheet says outright that the figures were counted, and an
evaluator who checks one and finds it stale discounts the rest of the page.

Count structurally, not by counting quote characters. Two of the COA validity
sub-tests are double-quoted because they contain an apostrophe, and a script
that counts single quotes and halves them reads 25 sub-tests as 24. That error
reached this sheet once already.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth

W, H = letter  # 612 x 792

# --- palette (matches the product UI) -------------------------------------
BG        = HexColor('#090d13')
PANEL     = HexColor('#0e141e')
PANEL_HI  = HexColor('#131b28')
LINE      = HexColor('#1e293b')
J_900     = HexColor('#2c1240')
J_800     = HexColor('#431c61')
J_600     = HexColor('#7b34b0')
J_500     = HexColor('#9b47db')
J_400     = HexColor('#ba6cf2')
J_300     = HexColor('#d79fff')
EMERALD   = HexColor('#34d399')
AMBER     = HexColor('#fbbf24')
WHITE     = HexColor('#f8fafc')
SLATE_200 = HexColor('#e2e8f0')
SLATE_400 = HexColor('#94a3b8')
SLATE_500 = HexColor('#64748b')
SLATE_600 = HexColor('#475569')

MONO  = 'Courier'
MONOB = 'Courier-Bold'
SANS  = 'Helvetica'
SANSB = 'Helvetica-Bold'

M = 38  # page margin
CW = W - 2 * M  # content width


def wrap(text, font, size, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        trial = f'{cur} {w}'.strip()
        if stringWidth(trial, font, size) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, text, x, y, max_w, font=SANS, size=8.6, leading=11.4, color=SLATE_400):
    c.setFillColor(color)
    c.setFont(font, size)
    for ln in wrap(text, font, size, max_w):
        c.drawString(x, y, ln)
        y -= leading
    return y


def label(c, text, x, y, color=J_400, size=7.8):
    c.setFillColor(color)
    c.setFont(MONOB, size)
    c.drawString(x, y, text)


def panel(c, x, y, w, h, fill=PANEL, stroke=LINE, r=4, lw=0.7):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(lw)
    c.roundRect(x, y, w, h, r, stroke=1, fill=1)


OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'JPE_Capability_Sheet.pdf')
c = canvas.Canvas(OUT, pagesize=letter)
c.setTitle('Joint Planning Engine — Capability Sheet')
c.setAuthor('Joint Planning Engine')
c.setSubject('JP 5-0 doctrine-grounded joint planning application')

# ============================= background =================================
c.setFillColor(BG)
c.rect(0, 0, W, H, stroke=0, fill=1)

# ============================= top bar ====================================
BAR_H = 16
c.setFillColor(J_900)
c.rect(0, H - BAR_H, W, BAR_H, stroke=0, fill=1)
c.setFillColor(J_300)
c.setFont(MONOB, 7)
c.drawString(M, H - BAR_H + 5, 'CAPABILITY SHEET')
c.setFillColor(J_400)
c.drawCentredString(W / 2, H - BAR_H + 5, 'UNCLASSIFIED')
c.drawRightString(W - M, H - BAR_H + 5, 'BUILT FOR JOINT STAFFS')

y = H - BAR_H - 34

# ============================= header =====================================
c.setFillColor(WHITE)
c.setFont(SANSB, 28)
c.drawString(M, y, 'JOINT PLANNING ENGINE')
tw = stringWidth('JOINT PLANNING ENGINE', SANSB, 28)
c.setFillColor(J_500)
c.rect(M, y - 8, tw, 2.4, stroke=0, fill=1)
c.setFillColor(J_300)
c.setFont(MONOB, 9)
c.drawRightString(W - M, y + 4, 'J P E')

y -= 25
c.setFillColor(SLATE_200)
c.setFont(SANS, 12)
c.drawString(M, y, 'The Joint Planning Process, executed — not remembered.')

y -= 15
c.setFillColor(SLATE_500)
c.setFont(MONO, 8)
c.drawString(M, y, 'From initiation to the signed order \u2014 with an assistant that runs on your own network.')

# ===================== problem / approach (two columns) ===================
y -= 18
COL_W = (CW - 12) / 2
BOX_H = 78
panel(c, M, y - BOX_H, COL_W, BOX_H)
panel(c, M + COL_W + 12, y - BOX_H, COL_W, BOX_H, fill=PANEL_HI, stroke=J_800)

label(c, 'THE PROBLEM', M + 12, y - 16, SLATE_400)
para(c,
     'JPP is executed today across slide decks, shared drives, and Word '
     'templates. Under time pressure doctrinal steps get skipped, staff '
     'products lose traceability to the governing publication, and hard-won '
     'planning knowledge walks out the door at PCS season.',
     M + 12, y - 30, COL_W - 24, size=7.9, leading=10)

label(c, 'THE APPROACH', M + COL_W + 24, y - 16, J_300)
para(c,
     'One workspace covering all seven JPP steps, where every field, '
     'checklist, and gate cites the JP 5-0 paragraph or figure it derives '
     'from. Doctrine is enforced by the tool rather than recalled by the '
     'planner under a compressed timeline.',
     M + COL_W + 24, y - 30, COL_W - 24, size=7.9, leading=10, color=SLATE_200)

y -= BOX_H + 24

# ========================= 7-step pipeline ================================
label(c, 'JOINT PLANNING PROCESS — 7-STEP PIPELINE', M, y)
c.setFillColor(SLATE_600)
c.setFont(MONO, 6.8)
c.drawRightString(W - M, y, 'INITIATION TO ORDER')
y -= 11

steps = [
    ('01', 'Planning\nInitiation', True),
    ('02', 'Mission\nAnalysis', True),
    ('03', 'COA\nDevelopment', True),
    ('04', 'COA Analysis\n& Wargaming', True),
    ('05', 'COA\nComparison', True),
    ('06', 'COA\nApproval', True),
    ('07', 'Plan or Order\nProduction', True),
]
GAP = 5
SW = (CW - GAP * 6) / 7
SH = 60
sy = y - SH
for i, (num, name, live) in enumerate(steps):
    sx = M + i * (SW + GAP)
    if live:
        panel(c, sx, sy, SW, SH, fill=HexColor('#1a0f2b'), stroke=J_600, lw=1.0)
    else:
        panel(c, sx, sy, SW, SH, fill=PANEL, stroke=LINE)
    c.setFillColor(J_500 if live else HexColor('#1e293b'))
    c.roundRect(sx + 6, sy + SH - 17, 16, 11, 2, stroke=0, fill=1)
    c.setFillColor(WHITE if live else SLATE_500)
    c.setFont(MONOB, 6.4)
    c.drawCentredString(sx + 14, sy + SH - 14, num)
    c.setFillColor(EMERALD if live else SLATE_600)
    c.circle(sx + SW - 9, sy + SH - 11.5, 2.3, stroke=0, fill=1)
    c.setFillColor(WHITE if live else SLATE_500)
    c.setFont(SANSB if live else SANS, 7.1)
    ty = sy + SH - 30
    for ln in name.split('\n'):
        c.drawString(sx + 6, ty, ln)
        ty -= 8.6
    c.setFillColor(EMERALD if live else SLATE_600)
    c.setFont(MONOB, 5.6)
    c.drawString(sx + 6, sy + 7, 'LIVE' if live else 'IN DEV')

y = sy - 21

# ========================== doctrinal depth stats =========================
label(c, 'BY THE NUMBERS', M, y)
c.setFillColor(SLATE_600)
c.setFont(MONO, 6.8)
c.drawRightString(W - M, y, 'EVERY FIGURE COUNTED FROM THE SHIPPING PRODUCT')
y -= 11

stats = [
    ('62', 'doctrinal\nconstant sets'),
    ('7 of 7', 'JPP steps\nlive'),
    ('28', 'exportable\nstaff products'),
    ('5 / 25', 'validity criteria\n& sub-tests'),
    ('19', 'COA analysis\npurposes'),
    ('9', 'plan development\nactivities'),
]
SGAP = 5
STW = (CW - SGAP * 5) / 6
STH = 45
sty = y - STH
for i, (big, small) in enumerate(stats):
    sx = M + i * (STW + SGAP)
    panel(c, sx, sty, STW, STH, fill=PANEL_HI, stroke=LINE)
    c.setFillColor(J_300)
    c.setFont(SANSB, 17)
    c.drawCentredString(sx + STW / 2, sty + STH - 22, big)
    c.setFillColor(SLATE_400)
    c.setFont(MONO, 5.8)
    ty = sty + STH - 33
    for ln in small.split('\n'):
        c.drawCentredString(sx + STW / 2, ty, ln)
        ty -= 7.2

y = sty - 21

# ========================== capability highlights =========================
label(c, 'CAPABILITY HIGHLIGHTS', M, y)
y -= 13

caps = [
    ('A planning assistant that never leaves your network',
     'Drafts a COA, critiques one against the five validity criteria, and pulls specified and '
     'implied tasks out of an uploaded order \u2014 running against a model on your own hardware, so '
     'planning data never leaves the building. Nothing is written without the planner accepting it.'),
    ('Reads the orders you already have',
     'PDF, Word, PowerPoint, plain text, and photographed or scanned pages. A printed order that '
     'cannot be copied and pasted becomes a task list sorted into specified, implied and essential '
     '\u2014 without anyone retyping it.'),
    ('Enforced doctrinal gates',
     'A COA failing any of the five validity criteria \u2014 suitable, feasible, acceptable, '
     'distinguishable, complete \u2014 is flagged for rejection or revision before it can advance.'),
    ('Every product leaves the tool',
     '28 staff products \u2014 WARNORD, CCIRs, sync matrix, decision statement, TPFDD and more \u2014 '
     'copy to the clipboard or download, each classification-marked.'),
]
for title, body in caps:
    c.setFillColor(J_400)
    c.setFont(MONOB, 6)
    c.drawString(M, y + 0.5, '■')
    c.setFillColor(WHITE)
    c.setFont(SANSB, 8.8)
    c.drawString(M + 11, y, title)
    y -= 10.4
    y = para(c, body, M + 11, y, CW - 11, size=7.8, leading=9.6)
    y -= 5.5

# ===================== traceability in practice ===========================
y -= 4
label(c, 'WHY IT MATTERS', M, y)
c.setFillColor(SLATE_600)
c.setFont(MONO, 6.8)
c.drawRightString(W - M, y, 'WHAT STAFFS GET BACK')
y -= 11

value = [
    ('Faster to a decision brief',
     'Products assemble from work the staff has already done, instead of being rebuilt from scratch the night before.'),
    ('Nothing lost at PCS',
     'The reasoning behind every COA and every decision stays with the plan, not with the planner who rotated out.'),
    ('Consistent across staffs',
     'Every planner works the same sequence, so products arrive in the same shape whoever built them.'),
    ('Trains while it plans',
     'Junior officers see the standard in front of them as they work, not in the after-action review.'),
]
TGAP = 5
TTW = (CW - TGAP * 3) / 4
TTH = 45
tty = y - TTH
for i, (title, body) in enumerate(value):
    sx = M + i * (TTW + TGAP)
    panel(c, sx, tty, TTW, TTH, fill=PANEL, stroke=LINE)
    c.setFillColor(J_300)
    c.setFont(SANSB, 7.4)
    ly = tty + TTH - 12
    for ln in wrap(title, SANSB, 7.4, TTW - 14)[:2]:
        c.drawString(sx + 7, ly, ln)
        ly -= 9
    c.setFillColor(SLATE_400)
    c.setFont(SANS, 6.6)
    ly -= 2
    for ln in wrap(body, SANS, 6.6, TTW - 14)[:6]:
        c.drawString(sx + 7, ly, ln)
        ly -= 8

y = tty - 20

# ============================ deployment ==================================
DEP_H = 46
panel(c, M, y - DEP_H, CW, DEP_H, fill=PANEL_HI, stroke=LINE)
label(c, 'DEPLOYMENT & THE AIR GAP', M + 12, y - 15, J_400, 7.2)
dep = [
    'Planning, ingestion and inference make no external call',
    'Browser-based \u2014 no client install',
    'Inference on your own hardware; nothing sent to a commercial API',
    'Sign-in uses Google SSO today; swappable for a disconnected network',
]
dx = M + 12
dy = y - 28
half = CW / 2 - 18
for i, item in enumerate(dep):
    col = i % 2
    row = i // 2
    c.setFillColor(EMERALD)
    c.setFont(MONOB, 5.4)
    c.drawString(dx + col * (half + 12), dy - row * 10, '▸')
    c.setFillColor(SLATE_400)
    c.setFont(SANS, 7.3)
    c.drawString(dx + col * (half + 12) + 8, dy - row * 10, item)

y -= DEP_H + 16

# ============================ status box ==================================
SB_H = 52
panel(c, M, y - SB_H, CW, SB_H, fill=HexColor('#1c1401'), stroke=HexColor('#78350f'))
c.setFillColor(AMBER)
c.setFont(MONOB, 7)
c.drawString(M + 12, y - 15, 'PROGRAM STATUS')
para(c,
     'Prototype under active development. All seven JPP steps are functional, with the '
     'local-inference assistant and document ingestion in the shipping build. The application is '
     'instrumented for a measured evaluation of planning time and product completeness; no results '
     'are claimed yet. All demonstration scenarios are notional. Not accredited and operating '
     'under no ATO. Not an official U.S. Department of Defense product or endorsement.',
     M + 12, y - 26, CW - 24, size=7.1, leading=8.4, color=HexColor('#fde68a'))

y -= SB_H + 18

# ============================== footer ====================================
c.setStrokeColor(LINE)
c.setLineWidth(0.7)
c.line(M, y + 5, W - M, y + 5)
c.setFillColor(SLATE_600)
c.setFont(MONO, 6.4)
c.drawString(M, y - 6, 'Demo available upon request.')
c.drawRightString(W - M, y - 6, 'derek@blackarrowsystems.net')

c.showPage()
c.save()
print(f'wrote {OUT} — content bottom at y={y - 6:.0f}pt (margin {M})')
