Paragon Signature Suites raw availability sheet can be converted into bulk-import CSVs with the preparation script.

Command:

```bash
npm run bulk:prepare:availability -- \
  --input "path/to/paragon-availability.csv" \
  --projectSlug paragon-signature-suites \
  --towerNumber TOWER-1 \
  --outputDir "samples/bulk-import/paragon-signature-suite/generated"
```

Generated files:

- `units.csv`: ready for the existing `Units` bulk import.
- `layout-summary.csv`: distinct layout/type combinations found in the sheet. Use this to confirm `project_layouts` already exist before importing units.
- `availability-audit.csv`: preserves agent, booking date, booking fee, and bank values from the raw sales sheet for manual audit or future booking-history import.
- `prep-summary.json`: simple totals for quick verification.

Important notes:

- The current units importer supports importing a subset inventory, so importing your company's 100 units out of the full tower stock is fine.
- CSV exports do not preserve cell colours. If your source spreadsheet uses colours to distinguish `BOOKING`, `APPROVED`, and `SIGNED SPA`, add an explicit text status column before export if you need that level of detail.
- Without an explicit status column, the prep script maps `Available -> AVAILABLE`, `Signed SPA/Sold -> SOLD`, and other non-available values to `RESERVED` by default.