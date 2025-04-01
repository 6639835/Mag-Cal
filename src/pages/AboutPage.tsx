import {
  Container,
  Title,
  Text,
  Image,
  Grid,
  List,
  ThemeIcon,
  Card,
  Accordion,
  Anchor,
  Divider,
  Group,
  Box,
} from '@mantine/core';
import { IconCheck, IconCompass } from '@tabler/icons-react';

function AboutPage() {
  return (
    <Container size="lg">
      <Grid gutter={40}>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Title order={2} mb="md">About Magnetic Declination</Title>
          <Text size="lg" mb="xl">
            Understanding magnetic declination is crucial for accurate navigation with a compass.
          </Text>

          <Text mb="lg">
            Magnetic declination (also called magnetic variation) is the angle between magnetic north (the direction the north end of a compass needle points) and true north (the direction along a meridian towards the geographic North Pole). This angle varies depending on your position on the Earth's surface and changes over time.
          </Text>

          <Grid mb="xl">
            <Grid.Col span={12}>
              <Image
                src="/declination-illustration.png"
                alt="Magnetic declination explained"
                fallbackSrc="https://placehold.co/800x400?text=Magnetic+Declination+Illustrated"
              />
              <Text size="sm" ta="center" c="dimmed" mt="xs">
                The angle between true north and magnetic north is the magnetic declination
              </Text>
            </Grid.Col>
          </Grid>

          <Title order={3} mb="md">Why Declination Matters</Title>
          <Text mb="md">
            If you're using a magnetic compass for navigation, you need to adjust for the declination to find true north. Without this adjustment, you could end up significantly off course over long distances.
          </Text>

          <List
            spacing="md"
            size="md"
            mb="xl"
            icon={
              <ThemeIcon color="blue" size={24} radius="xl">
                <IconCheck size={16} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Navigation:</b> Critical for hiking, sailing, aviation, and other outdoor activities
            </List.Item>
            <List.Item>
              <b>Surveying:</b> Surveyors must account for declination when establishing property boundaries
            </List.Item>
            <List.Item>
              <b>Construction:</b> Building orientation may require precise true north alignment
            </List.Item>
            <List.Item>
              <b>Scientific research:</b> Geophysical studies often depend on accurate magnetic field measurements
            </List.Item>
          </List>

          <Title order={3} mb="md">How Declination Changes</Title>
          <Text mb="md">
            Earth's magnetic field is not static—it changes over time due to fluid motion in the Earth's core. This means declination values for any location gradually change year by year.
          </Text>
          <Text mb="xl">
            The World Magnetic Model (WMM) is updated every five years to keep pace with these changes. Our calculator uses the latest model to provide the most accurate declination values.
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder shadow="md" radius="md" p="lg">
            <Title order={3} mb="md">About this Website</Title>
            <Text mb="lg">
              MagCalc is a tool designed to help you quickly and accurately calculate magnetic declination for any location on Earth. It connects to NOAA's Geomagnetic Calculator API to provide precise calculations based on the latest World Magnetic Model.
            </Text>

            <Divider my="md" label="Features" labelPosition="center" />

            <List
              spacing="sm"
              size="sm"
              center
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>Calculate declination for any coordinate</List.Item>
              <List.Item>Interactive map for easy location selection</List.Item>
              <List.Item>History tracking of past calculations</List.Item>
              <List.Item>Export results in different formats</List.Item>
              <List.Item>Support for different date calculations</List.Item>
              <List.Item>Responsive design for all devices</List.Item>
            </List>

            <Divider my="md" label="FAQs" labelPosition="center" />

            <Accordion variant="separated" mb="md">
              <Accordion.Item value="what">
                <Accordion.Control>What is this calculator for?</Accordion.Control>
                <Accordion.Panel>
                  This calculator helps you determine the magnetic declination (the angle between true north and magnetic north) for any location on Earth. This information is crucial for accurate navigation with a magnetic compass.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="accurate">
                <Accordion.Control>How accurate is the calculation?</Accordion.Control>
                <Accordion.Panel>
                  Our calculator uses NOAA's Geomagnetic Calculator API, which implements the World Magnetic Model (WMM). This provides accuracy within 1 degree for most locations. The model is updated every five years to maintain accuracy.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="how">
                <Accordion.Control>How do I use the declination value?</Accordion.Control>
                <Accordion.Panel>
                  If the declination is east (positive), add it to your compass reading to get true north. If the declination is west (negative), subtract its absolute value from your compass reading to get true north.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Divider my="md" label="Resources" labelPosition="center" />

            <Group mb="xs">
              <ThemeIcon size="md" color="blue" variant="light">
                <IconCompass size={16} />
              </ThemeIcon>
              <Text fw={500}>Official Resources</Text>
            </Group>
            <List type="ordered" withPadding size="sm" mb="lg">
              <List.Item>
                <Anchor href="https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml" target="_blank">
                  NOAA Magnetic Field Calculator
                </Anchor>
              </List.Item>
              <List.Item>
                <Anchor href="https://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml" target="_blank">
                  World Magnetic Model (WMM)
                </Anchor>
              </List.Item>
              <List.Item>
                <Anchor href="https://www.ngdc.noaa.gov/geomag/geomag.shtml" target="_blank">
                  NOAA Geomagnetism Program
                </Anchor>
              </List.Item>
            </List>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default AboutPage; 