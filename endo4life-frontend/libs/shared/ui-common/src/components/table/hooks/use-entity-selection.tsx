import { BaseEntity, IEntityAction, UniqueId } from '@endo4life/types';
import { useCallback, useState } from 'react';

export function useEntitySelection<T extends BaseEntity>(
  data: T[],
  defaultValues: UniqueId[] = []
) {
  const [selectedIds, setSelectedIds] = useState<UniqueId[]>(defaultValues);
  const [entityAction, setEntityAction] = useState<IEntityAction<T>>();

  const toggleSelectEntity = useCallback(
    (entityId: UniqueId) => {
      if (selectedIds.includes(entityId)) {
        setSelectedIds(selectedIds.filter((id) => id !== entityId));
      } else {
        setSelectedIds([...selectedIds, entityId]);
      }
    },
    [selectedIds]
  );

  const toggleSelectEntities = useCallback(() => {
    if (data.length === 0) return;
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((entity) => entity.id));
    }
  }, [selectedIds, data]);

  function selectEntity(item: T, action?: string) {
    setEntityAction({ entities: [item], type: action ?? '' });
  }

  function selectEntities(items: T[], action?: string) {
    setEntityAction({ entities: items, type: action ?? '' });
  }

  return {
    selectedIds,
    entityAction,
    toggleSelectEntity,
    toggleSelectEntities,
    selectEntities,
    selectEntity
  };
}

export default useEntitySelection