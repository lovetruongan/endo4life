import { IOption } from '@endo4life/types';

/**
 * Converts tag names to UUIDs using tag options
 * Used when loading form data - backend returns names but form needs UUIDs
 */
export function convertTagNamesToIds(
  tagNames: string[] | undefined,
  tagOptions: IOption[]
): string[] {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  return tagNames
    .map((name) => {
      // Try to find option by label (name)
      const option = tagOptions.find((opt) => opt.label === name);
      return option ? option.value : name; // Return UUID if found, name otherwise
    })
    .filter((val) => val); // Remove empty values
}

/**
 * Converts tag UUIDs to names using tag options
 * Used when displaying tags - backend returns names, form has UUIDs
 */
export function convertTagIdsToNames(
  tagIds: string[] | undefined,
  tagOptions: IOption[]
): string[] {
  if (!tagIds || tagIds.length === 0) {
    return [];
  }

  return tagIds
    .map((id) => {
      // Try to find option by value (UUID)
      const option = tagOptions.find((opt) => opt.value === id);
      return option ? option.label : id; // Return name if found, ID otherwise
    })
    .filter((val) => val); // Remove empty values
}

