# Bulk Property Import - Quick Start Guide

## 5-Minute Setup

### 1. **Access the Bulk Import Tool**

Navigate to your Admin Console:
```
https://yoursite.com/admin
```

You'll see the "Bulk Import" button in the Property section.

### 2. **Choose What to Import**

Click "Bulk Import" → Select entity type:
- **Developers** - Create or update developers used by projects
- **Projects** - Create new property projects
- **Layouts** - Define unit layouts (1BR, 2BR, etc.)
- **Units** - Add individual units to projects
- **Phases** - Define project phases
- **Towers** - Define towers/buildings

### 3. **Download Template**

- Select your entity type
- Click "Template" button
- Open CSV in Excel/Google Sheets

### 4. **Fill Your Data**

#### For Developers:
```csv
action,slug,name,legalName,description,isActive
create,example-developer,Example Developer Sdn. Bhd.,Example Developer Holdings Berhad,Township and residential developer,true
```

#### For Projects:
```csv
action,slug,name,developerSlug,tenureTypeCode,stateName
create,project-sunset,Sunset Garden,example-developer,FREEHOLD,Selangor
create,project-eden,Eden Springs,example-developer,LEASEHOLD,Kuala Lumpur
```

#### For Layouts:
```csv
action,projectSlug,layoutCode,layoutName,bedrooms,bathrooms,builtUpSqft
create,project-sunset,2B2B,2B 2B Unit,2,2,1050.50
create,project-sunset,3B2B,3B 2B Unit,3,2,1350.75
```

#### For Units:
```csv
action,projectSlug,unitNo,layoutCode,floor,basePrice,bookingStatusCode,lotTypeCode
create,project-sunset,01-01,2B2B,1,350000,available,residential
create,project-sunset,01-02,2B2B,1,350000,available,residential
```

### 5. **Save & Upload**

- Save CSV file
- Go back to import dialog
- Select your CSV file
- Click "Import"

### 6. **Review Results**

After import completes:
- ✓ Green section shows successful imports
- ✗ Red section shows any errors
- ⚠ Yellow section shows warnings

If there are errors:
- Review the row number
- Check the error message
- Fix your CSV
- Try again!

---

## Common Scenarios

### Scenario 1: Bulk Add 100 Units to Existing Project

**Step 1:** Navigate to `/samples/bulk-import/units_sample.csv`
**Step 2:** Replace sample data with your units:

```csv
action,projectSlug,unitNo,layoutCode,towerNumber,floor,basePrice,bookingStatusCode,lotTypeCode
create,my-project,UNIT-001,2B2B,TOWER-A,1,350000,available,residential
create,my-project,UNIT-002,2B2B,TOWER-A,1,350000,available,residential
create,my-project,UNIT-003,2B2B,TOWER-A,2,352000,available,residential
```

**Step 3:** Upload the CSV
**Step 4:** Verify all 100 units imported successfully

### Scenario 2: Update Prices for All Units in Phase

**Step 1:** Export existing units (current system)
**Step 2:** Change `action` to `update` and update prices:

```csv
action,projectSlug,unitNo,layoutCode,floor,basePrice,bookingStatusCode,lotTypeCode
update,my-project,UNIT-001,2B2B,1,360000,available,residential
update,my-project,UNIT-002,2B2B,1,360000,available,residential
```

**Step 3:** Upload CSV
**Step 4:** Prices updated!

### Scenario 3: Create Entire Project from Scratch

**Step 1:** Bulk import developers:

```csv
action,slug,name,legalName,description,isActive
create,example-developer,Example Developer Sdn. Bhd.,Example Developer Holdings Berhad,Township and residential developer,true
```

**Step 2:** Bulk import projects:
```csv
action,slug,name,developerSlug,tenureTypeCode
create,project-new,New Project,example-developer,FREEHOLD
```

**Step 3:** Bulk import phases:
```csv
action,projectSlug,phaseCode,phaseName,completionDate
create,project-new,P1,Phase 1,2025-12-31
create,project-new,P2,Phase 2,2026-12-31
```

**Step 4:** Bulk import towers:
```csv
action,projectSlug,towerNumber,towerName,phaseName,floorCount
create,project-new,TOWER-A,Tower A,P1,25
create,project-new,TOWER-B,Tower B,P1,25
```

**Step 5:** Bulk import layouts:
```csv
action,projectSlug,layoutCode,layoutName,bedrooms,bathrooms,builtUpSqft
create,project-new,2B2B,2 Bed 2 Bath,2,2,1050
create,project-new,3B2B,3 Bed 2 Bath,3,2,1350
```

