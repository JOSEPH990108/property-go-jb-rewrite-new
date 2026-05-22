# Bulk Property Data Import/Update Guide

## Overview

The bulk import system allows you to efficiently insert or update large volumes of property data using CSV files. It supports bulk operations for:

- **Developers** - Create or update developer records
- **Projects** - Create or update property projects
- **Layouts** - Define multiple unit layouts for a project
- **Units** - Add individual units/properties to a project
- **Phases** - Define project phases
- **Towers** - Define project towers/buildings

## Architecture & Algorithms

### 1. **Transaction-Based Processing**
- Each import operation runs in a database transaction
- All records must pass validation before any changes are committed
- On validation failure, entire batch rolls back to maintain data integrity

### 2. **Batch Processing**
- Large datasets are processed in chunks of 10-100 records
- Prevents memory overflow for large imports
- Progress is tracked per batch

### 3. **Three-Layer Validation**
```
CSV Parsing → Row Validation (Zod Schema) → Foreign Key Resolution
```

- **Layer 1**: CSV parsing with quote handling
- **Layer 2**: Zod schema validation for data types and required fields
- **Layer 3**: Foreign key resolution (lookup relationships)

### 4. **Duplicate Detection**
- System identifies duplicate entries based on unique key fields
- Warnings are generated without blocking import
- Only first occurrence is processed

### 5. **Foreign Key Resolution**
- Resolves references by code or slug instead of IDs
- Eliminates manual ID lookup
- Provides clear error messages for unresolved references

## CSV Format Specifications

### Developers CSV

**Required Headers:**
- `action` (create/update)
- `slug` - Unique developer identifier
- `name` - Developer display name

**Optional Headers:**
- `legalName`
- `description`
- `isActive` (true/false/yes/no)

**Example:**
```csv
action,slug,name,legalName,description,isActive
create,example-developer,Example Developer Sdn. Bhd.,Example Developer Holdings Berhad,Township and residential developer,true
update,example-developer,Example Developer Sdn. Bhd.,Example Developer Holdings Berhad,Updated brand narrative,true
```

### Projects CSV

**Required Headers:**
- `action` (create/update)
- `slug` - Unique project identifier
- `name` - Project name
- `developerSlug` - Developer slug (must exist)
- `tenureTypeCode` - Tenure type code (must exist)

**Optional Headers:**
- `displayName`, `legalName`, `description`
- `propertyCategoryCode`, `propertyTypeCode`, `projectStatusCode`
- `titleTypeCode`, `tenureExpiryDate`
- `stateName`, `regionName`, `areaName`, `address`
- `latitude`, `longitude`
- `totalUnits`, `launchYear`
- `bookingFee`, `maintenanceFeePerSqft`
- `isPublished` (yes/no), `isForeignerEligible` (yes/no)

**Example:**
```csv
action,slug,name,developerSlug,tenureTypeCode,displayName,description,stateName,totalUnits,launchYear,isPublished
create,project-sunset-garden,Sunset Garden Residences,abc-developer,freehold,Sunset Garden,Luxury residential project,Selangor,250,2024,yes
update,project-eden-springs,Eden Springs,xyz-developer,leasehold,Eden Springs,Residential paradise,,300,2023,yes
```

### Layouts CSV

**Required Headers:**
- `action` (create/update)
- `projectSlug` - Project reference
- `layoutCode` - Unique layout code within project
- `layoutName` - Layout name
- `bedrooms` - Number of bedrooms (numeric)
- `bathrooms` - Number of bathrooms (numeric)
- `builtUpSqft` - Built-up area in sqft (numeric)

**Optional Headers:**
- `studyRooms`, `hasBalcony` (yes/no), `hasYard` (yes/no)
- `virtualTourUrl`

**Example:**
```csv
action,projectSlug,layoutCode,layoutName,bedrooms,bathrooms,builtUpSqft,hasBalcony,hasYard
create,project-sunset-garden,2B2B,2 Bedroom 2 Bathroom,2,2,1050.50,yes,no
create,project-sunset-garden,3B2B,3 Bedroom 2 Bathroom,3,2,1350.75,yes,yes
```

### Units CSV

**Required Headers:**
- `action` (create/update)
- `projectSlug` - Project reference
- `unitNo` - Unique unit number within project
- `lotTypeCode` - Lot type code (must exist)
- `bookingStatusCode` - Booking status code (must exist)
- `basePrice` - Baseline unit price (numeric)

**Optional Headers:**
- `layoutCode` - Layout reference
- `towerNumber` - Tower reference
- `phaseName` - Phase reference
- `floor`, `stack`, `displaySequence`
- `builtUpSqft`, `landAreaSqft`, `dimensionText`
- `facing`, `positionType`
- `carparkCount`, `carparkLotNo`, `carparkType`
- `finalPrice`

**Example:**
```csv
action,projectSlug,unitNo,layoutCode,towerNumber,phaseName,floor,stack,basePrice,finalPrice,bookingStatusCode,lotTypeCode,carparkCount
create,project-sunset-garden,01-01,2B2B,TOWER-A,PHASE-1,1,A,350000,350000,available,residential,1
create,project-sunset-garden,01-02,2B2B,TOWER-A,PHASE-1,1,B,352000,352000,available,residential,1
create,project-sunset-garden,02-01,3B2B,TOWER-A,PHASE-1,2,A,425000,420000,reserved,residential,2
```

### Phases CSV

**Required Headers:**
- `action` (create/update)
- `projectSlug` - Project reference
- `phaseCode` - Unique phase code
- `phaseName` - Phase name

