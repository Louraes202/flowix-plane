/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * Flowix: upload an image for a project logo (backend app plane.flowix).
 */

import { API_BASE_URL } from "@plane/constants";
import { generateFileUploadPayload, getFileMetaDataForUpload } from "@plane/services";
import type { TFileSignedURLResponse } from "@plane/types";
import { APIService } from "@/services/api.service";
import { FileUploadService } from "@/services/file-upload.service";

export class FlowixProjectLogoService extends APIService {
  private fileUploadService = new FileUploadService();

  constructor() {
    super(API_BASE_URL);
  }

  /** Creates the asset, sends the file to storage and marks it uploaded. Returns the asset URL and id. */
  async upload(workspaceSlug: string, projectId: string, file: File): Promise<TFileSignedURLResponse> {
    const base = `/api/workspaces/${workspaceSlug}/projects/${projectId}/flowix-logo/`;
    const meta = await getFileMetaDataForUpload(file);
    const signed: TFileSignedURLResponse = await this.post(base, meta)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
    await this.fileUploadService.uploadFile(signed.upload_data.url, generateFileUploadPayload(signed, file));
    await this.patch(`${base}${signed.asset_id}/`).catch((err) => {
      throw err?.response?.data;
    });
    return signed;
  }
}
