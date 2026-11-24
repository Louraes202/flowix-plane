/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: upload an image as the project logo (instead of an emoji or icon).
 */

import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TLogoProps } from "@plane/types";
import { getFileURL } from "@plane/utils";
import { FlowixProjectLogoService } from "@/services/flowix-project-logo.service";

const logoService = new FlowixProjectLogoService();
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

type Props = {
  workspaceSlug: string;
  projectId: string;
  value: TLogoProps | undefined;
  onChange: (value: TLogoProps) => void;
};

export function ProjectLogoImageUpload({ workspaceSlug, projectId, value, onChange }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const currentUrl = value?.in_use === "image" && value.image?.url ? getFileURL(value.image.url) : undefined;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setToast({ type: TOAST_TYPE.ERROR, title: t("flowix.logo_image.error"), message: t("flowix.logo_image.types") });
      return;
    }
    setIsUploading(true);
    try {
      const res = await logoService.upload(workspaceSlug, projectId, file);
      onChange({ in_use: "image", image: { url: res.asset_url, asset_id: res.asset_id } });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: t("flowix.logo_image.error"), message: t("flowix.logo_image.failed") });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-subtle bg-layer-1">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="size-full object-cover" />
        ) : (
          <ImageUp className="size-8 text-placeholder" />
        )}
      </div>
      <p className="text-12 text-tertiary">{t("flowix.logo_image.hint")}</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <Button variant="primary" size="sm" loading={isUploading} onClick={() => inputRef.current?.click()}>
        {isUploading ? t("flowix.logo_image.uploading") : t("flowix.logo_image.choose")}
      </Button>
    </div>
  );
}
