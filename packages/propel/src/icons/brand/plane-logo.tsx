/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

import { FlowixMark } from "./flowix-mark";

// Flowix: the Plane logo is replaced by the small Flowix logo "Fx" + mark (logo-fx-*.svg).
export function PlaneLogo({ width = "36", height = "24", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="1.5 0.5 34.5 23.5"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flowix"
    >
      <g fill={color}>
        <path d="M2.56,22.95V5.07h9.5v3.36h-5.78v3.34h6.72v3.36h-6.72v7.82h-3.72Z" />
        <path d="M17.66,22.95h-3.98l4.39-6.46-3.55-5.66h3.53l1.92,3.17,1.9-3.17h3.55l-3.58,5.66,4.42,6.46h-3.98l-2.3-3.58-2.3,3.58Z" />
      </g>
      <FlowixMark offsetX={-43.82} offsetY={-1.13} />
    </svg>
  );
}
