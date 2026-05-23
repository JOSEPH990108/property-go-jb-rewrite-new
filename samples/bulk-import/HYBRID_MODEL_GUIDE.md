# PropertyGo JB — Bulk Import Hybrid Model

## Overview

This folder demonstrates the **recommended hybrid bulk import approach** that combines:

- **Tier 1 Reference Data** — Shared lookup tables (import once for the entire platform)
- **Tier 2 Per-Project Bundles** — Complete project data (import independently per project)

---

## Folder Structure

```
tier-1-reference-data/
├── developers.csv          # Developer company records (import once)
└── amenities.csv           # Amenity lookup table (import once)

paragon-signature-suite/    # Per-project bundle example
├── 01-project.csv          # Project core info + new fields
├── 02-phases.csv           # Project phases
├── 03-towers.csv           # Tower definitions
├── 04-layouts.csv          # Unit types + new layout fields
├── 05-units.csv            # Individual units
├── 06-project-media.csv    # Photos, floor plans, videos
├── 07-nearby-places.csv    # Nearby amenities & landmarks
└── 08-pricing-snapshots.csv # Historical price tracking
```

---

## Tier 1 — Reference Data (Import Once)

These are **shared lookup tables** that don't change frequently and may be used across multiple projects.

### developers.csv

| Field       | Example                                | Notes             |
| ----------- | -------------------------------------- | ----------------- |
| action      | create                                 | create or update  |
| slug        | developer-paragon                      | Unique identifier |
| name        | Paragon Development                    | Display name      |
| legalName   | Paragon Development Holdings Sdn. Bhd. | Full legal entity |
| description | Luxury residential developer           | Optional notes    |
| isActive    | true                                   | Active status     |

### amenities.csv

| Field     | Example       | Notes                       |
| --------- | ------------- | --------------------------- |
| action    | create        | Create lookup record        |
| code      | POOL          | Unique code for referencing |
| name      | Swimming Pool | Display name                |
| category  | Recreation    | Category for grouping       |
| icon      | swimming      | Icon identifier             |
| sortOrder | 1             | Display order               |

**Import sequence for Tier 1:**

1. `developers.csv`
2. `amenities.csv`

---

## Tier 2 — Per-Project Bundle

Each project gets its own folder with **numbered CSVs** (01-, 02-, etc.) to establish correct dependency order.

### Import Order for Per-Project Bundle

**01-project.csv** (Project metadata)

- Contains project header info
- **New fields added:**
  - `landAreaAcres` — Total land area
  - `bookingFeeBumi` — Special booking fee for Bumiputera
  - `sinkingFundPerSqft` — Maintenance sinking fund per sqft
  - `isGatedCommunity` — Boolean for gated status
  - `greenCertification` — Green building certification (e.g., GBI)

**02-phases.csv** → **03-towers.csv** → **04-layouts.csv** (Structural hierarchy)

**04-layouts.csv** (Unit types)

- **New fields added:**
  - `isDualKey` — Dual-key unit indicator
  - `ceilingHeightM` — Ceiling height in meters
  - `furnishingStatus` — UNFURNISHED / SEMI_FURNISHED / FULLY_FURNISHED

**05-units.csv** (Individual units - depends on layouts, towers, phases)

**06-project-media.csv** (NEW table - project photos, floor plans, videos)
| Field | Example | Notes |
|-------|---------|-------|
| projectSlug | paragon-signature-suite | Project reference |
| fileName | paragon-exterior-01.jpg | File name (will be uploaded) |
| mediaTypeCode | PHOTO | PHOTO, FLOORPLAN, MASTERPLAN, VIDEO |
| caption | Main Facade | Short description |
| sortOrder | 1 | Display order |

**07-nearby-places.csv** (NEW table - nearby amenities & landmarks)
| Field | Example | Notes |
|-------|---------|-------|
| projectSlug | paragon-signature-suite | Project reference |
| name | Legoland Malaysia Resort | Landmark/amenity name |
| category | Entertainment | Category for filtering |
| distance_km | 5.2 | Distance in km |
| sortOrder | 1 | Display order |

