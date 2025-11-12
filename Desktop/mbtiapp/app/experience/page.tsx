'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const BYU_COLLEGES = [
  'Engineering',
  'Education',
  'International Studies',
  'Computational, Mathematical and Physical Sciences',
  'Family, Home, and Social Sciences',
  'Fine Arts and Communications',
  'Life Sciences',
  'Business',
  'Humanities',
  'Nursing',
  'Undergraduate Education',
  'Continuing Education',
  'Law',
  'Other'
]

export default function ExperiencePage() {
  const router = useRouter()
  const [college, setCollege] = useState('')
  const [fit, setFit] = useState<string>('')
  const [wouldSwitch, setWouldSwitch] = useState<string>('')
  const [switchCollege, setSwitchCollege] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionData, setQuestionData] = useState<any>(null)

  useEffect(() => {
    // Retrieve data from previous page
    const storedData = sessionStorage.getItem('questionData')
    if (storedData) {
      setQuestionData(JSON.parse(storedData))
    } else {
      // Redirect back if no data found
      router.push('/questions')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!college || !fit || !wouldSwitch || !questionData) {
      alert('Please fill in all fields')
      return
    }

    if (wouldSwitch === 'yes' && !switchCollege) {
      alert('Please select which college you would switch into')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for Supabase
      const responseData = {
        school: questionData.school,
        enrolled: questionData.enrolled,
        mbti: questionData.mbti,
        college,
        fit: fit === 'yes',
        would_switch: wouldSwitch === 'yes',
        switch_college: wouldSwitch === 'yes' ? switchCollege : null
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('responses')
        .insert([responseData])

      if (error) {
        console.error('Error inserting data:', error)
        alert('There was an error submitting your response. Please try again.')
        setIsSubmitting(false)
        return
      }

      sessionStorage.clear()
      router.push(`/results?mbti=${encodeURIComponent(questionData.mbti)}`)
    } catch (error) {
      console.error('Error:', error)
      alert('There was an error submitting your response. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!questionData) {
    return null // Or a loading spinner
  }

  const handleWouldSwitchChange = (value: string) => {
    setWouldSwitch(value)
    if (value !== 'yes') {
      setSwitchCollege('')
    }
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <Card className="w-full max-w-3xl border-0 shadow-2xl shadow-purple-100">
          <CardHeader className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-purple-500">Step 02</p>
            <CardTitle className="text-3xl font-semibold text-slate-900">
              Share Your Program Experience
            </CardTitle>
            <CardDescription>
              Help future students understand how this college performs for people with similar profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* College Selection */}
              <div className="space-y-2">
                <Label htmlFor="college" className="text-slate-700">What college are/were you in?</Label>
                <Select value={college} onValueChange={setCollege}>
                  <SelectTrigger id="college" className="rounded-2xl border-slate-200 focus:ring-purple-200">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {BYU_COLLEGES.map((collegeName) => (
                      <SelectItem key={collegeName} value={collegeName}>
                        {collegeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Major Fit Question */}
              <div className="space-y-4">
              <Label className="text-slate-700">Does your major fit your personality?</Label>
              <RadioGroup value={fit} onValueChange={setFit} className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    value: 'yes',
                    label: 'Yes — the program aligns with my strengths',
                    helper: 'Coursework and outcomes match what I do best.',
                  },
                  {
                    value: 'no',
                    label: 'No — the program is not an ideal fit',
                    helper: 'Expectations or daily work feel misaligned.',
                  },
                ].map((option) => (
                  <div key={option.value} className="rounded-2xl border border-slate-200 p-4 hover:border-purple-200 transition">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={`fit-${option.value}`} />
                        <Label htmlFor={`fit-${option.value}`} className="font-medium text-slate-900 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="pl-7 text-sm text-slate-500">{option.helper}</p>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Would Switch Question */}
              <div className="space-y-4">
              <Label className="text-slate-700">If you could rewind, would you switch majors?</Label>
              <RadioGroup value={wouldSwitch} onValueChange={handleWouldSwitchChange} className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    value: 'yes',
                    label: 'Yes — I would select a different college/program',
                    helper: 'The experience did not meet my expectations.',
                  },
                  {
                    value: 'no',
                    label: 'No — I would make the same decision again',
                    helper: 'The program continues to meet my goals.',
                  },
                ].map((option) => (
                  <div key={option.value} className="rounded-2xl border border-slate-200 p-4 hover:border-rose-200 transition">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={`switch-${option.value}`} />
                        <Label htmlFor={`switch-${option.value}`} className="font-medium text-slate-900 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="pl-7 text-sm text-slate-500">{option.helper}</p>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {wouldSwitch === 'yes' && (
                <div className="space-y-2">
                  <Label htmlFor="switch-college" className="text-slate-700">Which college would you switch into?</Label>
                  <Select value={switchCollege} onValueChange={setSwitchCollege}>
                    <SelectTrigger id="switch-college" className="rounded-2xl border-slate-200 focus:ring-rose-200">
                      <SelectValue placeholder="Choose the college for your new major" />
                    </SelectTrigger>
                    <SelectContent>
                      {BYU_COLLEGES.map((collegeName) => (
                        <SelectItem key={`switch-${collegeName}`} value={collegeName}>
                          {collegeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    You can pick the same college again if the new major still lives there.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-500"
                >
                  <a href="/questions">← Back to Step 01</a>
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full bg-purple-600 hover:bg-purple-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving your wisdom...' : 'Show My Matches ✨'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
