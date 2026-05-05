import { Button, Container, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconArrowRight, IconBolt, IconCalendarEvent, IconClock } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { SectionTitle } from '../components/SectionTitle'
import { SurfaceCard } from '../components/SurfaceCard'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()
  const features = [
    {
      icon: IconBolt,
      title: t('home.feature1Title'),
      description: t('home.feature1Body'),
    },
    {
      icon: IconCalendarEvent,
      title: t('home.feature2Title'),
      description: t('home.feature2Body'),
    },
    {
      icon: IconClock,
      title: t('home.feature3Title'),
      description: t('home.feature3Body'),
    },
  ]

  return (
    <Container size="lg" py={48}>
      <SurfaceCard>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={32}>
          <Stack gap="lg">
            <Group gap="sm">
              <Image
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=64&q=80"
                fallbackSrc="/brand-mark.svg"
                alt={t('home.heroImageAlt')}
                h={32}
                w={32}
                radius="xl"
              />
              <Text fw={600} c="var(--muted)">
                {t('home.overline')}
              </Text>
            </Group>
            <Title order={1} className="display-font" fz={44}>
              {t('brand.name')}
            </Title>
            <Text c="var(--muted)" size="lg">
              {t('home.heroTitle')}
            </Text>
            <Group>
              <Button
                component={Link}
                to="/book"
                size="md"
                radius="xl"
                color="orange"
                rightSection={<IconArrowRight size={18} />}
              >
                {t('home.bookCta')}
              </Button>
              <Button
                component={Link}
                to="/admin"
                size="md"
                variant="subtle"
                radius="xl"
                color="orange"
              >
                {t('home.adminCta')}
              </Button>
            </Group>
          </Stack>
          <Image
            src="https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=640&q=80"
            fallbackSrc="/brand-mark.svg"
            alt={t('home.heroImageAlt')}
            radius="lg"
            h={260}
            fit="cover"
          />
        </SimpleGrid>
      </SurfaceCard>

      <Stack mt={60} gap="xl">
        <SectionTitle
          overline={t('home.featuresOverline')}
          title={t('home.featuresTitle')}
          description={t('home.featuresSubtitle')}
        />
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={24}>
          {features.map((feature) => (
            <SurfaceCard key={feature.title}>
              <Stack gap="md">
                <feature.icon size={26} color="var(--accent-strong)" />
                <Stack gap={6}>
                  <Text fw={700} className="display-font">
                    {feature.title}
                  </Text>
                  <Text size="sm" c="var(--muted)">
                    {feature.description}
                  </Text>
                </Stack>
              </Stack>
            </SurfaceCard>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
