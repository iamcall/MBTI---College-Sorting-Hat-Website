import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StartPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-20">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-200/15 px-6 py-2 text-sm uppercase tracking-[0.4em] text-amber-100">
          <Sparkles className="h-4 w-4 text-amber-200" />
          Welcome
        </div>
        <h1 className="text-4xl font-serif text-amber-100 drop-shadow lg:text-6xl">
          Welcome to Your College Sorting Hat
        </h1>
        <p className="text-lg text-indigo-100/80 max-w-2xl mx-auto">
          Using your MBTI to predict satisfaction and fit within colleges
        </p>
        <div className="pt-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-amber-300 text-slate-900 text-lg font-semibold px-10 py-6 hover:bg-amber-200 transition"
          >
            <Link href="/questions">Start</Link>
          </Button>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-100/70">
          powered by real data
        </p>
      </div>
    </div>
  )
}
