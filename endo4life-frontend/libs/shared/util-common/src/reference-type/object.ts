export const defaultObject = <T>(value: T | undefined): T => {
  return value !== undefined ? value : {} as T;
}

export const defaultObjectWithValue = <T>(value: T | undefined, alternative: T): T => {
  return value !== undefined ? value : alternative;
}

export const objectUtils = {
  defaultObject,
  defaultObjectWithValue,
}
