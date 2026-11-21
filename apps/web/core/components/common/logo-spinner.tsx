/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { FlowixMark } from "@plane/propel/icons";

// Flowix: the Plane animated GIF is replaced by the Flowix mark with a soft pulse.
export function LogoSpinner() {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="64.87 1.68 14.33 16.39"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="logo"
        className="h-6 w-auto motion-safe:animate-pulse sm:h-11"
      >
        <FlowixMark />
      </svg>
    </div>
  );
}
