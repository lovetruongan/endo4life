import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useRef, useMemo, useCallback, useState } from 'react';
import { ITagEntity } from '@endo4life/feature-tag';
import { TagType } from '@endo4life/data-access';
import { Chip, IconButton, Collapse, Box } from '@mui/material';
import { TbSubtask, TbChevronDown, TbChevronRight } from 'react-icons/tb';
import { AgGrid } from '@endo4life/ui-common';

interface ITagTableProps {
  data: ITagEntity[];
  loading: boolean;
  selectedType: TagType;
  onSelectionChanged: (tags: ITagEntity[]) => void;
}

export default function TagTable({
  data,
  loading,
  selectedType,
  onSelectionChanged,
}: ITagTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Flatten data to include children as separate rows
  const flatData = useMemo(() => {
    const result: Array<ITagEntity & { isChild?: boolean; parentId?: string }> =
      [];
    for (const tag of data) {
      result.push(tag);
      if (expandedRows.has(tag.id) && tag.children && tag.children.length > 0) {
        tag.children.forEach((child) => {
          result.push({
            ...child,
            isChild: true,
            parentId: tag.id,
          });
        });
      }
    }
    return result;
  }, [data, expandedRows]);

  const columns = useMemo<ColDef[]>(() => {
    const cols: ColDef[] = [
      {
        headerName: '',
        checkboxSelection: (params) => !params.data?.isChild,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        cellRenderer: (
          params: ICellRendererParams<ITagEntity & { isChild?: boolean }>,
        ) => {
          if (params.data?.isChild) {
            return null;
          }
          return params.value;
        },
      },
      {
        headerName: 'Tag Name',
        field: 'content',
        flex: 1,
        sortable: true,
        cellRenderer: (
          params: ICellRendererParams<
            ITagEntity & { isChild?: boolean; parentId?: string }
          >,
        ) => {
          const isChild = params.data?.isChild;
          const hasChildren =
            params.data?.children && params.data.children.length > 0;
          const isExpanded = expandedRows.has(params.data?.id || '');

          return (
            <div className="flex items-center h-full py-2">
              {!isChild &&
                selectedType === TagType.DamageTag &&
                hasChildren && (
                  <IconButton
                    size="small"
                    onClick={() => toggleRow(params.data?.id || '')}
                    className="mr-1"
                  >
                    {isExpanded ? (
                      <TbChevronDown size={16} />
                    ) : (
                      <TbChevronRight size={16} />
                    )}
                  </IconButton>
                )}
              {isChild && (
                <div className="flex items-center gap-2 ml-8">
                  <TbSubtask size={16} className="text-blue-500" />
                  <span className="text-gray-600">{params.value}</span>
                </div>
              )}
              {!isChild && (
                <span className="font-medium text-gray-800">
                  {params.value}
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 200,
        cellRenderer: (
          params: ICellRendererParams<ITagEntity & { isChild?: boolean }>,
        ) => {
          const isChild = params.data?.isChild;
          if (isChild) {
            return (
              <div className="flex items-center h-full py-2">
                <Chip
                  label="Detail Tag"
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
              </div>
            );
          }

          const type = params.value as TagType;
          let label = '';
          let color: 'primary' | 'success' | 'warning' | 'info' | 'error' =
            'primary';

          switch (type) {
            case TagType.DamageTag:
              label = 'Damage Tag';
              color = 'error';
              break;
            case TagType.AnatomyLocationTag:
              label = 'Anatomy Location';
              color = 'primary';
              break;
            case TagType.HpTag:
              label = 'HP Classification';
              color = 'warning';
              break;
            case TagType.LightTag:
              label = 'Light Type';
              color = 'info';
              break;
            case TagType.UpperGastroAnatomyTag:
              label = 'Upper GI Anatomy';
              color = 'success';
              break;
            default:
              label = type;
          }

          return (
            <div className="flex items-center h-full py-2">
              <Chip label={label} color={color} size="small" />
            </div>
          );
        },
      },
    ];

    // For DAMAGE_TAG, show children count with icon
    if (selectedType === TagType.DamageTag) {
      cols.push({
        headerName: 'Details',
        valueGetter: (params) => {
          return params.data?.children?.length || 0;
        },
        width: 120,
        cellRenderer: (
          params: ICellRendererParams<ITagEntity & { isChild?: boolean }>,
        ) => {
          if (params.data?.isChild) {
            return null;
          }
          const childCount = params.data?.children?.length || 0;
          return (
            <div className="flex items-center h-full py-2">
              {childCount > 0 ? (
                <div className="flex items-center gap-1 text-blue-600">
                  <TbSubtask size={16} />
                  <span className="font-medium">
                    {childCount} detail{childCount > 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">No details</span>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [selectedType, expandedRows, toggleRow]);

  const handleSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current?.api.getSelectedRows() || [];
    onSelectionChanged(selectedRows);
  }, [onSelectionChanged]);

  return (
    <div className="rounded-lg h-full">
      <AgGrid
        gridRef={gridRef}
        hasTableTool={false}
        openToolDialog={false}
        columns={columns}
        rowData={flatData}
        loading={loading}
        onToggleToolDialog={() => {}}
        onChangeColumns={() => {}}
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  );
}
