/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: the workspace's shared calendar. Shows events (meetings, visits, deadlines),
 * not work items. Clicking a day creates an event; clicking an event edits it.
 */

import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { addDays, addMonths, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react";
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { TCalendarEvent } from "@plane/types";
import { cn } from "@plane/utils";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions, useUserProfile } from "@/hooks/store/user";
// services
import { FlowixCalendarService } from "@/services/flowix-calendar.service";
// local
import { CalendarEventModal } from "./event-modal";
import type { TWeekStart } from "./utils";
import { dayKey, getMonthGridDays, groupEventsByDay } from "./utils";

const calendarService = new FlowixCalendarService();
const MAX_VISIBLE_PER_DAY = 4;

type Props = { workspaceSlug: string };

export const FlowixCalendarRoot = observer(function FlowixCalendarRoot({ workspaceSlug }: Props) {
  const { t, currentLocale } = useTranslation();
  const { data: profile } = useUserProfile();
  const { allowPermissions } = useUserPermissions();
  const { getProjectById } = useProject();
  const canEdit = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE,
    workspaceSlug
  );

  const [month, setMonth] = useState(() => new Date());
  const [modal, setModal] = useState<{ open: boolean; event?: TCalendarEvent; day?: Date }>({ open: false });
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const weekStartsOn = ((profile?.start_of_the_week ?? 1) % 7) as TWeekStart;
  const days = useMemo(() => getMonthGridDays(month, weekStartsOn), [month, weekStartsOn]);
  const rangeStart = days[0];
  const rangeEnd = addDays(days[days.length - 1], 1);

  const { data: events, mutate } = useSWR(
    workspaceSlug ? ["flowix-calendar-events", workspaceSlug, rangeStart.toISOString(), rangeEnd.toISOString()] : null,
    () => calendarService.list(workspaceSlug, rangeStart.toISOString(), rangeEnd.toISOString()),
    { revalidateOnFocus: true, keepPreviousData: true }
  );
  const eventsByDay = useMemo(() => groupEventsByDay(events ?? [], days), [events, days]);

  const locale = currentLocale || "pt-PT";
  const monthTitle = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const weekdayNames = days
    .slice(0, 7)
    .map((d) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d).replace(".", ""));
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  const openCreate = (day: Date) => canEdit && setModal({ open: true, day });
  const openEvent = (event: TCalendarEvent) => setModal({ open: true, event });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-subtle px-5 py-3">
        <div className="flex items-center gap-2">
          <h2 className="min-w-44 text-18 font-semibold text-primary first-letter:uppercase">{monthTitle}</h2>
          <button
            type="button"
            aria-label={t("flowix.calendar.previous_month")}
            className="grid size-7 place-items-center rounded-sm text-secondary hover:bg-layer-1"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t("flowix.calendar.next_month")}
            className="grid size-7 place-items-center rounded-sm text-secondary hover:bg-layer-1"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </button>
          <Button variant="secondary" size="sm" onClick={() => setMonth(new Date())}>
            {t("flowix.calendar.today")}
          </Button>
        </div>
        {canEdit && (
          <Button variant="primary" size="lg" prependIcon={<Plus />} onClick={() => openCreate(new Date())}>
            {t("flowix.calendar.new_event")}
          </Button>
        )}
      </div>

      {/* weekday header */}
      <div className="grid flex-shrink-0 grid-cols-7 border-b border-subtle bg-layer-1 text-12 font-medium text-tertiary">
        {weekdayNames.map((name) => (
          <div key={name} className="px-2 py-2 text-right capitalize">
            {name}
          </div>
        ))}
      </div>

      {/* month grid */}
      <div className="grid flex-1 auto-rows-fr grid-cols-7 overflow-y-auto">
        {days.map((day) => {
          const key = dayKey(day);
          const dayEvents = eventsByDay[key] ?? [];
          const isExpanded = expandedDay === key;
          const visible = isExpanded ? dayEvents : dayEvents.slice(0, MAX_VISIBLE_PER_DAY);
          const hidden = dayEvents.length - visible.length;
          const weekend = [0, 6].includes(day.getDay());
          return (
            <div
              key={key}
              className={cn(
                "group relative flex min-h-28 flex-col gap-0.5 border-r border-b border-subtle p-1 [&>*]:relative",
                weekend ? "bg-layer-1" : "bg-surface-1"
              )}
            >
              {/* the whole cell creates an event; events sit on top of this button */}
              {canEdit && (
                <button
                  type="button"
                  aria-label={`${t("flowix.calendar.new_event")}: ${day.toLocaleDateString(locale)}`}
                  onClick={() => openCreate(day)}
                  className="!absolute inset-0 cursor-pointer outline-none hover:bg-layer-transparent-hover focus-visible:bg-layer-transparent-hover"
                />
              )}
              <div className="pointer-events-none flex items-center justify-between px-1">
                {canEdit ? <Plus className="size-3.5 text-placeholder opacity-0 group-hover:opacity-100" /> : <span />}
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-12",
                    isSameMonth(day, month) ? "font-medium text-secondary" : "text-placeholder",
                    isToday(day) && "bg-accent-primary text-on-color"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
              {visible.map((event) => {
                const project = event.project ? getProjectById(event.project) : undefined;
                return (
                  <button
                    key={event.id}
                    type="button"
                    title={event.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEvent(event);
                    }}
                    className={cn(
                      "flex w-full items-center gap-1.5 truncate rounded-sm px-1.5 py-0.5 text-left text-12",
                      event.all_day
                        ? "bg-accent-primary text-on-color hover:opacity-90"
                        : "text-primary hover:bg-layer-1"
                    )}
                  >
                    {project?.logo_props?.in_use ? (
                      <span className="flex-shrink-0">
                        <Logo logo={project.logo_props} size={12} />
                      </span>
                    ) : (
                      !event.all_day && <span className="size-2 flex-shrink-0 rounded-full bg-accent-primary" />
                    )}
                    {!event.all_day && (
                      <span className="flex-shrink-0 text-tertiary tabular-nums">
                        {timeFormat.format(new Date(event.start_at))}
                      </span>
                    )}
                    <span className="truncate">{event.title}</span>
                    {event.location && <MapPin className="size-3 flex-shrink-0 opacity-60" />}
                  </button>
                );
              })}
              {(hidden > 0 || isExpanded) && dayEvents.length > MAX_VISIBLE_PER_DAY && (
                <button
                  type="button"
                  className="w-fit px-1.5 text-11 font-medium text-tertiary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedDay(isExpanded ? null : key);
                  }}
                >
                  {isExpanded ? t("flowix.calendar.show_less") : t("flowix.calendar.show_more", { count: hidden })}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <CalendarEventModal
        workspaceSlug={workspaceSlug}
        isOpen={modal.open}
        event={modal.event}
        day={modal.day}
        readOnly={!canEdit}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        onSaved={() => void mutate()}
      />
    </div>
  );
});
