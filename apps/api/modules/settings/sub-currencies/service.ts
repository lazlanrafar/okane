import { SubCurrenciesRepository } from "./repository";
import type { CreateSubCurrencyDto } from "./dto";

export class SubCurrenciesService {
  private repository: SubCurrenciesRepository;

  constructor() {
    this.repository = new SubCurrenciesRepository();
  }

  async getSubCurrencies(workspaceId: string) {
    return this.repository.findByWorkspaceId(workspaceId);
  }

  async addSubCurrency(workspaceId: string, data: CreateSubCurrencyDto) {
    const existing = await this.repository.findByCode(
      workspaceId,
      data.currencyCode,
    );
    if (existing) {
      throw new Error("Currency already added to sub-currencies");
    }

    return this.repository.create(workspaceId, data);
  }

  async removeSubCurrency(workspaceId: string, id: string) {
    return this.repository.delete(workspaceId, id);
  }
}
