import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Title,
  Text,
  Card,
  Image,
  Grid,
  SimpleGrid,
  Container,
  Button,
  Group,
  ThemeIcon,
  Paper,
  List,
  rem,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { 
  IconMapPin, 
  IconCompass, 
  IconNavigation, 
  IconCalendar,
  IconChartLine,
  IconMap,
  IconCheck
} from '@tabler/icons-react';
import DeclinationForm from '../components/DeclinationForm';
import DeclinationResults from '../components/DeclinationResults';
import { calculateDeclination } from '../utils/api';
import { Result } from '../types';

function HomePage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculateSuccess = (data: Result) => {
    setResult(data);
    setLoading(false);
    
    showNotification({
      title: 'Calculation Complete',
      message: 'Declination calculation was successful!',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  return (
    <Container size="lg">
      <Grid gutter={40}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Box mt={40}>
            <Title
              order={1}
              style={{
                fontSize: rem(48),
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              Magnetic Declination <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>Calculator</Text>
            </Title>

            <Text c="dimmed" mt="md" size="lg">
              Accurately calculate magnetic declination for any location on Earth.
              Get precise magnetic field information using NOAA's Geomagnetic Model.
            </Text>

            <List
              mt={30}
              spacing="sm"
              size="md"
              icon={
                <ThemeIcon size={24} radius="xl" color="blue">
                  <IconCheck style={{ width: rem(16), height: rem(16) }} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <b>Precise calculations</b> based on the World Magnetic Model (WMM)
              </List.Item>
              <List.Item>
                <b>Historical data</b> and future predictions
              </List.Item>
              <List.Item>
                <b>Interactive map</b> for easy location selection
              </List.Item>
              <List.Item>
                <b>Save and track</b> your calculation history
              </List.Item>
            </List>

            <Group mt={30}>
              <Button
                component={Link}
                to="/map"
                size="md"
                radius="md"
                leftSection={<IconMap size={18} />}
              >
                Try Interactive Map
              </Button>
              <Button
                component="a"
                href="#calculator"
                variant="light"
                size="md"
                radius="md"
              >
                Jump to Calculator
              </Button>
            </Group>
          </Box>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Image src="/compass-illustration.png" alt="Magnetic declination illustration" 
            style={{ maxHeight: '400px' }}
            fallbackSrc="https://placehold.co/600x400?text=Compass+Illustration"
          />
        </Grid.Col>
      </Grid>

      <Paper withBorder shadow="md" p={30} mt={40} radius="md" id="calculator">
        <Title order={2} mb="lg">Calculate Declination</Title>
        <DeclinationForm onCalculate={handleCalculateSuccess} isLoading={loading} setLoading={setLoading} />
      </Paper>

      {result && (
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <DeclinationResults result={result} />
        </Paper>
      )}

      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing={{ base: 'md', md: 'lg' }}
        mt={60}
      >
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <ThemeIcon size={50} radius="md" color="blue" mb="md">
            <IconCompass size={26} />
          </ThemeIcon>
          <Title order={3} fw={500}>
            What is declination?
          </Title>
          <Text mt="sm" c="dimmed">
            Magnetic declination is the angle between magnetic north and true north. It varies depending on your location on Earth and changes over time.
          </Text>
        </Card>

        <Card shadow="md" padding="lg" radius="md" withBorder>
          <ThemeIcon size={50} radius="md" color="indigo" mb="md">
            <IconNavigation size={26} />
          </ThemeIcon>
          <Title order={3} fw={500}>
            Why it matters
          </Title>
          <Text mt="sm" c="dimmed">
            For navigation with a compass, you need to adjust for declination to find true north. Critical for hiking, sailing, and aviation.
          </Text>
        </Card>

        <Card shadow="md" padding="lg" radius="md" withBorder>
          <ThemeIcon size={50} radius="md" color="cyan" mb="md">
            <IconChartLine size={26} />
          </ThemeIcon>
          <Title order={3} fw={500}>
            Changing over time
          </Title>
          <Text mt="sm" c="dimmed">
            Earth's magnetic field shifts over time. Our calculator uses the latest model to provide accurate declination for past, present, and future dates.
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}

export default HomePage; 