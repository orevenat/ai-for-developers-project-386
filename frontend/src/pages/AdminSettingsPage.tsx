import {
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconPlus, IconSettings, IconUser } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import {
  createEventType,
  getSettings,
  listAdminEventTypes,
  updateSettings,
} from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { StatusMessage } from '../components/StatusMessage'
import { useTranslation } from 'react-i18next'

export function AdminSettingsPage() {
  const { t } = useTranslation()
  const settingsState = useAsync(getSettings)
  const eventTypesState = useAsync(listAdminEventTypes)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const profileForm = useForm({
    initialValues: {
      name: '',
      avatar_url: '',
      workday_start: '09:00',
      workday_end: '18:00',
    },
  })

  useEffect(() => {
    if (settingsState.data) {
      profileForm.setValues({
        name: settingsState.data.owner.name,
        avatar_url: settingsState.data.owner.avatar_url,
        workday_start: settingsState.data.owner.workday_start,
        workday_end: settingsState.data.owner.workday_end,
      })
    }
  }, [settingsState.data, profileForm])

  const eventForm = useForm({
    initialValues: {
      name: '',
      description: '',
      duration_minutes: 30,
    },
  })

  const [eventMessage, setEventMessage] = useState<string | null>(null)

  return (
    <Container size="lg" py={32}>
      <Stack gap="lg">
        <Group gap="sm">
          <IconSettings size={22} color="var(--accent-strong)" />
          <Title order={3} className="display-font">
            {t('settings.title')}
          </Title>
        </Group>

        {settingsState.loading ? (
          <StatusMessage title={t('settings.loading')} variant="loading" />
        ) : null}
        {settingsState.error ? (
          <StatusMessage
            title={t('settings.error')}
            description={t('confirm.errorDefault')}
            variant="error"
          />
        ) : null}

        {settingsState.data ? (
          <Paper radius="lg" p="xl" style={{ background: 'white' }}>
            <Stack gap="md">
              <Group gap="sm">
                <IconUser size={20} color="var(--accent-strong)" />
                <Title order={4} className="display-font">
                  {t('settings.profile')}
                </Title>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label={t('settings.name')}
                  placeholder={t('settings.namePlaceholder')}
                  {...profileForm.getInputProps('name')}
                />
                <TextInput
                  label={t('settings.avatar')}
                  placeholder={t('settings.avatarPlaceholder')}
                  {...profileForm.getInputProps('avatar_url')}
                />
                <TextInput
                  label={t('settings.start')}
                  placeholder="09:00"
                  {...profileForm.getInputProps('workday_start')}
                />
                <TextInput
                  label={t('settings.end')}
                  placeholder="18:00"
                  {...profileForm.getInputProps('workday_end')}
                />
              </SimpleGrid>
              <Button
                radius="xl"
                color="orange"
                onClick={async () => {
                  setProfileMessage(null)
                  try {
                    await updateSettings(profileForm.values)
                    setProfileMessage(t('settings.saveOk'))
                  } catch {
                    setProfileMessage(t('settings.saveFail'))
                  }
                }}
              >
                {t('settings.save')}
              </Button>
              {profileMessage ? (
                <Text size="sm" c="var(--muted)">
                  {profileMessage}
                </Text>
              ) : null}
            </Stack>
          </Paper>
        ) : null}

        <Paper radius="lg" p="xl" style={{ background: 'white' }}>
          <Group justify="space-between" align="center" mb="md">
            <Title order={4} className="display-font">
              {t('settings.typesTitle')}
            </Title>
            <Button radius="xl" leftSection={<IconPlus size={16} />} color="orange">
              {t('settings.create')}
            </Button>
          </Group>

          {eventTypesState.loading ? (
            <StatusMessage title={t('status.loading')} variant="loading" />
          ) : null}
          {eventTypesState.error ? (
            <StatusMessage
              title={t('settings.error')}
              description={t('confirm.errorDefault')}
              variant="error"
            />
          ) : null}

          {!eventTypesState.loading &&
          !eventTypesState.error &&
          eventTypesState.data?.items.length === 0 ? (
            <StatusMessage title={t('settings.empty')} variant="empty" />
          ) : null}

          {!eventTypesState.loading &&
          !eventTypesState.error &&
          eventTypesState.data?.items.length ? (
            <Stack gap="md">
              {eventTypesState.data.items.map((event) => (
                <Paper key={event.id} radius="md" p="md" withBorder>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Text fw={600}>{event.name}</Text>
                      <Text size="sm" c="var(--muted)">
                        {event.description}
                      </Text>
                      <Text size="sm" c="var(--muted)">
                        {t('catalog.duration', { count: event.duration_minutes })}
                      </Text>
                    </Stack>
                    <Group>
                      <Button variant="light" radius="xl" color="orange">
                        {t('settings.edit')}
                      </Button>
                      <Button variant="outline" radius="xl" color="gray">
                        {t('settings.remove')}
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : null}
        </Paper>

        <Paper radius="lg" p="xl" style={{ background: 'white' }}>
          <Stack gap="md">
            <Title order={4} className="display-font">
              {t('settings.createTitle')}
            </Title>
            <form
              onSubmit={eventForm.onSubmit(async (values) => {
                setEventMessage(null)
                try {
                  await createEventType(values)
                  eventForm.reset()
                  setEventMessage(t('settings.createOk'))
                  eventTypesState.reload()
                } catch {
                  setEventMessage(t('settings.createFail'))
                }
              })}
            >
              <Stack gap="md">
                <TextInput label={t('settings.name')} {...eventForm.getInputProps('name')} />
                <TextInput
                  label={t('settings.description')}
                  {...eventForm.getInputProps('description')}
                />
                <NumberInput
                  label={t('settings.duration')}
                  min={5}
                  max={240}
                  {...eventForm.getInputProps('duration_minutes')}
                />
                <Button type="submit" radius="xl" color="orange">
                  {t('settings.createSubmit')}
                </Button>
                {eventMessage ? (
                  <Text size="sm" c="var(--muted)">
                    {eventMessage}
                  </Text>
                ) : null}
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
