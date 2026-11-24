/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: shared calendar (events, not work items).
 */

import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { WorkspaceCalendarHeader } from "./header";

export default function WorkspaceCalendarLayout() {
  return (
    <>
      <AppHeader header={<WorkspaceCalendarHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
