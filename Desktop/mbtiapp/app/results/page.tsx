'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recommendCollege, generateExplanation, type RecommendationResult } from '@/lib/recommendations'
import { CollegeComparison } from '@/components/CollegeComparison'
import { PersonalityScatter } from '@/components/PersonalityScatter'

const MBTI_FUN_FACTS: Record<string, string[]> = {
  INTJ: [
    'INTJs report the highest satisfaction when programs provide autonomy and strategic deliverables.',
    'Data-backed curricula and measurable outcomes increase INTJ retention by ~18%.',
  ],
  INTP: [
    'INTPs favor programs with research labs or independent study credit baked in.',
    'Flexible course sequencing correlates with stronger INTP fit scores.',
  ],
  ENTJ: [
    'ENTJs thrive in programs featuring leadership labs, client consulting, or venture accelerators.',
    'Structured mentoring from executives keeps ENTJ satisfaction high across semesters.',
  ],
  ENTP: [
    'ENTPs rate programs higher when iteration cycles (pitch, feedback, rebuild) are standard practice.',
    'Innovation coursework combined with debate/policy electives drives ENTP engagement.',
  ],
  INFJ: [
    'INFJs seek programs with purpose statements and integrated mentorship opportunities.',
    'Interdisciplinary capstones that tie strategy to people impact resonate strongly with INFJs.',
  ],
  INFP: [
    'INFPs value creative latitude plus community-focused outcomes inside their program.',
    'Service-learning requirements measurably improve INFP persistence.',
  ],
  ENFJ: [
    'ENFJs align with programs offering peer leadership roles and coaching assignments.',
    'Curricula that embed service hours sustain ENFJ motivation across junior/senior year.',
  ],
  ENFP: [
    'ENFPs prefer exploratory tracks during the first year to test multiple disciplines.',
    'Study-abroad or immersive internships correlate with higher ENFP satisfaction.',
  ],
  ISTJ: [
    'ISTJs rate programs highest when expectations, grading, and internship pipelines are explicit.',
    'Accreditation standards and structured practicum hours reinforce ISTJ confidence.',
  ],
  ISFJ: [
    'ISFJs value predictable support services and faculty access more than optional perks.',
    'Applied service projects boost ISFJ stay rates by double digits.',
  ],
  ESTJ: [
    'ESTJs excel in programs emphasizing operations, governance, and measurable KPIs.',
    'Cohort leadership roles keep ESTJs engaged even in heavy quantitative semesters.',
  ],
  ESFJ: [
    'ESFJs respond to curricula with strong community-building components.',
    'Programs that recognize milestone achievements publicly retain ESFJs at higher rates.',
  ],
  ISTP: [
    'ISTPs need extended lab or shop time to stay invested in technical programs.',
    'Autonomy in how they approach prototypes translates to higher ISTP fit scores.',
  ],
  ISFP: [
    'ISFPs thrive when studios, fieldwork, and user-impact briefs are standard each term.',
    'Flexible deliverable formats (photo, video, installation) bolster ISFP satisfaction.',
  ],
  ESTP: [
    'ESTPs favor live-client engagements and rapid feedback loops in coursework.',
    'Competitive practicums anchor ESTP focus and reduce attrition.',
  ],
  ESFP: [
    'ESFPs stay engaged when presentation, media, or performance deliverables are routine.',
    'Rotating team roles keep ESFPs energized throughout collaborative courses.',
  ],
}

