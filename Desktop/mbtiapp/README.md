# Your College Sorting Hat

A web application that recommends a BYU college based on MBTI type and crowdsourced satisfaction data.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** components
- **Supabase** (database + auth)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon/public key
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create the Database Table

Run the migration SQL in your Supabase SQL Editor. This script is idempotent and safe to run multiple times:

```bash
# Copy the contents of supabase-migration.sql and paste into Supabase SQL Editor
```

Or manually create the table:

```sql
-- Create the responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  school TEXT NOT NULL,
  enrolled BOOLEAN NOT NULL,
  mbti TEXT NOT NULL,
  college TEXT,
  fit BOOLEAN,
  would_switch BOOLEAN
);

-- Enable Row Level Security (RLS)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public insert" ON responses
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public read" ON responses
  FOR SELECT TO public USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mbti ON responses(mbti);
CREATE INDEX IF NOT EXISTS idx_college ON responses(college);
CREATE INDEX IF NOT EXISTS idx_mbti_college ON responses(mbti, college);
```

### 3b. Import Existing Data (Optional)

If you have existing CSV data (~200 responses):

1. Go to Supabase Dashboard > Table Editor > responses table
2. Click "Insert" > "Import data from CSV"
3. Upload your CSV file with columns: `school`, `enrolled`, `mbti`, `college`, `fit`, `would_switch`
4. Map columns and import

**Important:** New submissions will INSERT new rows without modifying existing data.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

## Application Flow

1. **`/start`** - Welcome page with introduction
2. **`/questions`** - Collects school, enrollment status, and MBTI type
3. **`/experience`** (conditional) - If enrolled, collects college, fit, and switch preference
4. **`/results`** - Displays MBTI type and recommended college

## Features

- ✅ Responsive design with TailwindCSS
- ✅ Form validation and state management
- ✅ Conditional routing based on enrollment status
- ✅ Database integration with Supabase
- ✅ Session storage for multi-page form flow
- ✅ Real-time recommendation algorithm using crowdsourced data
- ✅ Visual comparison charts for college statistics
- ✅ Works with existing datasets (append-only, no overwrites)
- ✅ Ready for Vercel deployment

## Database Schema

```typescript
interface Response {
  id?: string                    // UUID, auto-generated
  timestamp?: string             // Auto-generated timestamp
  school: string                 // User's school
  enrolled: boolean              // Whether user is enrolled in a degree
  mbti: string                   // MBTI type (16 options)
  college?: string | null        // BYU college (if enrolled)
  fit?: boolean | null           // Does major fit personality? (if enrolled)
  would_switch?: boolean | null  // Would switch majors? (if enrolled)
}
```

## Recommendation Algorithm

The app uses a data-driven algorithm to recommend colleges:

### How It Works

1. **Query Data**: Fetches all responses from students with the same MBTI type who are enrolled in a degree program
2. **Group by College**: Aggregates responses by college
3. **Filter**: Only includes colleges with ≥2 responses to ensure statistical significance
4. **Calculate Metrics**:
   - **Fit Rate**: Percentage of students who say their major fits their personality (higher is better)
   - **Switch Rate**: Percentage of students who would switch majors if they could go back (lower is better)
5. **Score & Rank**: Combines metrics with weighted scoring (70% fit rate, 30% inverse switch rate)
6. **Return Results**: Provides top recommendation plus 2 alternatives

### Example Calculation

For an INTJ student with 5 responses in Engineering:
- 4 out of 5 say it fits → **Fit Rate: 80%**
- 1 out of 5 would switch → **Switch Rate: 20%**
- **Score**: (80 × 0.7) + ((100 - 20) × 0.3) = 56 + 24 = **80**

### Data Requirements

- Minimum 2 responses per college for inclusion
- Uses both historical and new data
- All new submissions append to existing dataset

## Future Enhancements

- Add authentication for users to track their responses over time
- Implement admin dashboard for data analysis and insights
- Add more sophisticated weighting based on response recency
- Include confidence intervals for recommendations
- Add filtering by school or additional demographics

## Project Structure

```
├── app/
│   ├── start/              # Welcome page
│   ├── questions/          # Initial questionnaire
│   ├── experience/         # Experience form (enrolled students)
│   ├── results/            # Results display with recommendations
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home redirect
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── CollegeComparison.tsx  # Visual comparison chart
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── recommendations.ts  # Recommendation algorithm
│   └── utils.ts            # Utility functions
├── supabase-migration.sql  # Database setup script
└── public/                 # Static assets
```

## License

MIT
