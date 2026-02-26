import Anthropic from "@anthropic-ai/sdk";
import { TransactionsService } from "../transactions/transactions.service";

export const aiTools: Anthropic.Tool[] = [
  {
    name: "create_transaction",
    description:
      "Create a new financial transaction (income, expense, or transfer). Important: when type is transfer, amount must be positive, walletId is the source, toWalletId is the destination.",
    input_schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["income", "expense", "transfer"],
          description: "The type of transaction",
        },
        amount: {
          type: "number",
          description: "The absolute transaction amount",
        },
        date: {
          type: "string",
          description: "ISO string date (e.g. 2026-02-26T10:00:00Z)",
        },
        name: {
          type: "string",
          description: "Name/description of the transaction",
        },
        walletId: {
          type: "string",
          description: "The wallet ID (source wallet for transfers)",
        },
        toWalletId: {
          type: "string",
          description: "The destination wallet ID (only for transfers)",
        },
        categoryId: {
          type: "string",
          description: "The category ID (optional)",
        },
        description: {
          type: "string",
          description: "A longer description/notes (optional)",
        },
      },
      required: ["type", "amount", "date", "name", "walletId"],
    },
  },
  {
    name: "update_transaction",
    description: "Update an existing financial transaction.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The existing transaction ID to update",
        },
        type: {
          type: "string",
          enum: ["income", "expense", "transfer"],
          description: "The type of transaction",
        },
        amount: { type: "number", description: "The transaction amount" },
        date: { type: "string", description: "ISO string date" },
        name: { type: "string", description: "Name/description" },
        walletId: { type: "string", description: "The wallet ID" },
        toWalletId: {
          type: "string",
          description: "The destination wallet ID (for transfers)",
        },
        categoryId: { type: "string", description: "The category ID" },
        description: {
          type: "string",
          description: "A longer description/notes",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_transaction",
    description: "Delete a financial transaction by ID.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The transaction ID to delete" },
      },
      required: ["id"],
    },
  },
];

export async function executeAiTool(
  toolName: string,
  input: any,
  workspaceId: string,
  userId: string,
): Promise<any> {
  try {
    switch (toolName) {
      case "create_transaction": {
        const body = {
          type: input.type,
          amount: input.amount,
          date: input.date,
          name: input.name,
          walletId: input.walletId,
          toWalletId: input.toWalletId,
          categoryId: input.categoryId,
          description: input.description,
        };
        const result = await TransactionsService.create(
          workspaceId,
          userId,
          body,
        );
        return { success: true, data: result.data };
      }
      case "update_transaction": {
        const { id, ...body } = input;
        const result = await TransactionsService.update(
          workspaceId,
          userId,
          id,
          body,
        );
        return { success: true, data: result.data };
      }
      case "delete_transaction": {
        const result = await TransactionsService.delete(
          workspaceId,
          userId,
          input.id,
        );
        return { success: true, data: result.data };
      }
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
