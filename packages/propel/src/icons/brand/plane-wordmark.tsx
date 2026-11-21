/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

import { FlowixWordmarkPaths } from "./flowix-mark";

// Flowix: the Plane wordmark is replaced by the "Flowix" wordmark.
export function PlaneWordmark({ width = "68", height = "20", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="3 5.5 67 19.5"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flowix"
    >
      <FlowixWordmarkPaths color={color} />
    </svg>
  );
}
