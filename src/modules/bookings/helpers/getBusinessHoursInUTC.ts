import { DateTime } from 'luxon';

export function getBusinessHoursInUTC(date: string) {
  // Parse date in Vietnam timezone
  const vietnamDate = DateTime.fromISO(date, { zone: 'Asia/Ho_Chi_Minh' });

  // Business hours: 6:00 AM Vietnam
  const startOfBusinessDay = vietnamDate.set({
    hour: 6,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  // Business hours: 11:00 PM Vietnam
  const endOfBusinessDay = vietnamDate.set({
    hour: 23,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  // Convert to UTC and return as JS Date objects
  return {
    start: startOfBusinessDay.toUTC().toJSDate(),
    end: endOfBusinessDay.toUTC().toJSDate(),
  };
}
