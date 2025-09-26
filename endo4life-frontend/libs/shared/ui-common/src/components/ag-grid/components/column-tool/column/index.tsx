import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Task from "../task";
import { GridColDef } from "@endo4life/types";
import { numberUtils } from "@endo4life/util-common";

interface IColumnProps<T> {
  columns: GridColDef<T>[];
  onChangeColumns: (cols: GridColDef<T>[]) => void;
}

function Column<T>({
  columns,
  onChangeColumns,
}: IColumnProps<T>) {
  const uniqueIdentifiers = columns.map(i => numberUtils.defaultNumber(i.id));

  const handleChangeColumnVisibility = (id: number, hide: boolean) => {
    const updatedColumns = columns.map(col => 
      col.id === id ? { ...col, hide: hide } : col
    );
    onChangeColumns(updatedColumns);
  };

  return (
    <div className="flex flex-col w-full gap-4 rounded">
      <SortableContext
        items={uniqueIdentifiers}
        strategy={verticalListSortingStrategy}
      >
        {columns.map((item) => (
          !item.disabled && (
            <Task<T>
              key={item.id}
              item={item}
              onChangeColumnVisibility={handleChangeColumnVisibility}
            />
          )
        ))}
      </SortableContext>
    </div>
  );
};

export default Column;