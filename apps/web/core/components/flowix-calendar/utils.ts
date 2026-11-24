/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: date helpers for the shared calendar. Everything is in the browser's local time.
 */

import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import type { TCalendarEvent } from "@plane/types";

export type TWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Days shown in the month grid: whole weeks covering the month. */
export const getMonthGridDays = (month: Date, weekStartsOn: TWeekStart): Date[] => {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn });
  const last = endOfWeek(endOfMonth(month), { weekStartsOn });
  const days: Date[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
  return days;
};

export const dayKey = (date: Date) => format(date, "yyyy-MM-dd");

/** Start and end of a local day, as Date objects. */
const dayBounds = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return { start, end: addDays(start, 1) };
};

/** Events grouped by local day. An event that spans several days appears on each of them. */
export const groupEventsByDay = (events: TCalendarEvent[], days: Date[]): Record<string, TCalendarEvent[]> => {
  const grouped: Record<string, TCalendarEvent[]> = {};
  for (const day of days) {
    const { start, end } = dayBounds(day);
    grouped[dayKey(day)] = events
      .filter((event) => {
        const eventStart = new Date(event.start_at);
        const eventEnd = new Date(event.end_at);
        // all-day events end at midnight of the next day (exclusive)
        if (event.all_day) return eventStart < end && eventEnd > start;
        return eventStart < end && (eventEnd > start || eventStart >= start);
      })
      // filter() already returns a new array, so sorting in place is safe
      // oxlint-disable-next-line unicorn/no-array-sort
      .sort((a, b) => {
        if (a.all_day !== b.all_day) return a.all_day ? -1 : 1;
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      });
  }
  return grouped;
};

/** "HH:mm" for a time input. */
export const toTimeInput = (date: Date) => format(date, "HH:mm");
/** "yyyy-MM-dd" for a date input. */
export const toDateInput = (date: Date) => format(date, "yyyy-MM-dd");

/** Local date ("yyyy-MM-dd") and time ("HH:mm") to a Date. */
export const fromInputs = (date: string, time = "00:00") => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
};
