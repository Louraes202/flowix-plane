/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: events in the workspace's shared calendar (not work items).
 */

export type TCalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  /** ISO date-time (UTC) */
  start_at: string;
  /** ISO date-time (UTC) */
  end_at: string;
  all_day: boolean;
  project: string | null;
  attendees: string[];
  workspace: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TCalendarEventPayload = Pick<
  TCalendarEvent,
  "title" | "description" | "location" | "start_at" | "end_at" | "all_day" | "project" | "attendees"
>;
