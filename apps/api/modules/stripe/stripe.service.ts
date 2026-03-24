import { Env } from "@workspace/constants";
import {
  db,
  pricing,
  user_workspaces,
  users,
  webhook_events,
  workspaces,
} from "@workspace/database";
import { logger } from "@workspace/logger";
import { ErrorCode } from "@workspace/types";
import { buildError, buildSuccess } from "@workspace/utils";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { status } from "elysia";
import Stripe from "stripe";
import { OrdersService } from "../orders/orders.service";

const stripe = new Stripe(Env.STRIPE_SECRET_KEY as string);

async function isEventProcessed(eventId: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: webhook_events.id })
    .from(webhook_events)
    .where(eq(webhook_events.id, eventId))
    .limit(1);
  return !!existing;
}

async function markEventProcessed(eventId: string): Promise<void> {
  await db.insert(webhook_events).values({ id: eventId }).onConflictDoNothing();
}

export abstract class StripeService {
  static async handleWebhook(rawBody: string, signature: string) {
    const webhookSecret = Env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );

    logger.info(`[Stripe Webhook] Received event: ${event.type}`, {
      eventId: event.id,
      type: event.type,
    });

    if (await isEventProcessed(event.id)) {
      logger.info(
        `[Stripe Webhook] Event ${event.id} already processed, skipping`,
      );
      return;
    }

