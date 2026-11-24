# SPDX-License-Identifier: AGPL-3.0-only

from rest_framework import serializers

from plane.db.models import WorkspaceMember

from .models import CalendarEvent


class CalendarEventSerializer(serializers.ModelSerializer):
    # Written as a list of user ids; read back in to_representation.
    attendees = serializers.ListField(child=serializers.UUIDField(), required=False, write_only=True)

    class Meta:
        model = CalendarEvent
        fields = [
            "id",
            "title",
            "description",
            "location",
            "start_at",
            "end_at",
            "all_day",
            "project",
            "attendees",
            "workspace",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "created_by", "created_at", "updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["attendees"] = [str(user.id) for user in instance.attendees.all()]
        return data

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate(self, data):
        start_at = data.get("start_at", getattr(self.instance, "start_at", None))
        end_at = data.get("end_at", getattr(self.instance, "end_at", None))
        if start_at and end_at and end_at < start_at:
            raise serializers.ValidationError({"end_at": "The end must not be before the start."})

        workspace_id = self.context["workspace_id"]
        project = data.get("project")
        if project is not None and project.workspace_id != workspace_id:
            raise serializers.ValidationError({"project": "The project is not in this workspace."})

        attendees = data.get("attendees")
        if attendees is not None:
            members = set(
                WorkspaceMember.objects.filter(
                    workspace_id=workspace_id, member_id__in=attendees, is_active=True
                ).values_list("member_id", flat=True)
            )
            unknown = [str(a) for a in attendees if a not in members]
            if unknown:
                raise serializers.ValidationError({"attendees": "Not workspace members: " + ", ".join(unknown)})
        return data

    def create(self, validated_data):
        attendees = validated_data.pop("attendees", None)
        event = CalendarEvent.objects.create(**validated_data)
        if attendees is not None:
            event.attendees.set(attendees)
        return event

    def update(self, instance, validated_data):
        attendees = validated_data.pop("attendees", None)
        instance = super().update(instance, validated_data)
        if attendees is not None:
            instance.attendees.set(attendees)
        return instance
