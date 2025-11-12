import { memo, useMemo } from 'react'
import type { CollegeStats } from '@/lib/recommendations'

interface PersonalityScatterProps {
  data: CollegeStats[]
  mbti: string
}

const CHART_PADDING = 48
const WIDTH = 680
const HEIGHT = 360

export const PersonalityScatter = memo(({ data, mbti }: PersonalityScatterProps) => {
  const hasData = data.length > 0

  const { points, maxSwitch, maxFit, minSwitch, minFit } = useMemo(() => {
    if (!hasData) {
      return {
        points: [],
        maxSwitch: 100,
        maxFit: 100,
        minSwitch: 0,
        minFit: 0,
      }
    }

    const switchValues = data.map((college) => college.switchRate)
    const fitValues = data.map((college) => college.fitRate)

    const maxSwitchValue = Math.max(...switchValues, 30)
    const minSwitchValue = Math.min(...switchValues, 0)
    const maxFitValue = Math.max(...fitValues, 50)
    const minFitValue = Math.min(...fitValues, 50)

    const paddingSwitch = Math.max(5, (maxSwitchValue - minSwitchValue) * 0.15)
    const paddingFit = Math.max(5, (maxFitValue - minFitValue) * 0.15)

    const chartMaxSwitch = Math.min(100, maxSwitchValue + paddingSwitch)
    const chartMinSwitch = Math.max(0, minSwitchValue - paddingSwitch)
    const chartMaxFit = Math.min(100, maxFitValue + paddingFit)
    const chartMinFit = Math.max(0, minFitValue - paddingFit)

    const scaleX = (value: number) => {
      const ratio = (value - chartMinSwitch) / (chartMaxSwitch - chartMinSwitch || 1)
      return CHART_PADDING + ratio * (WIDTH - CHART_PADDING * 2)
    }

    const scaleY = (value: number) => {
      const ratio = (value - chartMinFit) / (chartMaxFit - chartMinFit || 1)
      return HEIGHT - CHART_PADDING - ratio * (HEIGHT - CHART_PADDING * 2)
    }

    const computedPoints = data.map((college) => ({
      ...college,
      x: scaleX(college.switchRate),
      y: scaleY(college.fitRate),
      labelOffset: 0,
    }))

    // Nudge labels when multiple colleges share exact percentages
    const duplicates = new Map<string, typeof computedPoints>()
    computedPoints.forEach((point) => {
      const key = `${point.switchRate}-${point.fitRate}`
      const group = duplicates.get(key) ?? []
      group.push(point)
      duplicates.set(key, group)
    })

    duplicates.forEach((group) => {
      if (group.length === 1) return
      group.forEach((point, index) => {
        point.labelOffset = (index - (group.length - 1) / 2) * 14
      })
    })

    return {
      points: computedPoints,
      maxSwitch: chartMaxSwitch,
      maxFit: chartMaxFit,
      minSwitch: chartMinSwitch,
      minFit: chartMinFit,
    }
  }, [data, hasData])

  if (!hasData) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        Not enough MBTI-specific responses to draw the chart (yet!). Invite a friend with your type to take the quiz.
      </div>
    )
  }

  const gridLines = 4
  const horizontalTicks = Array.from({ length: gridLines + 1 }).map((_, index) => {
    const ratio = index / gridLines
    const value = minSwitch + ratio * (maxSwitch - minSwitch)
    const x = CHART_PADDING + ratio * (WIDTH - CHART_PADDING * 2)
    return { x, value }
  })
  const verticalTicks = Array.from({ length: gridLines + 1 }).map((_, index) => {
    const ratio = index / gridLines
    const value = maxFit - ratio * (maxFit - minFit)
    const y = CHART_PADDING + ratio * (HEIGHT - CHART_PADDING * 2)
    return { y, value }
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Per College</p>
          <h3 className="text-2xl font-semibold text-slate-900">How {mbti} students feel</h3>
          <p className="text-sm text-slate-500">
            Higher is better fit, farther right means more would switch.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-indigo-50">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          className="w-full"
        >
          {/* Grid */}
          {Array.from({ length: gridLines + 1 }).map((_, index) => {
            const y = CHART_PADDING + (index / gridLines) * (HEIGHT - CHART_PADDING * 2)
            return (
              <line
                // eslint-disable-next-line react/no-array-index-key
                key={`h-${index}`}
                x1={CHART_PADDING}
                x2={WIDTH - CHART_PADDING}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
            )
          })}
          {Array.from({ length: gridLines + 1 }).map((_, index) => {
            const x = CHART_PADDING + (index / gridLines) * (WIDTH - CHART_PADDING * 2)
            return (
              <line
                // eslint-disable-next-line react/no-array-index-key
                key={`v-${index}`}
                x1={x}
                x2={x}
                y1={CHART_PADDING}
                y2={HEIGHT - CHART_PADDING}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
            )
          })}

          {/* Axes */}
          <line
            x1={CHART_PADDING}
            x2={WIDTH - CHART_PADDING}
            y1={HEIGHT - CHART_PADDING}
            y2={HEIGHT - CHART_PADDING}
            stroke="#94a3b8"
          />
          <line
            x1={CHART_PADDING}
            x2={CHART_PADDING}
            y1={CHART_PADDING}
            y2={HEIGHT - CHART_PADDING}
            stroke="#94a3b8"
          />

          {/* Axis ticks & labels */}
          {horizontalTicks.map((tick) => (
            <g key={`xtick-${tick.x}`}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={HEIGHT - CHART_PADDING}
                y2={HEIGHT - CHART_PADDING + 8}
                stroke="#94a3b8"
              />
              <text
                x={tick.x}
                y={HEIGHT - CHART_PADDING + 24}
                textAnchor="middle"
                fill="#475569"
                fontSize="12"
              >
                {tick.value.toFixed(0)}%
              </text>
            </g>
          ))}
          {verticalTicks.map((tick) => (
            <g key={`ytick-${tick.y}`}>
              <line
                x1={CHART_PADDING - 8}
                x2={CHART_PADDING}
                y1={tick.y}
                y2={tick.y}
                stroke="#94a3b8"
              />
              <text
                x={CHART_PADDING - 14}
                y={tick.y + 4}
                textAnchor="end"
                fill="#475569"
                fontSize="12"
              >
                {tick.value.toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={WIDTH / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            fill="#334155"
            fontSize="13"
          >
            % Who Would Switch Majors
          </text>
          <text
            x={-(HEIGHT / 2)}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#334155"
            fontSize="13"
          >
            % Who Feel Their Major Fits
          </text>

          {/* Points */}
          {points.map((point) => (
            <g key={point.college}>
              <circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill="url(#pointGradient)"
                stroke="#6366f1"
                strokeWidth={2}
              />
              <text
                x={point.x + 12}
                y={point.y - 10 + point.labelOffset}
                fill="#1f2937"
                fontSize="11"
                fontWeight={500}
              >
                {point.college}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id="pointGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#f0abfc" />
            </linearGradient>
          </defs>
        </svg>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span>Fit range: {minFit.toFixed(0)}% - {maxFit.toFixed(0)}%</span>
          <span>Switch range: {minSwitch.toFixed(0)}% - {maxSwitch.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
})

PersonalityScatter.displayName = 'PersonalityScatter'
