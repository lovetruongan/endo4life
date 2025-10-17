import { IEntityData } from '@endo4life/types';
import { ITagEntity } from '../types';
import { REACT_QUERY_KEYS } from '../constants';
import { useQuery } from 'react-query';
import { TagApiImpl } from '../api/tag-api';

export function useTags(parentTags: string[]): IEntityData<ITagEntity> {
  const { data, error, isFetching } = useQuery(
    [REACT_QUERY_KEYS.TAGS, parentTags],
    async () => {
      return new TagApiImpl().getTags(parentTags);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return {
    loading: isFetching,
    data,
    error,
  };
}