**Optional Headers:**
- `completionDate` (YYYY-MM-DD)
- `constructionStatusCode` - Construction status code

**Example:**
```csv
action,projectSlug,phaseCode,phaseName,completionDate,constructionStatusCode
create,project-sunset-garden,P1,Phase 1,2025-12-31,ongoing
create,project-sunset-garden,P2,Phase 2,2026-06-30,planning
```

### Towers CSV

**Required Headers:**
- `action` (create/update)
- `projectSlug` - Project reference
- `towerNumber` - Unique tower number

**Optional Headers:**
- `phaseName` - Phase reference
- `towerName` - Tower name
- `floorCount` - Number of floors

**Example:**
```csv
action,projectSlug,towerNumber,towerName,phaseName,floorCount
create,project-sunset-garden,TOWER-A,Tower A,PHASE-1,25
create,project-sunset-garden,TOWER-B,Tower B,PHASE-1,25
```

## Usage Steps

### 1. **Access Bulk Import**
- Navigate to Admin Console
- Click "Bulk Import" button
- Select entity type from dropdown

### 2. **Download Template**
- Click "Template" button to download CSV template for selected entity
- Open template in spreadsheet application
- Fill in your data

### 3. **Upload & Import**
- Select populated CSV file
- Review import settings if available
- Click "Import" button
- System validates all rows before importing

### 4. **Review Results**
- Success/failure summary displayed
- Detailed error messages for each failed row
- View warnings for skipped duplicates

## Validation Rules

### Data Type Conversions
- `numeric` fields: Automatically parsed as floats
- `integer` fields: Parsed as whole numbers
- `boolean` fields: "yes"/"true" = true, anything else = false
- `date` fields: Expected format YYYY-MM-DD
- `decimal` fields: Formatted to 2 decimal places

### Required Fields by Entity Type

**Developer:**
- slug, name

**Project:**
- slug, name, developerSlug, tenureTypeCode

**Layout:**
- projectSlug, layoutCode, layoutName, bedrooms, bathrooms, builtUpSqft

**Unit:**
- projectSlug, unitNo, lotTypeCode, bookingStatusCode, basePrice

**Phase:**
- projectSlug, phaseCode, phaseName

**Tower:**
- projectSlug, towerNumber

### Foreign Key Constraints
- `developerSlug` - Must reference existing developer
- `projectSlug` - Must reference existing project
- Referenced lookup codes/names must exist in database

### Recommended Import Order
- Developers
- Projects
- Phases, Towers, Layouts
- Units

## Error Handling

### Common Errors

**1. "Developer with slug 'X' not found"**
- Cause: Developer doesn't exist in database
- Solution: Import the developer first or verify slug spelling

**2. "Project with slug 'X' not found"**
- Cause: Project doesn't exist
- Solution: Create project first or verify slug spelling

**3. "Invalid CSV format"**
- Cause: Malformed CSV or missing required headers
- Solution: Verify headers match specification exactly (case-insensitive)

**4. "Base price must be a valid number"**
- Cause: Price field contains non-numeric value
- Solution: Ensure prices are numeric (e.g., "350000" or "350000.50")

## Performance Considerations

- **Small imports** (< 100 rows): < 2 seconds
- **Medium imports** (100-1000 rows): 5-15 seconds
- **Large imports** (1000+ rows): Consider splitting into multiple files
- **Batch size**: Automatically optimized at 10-100 records per batch

## Best Practices

1. **Validate Before Import**
   - Open CSV in spreadsheet app
   - Check for empty required fields
   - Verify lookup code existence

2. **Test with Sample Data**
   - Import small dataset first
   - Verify results before bulk operation
   - Check related entities were created correctly

3. **Use Consistent Formatting**
   - Standardize date formats (YYYY-MM-DD)
   - Use consistent slug naming (lowercase, hyphens)
   - Ensure numeric fields have no currency symbols

4. **Handle Foreign Keys Carefully**
   - Create parent entities first (Developers → Projects → Units)
   - Verify all referenced codes exist
   - Set up location hierarchy (State → Region → Area)

5. **Monitor Import Progress**
   - Check result summary
   - Review errors section
   - Verify success count matches expectations

## Technical Details

### CSV Parsing
- Handles both Unix (LF) and Windows (CRLF) line endings
- Supports quoted values with embedded commas
- Properly handles escaped quotes ("" within quoted fields)

### Validation Schema
- Uses Zod for runtime type checking
- Provides detailed error messages with field names
- Supports optional fields with defaults

### Database Operations
- Uses Drizzle ORM for type-safe queries
- Supports both INSERT and UPDATE operations
- Transaction-safe with automatic rollback

## API Reference

### Server Actions

```typescript
// Import projects
async function bulkImportProjects(csvContent: string): Promise<BulkImportResult>

// Import layouts
async function bulkImportLayouts(csvContent: string): Promise<BulkImportResult>

// Import units
async function bulkImportUnits(csvContent: string): Promise<BulkImportResult>

// Import phases
async function bulkImportPhases(csvContent: string): Promise<BulkImportResult>

// Import towers
async function bulkImportTowers(csvContent: string): Promise<BulkImportResult>
```

### UI Component

```typescript
// Add to your admin page/console
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';

export function YourAdminPage() {
  return (
    <div>
      <BulkImportDialog />
    </div>
  );
}
```

## Future Enhancements

- [ ] Async job queue for very large imports (10,000+ records)
- [ ] Email notification on completion
- [ ] Import history with detailed logs
- [ ] Excel format support
- [ ] Preview before import
- [ ] Field mapping customization
- [ ] Rollback support
- [ ] Import scheduling/cron
