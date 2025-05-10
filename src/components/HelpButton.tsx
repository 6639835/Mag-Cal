import React, { useState } from 'react';
import { ActionIcon, Modal, Tooltip, Text, Group } from '@mantine/core';
import { IconHelp, IconQuestionMark } from '@tabler/icons-react';
import HelpDocumentation from './HelpDocumentation';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip 
        label="Help & Documentation" 
        position="bottom"
        withArrow
        transitionProps={{ transition: 'pop', duration: 300 }}
      >
        <ActionIcon
          variant="filled"
          color="blue"
          size="lg"
          onClick={() => setIsOpen(true)}
          aria-label="Help and Documentation"
          radius="xl"
          style={{
            boxShadow: '0 0 10px rgba(0, 120, 255, 0.3)',
            position: 'relative',
          }}
        >
          <IconQuestionMark size={20} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          <Group>
            <IconHelp size={24} />
            <Text fw={600}>Help & Documentation</Text>
          </Group>
        }
        size="xl"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <HelpDocumentation />
      </Modal>
    </>
  );
};

export default HelpButton; 