const COLLEGE_TOP_MAJORS: Record<string, string[]> = {
  'marriott school of business': ['Accountancy', 'Finance', 'Information Systems', 'Management', 'Supply Chain'],
  business: ['Accountancy', 'Finance', 'Information Systems', 'Management', 'Supply Chain'],
  'college of fine arts and communications': ['Art', 'Design', 'Dance', 'Music', 'Communications'],
  'fine arts and communications': ['Art', 'Design', 'Dance', 'Music', 'Communications'],
  'fine arts': ['Art', 'Design', 'Dance', 'Music', 'Communications'],
  'college of humanities': ['English', 'Philosophy', 'Languages', 'Comparative Arts & Letters'],
  humanities: ['English', 'Philosophy', 'Languages', 'Comparative Arts & Letters'],
  'college of life sciences': ['Biology', 'Nutrition', 'Public Health', 'Neuroscience', 'Plant & Wildlife Sciences'],
  'life sciences': ['Biology', 'Nutrition', 'Public Health', 'Neuroscience', 'Plant & Wildlife Sciences'],
  'college of nursing': ['Nursing (BS)', 'Nursing (MS)', 'Nurse Practitioner Programs'],
  nursing: ['Nursing (BS)', 'Nursing (MS)', 'Nurse Practitioner Programs'],
  'college of physical and mathematical sciences': ['Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'Applied Statistics'],
  'college of computational, mathematical & physical sciences': ['Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'Applied Statistics'],
  'college of computational, mathematical and physical sciences': ['Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'Applied Statistics'],
  'computational, mathematical and physical sciences': ['Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'Applied Statistics'],
  'college of family, home, and social sciences': ['Sociology', 'Psychology', 'Family Studies', 'Economics', 'Anthropology'],
  'college of family, home & social sciences': ['Sociology', 'Psychology', 'Family Studies', 'Economics', 'Anthropology'],
  'family, home & social sciences': ['Sociology', 'Psychology', 'Family Studies', 'Economics', 'Anthropology'],
  'family, home, and social sciences': ['Sociology', 'Psychology', 'Family Studies', 'Economics', 'Anthropology'],
  'david m. kennedy center for international studies': ['International Relations', 'Area Studies', 'Language & Cultural Studies'],
  'kennedy center for international studies': ['International Relations', 'Area Studies', 'Language & Cultural Studies'],
  'j. reuben clark law school': ['Juris Doctor (JD)', 'Business Law', 'International Law'],
  'law school': ['Juris Doctor (JD)', 'Business Law', 'International Law'],
  law: ['Juris Doctor (JD)', 'Business Law', 'International Law'],
  'david o. mckay school of education': ['Elementary Education', 'Special Education', 'Early Childhood Education'],
  'school of education': ['Elementary Education', 'Special Education', 'Early Childhood Education'],
  education: ['Elementary Education', 'Special Education', 'Early Childhood Education'],
  'college of religious education': ['Ancient Scripture', 'Church History', 'World Religions'],
  'religious education': ['Ancient Scripture', 'Church History', 'World Religions'],
  'college of undergraduate education': ['General Education', 'Interdisciplinary Studies', 'Teacher Preparation'],
  'undergraduate education': ['General Education', 'Interdisciplinary Studies', 'Teacher Preparation'],
  'continuing education': ['Evening Classes', 'Independent Study', 'Professional Certificates'],
  'ira a. fulton college of engineering': ['Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering', 'Civil Engineering'],
  engineering: ['Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering', 'Civil Engineering'],
  'brigham young university': ['General Education', 'Campus-wide Programs', 'Leadership Development'],
  byu: ['General Education', 'Campus-wide Programs', 'Leadership Development'],
  other: ['Interdisciplinary Studies', 'Entrepreneurship', 'Data Analytics'],
}

const DEFAULT_FUN_FACTS = ['MBTI magic incoming soon!', 'Share the quiz to unlock more insights.']
const DEFAULT_TOP_MAJORS = ['Data Science', 'Communications', 'Experience Design']

const getTopMajors = (college: string | undefined | null): string[] => {
  if (!college) return DEFAULT_TOP_MAJORS
  const normalized = college.trim().toLowerCase()
  return COLLEGE_TOP_MAJORS[normalized] ?? DEFAULT_TOP_MAJORS
}

function ResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mbtiFromQuery = searchParams.get('mbti')
  const [mbti, setMbti] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const loadData = () => {
      if (mbtiFromQuery) {
        setMbti(mbtiFromQuery)
        setIsLoading(false)
        return
      }

      const completeData = sessionStorage.getItem('completeData')
      if (completeData) {
        const data = JSON.parse(completeData)
        if (data?.mbti) {
          setMbti(data.mbti)
          setIsLoading(false)
          return
        }
      }

      const questionData = sessionStorage.getItem('questionData')
      if (questionData) {
        const data = JSON.parse(questionData)
        if (data?.mbti) {
          setMbti(data.mbti)
          setIsLoading(false)
          return
        }
      }

      router.push('/questions')
    }

    loadData()
  }, [router, mbtiFromQuery])

  useEffect(() => {
    // Get recommendation once we have MBTI
    const getRecommendation = async () => {
      if (mbti && !isCalculating) {
        setIsCalculating(true)
        const result = await recommendCollege(mbti)
        setRecommendation(result)
        setIsCalculating(false)
      }
    }

    getRecommendation()
  }, [mbti, isCalculating])

  if (isLoading || !recommendation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-100">
          <CardContent className="pt-10 pb-12 text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full border-4 border-dashed border-indigo-300 animate-spin"></div>
            <p className="text-lg font-medium text-slate-700">
              {isLoading ? 'Gathering your MBTI sparkles...' : 'Crunching the crowd wisdom...'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasRecommendation = recommendation.hasEnoughData && !!recommendation.recommended
  const recommendedCollege = hasRecommendation ? recommendation.recommended : null
  const funFacts = MBTI_FUN_FACTS[mbti] ?? DEFAULT_FUN_FACTS
  const topMajors = hasRecommendation && recommendation.recommended
    ? getTopMajors(recommendation.recommended.college)
    : DEFAULT_TOP_MAJORS

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 lg:py-16 space-y-8">
        <Card className="border-0 shadow-2xl shadow-indigo-100">
          <CardHeader className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Your Results</p>
            <CardTitle className="text-4xl font-bold text-slate-900">
              {mbti} MBTI College Match
            </CardTitle>
            <CardDescription className="text-base">
              Powered by {recommendation.totalDataPoints} stories from students just like you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">Your MBTI</p>
                <p className="text-6xl font-extrabold text-indigo-700">{mbti}</p>
                <p className="text-sm text-slate-500 mt-2">We match you with colleges where personalities like yours thrive.</p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 space-y-4">
                {hasRecommendation ? (
                  <>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Best Match</p>
                    <h3 className="text-2xl font-semibold text-slate-900">{recommendation.recommended?.college}</h3>
                    <p className="text-sm text-slate-600">
                      {generateExplanation(recommendation.recommended!, mbti)}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex-1 rounded-2xl bg-lime-50 px-4 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-lime-600">Fit rate</p>
                        <p className="text-2xl font-bold text-lime-700">
                          {recommendation.recommended?.fitRate.toFixed(0)}%
                        </p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-amber-50 px-4 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Would switch</p>
                        <p className="text-2xl font-bold text-amber-700">
                          {recommendation.recommended?.switchRate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-amber-900">We need more responses ☕️</h3>
                  <p className="text-sm text-amber-800">
                    Not enough {mbti} students have weighed in per college yet. Share the quiz to unlock more insights!
                  </p>
                  <Link href="https://collegesortinghatmbti.vercel.app" className="text-sm font-semibold text-indigo-600 underline">
                    Share the quiz
                  </Link>
                </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Button asChild size="lg" className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-500">
                <Link href="/start">
                  Take the quiz again
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 rounded-full border-slate-200">
                <Link href="/questions">
                  Update my answers
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasRecommendation && recommendedCollege && (
          <CollegeComparison
            colleges={[recommendedCollege, ...recommendation.alternatives]}
            recommendedCollege={recommendedCollege.college}
          />
        )}

        <Card className="border-0 shadow-2xl shadow-indigo-100">
          <CardContent className="space-y-6 pt-8">
            <div className="grid gap-8 lg:grid-cols-[3fr,2fr] items-start">
              <div>
                <PersonalityScatter data={recommendation.allColleges} mbti={mbti} />
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/80 p-6 space-y-6 text-slate-800">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Fun facts</p>
                  <h4 className="mt-2 text-xl font-semibold text-indigo-900">
                    {mbti} talent signals
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 text-left">
                    {funFacts.map((fact) => (
                      <li key={fact} className="flex items-start gap-2">
                        <span className="text-amber-500">✦</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Top majors</p>
                  <h4 className="mt-2 text-xl font-semibold text-indigo-900">
                    {hasRecommendation && recommendation.recommended
                      ? `${recommendation.recommended.college} favorites`
                      : 'Not enough data yet'}
                  </h4>
                  {hasRecommendation && recommendation.recommended ? (
                    <ol className="mt-3 space-y-2 text-sm text-slate-700 text-left list-decimal list-inside">
                      {topMajors.slice(0, 3).map((major) => (
                        <li key={major}>{major}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">
                      Once more {mbti} students share their experiences, we’ll highlight this college’s standout majors here.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-500"
          >
            <Link href="/start">
              Back to Sorting Hat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ResultsFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-100">
        <CardContent className="pt-10 pb-12 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-dashed border-indigo-300 animate-spin"></div>
          <p className="text-lg font-medium text-slate-700">
            Loading your Sorting Hat insights...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsPageContent />
    </Suspense>
  )
}
