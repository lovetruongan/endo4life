/**
 * Label Panel Component
 * Shows list of annotations and allows editing labels
 */

import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { RiDeleteBinLine } from 'react-icons/ri';
import { HiSparkles, HiUser } from 'react-icons/hi2';
import { Annotation, ENDOSCOPY_LABELS } from './types';

interface LabelPanelProps {
  annotations: Annotation[];
  selectedId: string | null;
  currentLabel: string;
  onSelectAnnotation: (id: string | null) => void;
  onDeleteAnnotation: (id: string) => void;
  onLabelChange: (label: string) => void;
  onCurrentColorChange: (color: string) => void;
}

export function LabelPanel({
  annotations,
  selectedId,
  currentLabel,
  onSelectAnnotation,
  onDeleteAnnotation,
  onLabelChange,
  onCurrentColorChange,
}: LabelPanelProps) {
  const handleLabelSelect = (value: string) => {
    onLabelChange(value);
    const labelConfig = ENDOSCOPY_LABELS.find(l => l.value === value);
    if (labelConfig) {
      onCurrentColorChange(labelConfig.color);
    }
  };

  return (
    <Box className="flex flex-col h-full bg-white border-l">
      {/* Label selector */}
      <Box className="p-4 border-b">
        <Typography variant="subtitle2" className="mb-2">
          Nhãn hiện tại
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Chọn nhãn</InputLabel>
          <Select
            value={currentLabel}
            label="Chọn nhãn"
            onChange={(e) => handleLabelSelect(e.target.value)}
          >
            {ENDOSCOPY_LABELS.map((label) => (
              <MenuItem key={label.value} value={label.value}>
                <Box className="flex items-center gap-2">
                  <Box
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Annotations list */}
      <Box className="flex-1 overflow-auto">
        <Box className="p-3 bg-gray-50 border-b flex items-center justify-between">
          <Typography variant="subtitle2">
            Annotations ({annotations.length})
          </Typography>
        </Box>
        
        {annotations.length === 0 ? (
          <Box className="p-4 text-center text-gray-500">
            <Typography variant="body2">
              Chưa có annotation nào
            </Typography>
            <Typography variant="caption">
              Sử dụng công cụ vẽ để thêm annotation
            </Typography>
          </Box>
        ) : (
          <List dense>
            {annotations.map((annotation, index) => (
              <React.Fragment key={annotation.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onDeleteAnnotation(annotation.id)}
                    >
                      <RiDeleteBinLine size={16} />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    selected={selectedId === annotation.id}
                    onClick={() => onSelectAnnotation(annotation.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: annotation.color }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box className="flex items-center gap-2">
                          <span>{annotation.label}</span>
                          {annotation.isAIGenerated ? (
                            <Chip
                              icon={<HiSparkles size={14} />}
                              label="AI"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 10 }}
                            />
                          ) : (
                            <Chip
                              icon={<HiUser size={14} />}
                              label="Manual"
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 10 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box className="flex items-center gap-2 text-xs">
                          <span className="capitalize">{annotation.type}</span>
                          {annotation.confidence && (
                            <span>• {(annotation.confidence * 100).toFixed(0)}%</span>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < annotations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Legend */}
      <Box className="p-3 border-t bg-gray-50">
        <Typography variant="caption" className="text-gray-500 block mb-2">
          Phím tắt:
        </Typography>
        <Box className="grid grid-cols-2 gap-1 text-xs text-gray-600">
          <span>B - Bounding Box</span>
          <span>P - Polygon</span>
          <span>V - Select</span>
          <span>Del - Xóa</span>
          <span>ESC - Hủy</span>
        </Box>
      </Box>
    </Box>
  );
}

