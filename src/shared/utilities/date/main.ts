export function convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD(date: string): string {
  const [year, month, day] = date.split('-');

  if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
    throw new Error('Invalid date format. Expected dd-mm-yyyy.');
  }
  return `${year}-${month}-${day}`;
}

export function convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(yyyymmdd) {
  if (typeof yyyymmdd !== 'string' || yyyymmdd.length !== 8) {
      throw new Error('Invalid input format. Expected yyyymmdd string.');
  }
  const year = yyyymmdd.substring(0, 4);
  const month = yyyymmdd.substring(4, 6);
  const day = yyyymmdd.substring(6, 8);
  return `${day}-${month}-${year}`;
}

export function convertToUnixTimestamp(dateString: string){
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; 
  const day = parseInt(dateString.substring(6, 8), 10);
  const date = new Date(Date.UTC(year, month, day, 0, 0, 0));
  return date.getTime();
}

export function convertUnixToEndOfDay(dateString: string) {
  const unixTimestampInMillis = convertToUnixTimestamp(dateString)
  const date = new Date(unixTimestampInMillis);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}