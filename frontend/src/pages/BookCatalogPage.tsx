import { Container, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconArrowRight, IconClock, IconUser } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { listEventTypes } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { SectionTitle } from '../components/SectionTitle'
import { StatusMessage } from '../components/StatusMessage'
import { SurfaceCard } from '../components/SurfaceCard'
import { useTranslation } from 'react-i18next'

export function BookCatalogPage() {
  const { t } = useTranslation()
  const { data, loading, error } = useAsync(listEventTypes)

  return (
    <Container size="lg" py={48}>
      <Stack gap="xl">
        <Group gap="lg" align="center">
          <Image
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=140&q=80"
            alt={t('catalog.organizerAlt')}
            h={64}
            w={64}
            radius="xl"
          />
          <Stack gap={4}>
            <Text fw={700} className="display-font">
              {t('catalog.organizerName')}
            </Text>
            <Text size="sm" c="var(--muted)">
              {t('catalog.organizer')}
            </Text>
          </Stack>
        </Group>

        <SectionTitle
          overline={t('catalog.overline')}
          title={t('catalog.title')}
          description={t('catalog.subtitle')}
        />

        {loading ? <StatusMessage title={t('catalog.loading')} variant="loading" /> : null}
        {error ? (
          <StatusMessage
            title={t('catalog.errorTitle')}
            description={t('confirm.errorDefault')}
            variant="error"
          />
        ) : null}
        {!loading && !error && data?.items.length === 0 ? (
          <StatusMessage
            title={t('catalog.emptyTitle')}
            description={t('catalog.emptyBody')}
            variant="empty"
          />
        ) : null}
        {!loading && !error && data?.items.length ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24}>
            {data.items.map((event) => (
              <SurfaceCard key={event.id}>
                <Stack gap="md">
                  <Stack gap={6}>
                    <Title order={3} className="display-font" fz={22}>
                      {event.name}
                    </Title>
                    <Text size="sm" c="var(--muted)">
                      {event.description}
                    </Text>
                  </Stack>
                  <Group justify="space-between">
                    <Group gap={6}>
                      <IconClock size={18} color="var(--accent-strong)" />
                      <Text size="sm" fw={600}>
                        {t('catalog.duration', { count: event.duration_minutes })}
                      </Text>
                    </Group>
                    <Group gap={6}>
                      <IconUser size={18} color="var(--accent-strong)" />
                      <Text size="sm" fw={600}>
                        {t('catalog.typeLabel')}
                      </Text>
                    </Group>
                  </Group>
                  <Group justify="space-between" mt="xs">
                    <Text size="sm" c="var(--muted)">
                      {t('catalog.selectDate')}
                    </Text>
                    <Link to={`/book/${event.id}`}>
                      <Group gap={6}>
                        <Text size="sm" fw={600} c="var(--accent-strong)">
                          {t('catalog.go')}
                        </Text>
                        <IconArrowRight size={16} color="var(--accent-strong)" />
                      </Group>
                    </Link>
                  </Group>
                </Stack>
              </SurfaceCard>
            ))}
          </SimpleGrid>
        ) : null}
      </Stack>
    </Container>
  )
}
