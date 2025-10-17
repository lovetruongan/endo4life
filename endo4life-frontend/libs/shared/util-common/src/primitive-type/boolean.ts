export const defaultBoolean = (value: boolean | undefined) => {
  return value !== undefined ? value : false;
}

export const defaultBooleanWithValue = (value: boolean | undefined, alternative: boolean) => {
  return value !== undefined ? value : alternative;
}

export const booleanUtils = {
  defaultBoolean,
  defaultBooleanWithValue,
}
