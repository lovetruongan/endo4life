import { UserInfoState } from '@endo4life/data-access';
import { IUserEntity } from '../../types';
import { useTranslation } from 'react-i18next';

interface UserStatusCellProps {
  user: IUserEntity;
}
export function UserStatusCell({ user }: UserStatusCellProps) {
  const { t } = useTranslation('user');
  if (user.state === UserInfoState.Active.toString()) {
    return (
      <span className="px-3 py-1 text-xs rounded bg-neutral-background-layer-2 text-sematic-informative min-w-20">
        {t(`state.${UserInfoState.Active.toString()}`)}
      </span>
    );
  }
  if (user.state === UserInfoState.Inactive.toString()) {
    return (
      <span className="px-3 py-1 text-xs rounded text-sematic-negative bg-neutral-background-layer-2 min-w-20">
        {t(`state.${UserInfoState.Inactive.toString()}`)}
      </span>
    );
  }
  if (user.state === UserInfoState.Pending.toString()) {
    return (
      <span className="px-3 py-1 text-xs rounded text-sematic-warning bg-neutral-background-layer-2 min-w-20">
        {t(`state.${UserInfoState.Pending.toString()}`)}
      </span>
    );
  }
  return null;
}
