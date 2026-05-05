import { Container, Group, Stack, Table, Title } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'
import { listUpcomingBookings } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { StatusMessage } from '../components/StatusMessage'
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
  const { data, loading, error } = useAsync(listUpcomingBookings)

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
        {!loading && !error && data?.items.length === 0 ? (
          <StatusMessage title={t('bookings.empty')} variant="empty" />
        ) : null}
        {!loading && !error && data?.items.length ? (
          <Table withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('bookings.columns.event')}</Table.Th>
                <Table.Th>{t('bookings.columns.guest')}</Table.Th>
                <Table.Th>{t('bookings.columns.email')}</Table.Th>
                <Table.Th>{t('bookings.columns.created')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.items.map((booking) => (
                <Table.Tr key={booking.id}>
                  <Table.Td>{booking.event_type_id}</Table.Td>
                  <Table.Td>{booking.name}</Table.Td>
                  <Table.Td>{booking.email}</Table.Td>
                  <Table.Td>{formatDate(booking.created_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : null}
      </Stack>
    </Container>
  )
}
