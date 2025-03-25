import React from 'react';
import { Alert, Text, Button, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Something went wrong"
          color="red"
          variant="filled"
        >
          <Stack gap="md">
            <Text size="sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button
              variant="light"
              color="red"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 