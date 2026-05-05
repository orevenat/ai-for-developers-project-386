import { Paper } from '@mantine/core'

export function SurfaceCard({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      radius="lg"
      p="xl"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {children}
    </Paper>
  )
}
