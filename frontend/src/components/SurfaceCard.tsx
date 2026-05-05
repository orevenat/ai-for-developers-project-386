import { Paper } from '@mantine/core'
import type { CSSProperties } from 'react'

type SurfaceCardProps = {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

export function SurfaceCard({ children, className, style }: SurfaceCardProps) {
  return (
    <Paper
      radius="lg"
      p="xl"
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid var(--card-border, var(--border))',
        boxShadow: 'var(--card-shadow, var(--shadow))',
        ...style,
      }}
    >
      {children}
    </Paper>
  )
}
