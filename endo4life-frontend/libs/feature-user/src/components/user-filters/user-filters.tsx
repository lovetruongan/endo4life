import { filterUtils, IFilter } from '@endo4life/types';
import {
  FormInputSelect,
  FormInputText,
} from '@endo4life/ui-common';
import { UserFilter } from '../../types';
import useUserRoleOptions from '../../hooks/use-user-role-options';
import { useTranslation } from 'react-i18next';
import { useUserStateOptions } from '../../hooks';
import { TbSearch } from 'react-icons/tb';

interface Props {
  filter: IFilter;
  onChange(filter: IFilter): void;
}
export function UserFilters({ filter, onChange }: Props) {
  const { t } = useTranslation('user');
  const { options: roleOptions } = useUserRoleOptions();
  const { options: statusOptions } = useUserStateOptions();

  const handleSearchChange = (value: string) => {
    const userFilter = new UserFilter(filter);
    userFilter.setSearch(value);
    userFilter.setPage(0);
    onChange(userFilter.toFilter());
  };

  const handleRoleChange = (role: string) => {
    const userFilter = new UserFilter(filter);
    userFilter.setQuery('role', role);
    onChange(userFilter.toFilter());
  };

  const handleStateChange = (state: string) => {
    const userFilter = new UserFilter(filter);
    userFilter.setQuery('state', state);
    onChange(userFilter.toFilter());
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white border rounded-md border-slate-200">
      <FormInputText
        placeholder={t('userFilter.inputSearchPlaceholder')}
        icon={<TbSearch />}
        defaultValue={filter.search}
        onSubmit={handleSearchChange}
      />
      <FormInputSelect
        className="col-span-2 min-w-48"
        placeholder={t('userFilter.selectRolePlaceholder')}
        value={filterUtils.getString(filter, 'role')}
        onSubmit={handleRoleChange}
        options={roleOptions}
      />
      <FormInputSelect
        className="col-span-2 min-w-48"
        placeholder={t('userFilter.selectStatePlaceholder')}
        value={filterUtils.getString(filter, 'state')}
        onSubmit={handleStateChange}
        options={statusOptions}
      />
    </div>
  );
}

export default UserFilters;
