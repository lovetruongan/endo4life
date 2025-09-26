import moment from 'moment';
import 'moment/dist/locale/en-au';
import 'moment/dist/locale/vi';

export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
export const TIME_DATE_FORMAT = 'HH:mm:ss DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATE_FORMAT = 'DD/MM/YYYY';

export function formatDate(
  date: Date | string | number,
  format = DATE_TIME_FORMAT,
) {
  return moment(date).format(format);
}

export function formatDateOnly(date: Date | string | number) {
  return moment(date).format(DATE_FORMAT);
}

export function formatTime(durationInMs: number) {
  return moment
    .utc(moment.duration(durationInMs, 'milliseconds').asMilliseconds())
    .format(TIME_FORMAT);
}

export function formatTimeAgo(date: Date | string, locale = 'vi') {
  moment.locale(locale);
  const inputTime = moment(date);
  return inputTime.fromNow();
}
