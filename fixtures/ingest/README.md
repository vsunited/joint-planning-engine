# Document ingestion fixtures

The files a planner might actually hand the tool, one per ingestion path. They
are both the demo and the regression set: every format the app claims to read
has a file here that exercises it.

All are fictional. `PLANORD 26-04` is the same notional Bab-el-Mandeb scenario
used elsewhere, and none of it is real plan content.

| File | Path exercised | Expected result |
|---|---|---|
| `PLANORD_26-04.pdf` | `pdfjs-dist` text layer | parsed, 1 page, ~529 chars |
| `PLANORD_26-04.docx` | `mammoth` | parsed, ~584 chars |
| `PLANORD_26-04.pptx` | `jszip` over slide XML | parsed, 3 slides, ~379 chars |
| `PLANORD_photo.png` | straight to vision | transcribed by the vision model |
| `PLANORD_scanned.pdf` | **no text layer** — rendered, then vision | `needs_vision`, then ~533 chars transcribed |

`PLANORD_scanned.pdf` is the one worth keeping deliberately. It has a verified
**zero-character text layer**, which is what a printed-and-scanned order looks
like and is the case that must not fail silently. Producing another one is
fiddly, and without it the most compelling thing the product does — reading an
order nobody could copy and paste — has nothing to demonstrate against.

These live outside `apps/web/public/` on purpose: anything under `public/` is
published with the site, and test documents are not part of the product.
