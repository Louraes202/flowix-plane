# SPDX-License-Identifier: AGPL-3.0-only

import uuid

from django.conf import settings
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.response import Response

from plane.app.permissions import ROLE, allow_permission
from plane.app.views.base import BaseAPIView
from plane.bgtasks.storage_metadata_task import get_asset_object_metadata
from plane.db.models import FileAsset, Workspace
from plane.settings.storage import S3Storage
from plane.utils.path_validator import sanitize_filename

from .models import CalendarEvent
from .serializers import CalendarEventSerializer

# Everyone in the workspace sees the shared calendar. Guests can only read it.
READ_ROLES = [ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST]
WRITE_ROLES = [ROLE.ADMIN, ROLE.MEMBER]
MAX_EVENTS = 2000


class CalendarEventEndpoint(BaseAPIView):
    def get_events(self, slug):
        return CalendarEvent.objects.filter(workspace__slug=slug).prefetch_related("attendees")

    @allow_permission(READ_ROLES, level="WORKSPACE")
    def get(self, request, slug, pk=None):
        if pk:
            event = self.get_events(slug).get(pk=pk)
            return Response(CalendarEventSerializer(event).data, status=status.HTTP_200_OK)

        events = self.get_events(slug)
        # Events that overlap [start, end)
        start = parse_datetime(request.GET.get("start") or "")
        end = parse_datetime(request.GET.get("end") or "")
        if start:
            events = events.filter(end_at__gte=start)
        if end:
            events = events.filter(start_at__lt=end)
        project_id = request.GET.get("project")
        if project_id:
            events = events.filter(project_id=project_id)
        return Response(CalendarEventSerializer(events[:MAX_EVENTS], many=True).data, status=status.HTTP_200_OK)

    @allow_permission(WRITE_ROLES, level="WORKSPACE")
    def post(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)
        serializer = CalendarEventSerializer(data=request.data, context={"workspace_id": workspace.id})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        event = serializer.save(workspace=workspace)
        return Response(CalendarEventSerializer(event).data, status=status.HTTP_201_CREATED)

    @allow_permission(WRITE_ROLES, level="WORKSPACE")
    def patch(self, request, slug, pk):
        event = self.get_events(slug).get(pk=pk)
        serializer = CalendarEventSerializer(
            event, data=request.data, partial=True, context={"workspace_id": event.workspace_id}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        event = serializer.save()
        return Response(CalendarEventSerializer(event).data, status=status.HTTP_200_OK)

    @allow_permission(WRITE_ROLES, level="WORKSPACE")
    def delete(self, request, slug, pk):
        event = self.get_events(slug).get(pk=pk)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


LOGO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]


class ProjectLogoAssetEndpoint(BaseAPIView):
    """Upload an image to use as the project logo (logo_props.in_use = "image").

    The asset is stored as a PROJECT_COVER, so it is served by the public static URL
    (/api/assets/v2/static/<id>/), but unlike the cover upload it does not replace the
    project's cover image. The frontend then saves the URL in the project's logo_props.
    """

    @allow_permission([ROLE.ADMIN])
    def post(self, request, slug, project_id):
        name = sanitize_filename(request.data.get("name")) or "logo"
        file_type = request.data.get("type", "image/png")
        if file_type not in LOGO_TYPES:
            return Response(
                {"error": "Only JPEG, PNG, WebP and GIF images are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        size = min(int(request.data.get("size", settings.FILE_SIZE_LIMIT)), settings.FILE_SIZE_LIMIT)
        workspace = Workspace.objects.get(slug=slug)
        asset_key = f"{workspace.id}/{uuid.uuid4().hex}-{name}"
        asset = FileAsset.objects.create(
            attributes={"name": name, "type": file_type, "size": size},
            asset=asset_key,
            size=size,
            workspace=workspace,
            project_id=project_id,
            entity_type=FileAsset.EntityTypeContext.PROJECT_COVER,
            created_by=request.user,
        )
        presigned_url = S3Storage(request=request).generate_presigned_post(
            object_name=asset_key, file_type=file_type, file_size=size
        )
        return Response(
            {"upload_data": presigned_url, "asset_id": str(asset.id), "asset_url": asset.asset_url},
            status=status.HTTP_200_OK,
        )

    @allow_permission([ROLE.ADMIN])
    def patch(self, request, slug, project_id, pk):
        asset = FileAsset.objects.get(
            id=pk,
            workspace__slug=slug,
            project_id=project_id,
            entity_type=FileAsset.EntityTypeContext.PROJECT_COVER,
        )
        asset.is_uploaded = True
        asset.save(update_fields=["is_uploaded"])
        if not asset.storage_metadata:
            get_asset_object_metadata.delay(asset_id=str(pk))
        return Response(status=status.HTTP_204_NO_CONTENT)
