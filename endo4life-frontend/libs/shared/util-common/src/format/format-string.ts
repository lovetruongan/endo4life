import { stringUtils } from "../reference-type";

function formatFullName({
  firstName,
  lastName,
  formatVietnamese = true,
}: {
  firstName: string;
  lastName: string;
  formatVietnamese?: boolean;
}) {
  return formatVietnamese
    ? stringUtils.defaultString(firstName) + " " + stringUtils.defaultString(lastName)
    : stringUtils.defaultString(lastName) + " " + stringUtils.defaultString(firstName);
}

export {
  formatFullName,
};
