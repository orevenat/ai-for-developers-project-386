import { Group, Image, Stack, Text, Title } from '@mantine/core'

type SectionTitleProps = {
  icon?: string
  overline?: string
  title: string
  description?: string
}

export function SectionTitle({ icon, overline, title, description }: SectionTitleProps) {
  return (
    <Stack gap={6}>
      {overline ? (
        <Group gap={10}>
          {icon ? <Image src={icon} alt="" h={18} w={18} /> : null}
          <Text size="sm" fw={700} c="var(--accent-strong)" tt="uppercase" lts={1.2}>
            {overline}
          </Text>
        </Group>
      ) : null}
      <Title order={2} className="display-font" fz={28}>
        {title}
      </Title>
      {description ? (
        <Text size="sm" c="var(--muted)">
          {description}
        </Text>
      ) : null}
    </Stack>
  )
}
