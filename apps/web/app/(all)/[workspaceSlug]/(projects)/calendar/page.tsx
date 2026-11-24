/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: shared calendar (events, not work items).
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useTranslation } from "@plane/i18n";
import { PageHead } from "@/components/core/page-title";
import { FlowixCalendarRoot } from "@/components/flowix-calendar/root";

function WorkspaceCalendarPage() {
  const { workspaceSlug } = useParams();
  const { t } = useTranslation();
  return (
    <>
      <PageHead title={t("flowix.calendar.title")} />
      <div className="relative h-full w-full overflow-hidden">
        {workspaceSlug && <FlowixCalendarRoot workspaceSlug={workspaceSlug.toString()} />}
      </div>
    </>
  );
}

export default observer(WorkspaceCalendarPage);
