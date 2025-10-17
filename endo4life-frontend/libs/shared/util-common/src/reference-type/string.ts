export const defaultString = (value: string | undefined) => {
  return value !== undefined ? value : "";
}

export const defaultStringWithValue = (value: string | undefined, alternative: string) => {
  return value !== undefined ? value : alternative;
}

const comparator = (valueA: string, valueB: string, isAsc = true): number => {
  return isAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
};

export const stringUtils = {
  defaultString,
  defaultStringWithValue,
  comparator,
}
