import { Box, Container, Group, Text, Anchor } from '@mantine/core';

function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <Box component="footer" py="md" style={{ borderTop: '1px solid #e9ecef' }}>
      <Container size="lg">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            © {year} MagCalc - Magnetic Declination Calculator
          </Text>
          <Group gap={10}>
            <Anchor size="sm" href="https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml" target="_blank">
              NOAA Geomagnetic Calculator
            </Anchor>
            <Text size="sm" c="dimmed">|</Text>
            <Anchor size="sm" href="https://github.com" target="_blank">
              GitHub
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

export default Footer; 