**Step 6:** Bulk import units:
```csv
action,projectSlug,unitNo,layoutCode,towerNumber,floor,basePrice,bookingStatusCode,lotTypeCode
create,project-new,01-01,2B2B,TOWER-A,1,350000,available,residential
create,project-new,02-01,3B2B,TOWER-A,2,425000,available,residential
```

Done! Entire project with all details created in minutes.

---

## Troubleshooting

### ❌ "CSV parsing failed"
**Cause:** CSV format is invalid
**Fix:** 
- Check line endings are consistent (CRLF on Windows, LF on Mac)
- Validate headers match specification
- Use template CSV for reference

### ❌ "Field [slug] required"
**Cause:** Missing required column
**Fix:**
- Check CSV headers match specification exactly
- Headers are case-insensitive but must be spelled correctly
- See template CSV for exact headers

### ❌ "Developer with slug 'X' not found"
**Cause:** Developer doesn't exist in database
**Fix:**
- Import the developer first
- Check slug spelling exactly
- Verify developer is in system

### ❌ "Project with slug 'X' not found"
**Cause:** Parent project doesn't exist
**Fix:**
- Create project first (using project import)
- Check slug spelling
- Use same slug in child entity imports

### ❌ "Base price must be a valid number"
**Cause:** Price field contains non-numeric value
**Fix:**
- Remove currency symbols: ❌ $350,000 → ✓ 350000
- Remove thousand separators: ❌ 350,000 → ✓ 350000
- Use decimal point: ✓ 350000.50

### ⚠️ "Duplicate entry found in rows"
**Cause:** Same record appears twice in CSV
**Fix:**
- Only first occurrence will be imported
- Remove duplicate rows or separate into multiple imports
- Use in-app deduplication before export

---

## Best Practices

### Before Importing

1. ✅ **Validate in Spreadsheet**
   - Open CSV in Excel/Sheets
   - Check for blank required fields
   - Verify numeric fields don't have formatting

2. ✅ **Test with Sample Data**
   - Create 5 test records first
   - Verify they appear in system
   - Check relationships are correct

3. ✅ **Prepare Dependencies First**
   - Developers before Projects
   - Projects before Units
   - Phases before Towers

4. ✅ **Create Lookup Values**
   - Ensure all referenced codes exist
   - Verify property types, tenure types exist
   - Check booking statuses, lot types exist

### During Import

1. ✅ **Monitor the Process**
   - Watch progress bar
   - Wait for completion
   - Don't close dialog

2. ✅ **Review Errors Immediately**
   - Read error messages
   - Note row numbers
   - Fix and retry quickly

### After Import

1. ✅ **Verify Results**
   - Check record count matches
   - Sample 10 records in system
   - Verify prices and specs are correct

2. ✅ **Cross-Check Relationships**
   - Units linked to correct layouts
   - Phases in right sequence
   - Towers assigned to phases

---

## Sample Files Location

All sample CSV files are in `/samples/bulk-import/`:

- `projects_sample.csv` - Sample project import
- `layouts_sample.csv` - Sample layout import
- `units_sample.csv` - Sample unit import
- `phases_sample.csv` - Sample phase import
- `towers_sample.csv` - Sample tower import

**Use these as templates!** Copy, modify with your data, and upload.

---

## Advanced Tips

### Tip 1: Bulk Update Existing Records
Use `action: update` instead of `create`:
```csv
action,slug,name,developerSlug,tenureTypeCode
update,project-existing,New Name,dev-abc,freehold
```

### Tip 2: Handle Empty Optional Fields
Leave optional fields empty or don't include column:
```csv
action,projectSlug,unitNo,basePrice,carparkCount
create,my-project,UNIT-001,350000,
create,my-project,UNIT-002,350000,2
```

### Tip 3: Date Formatting
Always use YYYY-MM-DD format:
```csv
tenureExpiryDate,completionDate
2050-12-31,2025-06-30
```

### Tip 4: Boolean Fields
Use "yes" or "no":
```csv
isPublished,isForeignerEligible,hasBalcony
yes,no,yes
```

### Tip 5: Large Imports
For > 1000 records:
- Split into 2-3 separate CSV files
- Import sequentially
- Wait for success before next upload
- Monitor system performance

---

## Support & Questions

For questions about:
- **Field requirements:** See BULK_IMPORT_GUIDE.md
- **Architecture details:** See BULK_IMPORT_ARCHITECTURE.md
- **Sample data:** Check `/samples/bulk-import/`

---

## Performance Expectations

| Records | Time | Success Rate |
|--|--|--|
| 10 | < 1s | 99%+ |
| 100 | 1-3s | 99%+ |
| 1,000 | 5-15s | 99%+ |
| 10,000 | 1-2min | 99%+ |

---

Happy importing! 🚀
