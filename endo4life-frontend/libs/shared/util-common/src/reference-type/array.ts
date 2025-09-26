export const defaultArray = <T>(data: T[] | undefined): T[] => {
  return data !== undefined ? data : new Array<T>();
}

export const defaultArrayWithValue = <T>(data: T[] | undefined, alternative: T[]): T[] => {
  return data !== undefined ? data : alternative;
}

export const arrayUtils = {
  defaultArray,
  defaultArrayWithValue,
}
