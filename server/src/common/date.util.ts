const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getDatePartsInTimezone(date: Date, timezone: string): { day: number; month: number; year: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));
  return {
    day: Number(valueByType.get('day')),
    month: Number(valueByType.get('month')),
    year: Number(valueByType.get('year')),
  };
}

export function addDays(date: Date, dayCount: number): Date {
  return new Date(date.getTime() + dayCount * ONE_DAY_IN_MILLISECONDS);
}
