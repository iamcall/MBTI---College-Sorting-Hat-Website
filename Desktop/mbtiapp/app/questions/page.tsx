'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

const COLLEGE_NAMES = [
  'Boston College',
  'Boston University',
  'Brown University',
  'Brigham Young University',
  'Carnegie Mellon University',
  'Columbia University',
  'Cornell University',
  'Dartmouth College',
  'Duke University',
  'Emory University',
  'Georgetown University',
  'Harvard University',
  'Johns Hopkins University',
  'Massachusetts Institute of Technology (MIT)',
  'New York University (NYU)',
  'Northwestern University',
  'Princeton University',
  'Rice University',
  'Stanford University',
  'University of California, Berkeley (UC Berkeley)',
  'University of California, Davis (UCD)',
  'University of California, Irvine (UCI)',
  'University of California, Los Angeles (UCLA)',
  'University of California, San Diego (UCSD)',
  'University of California, Santa Barbara (UCSB)',
  'University of Chicago',
  'University of Michigan',
  'University of North Carolina at Chapel Hill (UNC)',
  'University of Notre Dame',
  'University of Pennsylvania',
  'University of Southern California (USC)',
  'University of Texas at Austin',
  'University of Virginia (UVA)',
  'Vanderbilt University',
  'Yale University'
]

const COLLEGES = [
  'Not Yet Enrolled',
  ...COLLEGE_NAMES.slice().sort((a, b) => a.localeCompare(b)),
  'Other'
]

export default function QuestionsPage() {
  const router = useRouter()
  const [schoolOption, setSchoolOption] = useState('')
  const [customSchool, setCustomSchool] = useState('')
  const [enrolled, setEnrolled] = useState<string>('')
  const [mbti, setMbti] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedSchool = schoolOption === 'Other' ? customSchool.trim() : schoolOption

    if (!selectedSchool || !enrolled || !mbti) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    // Store data in sessionStorage to pass to next pages
    const formData = {
      school: selectedSchool,
      enrolled: enrolled === 'yes',
      mbti
    }
    sessionStorage.setItem('questionData', JSON.stringify(formData))

    // Route based on enrollment status
    if (enrolled === 'yes') {
      router.push('/experience')
      setIsSubmitting(false)
      return
    }

    try {
      const responseData = {
        school: selectedSchool,
        enrolled: false,
        mbti,
        college: 'Other',
        fit: null,
        would_switch: null,
      }

      const { error } = await supabase.from('responses').insert([responseData])

      if (error) {
        console.error('Error inserting response:', error)
        alert('There was an issue saving your response. Please try again.')
        setIsSubmitting(false)
        return
      }

      sessionStorage.setItem('completeData', JSON.stringify(responseData))
      router.push(`/results?mbti=${encodeURIComponent(mbti)}`)
    } catch (error) {
      console.error('Unexpected error inserting response:', error)
      alert('There was an issue saving your response. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <Card className="w-full max-w-3xl border-0 shadow-2xl shadow-sky-100">
          <CardHeader className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-sky-500">Step 01</p>
            <CardTitle className="text-3xl font-semibold text-slate-900">
              Tell Us About You
            </CardTitle>
            <CardDescription>
              Provide the academic context we need to benchmark you against similar students.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* School Input */}
              <div className="space-y-2">
                <Label htmlFor="school" className="text-slate-700">What school do you attend?</Label>
                <Select
                  value={schoolOption}
                  onValueChange={(value) => {
                    setSchoolOption(value)
                    if (value !== 'Other') setCustomSchool('')
                  }}
                >
                  <SelectTrigger id="school" className="rounded-2xl border-slate-200 focus:ring-sky-200">
                    <SelectValue placeholder="Choose your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map((college) => (
                      <SelectItem key={college} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {schoolOption === 'Other' && (
                  <Input
                    className="mt-3 rounded-2xl border-slate-200 focus-visible:ring-2 focus-visible:ring-sky-200"
                    placeholder="Tell us your college"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                  />
                )}
                <p className="text-xs text-slate-500">If you don&apos;t see your college, choose “Other” and type it in.</p>
              </div>

              {/* Enrolled Status */}
              <div className="space-y-3">
                <Label className="text-slate-700">Have you enrolled in a degree already?</Label>
                <RadioGroup value={enrolled} onValueChange={setEnrolled} className="space-y-3">
                  {[
                    {
                      value: 'yes',
                      label: 'Yes, I am/was enrolled in a degree program',
                      helper: 'We will capture your program experience next.',
                    },
                    {
                      value: 'no',
                      label: 'No, I have not enrolled in a degree program',
                      helper: 'We can recommend a college based on your profile so far.',
                    },
                  ].map((option) => (
                    <div key={option.value} className="rounded-2xl border border-slate-200 p-4 hover:border-sky-200 transition">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={`enrolled-${option.value}`} />
                        <Label htmlFor={`enrolled-${option.value}`} className="font-medium text-slate-900 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="pl-7 text-sm text-slate-500">{option.helper}</p>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* MBTI Type */}
              <div className="space-y-2">
                <Label htmlFor="mbti" className="text-slate-700">Select your MBTI type</Label>
                <Select value={mbti} onValueChange={setMbti}>
                  <SelectTrigger id="mbti" className="rounded-2xl border-slate-200 focus:ring-sky-200">
                    <SelectValue placeholder="Choose your MBTI type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MBTI_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-500"
                >
                  <a href="/start">← Back to welcome</a>
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full bg-sky-600 hover:bg-sky-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sprinkling stardust...' : 'Next Step →'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
