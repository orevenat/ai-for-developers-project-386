import { Container, Group, Image, Stack, Text } from '@mantine/core'
import { Link, NavLink } from 'react-router-dom'
import { IconLayoutGrid, IconSettings } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

const navItems = [
  { to: '/book', key: 'nav.book', icon: IconLayoutGrid },
  { to: '/admin', key: 'nav.admin', icon: IconSettings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <Stack gap={0} style={{ minHeight: '100vh' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255, 250, 245, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Container size="lg" py={18}>
          <Group justify="space-between">
            <Group gap="sm">
              <Link to="/">
                <Group gap={10}>
                  <Image
                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=80&q=80"
                    alt={t('brand.logoAlt')}
                    h={36}
                    w={36}
                    radius="xl"
                  />
                  <Text fw={700} className="display-font" size="lg">
                    {t('brand.name')}
                  </Text>
                </Group>
              </Link>
            </Group>
            <Group gap="md">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                      <Group
                        gap={8}
                        px={14}
                        py={8}
                        style={{
                          borderRadius: 999,
                          border: `1px solid ${isActive ? 'var(--accent-strong)' : 'transparent'}`,
                          background: isActive ? 'rgba(243, 156, 52, 0.15)' : 'transparent',
                        }}
                      >
                        <Icon size={18} color="var(--accent-strong)" />
                        <Text size="sm" fw={600}>
                          {t(item.key)}
                        </Text>
                      </Group>
                    )}
                  </NavLink>
                )
              })}
            </Group>
          </Group>
        </Container>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </Stack>
  )
}
