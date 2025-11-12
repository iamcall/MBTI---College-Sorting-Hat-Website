# Recommendation System Documentation

## Overview

The app now includes a fully functional recommendation system that uses your existing dataset of ~200 responses plus any new submissions to provide data-driven college recommendations.

## Key Features

### ✅ Works with Existing Data
- Idempotent SQL migration (safe to run multiple times)
- Import existing CSV via Supabase dashboard
- New submissions append without overwriting

### ✅ Smart Algorithm
- Queries Supabase for MBTI-specific data
- Groups by college with minimum threshold (≥2 responses)
- Calculates fit rate and switch rate
- Ranks using weighted scoring (70% fit, 30% inverse switch)

### ✅ Rich Results Page
- Displays recommended college with explanation
- Shows fit rate and switch rate metrics
- Includes visual comparison chart for top 3 colleges
- Handles insufficient data gracefully

## Files Created

### Core Logic
- **`lib/recommendations.ts`** - Main recommendation algorithm
  - `recommendCollege(mbti)` - Returns recommendation result
  - `generateExplanation(stats, mbti)` - Creates human-readable explanation

### UI Components
- **`components/CollegeComparison.tsx`** - Visual comparison chart
  - Shows fit rate and switch rate bars
  - Highlights recommended college
  - Displays sample size for each college

### Database
- **`supabase-migration.sql`** - Safe, idempotent table creation
  - Creates table if not exists
  - Adds missing columns without data loss
  - Sets up RLS policies and indexes

### Documentation
- **`DATA_IMPORT_GUIDE.md`** - Step-by-step import instructions
- **`test-recommendations.ts`** - Test script for verification
- **`RECOMMENDATION_SYSTEM.md`** - This file

## How the Algorithm Works

### Step 1: Data Retrieval
```typescript
// Fetch all enrolled responses for given MBTI
const { data } = await supabase
  .from('responses')
  .eq('mbti', mbti)
  .eq('enrolled', true)
  .not('college', 'is', null)
```

### Step 2: Grouping & Filtering
```typescript
// Group by college
collegeGroups.forEach((group, college) => {
  // Only include if ≥2 responses
  if (totalResponses < 2) return

  // Calculate metrics...
})
```

### Step 3: Metric Calculation
```typescript
// Fit Rate (higher is better)
fitRate = (trueCount / totalCount) * 100

// Switch Rate (lower is better)
switchRate = (wouldSwitchCount / totalCount) * 100

// Combined Score
score = (fitRate * 0.7) + ((100 - switchRate) * 0.3)
```

### Step 4: Ranking & Results
```typescript
// Sort by score descending
collegeStats.sort((a, b) => b.score - a.score)

return {
  recommended: collegeStats[0],
  alternatives: collegeStats.slice(1, 3),
  totalDataPoints: data.length,
  hasEnoughData: true
}
```

## Using the Recommendation System

### In Your App

The recommendation system is automatically called on the `/results` page:

```typescript
// app/results/page.tsx
const result = await recommendCollege(mbti)

if (result.hasEnoughData && result.recommended) {
  // Show recommendation
  console.log(result.recommended.college)
  console.log(generateExplanation(result.recommended, mbti))
}
```

### Testing

Run the test script to see recommendations for all MBTI types:

```bash
# Install tsx if needed
npm install -D tsx

# Run test
npx tsx test-recommendations.ts
```

### Importing Data

See `DATA_IMPORT_GUIDE.md` for complete instructions:

1. Prepare CSV with required columns
2. Import via Supabase dashboard
3. Verify with test script

## Data Requirements

### Minimum Threshold
- **Per College**: ≥2 responses to be included
- **Per MBTI**: ≥2 responses across colleges to show recommendations

### Column Requirements
| Column | Required | Type | Notes |
|--------|----------|------|-------|
| school | Yes | text | Any school name |
| enrolled | Yes | boolean | true/false |
| mbti | Yes | text | Valid MBTI type |
| college | Conditional | text | Required if enrolled=true |
| fit | Conditional | boolean | Required if enrolled=true |
| would_switch | Conditional | boolean | Required if enrolled=true |

