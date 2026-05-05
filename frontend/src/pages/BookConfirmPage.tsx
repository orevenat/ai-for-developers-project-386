import { Button, Container, Divider, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import { IconCheck, IconMail, IconUser } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useCallback, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { createBooking, getEventType, listSlots } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { StatusMessage } from '../components/StatusMessage'
import { useTranslation } from 'react-i18next'

export function BookConfirmPage() {
  const { t } = useTranslation()
  const { eventTypeId } = useParams()
  const [searchParams] = useSearchParams()
  const slotId = searchParams.get('slot')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventTypeRequest = useCallback(
    () => (eventTypeId ? getEventType(eventTypeId) : Promise.reject()),
    [eventTypeId],
  )
  const slotsRequest = useCallback(
    () => (eventTypeId ? listSlots(eventTypeId) : Promise.reject()),
    [eventTypeId],
  )
  const eventState = useAsync(eventTypeRequest)
  const slotsState = useAsync(slotsRequest)

  const form = useForm({
    initialValues: { name: '', email: '' },
    validate: {
      name: (value) => (value.trim().length < 2 ? t('confirm.nameError') : null),
      email: (value) => (/\S+@\S+\.\S+/.test(value) ? null : t('confirm.emailError')),
    },
  })

  const bookingPayload = useMemo(() => {
    if (!eventTypeId || !slotId) return null
    return { event_type_id: eventTypeId, slot_id: Number(slotId) }
  }, [eventTypeId, slotId])

  const selectedSlot = useMemo(() => {
    if (!slotId || !slotsState.data?.items.length) return null
    return slotsState.data.items.find((slot) => String(slot.id) === slotId) ?? null
  }, [slotId, slotsState.data])

  if (!eventTypeId || !slotId) {
    return (
      <Container size="sm" py={48}>
        <StatusMessage
          title={t('confirm.notEnough')}
          description={t('confirm.notEnoughBody')}
          variant="empty"
        />
      </Container>
    )
  }

  const handleSubmit = async (values: { name: string; email: string }) => {
    if (!bookingPayload) return
    setError(null)
    try {
      await createBooking({ ...bookingPayload, ...values })
      setSuccess(true)
    } catch (requestError) {
      if (typeof requestError === 'object' && requestError && 'body' in requestError) {
        const body = (requestError as { body?: { message?: string } }).body
        setError(body?.message ?? t('confirm.errorDefault'))
        return
      }
      setError(t('confirm.errorDefault'))
    }
  }

  if (success) {
    return (
      <Container size="sm" py={48}>
        <Paper radius="lg" p="xl" style={{ background: 'white' }}>
          <Stack align="center" gap="md">
            <IconCheck size={46} color="#2f9e44" />
            <Title order={3} className="display-font">
              {t('confirm.successTitle')}
            </Title>
            <Text ta="center" c="var(--muted)">
              {t('confirm.successBody')}
            </Text>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="sm" py={48}>
      <Paper radius="lg" p="xl" style={{ background: 'white' }}>
        <Stack gap="lg">
          <Stack gap={6}>
            <Text size="sm" c="var(--muted)">
              {t('confirm.title')}
            </Text>
            <Title order={2} className="display-font">
              {eventState.data?.name ?? t('confirm.selectedEvent')}
            </Title>
            <Text size="sm" c="var(--muted)">
              {t('confirm.subtitle')}
            </Text>
          </Stack>

          <Stack gap={6}>
            <Group justify="space-between">
              <Text size="sm" c="var(--muted)">
                {t('confirm.summaryDate')}
              </Text>
              <Text fw={600}>{selectedSlot ? new Date(selectedSlot.start).toLocaleDateString('ru-RU') : '—'}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="var(--muted)">
                {t('confirm.summaryTime')}
              </Text>
              <Text fw={600}>
                {selectedSlot
                  ? `${new Date(selectedSlot.start).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} – ${new Date(selectedSlot.end).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : '—'}
              </Text>
            </Group>
          </Stack>

          <Divider color="var(--border)" />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label={t('confirm.name')}
                placeholder={t('confirm.namePlaceholder')}
                leftSection={<IconUser size={16} />}
                radius="md"
                {...form.getInputProps('name')}
              />
              <TextInput
                label={t('confirm.email')}
                placeholder={t('confirm.emailPlaceholder')}
                leftSection={<IconMail size={16} />}
                radius="md"
                {...form.getInputProps('email')}
              />
              {error ? (
                <Text size="sm" c="#d9480f">
                  {error}
                </Text>
              ) : null}
              <Group justify="space-between">
                <Button
                  component={Link}
                  to={`/book/${eventTypeId}?slot=${slotId}`}
                  variant="subtle"
                  radius="xl"
                  color="orange"
                >
                  {t('confirm.back')}
                </Button>
                <Button type="submit" radius="xl" color="orange">
                  {t('confirm.submit')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
