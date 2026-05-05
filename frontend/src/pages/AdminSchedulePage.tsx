import { Button, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { listAdminSchedule } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { StatusMessage } from '../components/StatusMessage'
import { SurfaceCard } from '../components/SurfaceCard'
import { useTranslation } from 'react-i18next'

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000)

const formatDate = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminSchedulePage() {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(new Date())
  const endDate = addDays(startDate, 6)
  const scheduleRequest = useCallback(
    () => listAdminSchedule(startDate.toISOString(), endDate.toISOString()),
    [startDate, endDate],
  )
  const { data, loading, error } = useAsync(scheduleRequest)

  return (
    <Container size="lg" py={32}>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconCalendar size={22} color="var(--accent-strong)" />
            <Title order={3} className="display-font">
              {t('schedule.title')}
            </Title>
          </Group>
          <Group>
            <Button
              variant="light"
              radius="xl"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setStartDate(addDays(startDate, -7))}
            >
              {t('schedule.previous')}
            </Button>
            <Button
              variant="light"
              radius="xl"
              rightSection={<IconChevronRight size={16} />}
              onClick={() => setStartDate(addDays(startDate, 7))}
            >
              {t('schedule.next')}
            </Button>
          </Group>
        </Group>

        {loading ? <StatusMessage title={t('schedule.loading')} variant="loading" /> : null}
        {error ? (
          <StatusMessage
            title={t('schedule.error')}
            description={t('confirm.errorDefault')}
            variant="error"
          />
        ) : null}

        {!loading && !error && data?.items.length === 0 ? (
          <StatusMessage title={t('schedule.empty')} variant="empty" />
        ) : null}

        {!loading && !error && data?.items.length ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={20}>
            {data.items.map((slot) => (
              <SurfaceCard key={slot.id}>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text fw={600}>
                      {slot.status === 'free' ? t('schedule.free') : t('schedule.busy')}
                    </Text>
                    <Text size="sm" c="var(--muted)">
                      {slot.event_type_id}
                    </Text>
                  </Group>
                  <Text size="sm" c="var(--muted)">
                    {formatDate(slot.start)} — {formatDate(slot.end)}
                  </Text>
                </Stack>
              </SurfaceCard>
            ))}
          </SimpleGrid>
        ) : null}
      </Stack>
    </Container>
  )
}
