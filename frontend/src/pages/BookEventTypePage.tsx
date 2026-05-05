import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { IconArrowRight, IconClock, IconPointFilled } from '@tabler/icons-react'
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getEventType, listSlots } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { SectionTitle } from '../components/SectionTitle'
import { StatusMessage } from '../components/StatusMessage'
import { SurfaceCard } from '../components/SurfaceCard'
import { useTranslation } from 'react-i18next'

const formatDate = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export function BookEventTypePage() {
  const { t } = useTranslation()
  const { eventTypeId } = useParams()
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const eventTypeRequest = useCallback(
    () => (eventTypeId ? getEventType(eventTypeId) : Promise.reject()),
    [eventTypeId],
  )
  const slotsRequest = useCallback(
    () => (eventTypeId ? listSlots(eventTypeId) : Promise.reject()),
    [eventTypeId],
  )
  const { data: eventType, loading, error } = useAsync(eventTypeRequest)
  const slotsState = useAsync(slotsRequest)

  dayjs.locale('ru')

  const calendarRange = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 13)
    return { today, maxDate }
  }, [])

  const handleDateChange = useCallback((value: Date | string | null) => {
    if (!value) {
      setSelectedDate(null)
      return
    }
    setSelectedDate(dayjs(value).toDate())
  }, [])

  const selectedDateKey = useMemo(
    () => (selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null),
    [selectedDate],
  )

  const slotsForDate = useMemo(() => {
    if (!selectedDateKey || !slotsState.data?.items.length) return []
    return slotsState.data.items
      .filter((slot) => dayjs(slot.start).format('YYYY-MM-DD') === selectedDateKey)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [selectedDateKey, slotsState.data])

  const availableDates = useMemo(() => {
    const set = new Set<string>()
    if (!slotsState.data?.items.length) return set
    slotsState.data.items.forEach((slot) => {
      if (slot.status !== 'free') return
      set.add(dayjs(slot.start).format('YYYY-MM-DD'))
    })
    return set
  }, [slotsState.data])

  useEffect(() => {
    if (!slotsState.data?.items.length) return

    const hasSelected = selectedDateKey ? availableDates.has(selectedDateKey) : false
    if (hasSelected) return

    const nextSlot = slotsState.data.items
      .filter((slot) => slot.status === 'free')
      .filter((slot) => {
        const slotDate = dayjs(slot.start)
        return slotDate.isAfter(dayjs(calendarRange.today).subtract(1, 'day'))
          && slotDate.isBefore(dayjs(calendarRange.maxDate).add(1, 'day'))
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0]

    if (!nextSlot) return

    setTimeout(() => {
      setSelectedDate(dayjs(nextSlot.start).toDate())
    }, 0)
  }, [availableDates, calendarRange, selectedDateKey, slotsState.data])

  const selectedDateLabel = selectedDate
    ? dayjs(selectedDate).format('D MMMM, dddd')
    : t('event.selectDate')

  if (!eventTypeId) {
    return (
      <Container size="lg" py={48}>
        <StatusMessage title={t('event.notFound')} variant="empty" />
      </Container>
    )
  }

  return (
    <Container size="lg" py={48}>
      <Stack gap="xl">
        {loading ? <StatusMessage title={t('event.loading')} variant="loading" /> : null}
        {error ? (
          <StatusMessage
            title={t('event.notFound')}
            description={t('confirm.errorDefault')}
            variant="error"
          />
        ) : null}
        {eventType ? (
          <SurfaceCard>
            <Stack gap="md">
              <SectionTitle
                overline={t('event.overline')}
                title={eventType.name}
                description={eventType.description}
              />
              <Group gap={8}>
                <IconClock size={18} color="var(--accent-strong)" />
                <Text size="sm" fw={600}>
                  {t('catalog.duration', { count: eventType.duration_minutes })}
                </Text>
              </Group>
            </Stack>
          </SurfaceCard>
        ) : null}

        <Grid gutter={24} align="start">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <SurfaceCard>
              <Stack gap="md">
                <Text fw={700} className="display-font">
                  {t('event.slotsOverline')}
                </Text>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  minDate={calendarRange.today}
                  maxDate={calendarRange.maxDate}
                  firstDayOfWeek={1}
                  locale="ru"
                  renderDay={(date) => {
                    const nativeDate = dayjs(date as unknown as Date).toDate()
                    const day = nativeDate.getDate()
                    const isAvailable = availableDates.has(dayjs(nativeDate).format('YYYY-MM-DD'))
                    return (
                      <Stack align="center" gap={2}>
                        <Text size="sm">{day}</Text>
                        {isAvailable ? (
                          <ThemeIcon size={6} radius="xl" color="orange">
                            <IconPointFilled size={6} />
                          </ThemeIcon>
                        ) : (
                          <span style={{ height: 6 }} />
                        )}
                      </Stack>
                    )
                  }}
                />
                <Text size="sm" c="var(--muted)">
                  {t('event.slotsSubtitle')}
                </Text>
              </Stack>
            </SurfaceCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <SectionTitle
                overline={t('event.slotsOverline')}
                title={t('event.slotsTitle')}
                description={t('event.slotsSubtitle')}
              />

              {slotsState.loading ? (
                <StatusMessage title={t('event.slotsLoading')} variant="loading" />
              ) : null}
              {slotsState.error ? (
                <StatusMessage
                  title={t('event.slotsError')}
                  description={t('confirm.errorDefault')}
                  variant="error"
                />
              ) : null}

              {!slotsState.loading && !slotsState.error && slotsForDate.length === 0 ? (
                <StatusMessage
                  title={t('event.slotsEmptyTitle')}
                  description={t('event.slotsEmptyForDate', { date: selectedDateLabel })}
                  variant="empty"
                />
              ) : null}

              {!slotsState.loading && !slotsState.error && slotsForDate.length ? (
                <SurfaceCard>
                  <Stack gap="sm">
                    <Text size="sm" c="var(--muted)">
                      {t('event.slotsForDate', { date: selectedDateLabel })}
                    </Text>
                    {slotsForDate.map((slot) => (
                      <Group key={slot.id} justify="space-between" align="center">
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>
                            {dayjs(slot.start).format('HH:mm')} – {dayjs(slot.end).format('HH:mm')}
                          </Text>
                          <Text size="xs" c="var(--muted)">
                            {t('event.endsAt', { time: formatDate(slot.end) })}
                          </Text>
                        </Stack>
                        <Group gap="sm">
                          <Badge color={slot.status === 'free' ? 'green' : 'gray'}>
                            {slot.status === 'free' ? t('event.free') : t('event.busy')}
                          </Badge>
                          {slot.status === 'free' ? (
                            <Button
                              component={Link}
                              to={`/book/${eventTypeId}/confirm?slot=${slot.id}`}
                              size="xs"
                              radius="xl"
                              color="orange"
                              rightSection={<IconArrowRight size={14} />}
                            >
                              {t('event.reserve')}
                            </Button>
                          ) : (
                            <Button size="xs" radius="xl" variant="light" color="gray" disabled>
                              {t('event.unavailable')}
                            </Button>
                          )}
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </SurfaceCard>
              ) : null}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}
