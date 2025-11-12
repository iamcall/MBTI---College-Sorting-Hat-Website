/**
 * Test script for recommendation algorithm
 *
 * Usage:
 * 1. Create .env.local with your Supabase credentials
 * 2. Run: npx tsx test-recommendations.ts
 *
 * This script will:
 * - Test the recommendation function with different MBTI types
 * - Show you what data exists for each MBTI
 * - Display the recommendation results
 */

import { recommendCollege, generateExplanation } from './lib/recommendations'

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

async function testRecommendations() {
  console.log('🎓 Testing College Recommendation Algorithm\n')
  console.log('=' .repeat(60))

  for (const mbti of MBTI_TYPES) {
    console.log(`\n📊 Testing MBTI Type: ${mbti}`)
    console.log('-'.repeat(60))

    try {
      const result = await recommendCollege(mbti)

      console.log(`Total data points: ${result.totalDataPoints}`)
      console.log(`Has enough data: ${result.hasEnoughData ? '✅' : '❌'}`)

      if (result.recommended) {
        console.log(`\n🎯 RECOMMENDED: ${result.recommended.college}`)
        console.log(`   Fit Rate: ${result.recommended.fitRate.toFixed(1)}%`)
        console.log(`   Switch Rate: ${result.recommended.switchRate.toFixed(1)}%`)
        console.log(`   Score: ${result.recommended.score.toFixed(2)}`)
        console.log(`   Responses: ${result.recommended.totalResponses}`)
        console.log(`\n   Explanation:`)
        console.log(`   ${generateExplanation(result.recommended, mbti)}`)

        if (result.alternatives.length > 0) {
          console.log(`\n   Alternatives:`)
          result.alternatives.forEach((alt, index) => {
            console.log(`   ${index + 1}. ${alt.college}`)
            console.log(`      Fit: ${alt.fitRate.toFixed(1)}%, Switch: ${alt.switchRate.toFixed(1)}%, Score: ${alt.score.toFixed(2)}`)
          })
        }
      } else {
        console.log('   ⚠️  Not enough data for recommendations')
        if (result.totalDataPoints > 0) {
          console.log(`   Found ${result.totalDataPoints} response(s), but need ≥2 per college`)
        }
      }

    } catch (error) {
      console.error(`   ❌ Error testing ${mbti}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Test complete!\n')
}

// Run if executed directly
if (require.main === module) {
  testRecommendations().catch(console.error)
}

export { testRecommendations }
