/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: create, edit or delete an event in the shared calendar.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TCalendarEvent, TCalendarEventPayload } from "@plane/types";
import { EModalPosition, EModalWidth, Input, ModalCore, TextArea } from "@plane/ui";
import { addDays, addHours } from "date-fns";
// components
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { ProjectDropdown } from "@/components/dropdowns/project/dropdown";
// services
import { FlowixCalendarService } from "@/services/flowix-calendar.service";
// local
import { fromInputs, toDateInput, toTimeInput } from "./utils";

const calendarService = new FlowixCalendarService();

type TForm = {
  title: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  project: string | null;
  attendees: string[];
  location: string;
  description: string;
};

const formFromEvent = (event: TCalendarEvent): TForm => {
  const start = new Date(event.start_at);
  // all-day events are stored with an exclusive end (midnight of the next day)
  const end = event.all_day ? addDays(new Date(event.end_at), -1) : new Date(event.end_at);
  return {
    title: event.title,
    allDay: event.all_day,
    startDate: toDateInput(start),
    startTime: toTimeInput(start),
    endDate: toDateInput(end),
    endTime: toTimeInput(end),
    project: event.project,
    attendees: event.attendees,
    location: event.location,
    description: event.description,
  };
};

const formForDay = (day: Date, projectId: string | null): TForm => {
  const now = new Date();
  // default slot: next full hour on the chosen day, one hour long
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.min(now.getHours() + 1, 23), 0);
  const end = addHours(start, 1);
  return {
    title: "",
    allDay: false,
    startDate: toDateInput(start),
    startTime: toTimeInput(start),
    endDate: toDateInput(end),
    endTime: toTimeInput(end),
    project: projectId,
    attendees: [],
    location: "",
    description: "",
  };
};

const toPayload = (form: TForm): TCalendarEventPayload => {
  const start = form.allDay ? fromInputs(form.startDate) : fromInputs(form.startDate, form.startTime);
  const end = form.allDay ? addDays(fromInputs(form.endDate), 1) : fromInputs(form.endDate, form.endTime);
  return {
    title: form.title.trim(),
    all_day: form.allDay,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    project: form.project,
    attendees: form.attendees,
    location: form.location.trim(),
    description: form.description.trim(),
  };
};

