import {
  sendPurchaseSuccessEmail,
  sendPackageExpiredEmail,
} from "@workspace/email";
import {
  db,
  pricing,
  workspaces,
  workspaceAddons,
  eq,
  and,
  isNull,
} from "@workspace/database";
import { Env } from "@workspace/constants";
import { logger } from "@workspace/logger";
import { ErrorCode } from "@workspace/types";
import { buildError, buildSuccess } from "@workspace/utils";
import { status } from "elysia";
import Stripe from "stripe";
import { OrdersService } from "../orders/orders.service";
import { NotificationsService } from "../notifications/notifications.service";
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
          const customerId = session.customer as string;

          // 1. Handle Subscriptions (Plan Upgrades)
          if (session.mode === "subscription" && session.subscription) {
            const subscriptionId = session.subscription as string;
            const subscription = await this.stripe.subscriptions.retrieve(
              subscriptionId,
            );
            const priceId = subscription.items.data[0]?.price.id;

            if (priceId) {
              const plan =
                await StripeRepository.findPlanByStripePriceId(priceId);

              // If it's a core plan (not an addon)
              if (plan && !plan.is_addon) {
                let currentPeriodEnd = (subscription as any).current_period_end;

                await StripeRepository.updateWorkspaceSubscription(
                  workspaceId,
                  {
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    plan_id: plan?.id,
                    plan_status: subscription.status,
                    stripe_current_period_end: currentPeriodEnd
                      ? new Date(Number(currentPeriodEnd) * 1000)
                      : null,
                    ai_tokens_used: 0,
                    vault_size_used_bytes: 0,
                  },
                );

                if (session.payment_status === "paid" && session.invoice) {
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

                  // Send purchase success email
                  const workspace =
                    await StripeRepository.findWorkspaceById(workspaceId);
                  const owner =
                    await StripeRepository.findWorkspaceOwner(workspaceId);
                  if (owner && workspace) {
                    await sendPurchaseSuccessEmail(
                      owner.email,
                      owner.name || "there",
                      workspace.name,
                      plan?.name || "Premium",
                    ).catch((err) =>
                      logger.error("Failed to send purchase email", { err }),
                    );

                    await NotificationsService.create({
                      workspace_id: workspaceId,
                      user_id: userId || owner.id,
                      type: "subscription.success",
                      title: "Subscription Activated",
                      message: `Your ${plan?.name || "Premium"} plan is now active for ${workspace.name}.`,
                      link: "/settings/billing",
                    });
                  }
                }
              }
            }
          }

          // 2. Handle Add-ons (One-time or Recurring)
          if (session.payment_status === "paid") {
            const type = session.metadata?.type;
            const addonId = session.metadata?.addonId;
            const addonType = session.metadata?.addonType;
            const amount = Number(session.metadata?.amount || 0);

            if (type === "addon" && amount > 0) {
              const workspace =
                await StripeRepository.findWorkspaceById(workspaceId);
              if (workspace) {
                // If it's a subscription (recurring add-on)
                if (session.mode === "subscription" && session.subscription) {
                  await db.insert(workspaceAddons).values({
                    workspace_id: workspaceId,
                    addon_id: addonId!,
                    stripe_subscription_id: session.subscription as string,
                    amount: amount,
                    status: "active",
                  });
                }
                // Legacy support for one-time (payment mode)
                else if (session.mode === "payment") {
                  const updateData: any = {};
                  if (addonType === "ai") {
                    updateData.extra_ai_tokens =
                      (workspace.extra_ai_tokens || 0) + amount;
                  } else if (addonType === "vault") {
                    updateData.extra_vault_size_mb =
                      (workspace.extra_vault_size_mb || 0) + amount;
                  }

                  if (Object.keys(updateData).length > 0) {
                    await StripeRepository.updateWorkspaceSubscription(
                      workspaceId,
                      updateData,
                    );
                  }
                }

                // Create order for history
                await OrdersService.createOrderFromStripe({
                  workspace_id: workspaceId,
                  user_id: userId,
                  stripe_invoice_id: session.invoice as string,
                  stripe_payment_intent_id: session.payment_intent as string,
                  amount: session.amount_total || 0,
                  currency: session.currency || "usd",
                  status: "paid",
                });

                const owner =
                  await StripeRepository.findWorkspaceOwner(workspaceId);
                if (owner) {
                  await NotificationsService.create({
                    workspace_id: workspaceId,
                    user_id: userId || owner.id,
                    type: "purchase.success",
                    title: "Add-on Activated",
                    message: `Successfully added ${amount.toLocaleString()} ${addonType === "ai" ? "AI tokens" : "MB storage"} monthly to ${workspace.name}.`,
                    link: "/settings/billing",
                  });
                }
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspace = await StripeRepository.findWorkspaceBySubscriptionId(
          subscription.id,
        );

        if (workspace) {
          // If it's the main plan
          await StripeRepository.updateWorkspaceSubscription(workspace.id, {
            plan_status: "canceled",
            stripe_current_period_end: (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : null,
          });
        } else {
          // Check if it's an add-on subscription
          await db
            .update(workspaceAddons)
            .set({ status: "cancelled", deleted_at: new Date() })
            .where(eq(workspaceAddons.stripe_subscription_id, subscription.id));
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logger.info(`[Stripe Webhook] invoice.paid for customer ${customerId}`);

        const workspace =
          await StripeRepository.findWorkspaceByCustomerId(customerId);

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

          // Send confirmation email for recurring payments if it's not the initial checkout (which is handled above)
          if (invoice.billing_reason === "subscription_cycle" && owner) {
            const plan = workspace.plan_id
              ? await StripeRepository.findPlanById(workspace.plan_id)
              : null;
            await sendPurchaseSuccessEmail(
              owner.email,
              owner.name || "there",
              workspace.name,
              plan?.name || "Premium",
            ).catch((err) =>
              logger.error("Failed to send renewal email", { err }),
            );

            await NotificationsService.create({
              workspace_id: workspace.id,
              user_id: owner.id,
              type: "subscription.renewed",
              title: "Subscription Renewed",
              message: `Your subscription for ${workspace.name} has been successfully renewed.`,
              link: "/settings/billing",
            });
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const workspace =
          await StripeRepository.findWorkspaceByCustomerId(customerId);

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

          // Send expiration/warning email
          if (owner) {
            await sendPackageExpiredEmail(
              owner.email,
              owner.name || "there",
              workspace.name,
            ).catch((err) =>
              logger.error("Failed to send expiration email", { err }),
            );

            await NotificationsService.create({
              workspace_id: workspace.id,
              user_id: owner.id,
              type: "subscription.failed",
              title: "Payment Failed",
              message: `Your recent payment for ${workspace.name} failed. Please update your billing info.`,
              link: "/settings/billing",
            });
          }
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

          if (plan && !plan.is_addon) {
            await StripeRepository.updateWorkspaceSubscriptionByCustomerId(
              customerId,
              {
                stripe_subscription_id: subscription.id,
                plan_id: plan?.id,
                plan_status: subscription.status,
                stripe_current_period_end: currentPeriodEnd
                  ? new Date(Number(currentPeriodEnd) * 1000)
                  : null,
              },
            );
          }

          // If subscription becomes past_due or canceled, send email
          if (
            subscription.status === "past_due" ||
            subscription.status === "unpaid"
          ) {
            const workspace =
              await StripeRepository.findWorkspaceByCustomerId(customerId);
            if (workspace) {
              const owner = await StripeRepository.findWorkspaceOwner(
                workspace.id,
              );
              if (owner) {
                await sendPackageExpiredEmail(
                  owner.email,
                  owner.name || "there",
                  workspace.name,
                ).catch((err) =>
                  logger.error("Failed to send expiration alert", { err }),
                );
              }
            }
          }
        }
        break;
      }
    }
  }

  static async createCheckoutSession(
    workspaceId: string,
    userId: string,
    priceId: string,
    returnPath?: string,
    options?: {
      mode?: Stripe.Checkout.SessionCreateParams.Mode;
      metadata?: Stripe.MetadataParam;
    },
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

    const appUrl =
      Env.NEXT_PUBLIC_APP_URL ||
      (Env.API_BASE_URL || "http://localhost:3001")
        .replace("api.", "")
        .replace(":3002", ":3001")
        .replace(/\/v1$/, "");

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        billing_address_collection: "required",
        customer: workspace.stripe_customer_id || undefined,
        client_reference_id: workspace.id,
        metadata: {
          userId,
          ...options?.metadata,
        },
        line_items: [{ price: priceId, quantity: 1 }],
        mode: options?.mode || "subscription",
        success_url: `${appUrl}${returnPath ?? "/en/settings/billing"}?success=true`,
        cancel_url: `${appUrl}${returnPath ?? "/en/settings/billing"}?canceled=true`,
      });

      return buildSuccess({ url: session.url }, "Checkout session created");
    } catch (error: any) {
      logger.error("[Stripe] Checkout error", {
        priceId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (
        error.code === "resource_missing" ||
        error.message?.includes("No such price")
      ) {
        throw status(
          422,
          buildError(
            ErrorCode.VALIDATION_ERROR,
            `Stripe Price ID not found: ${priceId}. Please ensure your Stripe products are correctly configured in your dashboard or re-run the seeders with real IDs.`,
          ),
        );
      }
      throw error;
    }
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
