import { Button, Container, Group, Stack, Table, Text, Title } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'
import { cancelAdminBooking, listUpcomingBookings } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { StatusMessage } from '../components/StatusMessage'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const formatDate = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminBookingsPage() {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useAsync(listUpcomingBookings)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const bookings = useMemo(() => data?.items ?? [], [data])

  return (
    <Container size="lg" py={32}>
      <Stack gap="lg">
        <Group gap="sm">
          <IconCalendarEvent size={22} color="var(--accent-strong)" />
          <Title order={3} className="display-font">
            {t('bookings.title')}
          </Title>
        </Group>
        {loading ? <StatusMessage title={t('bookings.loading')} variant="loading" /> : null}
        {error ? (
          <StatusMessage
            title={t('bookings.error')}
            description={t('confirm.errorDefault')}
            variant="error"
          />
        ) : null}
        {actionError ? (
          <StatusMessage title={t('bookings.error')} description={actionError} variant="error" />
        ) : null}
        {!loading && !error && bookings.length === 0 ? (
          <StatusMessage title={t('bookings.empty')} variant="empty" />
        ) : null}
        {!loading && !error && bookings.length ? (
          <Table withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('bookings.columns.event')}</Table.Th>
                <Table.Th>{t('bookings.columns.guest')}</Table.Th>
                <Table.Th>{t('bookings.columns.email')}</Table.Th>
                <Table.Th>{t('bookings.columns.meeting')}</Table.Th>
                <Table.Th>{t('bookings.columns.status')}</Table.Th>
                <Table.Th>{t('bookings.columns.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled'
                return (
                  <Table.Tr key={booking.id}>
                    <Table.Td>{booking.event_type_name}</Table.Td>
                    <Table.Td>{booking.name}</Table.Td>
                    <Table.Td>{booking.email}</Table.Td>
                    <Table.Td>{formatDate(booking.slot_start)}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c={isCancelled ? 'var(--muted)' : 'inherit'}>
                        {t(`bookings.status.${booking.status}`)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {!isCancelled ? (
                        <Button
                          radius="xl"
                          size="xs"
                          color="orange"
                          disabled={pendingId === booking.id}
                          loading={pendingId === booking.id}
                          onClick={async () => {
                            setActionError(null)
                            setPendingId(booking.id)
                            try {
                              await cancelAdminBooking(booking.id)
                              reload()
                            } catch {
                              setActionError(t('confirm.errorDefault'))
                            } finally {
                              setPendingId(null)
                            }
                          }}
                        >
                          {t('bookings.cancel')}
                        </Button>
                      ) : (
                        <Text size="sm" c="var(--muted)">
                          —
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        ) : null}
      </Stack>
    </Container>
  )
}
