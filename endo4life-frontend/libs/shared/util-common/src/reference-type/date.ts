const comparator = (dateA: Date | string, dateB: Date | string, isAsc = true): number => {
  const [timestampA, timestampB] = [new Date(dateA).getTime(), new Date(dateB).getTime()];
  return isAsc ? timestampA - timestampB : timestampB - timestampA;
};

export const dateUtils = {
  comparator,
}
