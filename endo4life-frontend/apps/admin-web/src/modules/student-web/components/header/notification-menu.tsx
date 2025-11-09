import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { VscArrowRight } from 'react-icons/vsc';
import { TbMessage2Question, TbMessage } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { useNotifications } from '../../hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';

interface INotificationMenu {
  opened: boolean;
}

export default function NotificationMenu({ opened }: INotificationMenu) {
  const { t } = useTranslation('common');
  const { notifications, loading } = useNotifications();

  // Show max 5 notifications
  const displayNotifications = notifications.slice(0, 5);

  return (
    <div
      className={clsx(
        'absolute right-0 top-full z-10 mt-2 border border-slate-100 bg-white shadow min-w-320 rounded-xl max-h-96 overflow-hidden',
        { hidden: !opened }
      )}
    >
      <div className="w-96">
        <div className="flex items-center px-4 py-3">
          <span className="w-full text-lg text-center font-semibold text-slate-700">
            {t('notification.txtNotification')}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center px-4 py-8 text-slate-500">
            Loading...
          </div>
        )}

        {!loading && displayNotifications.length === 0 && (
          <div className="flex items-center justify-center px-4 py-8 text-slate-500">
            No new notifications
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
               {!loading &&
                 displayNotifications.map((notification) => {
                   const Icon = notification.type === 'CONVERSATION' ? TbMessage2Question : TbMessage;
                   
                   return (
                     <Link
                       key={notification.id}
                       to={notification.link}
                       className={clsx(
                         'flex gap-3 w-full px-4 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors',
                         {
                           'bg-blue-50': notification.isUnread,
                         }
                       )}
                     >
                       <div className="flex-shrink-0 mt-1">
                         <Icon size={18} className="text-slate-600" />
                       </div>
                       <div className="flex-grow flex flex-col">
                         <div className="flex items-start justify-between gap-2">
                           <span className="flex-auto text-sm font-medium text-slate-900">
                             {notification.title}
                           </span>
                           {notification.isUnread && (
                             <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                           )}
                         </div>
                         <span className="text-xs text-slate-600 mt-1 line-clamp-2">
                           {notification.content}
                         </span>
                         <span className="text-xs text-slate-400 mt-1">
                           {formatDistanceToNow(notification.createdAt, {
                             addSuffix: true,
                           })}
                         </span>
                       </div>
                     </Link>
                   );
                 })}
        </div>

        {!loading && displayNotifications.length > 0 && (
          <Link
            to={STUDENT_WEB_ROUTES.MY_QUESTIONS}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2 text-sm text-center font-medium text-slate-500 border-b-2">
              {t('notification.txtViewAll')}
              <VscArrowRight />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
