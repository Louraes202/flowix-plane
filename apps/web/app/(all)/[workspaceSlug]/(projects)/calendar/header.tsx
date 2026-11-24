/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: shared calendar (events, not work items).
 */

import { observer } from "mobx-react";
import { CalendarDays } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Breadcrumbs, Header } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";

export const WorkspaceCalendarHeader = observer(function WorkspaceCalendarHeader() {
  const { t } = useTranslation();
  return (
    <Header>
      <Header.LeftItem>
        <Breadcrumbs>
          <Breadcrumbs.Item
            component={
              <BreadcrumbLink
                label={t("flowix.calendar.title")}
                icon={<CalendarDays className="size-4 text-secondary" />}
              />
            }
          />
        </Breadcrumbs>
      </Header.LeftItem>
    </Header>
  );
});
