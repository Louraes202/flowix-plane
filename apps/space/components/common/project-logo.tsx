/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// types
import type { TLogoProps } from "@plane/types";
// helpers
import { cn, getFileURL } from "@plane/utils";

type Props = {
  className?: string;
  logo: TLogoProps;
};

export function ProjectLogo(props: Props) {
  const { className, logo } = props;

  // Flowix: uploaded image
  if (logo.in_use === "image" && logo.image?.url)
    return <img src={getFileURL(logo.image.url)} alt="" className={cn("size-4 rounded-sm object-cover", className)} />;

  if (logo.in_use === "icon" && logo.icon)
    return (
      <span
        style={{
          color: logo.icon.color,
        }}
        className={cn("material-symbols-rounded text-14", className)}
      >
        {logo.icon.name}
      </span>
    );

  if (logo.in_use === "emoji" && logo.emoji)
    return (
      <span className={cn("text-14", className)}>
        {logo.emoji.value?.split("-").map((emoji) => String.fromCodePoint(parseInt(emoji, 10)))}
      </span>
    );

  return <span />;
}
