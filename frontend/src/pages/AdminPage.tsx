import { Tabs } from '@mantine/core'
import { IconCalendarEvent, IconListDetails, IconSettings } from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AdminBookingsPage } from './AdminBookingsPage'
import { AdminSchedulePage } from './AdminSchedulePage'
import { AdminSettingsPage } from './AdminSettingsPage'
import { useTranslation } from 'react-i18next'

const tabs = [
  { value: 'bookings', icon: IconCalendarEvent, path: '/admin' },
  { value: 'schedule', icon: IconListDetails, path: '/admin/schedule' },
  { value: 'settings', icon: IconSettings, path: '/admin/settings' },
]

export function AdminPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = tabs.find((tab) => location.pathname === tab.path)?.value ?? 'bookings'

  return (
    <Tabs
      value={activeTab}
      onChange={(value) => {
        const target = tabs.find((tab) => tab.value === value)
        if (target) navigate(target.path)
      }}
      variant="pills"
      radius="xl"
      styles={{
        tab: { fontWeight: 600 },
      }}
    >
      <Tabs.List grow>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<Icon size={16} />}>
              {t(`admin.${tab.value}`)}
            </Tabs.Tab>
          )
        })}
      </Tabs.List>
      <Tabs.Panel value="bookings">
        <AdminBookingsPage />
      </Tabs.Panel>
      <Tabs.Panel value="schedule">
        <AdminSchedulePage />
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <AdminSettingsPage />
      </Tabs.Panel>
    </Tabs>
  )
}
