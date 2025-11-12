import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Response {
  id?: string
  timestamp?: string
  school: string
  enrolled: boolean
  mbti: string
  college?: string | null
  fit?: boolean | null
  would_switch?: boolean | null
}
