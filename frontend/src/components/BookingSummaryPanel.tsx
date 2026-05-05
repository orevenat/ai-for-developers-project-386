import { Divider, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import {
  IconCalendarEvent,
  IconClock,
  IconUser,
  IconCalendarTime,
} from '@tabler/icons-react'
import { SurfaceCard } from './SurfaceCard'

type BookingSummaryPanelProps = {
  organizerName: string
  organizerRole: string
  eventName: string
  eventDescription?: string
  durationMinutes?: number
  selectedDateLabel: string
  selectedTimeLabel: string
}

export function BookingSummaryPanel({
  organizerName,
  organizerRole,
  eventName,
  eventDescription,
  durationMinutes,
  selectedDateLabel,
  selectedTimeLabel,
}: BookingSummaryPanelProps) {
  return (
    <SurfaceCard>
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon size={34} radius="xl" variant="light" color="orange">
            <IconUser size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700} className="display-font">
              {organizerName}
            </Text>
            <Text size="sm" c="var(--muted)">
              {organizerRole}
            </Text>
          </Stack>
        </Group>

        <Divider color="var(--border)" />

        <Group gap="sm" align="flex-start">
          <ThemeIcon size={34} radius="xl" variant="light" color="orange">
            <IconCalendarEvent size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="sm" c="var(--muted)">
              Тип встречи
            </Text>
            <Text fw={600}>{eventName}</Text>
            {eventDescription ? (
              <Text size="sm" c="var(--muted)">
                {eventDescription}
              </Text>
            ) : null}
          </Stack>
        </Group>

        <Group gap="sm" align="flex-start">
          <ThemeIcon size={34} radius="xl" variant="light" color="orange">
            <IconClock size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="sm" c="var(--muted)">
              Длительность
            </Text>
            <Text fw={600}>{durationMinutes ? `${durationMinutes} мин` : '—'}</Text>
          </Stack>
        </Group>

        <Divider color="var(--border)" />

        <Group gap="sm" align="flex-start">
          <ThemeIcon size={34} radius="xl" variant="light" color="orange">
            <IconCalendarEvent size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="sm" c="var(--muted)">
              Дата
            </Text>
            <Text fw={600}>{selectedDateLabel}</Text>
          </Stack>
        </Group>

        <Group gap="sm" align="flex-start">
          <ThemeIcon size={34} radius="xl" variant="light" color="orange">
            <IconCalendarTime size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="sm" c="var(--muted)">
              Время
            </Text>
            <Text fw={600}>{selectedTimeLabel}</Text>
          </Stack>
        </Group>
      </Stack>
    </SurfaceCard>
  )
}
