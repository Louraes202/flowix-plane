/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

import { FlowixMark, FlowixWordmarkPaths } from "./flowix-mark";

// Flowix: the Plane lockup is replaced by the Flowix logo (logo-full-*.svg).
// The wordmark follows `color` (ink on light, white on dark); the mark stays blue.
export function PlaneLockup({ width = "95", height = "31", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="2.5 1.5 77.5 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flowix"
    >
      <FlowixWordmarkPaths color={color} />
      <FlowixMark />
    </svg>
  );
}
