import { SettingsRepository } from "./repository";
import type { TransactionSettingsDto } from "./dto";
import { encrypt } from "@workspace/encryption";

export class SettingsService {
  private repository: SettingsRepository;
  private encryptionSecret: string;

  constructor() {
    this.repository = new SettingsRepository();
    this.encryptionSecret = process.env.ENCRYPTION_KEY || "";
  }

  async getTransactionSettings(workspaceId: string) {
    const settings = await this.repository.findByWorkspaceId(workspaceId);

    if (!settings) {
      // Create default settings if not exists
      return this.repository.create(workspaceId);
    }

    // Sanitize sensitive fields
    return {
      ...settings,
      r2AccessKeyId: settings.r2AccessKeyId ? "********" : null,
      r2SecretAccessKey: settings.r2SecretAccessKey ? "********" : null,
    };
  }

  async updateTransactionSettings(
    workspaceId: string,
    data: TransactionSettingsDto,
  ) {
    // Ensure settings exist before updating
    const existing = await this.repository.findByWorkspaceId(workspaceId);
    if (!existing) {
      await this.repository.create(workspaceId);
    }

    const updateData = { ...data };

    if (updateData.r2AccessKeyId && updateData.r2AccessKeyId !== "********") {
      updateData.r2AccessKeyId = encrypt(
        updateData.r2AccessKeyId,
        this.encryptionSecret,
      );
    } else {
      delete updateData.r2AccessKeyId;
    }

    if (
      updateData.r2SecretAccessKey &&
      updateData.r2SecretAccessKey !== "********"
    ) {
      updateData.r2SecretAccessKey = encrypt(
        updateData.r2SecretAccessKey,
        this.encryptionSecret,
      );
    } else {
      delete updateData.r2SecretAccessKey;
    }

    return this.repository.update(workspaceId, updateData);
  }
}