    try {
      await StripeService.processEvent(event);
      await markEventProcessed(event.id);
    } catch (error) {
      logger.error("[Stripe Webhook] Error processing event", {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private static async processEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id) {
          const workspaceId = session.client_reference_id;
          const userId = session.metadata?.userId;
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;

          if (subscriptionId) {
            const subscription =
              await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;

            if (priceId) {
              const [plan] = await db
                .select()
                .from(pricing)
                .where(
                  and(
                    or(
                      sql`${pricing.prices} @> ${JSON.stringify([{ stripe_monthly_id: priceId }])}::jsonb`,
                      sql`${pricing.prices} @> ${JSON.stringify([{ stripe_yearly_id: priceId }])}::jsonb`,
                    ),
                    isNull(pricing.deleted_at),
                  ),
                )
                .limit(1);

              logger.info("[Stripe Webhook] Subscription keys", {
                keys: Object.keys(subscription),
              });
              let currentPeriodEnd = (subscription as any).current_period_end;
              if (!currentPeriodEnd && (subscription as any).items?.data?.[0]) {
                currentPeriodEnd = (subscription as any).items.data[0]
                  .current_period_end;
                logger.info(
                  "[Stripe Webhook] Found current_period_end in items.data[0]:",
                  currentPeriodEnd,
                );
              }
              logger.info("[Stripe Webhook] current_period_end value", {
                currentPeriodEnd,
              });

              await db
                .update(workspaces)
                .set({
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                  plan_id: plan?.id,
                  plan_status: subscription.status,
                  stripe_current_period_end: currentPeriodEnd
                    ? new Date(Number(currentPeriodEnd) * 1000)
                    : null,
                  ai_tokens_used: 0,
                  vault_size_used_bytes: 0,
                })
                .where(
                  and(
                    eq(workspaces.id, workspaceId),
                    isNull(workspaces.deleted_at),
                  ),
                );

              // Create or update order from session info as a fallback for the race condition
              // This ensures that for new customers, the order is created even if invoice.paid arrives too early to find the workspace
              if (session.payment_status === "paid" && session.invoice) {
                logger.info(
                  `[Stripe Webhook] Session paid. Creating/updating order from session ${session.id}...`,
                );
                await OrdersService.createOrderFromStripe({
                  workspace_id: workspaceId,
                  user_id: userId,
                  stripe_invoice_id: session.invoice as string,
                  stripe_subscription_id: subscriptionId,
                  stripe_payment_intent_id: session.payment_intent as string,
                  amount: session.amount_total || 0,
                  currency: session.currency || "usd",
                  status: "paid",
                });
              }
            }
          }
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        logger.info(`[Stripe Webhook] invoice.paid for customer ${customerId}`);
        logger.info("[Stripe Webhook] Invoice details", {
          id: invoice.id,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          customer: invoice.customer,
          subscription: invoice.subscription,
        });

        const [workspace] = await db
          .select()
          .from(workspaces)
          .where(
            and(
              eq(workspaces.stripe_customer_id, customerId),
              isNull(workspaces.deleted_at),
            ),
          )
          .limit(1);

        if (workspace) {
          logger.info(
            `[Stripe Webhook] Found workspace ${workspace.id} for customer ${customerId}. Creating order...`,
          );

          // Find the owner of the workspace to attribute the order
          const owner = await db
            .select({ id: users.id })
            .from(users)
            .innerJoin(user_workspaces, eq(users.id, user_workspaces.user_id))
            .where(
              and(
                eq(user_workspaces.workspace_id, workspace.id),
                eq(user_workspaces.role, "owner"),
                isNull(user_workspaces.deleted_at),
              ),
            )
            .limit(1)
            .then((res) => res[0]);

          const orderResult = await OrdersService.createOrderFromStripe({
            workspace_id: workspace.id,
            user_id: owner?.id,
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: invoice.subscription as string,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "paid",
          });
          logger.info("[Stripe Webhook] Order creation result", {
            orderResult,
          });
        } else {
          logger.info(
            `[Stripe Webhook] Workspace not found for customer ${customerId} (Checked stripe_customer_id)`,
          );
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        const [workspace] = await db
          .select()
          .from(workspaces)
          .where(
            and(
              eq(workspaces.stripe_customer_id, customerId),
              isNull(workspaces.deleted_at),
            ),
          )
          .limit(1);

        if (workspace) {
          // Find the owner of the workspace to attribute the order
          const owner = await db
            .select({ id: users.id })
            .from(users)
            .innerJoin(user_workspaces, eq(users.id, user_workspaces.user_id))
            .where(
              and(
                eq(user_workspaces.workspace_id, workspace.id),
                eq(user_workspaces.role, "owner"),
                isNull(user_workspaces.deleted_at),
              ),
            )
            .limit(1)
            .then((res) => res[0]);

          await OrdersService.createOrderFromStripe({
            workspace_id: workspace.id,
            user_id: owner?.id,
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: invoice.subscription as string,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "failed",
          });

          // Also update workspace plan status
          await db
            .update(workspaces)
            .set({ plan_status: "past_due" })
            .where(
              and(
                eq(workspaces.id, workspace.id),
                isNull(workspaces.deleted_at),
              ),
            );
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        if (priceId) {
          const [plan] = await db
            .select()
            .from(pricing)
            .where(
              and(
                or(
                  sql`${pricing.prices} @> ${JSON.stringify([{ stripe_monthly_id: priceId }])}::jsonb`,
                  sql`${pricing.prices} @> ${JSON.stringify([{ stripe_yearly_id: priceId }])}::jsonb`,
                ),
                isNull(pricing.deleted_at),
              ),
            )
            .limit(1);

          logger.info("[Stripe Webhook] Subscription keys", {
            keys: Object.keys(subscription),
          });
          let currentPeriodEnd = (subscription as any).current_period_end;
          if (!currentPeriodEnd && (subscription as any).items?.data?.[0]) {
            currentPeriodEnd = (subscription as any).items.data[0]
              .current_period_end;
            logger.info(
              "[Stripe Webhook] Found current_period_end in items.data[0]:",
              currentPeriodEnd,
            );
          }
          logger.info("[Stripe Webhook] Resolved current_period_end value", {
            currentPeriodEnd,
          });

          // Whenever a subscription updates (renews, upgrades), reset standard usages if the period rolled over
          await db
            .update(workspaces)
            .set({
              stripe_subscription_id: subscription.id,
              plan_id: plan?.id,
              plan_status: subscription.status,
              stripe_current_period_end: currentPeriodEnd
                ? new Date(Number(currentPeriodEnd) * 1000)
                : null,
            })
            .where(
              and(
                eq(workspaces.stripe_customer_id, customerId),
                isNull(workspaces.deleted_at),
              ),
            );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Downgrade back to Free Tier config
        await db
          .update(workspaces)
          .set({
            plan_status: "free",
            plan_id: null,
            stripe_subscription_id: null,
          })
          .where(
            and(
              eq(workspaces.stripe_customer_id, customerId),
              isNull(workspaces.deleted_at),
            ),
          );
        break;
      }
    }
  }

  static async createCheckoutSession(
    workspaceId: string,
    userId: string,
    priceId: string,
    returnPath?: string,
  ) {
    if (!Env.STRIPE_SECRET_KEY) {
      throw status(
        500,
        buildError(ErrorCode.INTERNAL_ERROR, "Stripe is not configured"),
      );
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), isNull(workspaces.deleted_at)))
      .limit(1);

    if (!workspace) {
      throw status(404, buildError(ErrorCode.NOT_FOUND, "Workspace not found"));
    }

    const [plan] = await db
      .select()
      .from(pricing)
      .where(
        and(
          or(
            sql`${pricing.prices} @> ${JSON.stringify([{ stripe_monthly_id: priceId }])}::jsonb`,
            sql`${pricing.prices} @> ${JSON.stringify([{ stripe_yearly_id: priceId }])}::jsonb`,
          ),
          isNull(pricing.deleted_at),
        ),
      )
      .limit(1);

    if (!plan) {
      throw status(404, buildError(ErrorCode.NOT_FOUND, "Plan not found"));
    }

    const appUrl =
      Env.NEXT_PUBLIC_APP_URL ||
      (Env.API_BASE_URL || "http://localhost:3001")
        .replace("api.", "")
        .replace(":3002", ":3001")
        .replace(/\/v1$/, "");

    // Determine mode based on which price ID it is
    const mode = "subscription";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer: workspace.stripe_customer_id || undefined,
      client_reference_id: workspace.id,
      metadata: {
        userId,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${appUrl}${returnPath ?? "/en/settings/billing"}?success=true`,
      cancel_url: `${appUrl}${returnPath ?? "/en/settings/billing"}?canceled=true`,
    });

    return buildSuccess({ url: session.url }, "Checkout session created");
  }

  static async createCustomerPortal(workspaceId: string) {
    const workspace = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.id, workspaceId), isNull(workspaces.deleted_at)),
    });

    if (!workspace || !workspace.stripe_customer_id) {
      throw status(
        400,
        buildError(
          ErrorCode.VALIDATION_ERROR,
          "No active Stripe customer found for this workspace",
        ),
      );
    }

    const appUrl =
      Env.NEXT_PUBLIC_APP_URL ||
      (Env.API_BASE_URL || "http://localhost:3001")
        .replace("api.", "")
        .replace(":3002", ":3001")
        .replace(/\/v1$/, "");

    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: `${appUrl}/en/settings/billing`,
    });

    return buildSuccess({ url: session.url }, "Customer portal created");
  }

  static async getInvoiceUrl(invoiceId: string) {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return buildSuccess(
      { url: invoice.invoice_pdf || invoice.hosted_invoice_url },
      "Invoice URL retrieved",
    );
  }

  static async cancelSubscription(workspaceId: string) {
    const workspace = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.id, workspaceId), isNull(workspaces.deleted_at)),
    });

    if (!workspace || !workspace.stripe_subscription_id) {
      throw status(
        400,
        buildError(ErrorCode.VALIDATION_ERROR, "No active subscription found"),
      );
    }

    const subscription = await stripe.subscriptions.update(
      workspace.stripe_subscription_id,
      { cancel_at_period_end: true },
    );

    return buildSuccess(
      subscription,
      "Subscription set to cancel at period end",
    );
  }
}
