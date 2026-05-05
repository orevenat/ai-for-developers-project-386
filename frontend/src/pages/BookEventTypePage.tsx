import { Badge, Button, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { IconArrowRight, IconClock, IconPointFilled } from '@tabler/icons-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getEventType, listSlots } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { BookingSummaryPanel } from '../components/BookingSummaryPanel'
import { StatusMessage } from '../components/StatusMessage'
import { SurfaceCard } from '../components/SurfaceCard'
import { useTranslation } from 'react-i18next'

export function BookEventTypePage() {
  const { t } = useTranslation()
  const { eventTypeId } = useParams()
  const [searchParams] = useSearchParams()
  const selectedSlotId = searchParams.get('slot')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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


  const selectedSlot = useMemo(() => {
    if (!selectedSlotId || !slotsState.data?.items.length) return null
    return slotsState.data.items.find((slot) => String(slot.id) === selectedSlotId) ?? null
  }, [selectedSlotId, slotsState.data])

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
  const selectedTimeLabel = selectedSlot
    ? dayjs(selectedSlot.start).format('HH:mm')
    : t('event.selectTime')
  const showSelectDateHint = !selectedDate

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
        <Title order={2} className="display-font">
          {t('event.pageTitle')}
        </Title>

        <Grid gutter={24} align="start">
          <Grid.Col span={{ base: 12, md: 4 }}>
            {eventType ? (
              <BookingSummaryPanel
                organizerName={t('catalog.organizerName')}
                organizerRole={t('catalog.organizer')}
                eventName={eventType.name}
                eventDescription={eventType.description}
                durationMinutes={eventType.duration_minutes}
                selectedDateLabel={selectedDateLabel}
                selectedTimeLabel={selectedTimeLabel}
              />
            ) : null}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <SurfaceCard>
              <Stack gap="md">
                <Text fw={700} className="display-font">
                  {t('event.selectDateTitle')}
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
                  {t('event.selectDateHelp')}
                </Text>
              </Stack>
            </SurfaceCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">

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

               {!slotsState.loading && !slotsState.error && showSelectDateHint ? (
                 <StatusMessage title={t('event.selectDateHint')} variant="empty" />
               ) : null}

               {!slotsState.loading
               && !slotsState.error
               && !showSelectDateHint
               && slotsForDate.length === 0 ? (
                 <StatusMessage
                   title={t('event.slotsEmptyTitle')}
                   description={t('event.slotsEmptyForDate', { date: selectedDateLabel })}
                   variant="empty"
                 />
              ) : null}

               {!slotsState.loading && !slotsState.error && slotsForDate.length ? (
                 <SurfaceCard>
                   <Stack gap="md">
                     <Text fw={700} className="display-font">
                       {t('event.selectTimeTitle')}
                     </Text>
                     <Text size="sm" c="var(--muted)">
                       {t('event.slotsForDate', { date: selectedDateLabel })}
                     </Text>
                     <Stack gap="xs">
                       {slotsForDate.map((slot) => {
                         const isSelected = selectedSlotId === String(slot.id)
                         const isFree = slot.status === 'free'
                         return (
                           <Button
                             key={slot.id}
                             component={isFree ? Link : 'button'}
                             to={isFree ? `/book/${eventTypeId}?slot=${slot.id}` : undefined}
                             size="sm"
                             radius="xl"
                             color={isSelected ? 'dark' : isFree ? 'orange' : 'gray'}
                             variant={isSelected ? 'filled' : 'light'}
                             disabled={!isFree}
                             fullWidth
                           >
                             <Group justify="space-between" w="100%">
                               <Group gap={8}>
                                 <IconClock size={16} />
                                 <Text size="sm" fw={600}>
                                   {dayjs(slot.start).format('HH:mm')} – {dayjs(slot.end).format('HH:mm')}
                                 </Text>
                               </Group>
                               <Text size="sm" fw={600}>
                                 {isFree ? t('event.free') : t('event.busy')}
                               </Text>
                             </Group>
                           </Button>
                         )
                       })}
                     </Stack>
                     <Group justify="space-between" mt="md">
                       <Button
                         component={Link}
                         to="/book"
                         variant="subtle"
                         radius="xl"
                         color="orange"
                       >
                         {t('event.back')}
                       </Button>
                       <Button
                         component={Link}
                         to={
                           selectedSlotId
                             ? `/book/${eventTypeId}/confirm?slot=${selectedSlotId}`
                             : `/book/${eventTypeId}`
                         }
                         radius="xl"
                         color="orange"
                         rightSection={<IconArrowRight size={16} />}
                         disabled={!selectedSlotId}
                       >
                         {t('event.continue')}
                       </Button>
                     </Group>
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
