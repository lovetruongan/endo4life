/**
 * Bounding Box Drawing Tool Component
 * Provides UI controls for bbox annotation
 */

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { TbBoxMultiple } from 'react-icons/tb';

interface BoundingBoxToolProps {
  isActive: boolean;
  onActivate: () => void;
  disabled?: boolean;
}

export function BoundingBoxTool({
  isActive,
  onActivate,
  disabled = false,
}: BoundingBoxToolProps) {
  return (
    <Tooltip title="Vẽ bounding box (B)">
      <span>
        <IconButton
          onClick={onActivate}
          disabled={disabled}
          sx={{
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'white' : 'inherit',
            '&:hover': {
              bgcolor: isActive ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          <TbBoxMultiple />
        </IconButton>
      </span>
    </Tooltip>
  );
}

