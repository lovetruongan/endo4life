const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});
export function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

const numberFormatter = new Intl.NumberFormat('vi-VN');
export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatIntStr(value: number) {
  return (value < 10 ? '0' : '') + value;
}
