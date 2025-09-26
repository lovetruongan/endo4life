import { useAuthContext } from '@endo4life/feature-auth';
import { deepOrange } from '@mui/material/colors';
import { Avatar } from '@mui/material';
import { FaUser } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TbLogout2 } from 'react-icons/tb';

interface IProfileMenu {
  opened: boolean;
}

export default function ProfileMenu({ opened }: IProfileMenu) {
  const { logout: onClickLogout } = useAuthContext();
  const { t } = useTranslation('common');

  return (
    <div
      className={clsx(
        'absolute right-0 top-full z-10 mt-2 border border-slate-100 bg-white shadow min-w-320 rounded-xl p-2',
        { hidden: !opened }
      )}
    >
      <section className="py-2 w-72">
        <div className="flex items-center gap-3 px-4 py-2 cursor-pointer">
          <Avatar
            alt="avatar"
            sx={{
              bgcolor: deepOrange[500],
              width: '36px',
              height: '36px',
            }}
            src="https://img.freepik.com/free-photo/close-up-young-successful-man-smiling-camera-standing-casual-outfit-against-blue-background_1258-65746.jpg"
          ></Avatar>
          <div>
            <h3 className="text-sm">(name of user here)</h3>
            <p className="text-xs text-slate-500">(email here)</p>
          </div>
        </div>
        <button className="flex items-center w-full gap-4 px-4 py-2 mt-2 hover:bg-slate-100">
          <FaUser color="gray" />
          <span className="flex-auto text-sm text-left">{t('account.txtProfile')}</span>
        </button>
        <button className="flex items-center w-full gap-4 px-4 py-2 hover:bg-slate-100">
          <IoMdSettings color="gray" />
          <span className="flex-auto text-sm text-left">{t('account.txtSetting')}</span>
        </button>
      </section>
      <section className="pt-2 border-t-2">
        <button
          className="flex items-center w-full gap-4 px-4 py-2 hover:bg-slate-100"
          onClick={onClickLogout}
        >
          <TbLogout2 color="gray" />
          <span className="flex-auto text-sm text-left">{t('account.txtLogout')}</span>
        </button>
      </section>
    </div>
  );
}
