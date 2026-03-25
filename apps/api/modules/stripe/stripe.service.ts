import { Env } from "@workspace/constants";
import { logger } from "@workspace/logger";
import { ErrorCode } from "@workspace/types";
import { buildError, buildSuccess } from "@workspace/utils";
import { status } from "elysia";
import Stripe from "stripe";
import { OrdersService } from "../orders/orders.service";
import { StripeRepository } from "./stripe.repository";

export abstract class StripeService {
  private static _stripe: Stripe | null = null;
  private static get stripe() {
    if (!this._stripe) {
      this._stripe = new Stripe(Env.STRIPE_SECRET_KEY as string);
    }
    return this._stripe;
  }

  static async handleWebhook(rawBody: string, signature: string) {
    const webhookSecret = Env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const event = await this.stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );

    logger.info(`[Stripe Webhook] Received event: ${event.type}`, {
      eventId: event.id,
      type: event.type,
    });

    if (await StripeRepository.isEventProcessed(event.id)) {
      logger.info(
        `[Stripe Webhook] Event ${event.id} already processed, skipping`,
      );
      return;
    }

    try {
      await StripeService.processEvent(event);
      await StripeRepository.markEventProcessed(event.id);
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
              await this.stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;

            if (priceId) {
              const plan = await StripeRepository.findPlanByStripePriceId(priceId);

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

              await StripeRepository.updateWorkspaceSubscription(workspaceId, {
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan_id: plan?.id,
                plan_status: subscription.status,
                stripe_current_period_end: currentPeriodEnd
                  ? new Date(Number(currentPeriodEnd) * 1000)
                  : null,
                ai_tokens_used: 0,
                vault_size_used_bytes: 0,
              });

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
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logger.info(`[Stripe Webhook] invoice.paid for customer ${customerId}`);

        const workspace = await StripeRepository.findWorkspaceByCustomerId(customerId);

        if (workspace) {
          logger.info(
            `[Stripe Webhook] Found workspace ${workspace.id} for customer ${customerId}. Creating order...`,
          );

          const owner = await StripeRepository.findWorkspaceOwner(workspace.id);

          await OrdersService.createOrderFromStripe({
            workspace_id: workspace.id,
            user_id: owner?.id,
            stripe_invoice_id: (invoice as any).id,
            stripe_subscription_id: (invoice as any).subscription as string,
            stripe_payment_intent_id: (invoice as any).payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "paid",
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const workspace = await StripeRepository.findWorkspaceByCustomerId(customerId);

        if (workspace) {
          const owner = await StripeRepository.findWorkspaceOwner(workspace.id);

          await OrdersService.createOrderFromStripe({
            workspace_id: workspace.id,
            user_id: owner?.id,
            stripe_invoice_id: (invoice as any).id,
            stripe_subscription_id: (invoice as any).subscription as string,
            stripe_payment_intent_id: (invoice as any).payment_intent as string,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "failed",
          });

          await StripeRepository.updateWorkspaceSubscription(workspace.id, {
            plan_status: "past_due",
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        if (priceId) {
          const plan = await StripeRepository.findPlanByStripePriceId(priceId);

          let currentPeriodEnd = (subscription as any).current_period_end;
          if (!currentPeriodEnd && (subscription as any).items?.data?.[0]) {
            currentPeriodEnd = (subscription as any).items.data[0]
              .current_period_end;
          }

          await StripeRepository.updateWorkspaceSubscriptionByCustomerId(customerId, {
            stripe_subscription_id: subscription.id,
            plan_id: plan?.id,
            plan_status: subscription.status,
            stripe_current_period_end: currentPeriodEnd
              ? new Date(Number(currentPeriodEnd) * 1000)
              : null,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await StripeRepository.updateWorkspaceSubscriptionByCustomerId(customerId, {
          plan_status: "free",
          plan_id: null,
          stripe_subscription_id: null,
        });
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

    const workspace = await StripeRepository.findWorkspaceById(workspaceId);

    if (!workspace) {
      throw status(404, buildError(ErrorCode.NOT_FOUND, "Workspace not found"));
    }

    const plan = await StripeRepository.findPlanByStripePriceId(priceId);

    if (!plan) {
      throw status(404, buildError(ErrorCode.NOT_FOUND, "Plan not found"));
    }

    const appUrl =
      Env.NEXT_PUBLIC_APP_URL ||
      (Env.API_BASE_URL || "http://localhost:3001")
        .replace("api.", "")
        .replace(":3002", ":3001")
        .replace(/\/v1$/, "");

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer: workspace.stripe_customer_id || undefined,
      client_reference_id: workspace.id,
      metadata: { userId },
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}${returnPath ?? "/en/settings/billing"}?success=true`,
      cancel_url: `${appUrl}${returnPath ?? "/en/settings/billing"}?canceled=true`,
    });

    return buildSuccess({ url: session.url }, "Checkout session created");
  }

  static async createCustomerPortal(workspaceId: string) {
    const workspace = await StripeRepository.findWorkspaceById(workspaceId);

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

    const session = await this.stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: `${appUrl}/en/settings/billing`,
    });

    return buildSuccess({ url: session.url }, "Customer portal created");
  }

  static async getInvoiceUrl(invoiceId: string) {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    return buildSuccess(
      { url: invoice.invoice_pdf || invoice.hosted_invoice_url },
      "Invoice URL retrieved",
    );
  }

  static async cancelSubscription(workspaceId: string) {
    const workspace = await StripeRepository.findWorkspaceById(workspaceId);

    if (!workspace || !workspace.stripe_subscription_id) {
      throw status(
        400,
        buildError(ErrorCode.VALIDATION_ERROR, "No active subscription found"),
      );
    }

    const subscription = await this.stripe.subscriptions.update(
      workspace.stripe_subscription_id,
      { cancel_at_period_end: true },
    );

    return buildSuccess(
      subscription,
      "Subscription set to cancel at period end",
    );
  }
}