## Example Scenarios

### Scenario 1: Sufficient Data
```
MBTI: INTJ
Data Points: 15 responses

Results:
✅ Recommended: Engineering (fit: 82%, switch: 18%, score: 82)
   Alternatives:
   - Business (fit: 75%, switch: 25%, score: 75)
   - Physical Sciences (fit: 70%, switch: 30%, score: 70)
```

### Scenario 2: Insufficient Data
```
MBTI: ISFP
Data Points: 3 responses (1 per college)

Results:
❌ Not enough data
   Message: "We don't have enough data from ISFP students yet..."
```

### Scenario 3: No Data
```
MBTI: ENFJ
Data Points: 0 responses

Results:
❌ Not enough data
   Message: "Check back as more students contribute..."
```

## Customization

### Adjusting Minimum Threshold

Edit `lib/recommendations.ts`:

```typescript
// Change from 2 to your preferred minimum
if (totalResponses < 2) return  // Change this number
```

### Adjusting Score Weights

Edit `lib/recommendations.ts`:

```typescript
// Current: 70% fit rate, 30% switch rate
const score = (fitRate * 0.7) + ((100 - switchRate) * 0.3)

// More weight on fit:
const score = (fitRate * 0.8) + ((100 - switchRate) * 0.2)

// Equal weight:
const score = (fitRate * 0.5) + ((100 - switchRate) * 0.5)
```

### Adding Confidence Intervals

Future enhancement - add to `CollegeStats`:

```typescript
interface CollegeStats {
  // ... existing fields
  confidence: number // 0-100
  marginOfError: number // percentage points
}
```

## Monitoring & Maintenance

### Check Data Distribution

```sql
-- Responses per MBTI type
SELECT mbti, COUNT(*) as count
FROM responses
GROUP BY mbti
ORDER BY count DESC;

-- Responses per college
SELECT college, COUNT(*) as count
FROM responses
WHERE college IS NOT NULL
GROUP BY college
ORDER BY count DESC;

-- Response completeness
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE enrolled = true) as enrolled,
  COUNT(*) FILTER (WHERE college IS NOT NULL) as has_college
FROM responses;
```

### Performance Optimization

Indexes are already created:
- `idx_mbti` - Fast MBTI lookups
- `idx_college` - Fast college grouping
- `idx_mbti_college` - Fast combined queries

For large datasets (>10k rows), consider:
- Materialized views for pre-computed statistics
- Caching recommendations in Redis/Upstash
- Background job to update recommendations

## Troubleshooting

### No recommendations showing
1. Check if data exists: `SELECT * FROM responses WHERE mbti = 'INTJ'`
2. Verify enrolled students: `SELECT * FROM responses WHERE enrolled = true`
3. Check college field: `SELECT * FROM responses WHERE college IS NOT NULL`

### Recommendations seem wrong
1. Run test script to see all calculations
2. Check data quality (nulls, invalid values)
3. Verify scoring weights make sense for your use case

### Import failed
1. Check CSV format matches requirements
2. Verify column names are exact
3. Ensure boolean values are correct format
4. See `DATA_IMPORT_GUIDE.md` for solutions

## API Reference

### `recommendCollege(mbti: string): Promise<RecommendationResult>`

Returns recommendation for given MBTI type.

**Parameters:**
- `mbti` - Valid MBTI type (e.g., "INTJ")

**Returns:**
```typescript
{
  recommended: CollegeStats | null,
  alternatives: CollegeStats[],
  totalDataPoints: number,
  hasEnoughData: boolean
}
```

### `generateExplanation(stats: CollegeStats, mbti: string): string`

Generates human-readable explanation for recommendation.

**Parameters:**
- `stats` - College statistics object
- `mbti` - MBTI type string

**Returns:** Formatted explanation string

## Next Steps

1. ✅ Import your existing ~200 responses
2. ✅ Run test script to verify recommendations
3. ✅ Deploy to Vercel
4. 📈 Monitor data growth and recommendation quality
5. 🔄 Iterate on scoring weights based on user feedback
