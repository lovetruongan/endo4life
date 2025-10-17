export const defaultNumber = (value: number | undefined): number => {
  return value !== undefined ? value : 0;
}

export const defaultNumberWithValue = (value: number | undefined, alternative: number): number => {
  return value !== undefined ? value : alternative;
}

const comparator = (valueA: number, valueB: number, isAsc = true): number => {
  return isAsc ? valueA - valueB : valueB - valueA;
};

export const numberUtils = {
  defaultNumber,
  defaultNumberWithValue,
  comparator,
}
