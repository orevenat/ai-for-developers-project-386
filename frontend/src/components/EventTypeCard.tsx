import { Group, Stack, Text, Title } from '@mantine/core'
import { IconArrowRight, IconClock, IconUser } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { SurfaceCard } from './SurfaceCard'

type EventTypeCardProps = {
  id: string
  name: string
  description: string
  duration: number
  typeLabel: string
  selectLabel: string
  ctaLabel: string
}

export function EventTypeCard({
  id,
  name,
  description,
  duration,
  typeLabel,
  selectLabel,
  ctaLabel,
}: EventTypeCardProps) {
  return (
    <Link to={`/book/${id}`} style={{ display: 'block' }}>
      <SurfaceCard
        className="event-card"
        style={{ transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease' }}
      >
        <Stack gap="md">
          <Stack gap={6}>
            <Title order={3} className="display-font" fz={22}>
              {name}
            </Title>
            <Text size="sm" c="var(--muted)">
              {description}
            </Text>
          </Stack>
          <Group justify="space-between">
            <Group gap={6}>
              <IconClock size={18} color="var(--accent-strong)" />
              <Text size="sm" fw={600}>
                {duration} мин
              </Text>
            </Group>
            <Group gap={6}>
              <IconUser size={18} color="var(--accent-strong)" />
              <Text size="sm" fw={600}>
                {typeLabel}
              </Text>
            </Group>
          </Group>
          <Group justify="space-between" mt="xs">
            <Text size="sm" c="var(--muted)">
              {selectLabel}
            </Text>
            <Group gap={6}>
              <Text size="sm" fw={600} c="var(--accent-strong)">
                {ctaLabel}
              </Text>
              <IconArrowRight size={16} color="var(--accent-strong)" />
            </Group>
          </Group>
        </Stack>
      </SurfaceCard>
    </Link>
  )
}
