# SPDX-License-Identifier: AGPL-3.0-only

from django.conf import settings
from django.db import models

from plane.db.models.base import BaseModel


class CalendarEvent(BaseModel):
    """An event in the workspace's shared calendar: a meeting, a visit, a deadline.

    It is not a work item. It has no state or assignee and never shows up in work item lists.
    """

    workspace = models.ForeignKey("db.Workspace", on_delete=models.CASCADE, related_name="flowix_calendar_events")
    project = models.ForeignKey(
        "db.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="flowix_calendar_events",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    location = models.CharField(max_length=512, blank=True, default="")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    attendees = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="flowix_calendar_events")

    class Meta:
        db_table = "flowix_calendar_events"
        ordering = ("start_at",)
        indexes = [models.Index(fields=["workspace", "start_at"], name="flowix_cal_ws_start_idx")]

    def __str__(self):
        return self.title
