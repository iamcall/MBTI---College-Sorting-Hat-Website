# Quick Setup Guide

Follow these steps to get your app running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

### Create a Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### Get Your API Keys
1. Go to Project Settings (gear icon) > API
2. Copy the `Project URL`
3. Copy the `anon public` key

### Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Create the Database Table
1. Go to the SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Paste this SQL and click "Run":

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  school TEXT NOT NULL,
  enrolled BOOLEAN NOT NULL,
  mbti TEXT NOT NULL,
  college TEXT,
  fit BOOLEAN,
  would_switch BOOLEAN
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON responses
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public read" ON responses
  FOR SELECT TO public USING (true);

CREATE INDEX idx_mbti ON responses(mbti);
CREATE INDEX idx_college ON responses(college);
```

## 3. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 4. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then:
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Add the same environment variables from `.env.local`
5. Click "Deploy"

Done! Your app will be live in ~2 minutes.
