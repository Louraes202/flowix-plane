# SPDX-License-Identifier: AGPL-3.0-only

from django.urls import path

from .views import CalendarEventEndpoint, ProjectLogoAssetEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/calendar-events/",
        CalendarEventEndpoint.as_view(),
        name="flowix-calendar-events",
    ),
    path(
        "workspaces/<str:slug>/calendar-events/<uuid:pk>/",
        CalendarEventEndpoint.as_view(),
        name="flowix-calendar-event",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/flowix-logo/",
        ProjectLogoAssetEndpoint.as_view(),
        name="flowix-project-logo",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/flowix-logo/<uuid:pk>/",
        ProjectLogoAssetEndpoint.as_view(),
        name="flowix-project-logo-uploaded",
    ),
]
