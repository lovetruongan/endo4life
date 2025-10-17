import React, { useEffect } from 'react';
import {
  ICustomHeaderComponentParamsProps,
  SortOrderEnum,
} from '@endo4life/types';
import { ColumnEvent, IHeaderParams, SortChangedEvent } from 'ag-grid-community';
import { useToggle, useUpdate } from 'ahooks';
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from 'react-icons/io';
import { IconButton } from '@mui/material';
import { BsThreeDotsVertical } from 'react-icons/bs';

function CustomHeader({
  displayName,
  enableSorting,
  column,
  progressSort,
  openToolDialog,
  onToggleToolDialog,
}: IHeaderParams & ICustomHeaderComponentParamsProps) {
  const [hovered, hoverToggle] = useToggle(false);
  const update = useUpdate();

  const onMouseEnter = (event: React.MouseEvent) => {
    hoverToggle.setRight();
  };

  const onMouseLeave = (event: React.MouseEvent) => {
    hoverToggle.setLeft();
  };

  const onHeaderClick = (event: React.MouseEvent) => {
    if (enableSorting) {
      progressSort(event.shiftKey);
    }
  };

  const onIconClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleToolDialog && onToggleToolDialog();
  };

  useEffect(() => {
    const handleSortChange = (event: ColumnEvent) => {
      update();
    };
    column.addEventListener('sortChanged', handleSortChange);

    return () => {
      column.removeEventListener('sortChanged', handleSortChange);
    };
  }, [column, update]);

  return (
    <div
      className="flex items-center justify-between w-full cursor-pointer"
      onClick={onHeaderClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-2">
        {column.getSort() === SortOrderEnum.ASC.toLowerCase() ? (
          <span>
            <IoIosArrowRoundUp size={20} />
          </span>
        ) : column.getSort() === SortOrderEnum.DESC.toLowerCase() ? (
          <span>
            <IoIosArrowRoundDown size={20} />
          </span>
        ) : null}

        <span>{displayName}</span>
      </div>
      {hovered && (
        <IconButton onClick={onIconClick}>
          <BsThreeDotsVertical size={12} />
        </IconButton>
      )}
    </div>
  );
}

export default CustomHeader;
