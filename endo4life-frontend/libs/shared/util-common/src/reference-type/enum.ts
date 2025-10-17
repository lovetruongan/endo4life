import { defaultObject, defaultObjectWithValue } from "./object";

export const defaultEnum = <T>(value: T | undefined): T => {
  return defaultObject(value);
}

export const defaultEnumWithValue = <T>(value: T | undefined, alternative: T): T => {
  return defaultObjectWithValue(value, alternative);
}

export const enumUtils = {
  defaultEnum,
  defaultEnumWithValue,
}
