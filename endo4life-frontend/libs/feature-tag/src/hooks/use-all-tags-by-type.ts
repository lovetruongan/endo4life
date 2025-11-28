import { useQuery } from 'react-query';
import { TagApiImpl } from '../api';
import { ITagEntity } from '../types';
import { TagType } from '@endo4life/data-access';
import { REACT_QUERY_KEYS } from '../constants';

export function useAllTagsByType(type?: TagType) {
  const { data, isLoading, error } = useQuery<ITagEntity[], Error>(
    [REACT_QUERY_KEYS.TAGS, type],
    async () => {
      const api = new TagApiImpl();
      if (type) {
        return api.getTagsByType(type);
      }
      return api.getTags([]);
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  return {
    data: data || [],
    loading: isLoading,
    error,
  };
}

