import { VaultRepository } from "./vault.repository";
import { BucketClient } from "@workspace/bucket";
import { decrypt } from "@workspace/encryption";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import {
  buildPagination,
  parsePaginationQuery,
  buildError,
} from "@workspace/utils";
import type { PaginationQuery } from "@workspace/types";
import { ErrorCode } from "@workspace/types";
import { status } from "elysia";
import { Env } from "@workspace/constants";

export abstract class VaultService {
  private static async getBucketClient(workspaceId: string) {
    const settings = await VaultRepository.getWorkspaceSettings(workspaceId);

    const secret = Env.ENCRYPTION_KEY || "";

    // If custom R2 settings exist, use them
    if (
      settings?.r2Endpoint &&
      settings?.r2AccessKeyId &&
      settings?.r2SecretAccessKey &&
      settings?.r2BucketName
    ) {
      return new BucketClient({
        endpoint: settings.r2Endpoint,
        accessKeyId: decrypt(settings.r2AccessKeyId, secret),
        secretAccessKey: decrypt(settings.r2SecretAccessKey, secret),
        bucketName: settings.r2BucketName,
      });
    }

    // Fallback to system bucket (from env)
    const systemEndpoint = Env.R2_ENDPOINT;
    const systemAccessKeyId = Env.R2_ACCESS_KEY_ID;
    const systemSecretAccessKey = Env.R2_SECRET_ACCESS_KEY;
    const systemBucketName = Env.R2_BUCKET_NAME;

    if (
      !systemEndpoint ||
      !systemAccessKeyId ||
      !systemSecretAccessKey ||
      !systemBucketName
    ) {
      throw new Error("R2 storage not configured");
    }

    return new BucketClient({
      endpoint: systemEndpoint,
      accessKeyId: systemAccessKeyId,
      secretAccessKey: systemSecretAccessKey,
      bucketName: systemBucketName,
    });
  }

  static async uploadFile(
    workspaceId: string,
    userId: string,
    file: { name: string; type: string; size: number; buffer: Buffer },
  ) {
    const usageData = await VaultRepository.getUsageAndQuota(workspaceId);

    if (!usageData)
      throw status(
        404,
        buildError(ErrorCode.WORKSPACE_NOT_FOUND, "Workspace not found"),
      );

    const maxVaultMb = usageData.maxMb ?? 100;
    const usedBytes = Number(usageData.used);
    const maxBytes = maxVaultMb * 1024 * 1024;

    if (usedBytes + file.size > maxBytes) {
      throw status(
        422,
        buildError(
          ErrorCode.PLAN_LIMIT_REACHED,
          `Vault storage limit exceeded. Max: ${maxVaultMb}MB.`,
        ),
      );
    }

    const bucket = await VaultService.getBucketClient(workspaceId);

    // Generate unique key
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const key = `vault/${workspaceId}/${timestamp}-${safeName}`;

    await bucket.upload(key, file.buffer, file.type);

    const vaultEntry = await VaultRepository.create({
      workspaceId,
      name: file.name,
      key,
      size: file.size,
      type: file.type,
    });

    if (!vaultEntry) {
      throw status(500, buildError(ErrorCode.INTERNAL_ERROR, "Failed to save file entry to database"));
    }

    // Increment vault size safely in DB
    await VaultRepository.updateVaultSize(workspaceId, usedBytes + file.size);

    await AuditLogsService.log({
        workspace_id: workspaceId,
        user_id: userId,
        action: "vault.file_uploaded",
        entity: "vault_file",
        entity_id: vaultEntry.id,
        after: vaultEntry,
    });

    return {
      ...vaultEntry,
      url: await bucket.getSignedUrl(vaultEntry.key),
    };
  }

  static async listFiles(workspaceId: string, query: PaginationQuery) {
    const { limit, offset, page } = parsePaginationQuery(query);

    const [files, total] = await Promise.all([
      VaultRepository.findMany(
        workspaceId,
        limit,
        offset,
        (query as any).search,
      ),
      VaultRepository.count(workspaceId, { search: (query as any).search }),
    ]);

    const bucket = await VaultService.getBucketClient(workspaceId);

    // Provide signed URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await bucket.getSignedUrl(file.key),
      })),
    );

    return {
      files: filesWithUrls,
      pagination: buildPagination(total, page, limit),
    };
  }

  static async deleteFile(workspaceId: string, userId: string, fileId: string) {
    const file = await VaultRepository.findById(fileId, workspaceId);
    if (!file) throw new Error("File not found");

    const bucket = await VaultService.getBucketClient(workspaceId);
    await bucket.delete(file.key);

    const deletedFile = await VaultRepository.delete(fileId, workspaceId);

    // Decrement the vault size usage safely in DB
    const workspaceSync = await VaultRepository.getUsageAndQuota(workspaceId);

    if (workspaceSync) {
      const currentUsed = Number(workspaceSync.used);
      const newUsed = Math.max(0, currentUsed - Number(file.size));
      await VaultRepository.updateVaultSize(workspaceId, newUsed);
    }

    await AuditLogsService.log({
        workspace_id: workspaceId,
        user_id: userId,
        action: "vault.file_deleted",
        entity: "vault_file",
        entity_id: fileId,
        before: file,
    });

    return deletedFile;
  }

  static async getDownloadUrl(workspaceId: string, fileId: string) {
    const file = await VaultRepository.findById(fileId, workspaceId);
    if (!file) throw new Error("File not found");

    const bucket = await VaultService.getBucketClient(workspaceId);
    return bucket.getSignedUrl(file.key);
  }

  static async updateTags(workspaceId: string, userId: string, fileId: string, tags: string[]) {
    const before = await VaultRepository.findById(fileId, workspaceId);
    const updated = await VaultRepository.updateTags(fileId, workspaceId, tags);

    await AuditLogsService.log({
        workspace_id: workspaceId,
        user_id: userId,
        action: "vault.file_tags_updated",
        entity: "vault_file",
        entity_id: fileId,
        before,
        after: updated,
    });

    return updated;
  }
}
