import { useAuthContext } from '@endo4life/feature-auth';
import { WEB_CLIENT_STUDENT } from '@endo4life/feature-config';
import { Avatar } from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { IoIosLogOut } from 'react-icons/io';
import { PiGearSix, PiUserCircle } from 'react-icons/pi';

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

  return (
    <div
      className={clsx(
        'fixed left-40 bottom-10 z-10 mt-2 border border-slate-100 bg-white shadow min-w-320 rounded-xl p-2',
        { hidden: !opened },
      )}
    >
      <section className="py-2 w-64">
        <div className="flex items-center gap-3 px-4 py-2 cursor-pointer">
          <Avatar
            alt="avatar"
            src={userProfile?.avatarLink}
            sx={{
              bgcolor: '#ccc',
              width: '36px',
              height: '36px',
            }}
          >
            {!userProfile?.avatarLink &&
              (userProfile?.firstName?.charAt(0) ||
                userProfile?.lastName?.charAt(0) ||
                userProfile?.email?.charAt(0)?.toUpperCase())}
          </Avatar>
          <div>
            <h3 className="text-sm">
              {userProfile?.firstName} {userProfile?.lastName}
            </h3>
            <p className="text-xs text-slate-500">{userProfile?.email}</p>
          </div>
        </div>
        <button className="flex items-center w-full gap-4 px-4 py-2 mt-2 hover:bg-slate-100">
          <PiUserCircle size={20} color="gray" />
          <span className="flex-auto text-sm text-left">
            {t('account.txtProfile')}
          </span>
        </button>
        <button
          onClick={() => changeWebClientId(WEB_CLIENT_STUDENT)}
          className="flex items-center w-full gap-4 px-4 py-2 hover:bg-slate-100"
        >
          <PiGearSix size={20} color="gray" />
          <span className="flex-auto text-sm text-left">
            {t('account.txtStudent')}
          </span>
        </button>
      </section>
      <section className="pt-2 border-t-2">
        <button
          className="flex items-center w-full gap-4 px-4 py-2 hover:bg-slate-100"
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
