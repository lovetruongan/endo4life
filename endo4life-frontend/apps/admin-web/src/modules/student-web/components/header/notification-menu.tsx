import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { VscArrowRight } from 'react-icons/vsc';

interface INotificationMenu {
  opened: boolean;
}

export default function NotificationMenu({ opened }: INotificationMenu) {
  const { t } = useTranslation('common');

  const notifications = [
    {
      id: 'notification1',
      label: 'Thông báo 1',
      link: '#',
      unread: true,
    },
    {
      id: 'notification2',
      label: 'Thông báo 2',
      link: '#',
      unread: true,
    },
    {
      id: 'notification3',
      label: 'Thông báo 3',
      link: '#',
      unread: false,
    },
  ];

  return (
    <div
      className={clsx(
        'absolute right-0 top-full z-10 mt-2 border border-slate-100 bg-white shadow min-w-320 rounded-xl',
        { hidden: !opened }
      )}
    >
      <div className="w-72">
        <div className="flex items-center px-4 py-3 cursor-pointer">
          <span className="w-full text-lg text-center font-semibold text-slate-700">{t('notification.txtNotification')}</span>
        </div>
        {notifications.map((notification) => {
          return (
            <button
              key={notification.id}
              className={clsx(
                'flex items-center w-full px-4 py-3 border-b border-slate-200 hover:bg-slate-50',
                {
                  'bg-slate-100': notification.unread,
                  'opacity-80': !notification.unread,
                }
              )}
            >
              <span className="flex-auto text-sm text-left">{notification.label}</span>
            </button>
          );
        })}
        <button
          className="flex items-center justify-center w-full gap-4 px-4 py-3"
        >
            <span className="flex items-center gap-2 text-sm text-center font-medium text-slate-500 border-b-2">
            {t('notification.txtViewAll')}
            <VscArrowRight />
          </span>
        </button>
      </div>
    </div>
  );
}
