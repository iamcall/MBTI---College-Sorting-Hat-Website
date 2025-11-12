import { supabase } from './supabase'

export interface CollegeStats {
  college: string
  totalResponses: number
  fitRate: number // percentage (0-100)
  switchRate: number // percentage (0-100)
  score: number // computed ranking score
}

export interface RecommendationResult {
  recommended: CollegeStats | null
  alternatives: CollegeStats[]
  totalDataPoints: number
  hasEnoughData: boolean
  allColleges: CollegeStats[]
}

/**
 * Recommends colleges based on MBTI type and crowdsourced data
 * @param mbti The MBTI type to get recommendations for
 * @returns Recommendation result with top college and alternatives
 */
export async function recommendCollege(mbti: string): Promise<RecommendationResult> {
  try {
    // Query all responses for this MBTI type where college is not null
    // (only enrolled students have college data)
    const { data, error } = await supabase
      .from('responses')
      .select('college, fit, would_switch')
      .eq('mbti', mbti)
      .eq('enrolled', true)
      .not('college', 'is', null)

    if (error) {
      console.error('Error fetching data from Supabase:', error)
      return {
        recommended: null,
        alternatives: [],
        totalDataPoints: 0,
        hasEnoughData: false,
        allColleges: []
      }
    }

    if (!data || data.length === 0) {
      console.log(`No data found for MBTI type: ${mbti}`)
      return {
        recommended: null,
        alternatives: [],
        totalDataPoints: 0,
        hasEnoughData: false,
        allColleges: []
      }
    }

    // Group responses by college
    const collegeGroups = new Map<string, { fit: boolean[], wouldSwitch: boolean[] }>()

    data.forEach((response) => {
      if (!response.college) return

      if (!collegeGroups.has(response.college)) {
        collegeGroups.set(response.college, { fit: [], wouldSwitch: [] })
      }

      const group = collegeGroups.get(response.college)!

      // Only count responses where fit and would_switch are not null
      if (response.fit !== null) {
        group.fit.push(response.fit)
      }
      if (response.would_switch !== null) {
        group.wouldSwitch.push(response.would_switch)
      }
    })

    // Calculate stats for each college
    const collegeStats: CollegeStats[] = []

    collegeGroups.forEach((group, collegeName) => {
      const totalResponses = Math.max(group.fit.length, group.wouldSwitch.length)

      // Only include colleges with at least 2 responses
      if (totalResponses < 2) return

      // Calculate fit rate (percentage of TRUE values)
      const fitRate = group.fit.length > 0
        ? (group.fit.filter(f => f === true).length / group.fit.length) * 100
        : 0

      // Calculate switch rate (percentage of TRUE values - higher means more people would switch)
      const switchRate = group.wouldSwitch.length > 0
        ? (group.wouldSwitch.filter(s => s === true).length / group.wouldSwitch.length) * 100
        : 0

      // Calculate ranking score
      // Higher fit rate is better, lower switch rate is better
      // Weight fit rate more heavily (70/30 split)
      const score = (fitRate * 0.7) + ((100 - switchRate) * 0.3)

      collegeStats.push({
        college: collegeName,
        totalResponses,
        fitRate: Math.round(fitRate * 10) / 10, // Round to 1 decimal
        switchRate: Math.round(switchRate * 10) / 10, // Round to 1 decimal
        score
      })
    })

    // Sort by score (highest first)
    collegeStats.sort((a, b) => b.score - a.score)

    // Return results
    if (collegeStats.length === 0) {
      return {
        recommended: null,
        alternatives: [],
        totalDataPoints: data.length,
        hasEnoughData: false,
        allColleges: []
      }
    }

    return {
      recommended: collegeStats[0],
      alternatives: collegeStats.slice(1, 3), // Next 2 alternatives
      totalDataPoints: data.length,
      hasEnoughData: true,
      allColleges: collegeStats
    }

  } catch (error) {
    console.error('Error in recommendCollege:', error)
    return {
      recommended: null,
      alternatives: [],
      totalDataPoints: 0,
      hasEnoughData: false,
      allColleges: []
    }
  }
}

/**
 * Generates an explanation for why a college is recommended
 * @param stats College statistics
 * @param mbti MBTI type
 * @returns Explanation string
 */
export function generateExplanation(stats: CollegeStats, mbti: string): string {
  const fitDescription = stats.fitRate >= 75 ? 'excellent' :
                         stats.fitRate >= 60 ? 'strong' :
                         stats.fitRate >= 50 ? 'good' : 'moderate'

  const switchDescription = stats.switchRate <= 20 ? 'rarely' :
                            stats.switchRate <= 35 ? 'infrequently' :
                            stats.switchRate <= 50 ? 'sometimes' : 'often'

  return `Based on ${stats.totalResponses} ${mbti} students in this college, ` +
         `${stats.fitRate.toFixed(0)}% report that their major fits their personality (${fitDescription} fit rate), ` +
         `and ${stats.switchRate.toFixed(0)}% say they would switch if they could go back (students ${switchDescription} regret this choice).`
}
