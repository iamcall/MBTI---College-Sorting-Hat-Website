import { CollegeStats } from '@/lib/recommendations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CollegeComparisonProps {
  colleges: CollegeStats[]
  recommendedCollege: string
}

export function CollegeComparison({ colleges, recommendedCollege }: CollegeComparisonProps) {
  if (colleges.length === 0) return null

  const maxResponses = Math.max(...colleges.map((college) => college.totalResponses))

  return (
    <Card>
      <CardHeader>
        <CardTitle>College Comparison</CardTitle>
        <CardDescription>
          How the top colleges compare for your personality type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {colleges.map((college) => (
          <div key={college.college} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className={`font-semibold ${college.college === recommendedCollege ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {college.college}
                  {college.college === recommendedCollege && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  {college.totalResponses === maxResponses && maxResponses > 0 && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span aria-hidden="true">★</span>
                      <span>Most popular</span>
                    </span>
                  )}
                </h4>
              </div>
              <span className="text-sm text-muted-foreground">
                {college.totalResponses} responses
              </span>
            </div>

            {/* Fit Rate Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Personality Fit Rate</span>
                <span className="font-semibold text-green-600">{college.fitRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${college.fitRate}%` }}
                />
              </div>
            </div>

            {/* Switch Rate Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Would Switch Rate</span>
                <span className="font-semibold text-orange-600">{college.switchRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-orange-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${college.switchRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p className="mb-2"><strong>How to read this chart:</strong></p>
          <ul className="space-y-1 ml-4 list-disc">
            <li><span className="text-green-600 font-semibold">Personality Fit Rate:</span> Higher is better (more students feel their major fits their personality)</li>
            <li><span className="text-orange-600 font-semibold">Would Switch Rate:</span> Lower is better (fewer students regret their choice)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
