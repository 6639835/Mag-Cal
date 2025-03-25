import React from 'react';
import { Notification, Transition } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  const icons = {
    success: <IconCheck size={16} />,
    error: <IconX size={16} />,
    warning: <IconAlertCircle size={16} />,
    info: <IconInfoCircle size={16} />,
  };

  const colors = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <Transition mounted={true} transition="slide-up" duration={400}>
      {(styles) => (
        <div style={styles}>
          <Notification
            icon={icons[type]}
            color={colors[type]}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            onClose={onClose}
            withBorder
          >
            {message}
          </Notification>
        </div>
      )}
    </Transition>
  );
};

export default Toast; 