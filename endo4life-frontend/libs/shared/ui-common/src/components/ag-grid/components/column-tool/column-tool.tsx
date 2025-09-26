import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Column from './column';
import { GridColDef } from '@endo4life/types';
import { getTaskPosition } from '../../utils';
import { objectUtils } from "@endo4life/util-common";

export interface IColumToolProps<T> {
  columns: GridColDef<T>[];
  onChangeColumns: (cols: GridColDef<T>[]) => void;
}

function ColumnTool<T>({
  columns,
  onChangeColumns,
}: IColumToolProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id === over?.id) return;

    const originalPos = getTaskPosition(columns, active?.id);
    const newPos = getTaskPosition(columns, objectUtils.defaultObject(over?.id));

    onChangeColumns(arrayMove(columns, originalPos, newPos));
  }

  return (
    <div className="flex flex-col items-start w-full h-full gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <Column<T>
          columns={columns}
          onChangeColumns={onChangeColumns}
        />
      </DndContext>
    </div>
  )
};

export default ColumnTool;