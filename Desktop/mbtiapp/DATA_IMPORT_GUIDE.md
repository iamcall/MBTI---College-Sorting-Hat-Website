# Data Import Guide

This guide explains how to import your existing ~200 responses into the Supabase database.

## Prerequisites

- Supabase project created and configured
- Database table created using `supabase-migration.sql`
- CSV file with your existing responses

## CSV Format Requirements

Your CSV should have the following columns (order doesn't matter):

```csv
school,enrolled,mbti,college,fit,would_switch
Brigham Young University,true,INTJ,Ira A. Fulton College of Engineering,true,false
Brigham Young University,false,ENFP,,,
```

### Column Specifications

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `school` | text | Yes | Name of the school (e.g., "Brigham Young University") |
| `enrolled` | boolean | Yes | `true` or `false` (or `TRUE`/`FALSE`, `1`/`0`) |
| `mbti` | text | Yes | One of 16 MBTI types (e.g., "INTJ", "ENFP") |
| `college` | text | No | BYU college name (can be empty if not enrolled) |
| `fit` | boolean | No | `true` or `false` (can be empty if not enrolled) |
| `would_switch` | boolean | No | `true` or `false` (can be empty if not enrolled) |

### Important Notes

- `id` and `timestamp` columns will be auto-generated - do NOT include them in your CSV
- Empty/null values are allowed for `college`, `fit`, and `would_switch`
- Boolean values can be: `true`/`false`, `TRUE`/`FALSE`, `1`/`0`, `t`/`f`
- MBTI must be valid (one of the 16 types)

## Method 1: Supabase Dashboard (Recommended)

### Step 1: Prepare Your CSV

1. Open your CSV in Excel, Google Sheets, or a text editor
2. Verify column names match exactly: `school`, `enrolled`, `mbti`, `college`, `fit`, `would_switch`
3. Remove any `id` or `timestamp` columns if present
4. Save as CSV

### Step 2: Import via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** in the left sidebar
3. Select the `responses` table
4. Click the **"Insert"** dropdown button
5. Select **"Import data from CSV"**
6. Upload your CSV file
7. Map the columns:
   - Supabase will auto-detect most columns
   - Verify each column maps correctly
   - Ensure boolean columns are mapped to boolean type
8. Click **"Import"**
9. Wait for confirmation message

### Step 3: Verify Import

```sql
-- Check total rows
SELECT COUNT(*) FROM responses;

-- Check MBTI distribution
SELECT mbti, COUNT(*) as count
FROM responses
GROUP BY mbti
ORDER BY count DESC;

-- Check enrolled vs not enrolled
SELECT enrolled, COUNT(*) as count
FROM responses
GROUP BY enrolled;
```

## Method 2: SQL INSERT (For Advanced Users)

If you prefer SQL or have many rows:

### Step 1: Convert CSV to SQL

```sql
INSERT INTO responses (school, enrolled, mbti, college, fit, would_switch) VALUES
('Brigham Young University', true, 'INTJ', 'Ira A. Fulton College of Engineering', true, false),
('Brigham Young University', false, 'ENFP', NULL, NULL, NULL),
-- ... more rows
;
```

### Step 2: Run in SQL Editor

1. Go to **SQL Editor** in Supabase dashboard
2. Paste your INSERT statement
3. Click **"Run"**

## Method 3: Programmatic Upload

If you need to transform data or have a complex CSV:

```typescript
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for bulk import
)

async function importData() {
  const fileContent = fs.readFileSync('your-data.csv', 'utf-8')
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  })

  // Transform data if needed
  const transformedRecords = records.map((row: any) => ({
    school: row.school,
    enrolled: row.enrolled === 'true' || row.enrolled === '1',
    mbti: row.mbti.toUpperCase(),
    college: row.college || null,
    fit: row.fit ? (row.fit === 'true' || row.fit === '1') : null,
    would_switch: row.would_switch ? (row.would_switch === 'true' || row.would_switch === '1') : null
  }))

  // Insert in batches of 100
  for (let i = 0; i < transformedRecords.length; i += 100) {
    const batch = transformedRecords.slice(i, i + 100)
    const { error } = await supabase.from('responses').insert(batch)

    if (error) {
      console.error(`Error in batch ${i / 100 + 1}:`, error)
    } else {
      console.log(`Imported batch ${i / 100 + 1} (${batch.length} rows)`)
    }
  }
}

importData()
```

## Common Issues & Solutions

### Issue: Boolean columns not importing correctly

**Solution**: Ensure your CSV uses `true`/`false` or `1`/`0`. Avoid text like "yes"/"no".

### Issue: Some rows failing to import

**Solution**: Check that:
- `school`, `enrolled`, and `mbti` are present for ALL rows
- MBTI values are valid (INTJ, ENFP, etc.)
- No extra columns that don't exist in the table

### Issue: Timestamps not showing

**Solution**: Timestamps are auto-generated. If you need to preserve original timestamps, add them to your CSV as an ISO 8601 string:

```csv
timestamp,school,enrolled,mbti
2024-01-15T10:30:00Z,Brigham Young University,true,INTJ
```

### Issue: Duplicate data

**Solution**: The table allows duplicates by design. If you accidentally imported twice, you can delete:

```sql
-- Delete duplicates keeping the oldest entry
DELETE FROM responses a
USING responses b
WHERE a.id > b.id
  AND a.school = b.school
  AND a.mbti = b.mbti
  AND a.enrolled = b.enrolled
  AND COALESCE(a.college, '') = COALESCE(b.college, '');
```

## After Import

1. **Verify data**:
   ```sql
   SELECT * FROM responses LIMIT 10;
   ```

2. **Test recommendations**:
   - Visit your app
   - Complete the questionnaire with an MBTI type that has data
   - Check that recommendations appear

3. **Monitor performance**:
   - Recommendations require ≥2 responses per college
   - More data = better recommendations

## Appending New Data

The app automatically appends new submissions to your existing data. No special configuration needed - just make sure not to truncate or drop the table!
