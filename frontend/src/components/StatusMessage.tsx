import { Center, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

type StatusMessageProps = {
  title: string
  description?: string
  variant?: 'loading' | 'empty' | 'error'
}

const variantConfig = {
  loading: { icon: IconLoader2, color: 'var(--accent-strong)' },
  empty: { icon: IconAlertCircle, color: 'var(--muted)' },
  error: { icon: IconAlertCircle, color: '#d9480f' },
}

export function StatusMessage({ title, description, variant = 'loading' }: StatusMessageProps) {
  const { t } = useTranslation()
  const { icon: Icon, color } = variantConfig[variant]

  return (
    <Center py="xl">
      <Stack align="center" gap={6}>
        <ThemeIcon
          size={44}
          radius="xl"
          variant="light"
          style={{ background: 'rgba(243, 156, 52, 0.15)' }}
        >
          <Icon size={24} color={color} />
        </ThemeIcon>
        <Text fw={600}>{title || t('status.loading')}</Text>
        {description ? (
          <Text size="sm" c="var(--muted)" ta="center">
            {description}
          </Text>
        ) : null}
      </Stack>
    </Center>
  )
}
