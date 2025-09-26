import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { GrDrag } from "react-icons/gr";
import { GridColDef } from "@endo4life/types";
import { numberUtils } from "@endo4life/util-common";

interface ITaskProps<T> {
  item: GridColDef<T>;
  onChangeColumnVisibility: (id: number, hide: boolean) => void;
}

function Task<T>({
  item,
  onChangeColumnVisibility,
}: ITaskProps<T>) {
  const { id, headerName, hide } = item;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: numberUtils.defaultNumber(id) });
  const [checked, setChecked] = useState(!hide);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleChangeCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    onChangeColumnVisibility(numberUtils.defaultNumber(id), !isChecked);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-start w-full rounded gap-x-2 gap-y-2 touch-none"
    >
      <GrDrag />
      <Checkbox
        className="!p-0"
        checked={checked}
        onChange={handleChangeCheckbox}
      />
      <span className="select-none point-events-none">
        {headerName}
      </span>
    </div>
  );
};

export default Task;