import { SettingsRepository } from "./repository";
import type { TransactionSettingsDto } from "./dto";

export class SettingsService {
  private repository: SettingsRepository;

  constructor() {
    this.repository = new SettingsRepository();
  }

  async getTransactionSettings(workspaceId: string) {
    const settings = await this.repository.findByWorkspaceId(workspaceId);

    if (!settings) {
      // Create default settings if not exists
      return this.repository.create(workspaceId);
    }

    return settings;
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

    return this.repository.update(workspaceId, data);
  }
}
