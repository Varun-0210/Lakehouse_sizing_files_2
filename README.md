# Lakehouse cluster sizing: source files

`../index.html` is the finished page. It is built from these files (no framework, no bundler):

| File | What it holds |
|---|---|
| `model.js` | The sizing model: client inputs, assumptions and every formula, plus labels, help text and glossary. Edit this to change numbers, add or remove a parameter. |
| `engine.js` | Small formula engine. Evaluates the formulas in `model.js` in the browser. |
| `export.js` | Builds the Excel workbook (ExcelJS) with live formulas from the same model. |
| `ui.js` | Page behaviour: the six pages (Inputs, Assumptions, Storage, Compute, Review, BoM), scope buttons, input forms, validation, results tables, Download Excel. |
| `page.html` | Page layout, styling and text. Loads ExcelJS from jsDelivr. |
| `assemble.py` | Joins the files above into `../index.html`. |
| `tests/` | Checks: baseline numbers, Excel export, page behaviour. |

## Rebuild
    python3 assemble.py

Always edit these source files and rebuild. Editing `index.html` directly is overwritten by the next build.

## Run the checks (needs Node.js)
    npm install
    node tests/test_baseline.js      # model reproduces the v3.2 workbook figures
    node tests/test_ui.js            # page renders and reacts to inputs (jsdom)
    node tests/test_pages.js         # the six pages open from the tabs
    node tests/test_export.js        # writes test workbooks to /tmp, then recalculate in LibreOffice
    python3 tests/compare_excel.py   # every Excel cell equals the page's value

## Offline use
Replace the ExcelJS `<script src=...>` line in `page.html` with a local copy of `exceljs.min.js` placed next to `index.html`.
