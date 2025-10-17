import clsx from 'clsx';
import useUserRoleOptions from '../../hooks/use-user-role-options';
import { IUserEntity } from '../../types';
import { UserInfoRole } from '@endo4life/data-access';

interface UserRoleCellProps {
  user: IUserEntity;
}
export function UserRoleCell({ user }: UserRoleCellProps) {
  const { getOptionByValue } = useUserRoleOptions();
  return (
    <span
      className={clsx({
        'px-3 py-1 text-xs rounded min-w-20': true,
        'text-orange-700 bg-orange-200': user.role === UserInfoRole.Admin,
        'text-slate-700 bg-slate-200': user.role === UserInfoRole.Customer,
        'text-purple-700 bg-purple-200': user.role === UserInfoRole.Specialist,
        'text-red-700 bg-red-200': user.role === UserInfoRole.Coordinator,
      })}
    >
      {getOptionByValue(user.role)?.label}
    </span>
  );
}