type Props = {
  workspaceSlug: string;
  isOpen: boolean;
  /** Event to edit, or undefined to create one */
  event?: TCalendarEvent;
  /** Day picked in the calendar when creating */
  day?: Date;
  defaultProjectId?: string | null;
  readOnly?: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export const CalendarEventModal = observer(function CalendarEventModal(props: Props) {
  const { workspaceSlug, isOpen, event, day, defaultProjectId = null, readOnly = false, onClose, onSaved } = props;
  const { t } = useTranslation();
  const [form, setForm] = useState<TForm>(() => formForDay(day ?? new Date(), defaultProjectId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(event ? formFromEvent(event) : formForDay(day ?? new Date(), defaultProjectId));
    setError(null);
    setConfirmDelete(false);
  }, [isOpen, event, day, defaultProjectId]);

  const set = <K extends keyof TForm>(key: K, value: TForm[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!form.title.trim()) {
      setError(t("flowix.calendar.errors.title"));
      return;
    }
    const payload = toPayload(form);
    if (new Date(payload.end_at) < new Date(payload.start_at)) {
      setError(t("flowix.calendar.errors.end_before_start"));
      return;
    }
    setIsSaving(true);
    try {
      if (event) await calendarService.update(workspaceSlug, event.id, payload);
      else await calendarService.create(workspaceSlug, payload);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t(event ? "flowix.calendar.toasts.updated" : "flowix.calendar.toasts.created"),
      });
      onSaved();
      onClose();
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: t("flowix.calendar.toasts.error") });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    // first click asks, second click deletes
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await calendarService.remove(workspaceSlug, event.id);
      setToast({ type: TOAST_TYPE.SUCCESS, title: t("flowix.calendar.toasts.deleted") });
      onSaved();
      onClose();
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: t("flowix.calendar.toasts.error") });
    } finally {
      setIsDeleting(false);
    }
  };

  const label = "text-12 font-medium text-tertiary";

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} position={EModalPosition.CENTER} width={EModalWidth.XXL}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <h3 className="text-18 font-medium text-primary">
          {t(event ? "flowix.calendar.edit_event" : "flowix.calendar.new_event")}
        </h3>

        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("flowix.calendar.fields.title")}
          className="w-full text-16"
          disabled={readOnly}
          hasError={!!error && !form.title.trim()}
        />

        <label className="flex w-fit cursor-pointer items-center gap-2 text-13 text-secondary">
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => set("allDay", e.target.checked)}
            disabled={readOnly}
            className="size-4 accent-[var(--color-accent-primary,#1a6eff)]"
          />
          {t("flowix.calendar.fields.all_day")}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className={label}>{t("flowix.calendar.fields.start")}</span>
            <div className="flex gap-2">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => {
                  const startDate = e.target.value;
                  // keep the end on or after the start
                  setForm((prev) => ({
                    ...prev,
                    startDate,
                    endDate: prev.endDate < startDate ? startDate : prev.endDate,
                  }));
                }}
                className="w-full"
                disabled={readOnly}
              />
              {!form.allDay && (
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  className="w-28"
                  disabled={readOnly}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={label}>{t("flowix.calendar.fields.end")}</span>
            <div className="flex gap-2">
              <Input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full"
                disabled={readOnly}
              />
              {!form.allDay && (
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                  className="w-28"
                  disabled={readOnly}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className={label}>{t("flowix.calendar.fields.project")}</span>
            <div className="flex min-w-0 items-center gap-2 [&>*:first-child]:min-w-0 [&>*:first-child]:flex-1">
              <ProjectDropdown
                multiple={false}
                value={form.project}
                onChange={(val) => set("project", val === form.project ? null : val)}
                buttonVariant="border-with-text"
                buttonContainerClassName="w-full text-left"
                buttonClassName="w-full"
                placeholder={t("flowix.calendar.fields.no_project")}
                disabled={readOnly}
              />
              {form.project && !readOnly && (
                <button
                  type="button"
                  className="text-12 whitespace-nowrap text-tertiary hover:text-primary"
                  onClick={() => set("project", null)}
                >
                  {t("flowix.calendar.fields.clear")}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={label}>{t("flowix.calendar.fields.attendees")}</span>
            <MemberDropdown
              multiple
              value={form.attendees}
              onChange={(val) => set("attendees", val)}
              buttonVariant="border-with-text"
              buttonContainerClassName="w-full text-left"
              buttonClassName="w-full"
              placeholder={t("flowix.calendar.fields.no_attendees")}
              disabled={readOnly}
              showUserDetails
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className={label}>{t("flowix.calendar.fields.location")}</span>
          <Input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder={t("flowix.calendar.fields.location_placeholder")}
            className="w-full"
            disabled={readOnly}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className={label}>{t("flowix.calendar.fields.description")}</span>
          <TextArea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-20 w-full"
            disabled={readOnly}
          />
        </div>

        {error && <p className="text-13 text-danger-primary">{error}</p>}

        <div className="flex items-center justify-between gap-2 border-t border-subtle pt-4">
          <div>
            {event && !readOnly && (
              <Button
                variant={confirmDelete ? "error-fill" : "error-outline"}
                size="lg"
                type="button"
                onClick={handleDelete}
                loading={isDeleting}
              >
                {t(confirmDelete ? "flowix.calendar.confirm_delete" : "flowix.calendar.delete")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" type="button" onClick={onClose}>
              {t(readOnly ? "flowix.calendar.close" : "flowix.calendar.cancel")}
            </Button>
            {!readOnly && (
              <Button variant="primary" size="lg" type="submit" loading={isSaving}>
                {t(event ? "flowix.calendar.save" : "flowix.calendar.create")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </ModalCore>
  );
});
