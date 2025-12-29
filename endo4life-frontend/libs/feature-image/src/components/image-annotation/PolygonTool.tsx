/**
 * Polygon Drawing Tool Component
 * Provides UI controls for polygon annotation
 */

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { TbPolygon } from 'react-icons/tb';

interface PolygonToolProps {
  isActive: boolean;
  onActivate: () => void;
  disabled?: boolean;
}

export function PolygonTool({
  isActive,
  onActivate,
  disabled = false,
}: PolygonToolProps) {
  return (
    <Tooltip title="Vẽ polygon (P)">
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
          <TbPolygon />
        </IconButton>
      </span>
    </Tooltip>
  );
}

