import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, ChatResponse } from "./ai.dto";
import { AiRepository } from "./ai.repository";

const SYSTEM_PROMPT_BASE = `You are Okane, a friendly and insightful personal finance assistant. You have access to the user's real financial data below and can answer questions about their spending, income, wallet balances, and financial health.

Be concise, helpful, and direct. Use bullet points and short paragraphs. Format numbers clearly. When the user asks about their data, reference real numbers from the context. If data is not available in the context, say so honestly.

Never make up numbers. Always use the financial context provided.`;

export abstract class AiService {
  /**
   * Build a financial context block from the database for the given workspace.
   */
  static async buildFinancialContext(workspaceId: string): Promise<string> {
    const [recentTxns, walletSummary, spending, monthlyTotals] =
      await Promise.all([
        AiRepository.getRecentTransactions(workspaceId, 20),
        AiRepository.getWalletSummary(workspaceId),
        AiRepository.getSpendingByCategory(workspaceId, 30),
        AiRepository.getMonthlyTotals(workspaceId, 3),
      ]);

    const totalBalance = walletSummary
      .filter((w) => w.isIncludedInTotals)
      .reduce((sum, w) => sum + w.balance, 0);

    const walletLines = walletSummary
      .map((w) => `  - ${w.name}: ${w.balance.toLocaleString()}`)
      .join("\n");

    const spendingLines =
      spending.length > 0
        ? spending
            .map(
              (s) =>
                `  - ${s.categoryName ?? "Uncategorized"}: ${Number(s.total).toLocaleString()} (${s.count} transactions)`,
            )
            .join("\n")
        : "  - No expense data in the last 30 days.";

    // Group monthly totals
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    for (const row of monthlyTotals) {
      if (!monthlyMap[row.month]) {
        monthlyMap[row.month] = { income: 0, expense: 0 };
      }
      if (row.type === "income") {
        monthlyMap[row.month]!.income = Number(row.total);
      } else if (row.type === "expense") {
        monthlyMap[row.month]!.expense = Number(row.total);
      }
    }
    const monthlyLines =
      Object.keys(monthlyMap).length > 0
        ? Object.entries(monthlyMap)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(
              ([month, v]) =>
                `  - ${month}: Income ${v.income.toLocaleString()} | Expense ${v.expense.toLocaleString()} | Net ${(v.income - v.expense).toLocaleString()}`,
            )
            .join("\n")
        : "  - No monthly data available yet.";

    const recentLines =
      recentTxns.length > 0
        ? recentTxns
            .slice(0, 10)
            .map(
              (t) =>
                `  - [${t.date}] ${t.name} | ${t.type} | ${Number(t.amount).toLocaleString()} | ${t.walletName ?? "?"} | ${t.categoryName ?? "Uncategorized"}`,
            )
            .join("\n")
        : "  - No recent transactions found.";

    return `
## User's Financial Context (live data)

### Wallet Balances
${walletLines || "  - No wallets found."}
Total (included in totals): ${totalBalance.toLocaleString()}

### Spending by Category (last 30 days)
${spendingLines}

### Monthly Summary (last 3 months — Income | Expense | Net)
${monthlyLines}

### Recent Transactions (latest 10)
${recentLines}
`.trim();
  }

  /**
   * Helper to generate a short title for a new chat session.
   */
  static async generateTitle(firstMessage: string): Promise<string> {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 20,
      system:
        "You are a title generator. Generate a very short (max 4 words) title summarizing the user's message. Output ONLY the title, no quotes or extra text.",
      messages: [{ role: "user", content: firstMessage }],
    });
    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    return textBlock
      ? textBlock.text.trim().replace(/^['"]|['"]$/g, "")
      : "New Chat";
  }

  /**
   * Chat with Claude using the user's financial context and save to DB.
   */
  static async chat(
    messages: ChatMessage[],
    workspaceId: string,
    sessionId?: string,
  ): Promise<ChatResponse> {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let currentSessionId = sessionId;
    const latestUserMessage = messages[messages.length - 1];

    if (!latestUserMessage) {
      throw new Error("No messages provided");
    }

    if (!currentSessionId) {
      const title = await AiService.generateTitle(latestUserMessage.content);
      const newSession = await AiRepository.createSession(workspaceId, title);
      currentSessionId = newSession!.id;

      // Save all previous messages acting as history if they were passed, though typically it's just 1
      for (const msg of messages.slice(0, -1)) {
        await AiRepository.saveMessage(currentSessionId, msg.role, msg.content);
      }
    } else {
      // Verify session belongs to workspace
      const session = await AiRepository.getSession(
        currentSessionId,
        workspaceId,
      );
      if (!session) throw new Error("Chat session not found or access denied.");
    }

    // Save the new user message
    await AiRepository.saveMessage(
      currentSessionId,
      latestUserMessage.role,
      latestUserMessage.content,
    );

    const financialContext = await AiService.buildFinancialContext(workspaceId);
    const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${financialContext}`;

    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );
    const reply = textBlock
      ? textBlock.text
      : "I couldn't generate a response. Please try again.";

    // Save assistant response
    await AiRepository.saveMessage(currentSessionId, "assistant", reply);

    return {
      sessionId: currentSessionId,
      reply,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  }

  static async getSessions(workspaceId: string) {
    return AiRepository.getSessions(workspaceId);
  }

  static async getSessionMessages(sessionId: string, workspaceId: string) {
    const session = await AiRepository.getSession(sessionId, workspaceId);
    if (!session) throw new Error("Chat session not found or access denied.");
    return AiRepository.getSessionMessages(sessionId);
  }
}
