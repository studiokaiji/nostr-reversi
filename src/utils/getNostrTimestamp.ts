export const getNostrTimestamp = (date = new Date()) =>
  Math.floor(date.getTime() / 1000);

export const nostrTimestampToDate = (timestamp: number) =>
  new Date(timestamp * 1000);
