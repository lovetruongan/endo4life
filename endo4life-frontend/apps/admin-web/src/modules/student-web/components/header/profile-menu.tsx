import { useAuthContext } from '@endo4life/feature-auth';
import {
  WEB_CLIENT_ADMIN,
  STUDENT_WEB_ROUTES,
} from '@endo4life/feature-config';
import { useNameInitial } from '@endo4life/feature-user';
import { Avatar } from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { IoIosLogOut } from 'react-icons/io';
import { PiGearSix, PiUserCircle } from 'react-icons/pi';
import { TbMessage2Question } from 'react-icons/tb';
import { Link } from 'react-router-dom';

interface IProfileMenu {
  opened: boolean;
}

export default function ProfileMenu({ opened }: IProfileMenu) {
  const {
    userProfile,
    logout: onClickLogout,
    changeWebClientId,
  } = useAuthContext();
  const { t } = useTranslation('common');
  const firstCharacterName = useNameInitial(userProfile);

  const onClickSwitchToAdmin = () => {
    changeWebClientId(WEB_CLIENT_ADMIN);
  };

  return (
    <div
      className={clsx(
        'absolute right-0 top-full z-10 mt-2 border border-slate-100 bg-white shadow min-w-320 rounded-xl',
        { hidden: !opened },
      )}
    >
      <section className="py-2 w-64">
        <h2 className="px-4 py-2 mt-2 text-xs font-semibold uppercase text-slate-700">
          {t('account.txtAccount')}
        </h2>
        <div className="flex items-center gap-3 px-4 py-2 cursor-pointer">
          <Avatar
            alt="avatar"
            src={userProfile?.avatarLink}
            sx={{
              width: '36px',
              height: '36px',
            }}
          >
            {firstCharacterName}
          </Avatar>
          <div>
            <h3 className="text-sm">
              {userProfile?.firstName} {userProfile?.lastName}
            </h3>
            <p className="text-xs text-slate-500">{userProfile?.email}</p>
          </div>
        </div>
        <Link
          to={STUDENT_WEB_ROUTES.MY_QUESTIONS}
          className="flex items-center w-full gap-3 px-4 py-2 mt-2 hover:bg-slate-100"
        >
          <TbMessage2Question size={20} color="gray" />
        <span className="flex-auto text-sm text-left">
          {userProfile?.roles?.[0] === 'SPECIALIST'
            ? 'Assigned Questions'
            : t('navigation.txtMenuItemQ&A')}
        </span>
        </Link>
        <Link
          to={STUDENT_WEB_ROUTES.MY_PROFILE}
          className="flex items-center w-full gap-3 px-4 py-2 hover:bg-slate-100"
        >
          <PiUserCircle size={20} color="gray" />
          <span className="flex-auto text-sm text-left">
            {t('account.txtProfile')}
          </span>
        </Link>
        <button
          className="flex items-center w-full gap-3 px-4 py-2 hover:bg-slate-100"
          onClick={onClickSwitchToAdmin}
        >
          <PiGearSix size={20} color="gray" />
          <span className="flex-auto text-sm text-left">
            {t('account.txtAdmin')}
          </span>
        </button>
      </section>

      <section className="pt-2 pb-1 border-t-2">
        <button
          className="flex items-center w-full gap-3 px-4 py-2 hover:bg-slate-100"
          onClick={onClickLogout}
        >
          <IoIosLogOut size={20} color="gray" />
          <span className="flex-auto text-sm text-left">
            {t('account.txtLogout')}
          </span>
        </button>
      </section>
    </div>
  );
}