**08-pricing-snapshots.csv** (NEW table - historical price tracking)
| Field | Example | Notes |
|-------|---------|-------|
| projectSlug | paragon-signature-suite | Project reference |
| phaseName | Phase 1 - Tower A & B | Phase name (optional) |
| towerNumber | TOWER-A | Tower reference (optional) |
| layoutCode | A1 | Layout type (optional) |
| buyerTypeCode | LOCAL | BUMIPUTERA, LOCAL, FOREIGN |
| viewKey | city_view | View direction (optional) |
| spaPriceMin | 450000 | SPA price (main advertised price) |
| spaPriceMax | 450000 | Can be range |
| nettPriceMin | 440000 | Net price after discounts |
| nettPriceMax | 440000 | Can be range |
| rebatePercentTotal | 2.00 | Total rebate % |
| snapshotDate | 2026-01-01 | Date snapshot was recorded |
| sourceNote | Launch pricing | Context/source |

---

## Import Workflow Example

### First Time Setup (Tier 1)

```
1. Upload tier-1-reference-data/developers.csv
2. Upload tier-1-reference-data/amenities.csv
✓ Reference data ready for all projects
```

### Import Paragon Signature Suite Project

```
1. Upload 01-project.csv              → Creates project "paragon-signature-suite"
2. Upload 02-phases.csv               → Defines 3 phases
3. Upload 03-towers.csv               → Defines 5 towers
4. Upload 04-layouts.csv              → Defines 7 layout types
5. Upload 05-units.csv                → Creates 9 sample units
6. Upload 06-project-media.csv        → Attaches 8 media assets
7. Upload 07-nearby-places.csv        → Adds 10 nearby landmarks
8. Upload 08-pricing-snapshots.csv    → Records 10 pricing variants
✓ Complete Paragon project loaded
```

### Import Another Project (e.g., M Grand Minori)

```
1. Upload minori/01-project.csv
2. Upload minori/02-phases.csv
3. Upload minori/03-towers.csv
... (same pattern)
✓ M Grand Minori project loaded independently
```

---

## Key Benefits of This Model

✅ **No Data Duplication** — Developers & amenities defined once, referenced by code  
✅ **Project Independence** — Each project imports cleanly without cross-dependencies  
✅ **Scalability** — Add new projects by duplicating the folder pattern  
✅ **Maintainability** — Clear 8-step process per project  
✅ **Complete Coverage** — New schema tables (media, nearby, pricing) fully captured  
✅ **Historical Tracking** — Pricing snapshots maintain price evolution  
✅ **Media Support** — Photos, floor plans, videos attached per project

---

## New Schema Fields Demonstrated

| Field              | Table           | Purpose                         |
| ------------------ | --------------- | ------------------------------- |
| landAreaAcres      | projects        | Total project land size         |
| bookingFeeBumi     | projects        | Bumiputera-specific booking fee |
| sinkingFundPerSqft | projects        | Maintenance reserve fund        |
| isGatedCommunity   | projects        | Security/gated status           |
| greenCertification | projects        | Environmental certification     |
| isDualKey          | project_layouts | Flexible dual-key units         |
| ceilingHeightM     | project_layouts | Ceiling height specification    |
| furnishingStatus   | project_layouts | Furnishing level per type       |

---

## Notes

- **CSV Order Matters** — Follow the 01-, 02-, ... numbering for dependencies
- **Foreign Keys via Code** — Reference using unique codes (e.g., `developer-paragon`, `TOWER-A`), not IDs
- **BOM Handling** — CSVs with byte-order marks are automatically normalized
- **Header Flexibility** — Column order in CSV doesn't matter; only header names are used
- **Soft Deletes** — Deleted records keep `deleted_at` timestamp
- **Extensions** — Easy to add more CSVs (e.g., unit_status_history, amenity_mappings) following the same pattern
