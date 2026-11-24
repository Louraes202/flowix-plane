/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: shared calendar events (backend app plane.flowix).
 */

import { API_BASE_URL } from "@plane/constants";
import type { TCalendarEvent, TCalendarEventPayload } from "@plane/types";
import { APIService } from "@/services/api.service";

export class FlowixCalendarService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async list(workspaceSlug: string, start: string, end: string): Promise<TCalendarEvent[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/calendar-events/`, { params: { start, end } })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async create(workspaceSlug: string, payload: TCalendarEventPayload): Promise<TCalendarEvent> {
    return this.post(`/api/workspaces/${workspaceSlug}/calendar-events/`, payload)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    eventId: string,
    payload: Partial<TCalendarEventPayload>
  ): Promise<TCalendarEvent> {
    return this.patch(`/api/workspaces/${workspaceSlug}/calendar-events/${eventId}/`, payload)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async remove(workspaceSlug: string, eventId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/calendar-events/${eventId}/`)
      .then(() => undefined)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}
