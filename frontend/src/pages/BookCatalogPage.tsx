import { Container, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core'
import { listEventTypes } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { SectionTitle } from '../components/SectionTitle'
import { StatusMessage } from '../components/StatusMessage'
import { EventTypeCard } from '../components/EventTypeCard'
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
            fallbackSrc="/organizer-avatar.svg"
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
              <EventTypeCard
                key={event.id}
                id={event.id}
                name={event.name}
                description={event.description}
                duration={event.duration_minutes}
                typeLabel={t('catalog.typeLabel')}
                selectLabel={t('catalog.selectDate')}
                ctaLabel={t('catalog.go')}
              />
            ))}
          </SimpleGrid>
        ) : null}
      </Stack>
    </Container>
  )
}
