import {
  db,
  pricing,
  user_workspaces,
  users,
  webhook_events,
  workspaces,
  and,
  eq,
  isNull,
  or,
  sql,
} from "@workspace/database";

export abstract class StripeRepository {
  static async isEventProcessed(eventId: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: webhook_events.id })
      .from(webhook_events)
      .where(eq(webhook_events.id, eventId))
      .limit(1);
    return !!existing;
  }

  static async markEventProcessed(eventId: string): Promise<void> {
    await db.insert(webhook_events).values({ id: eventId }).onConflictDoNothing();
  }

  static async findPlanByStripePriceId(priceId: string) {
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
    return plan;
  }

  static async updateWorkspaceSubscription(workspaceId: string, data: any) {
    await db
      .update(workspaces)
      .set(data)
      .where(
        and(
          eq(workspaces.id, workspaceId),
          isNull(workspaces.deleted_at),
        ),
      );
  }

  static async updateWorkspaceSubscriptionByCustomerId(customerId: string, data: any) {
    await db
      .update(workspaces)
      .set(data)
      .where(
        and(
          eq(workspaces.stripe_customer_id, customerId),
          isNull(workspaces.deleted_at),
        ),
      );
  }

  static async findWorkspaceById(id: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, id), isNull(workspaces.deleted_at)))
      .limit(1);
    return workspace;
  }

  static async findWorkspaceByCustomerId(customerId: string) {
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
    return workspace;
  }

  static async findWorkspaceOwner(workspaceId: string) {
    const [owner] = await db
      .select({ 
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .innerJoin(user_workspaces, eq(users.id, user_workspaces.user_id))
      .where(
        and(
          eq(user_workspaces.workspace_id, workspaceId),
          eq(user_workspaces.role, "owner"),
          isNull(user_workspaces.deleted_at),
        ),
      )
      .limit(1);
    return owner;
  }
  static async findPlanById(id: string) {
    const [plan] = await db
      .select()
      .from(pricing)
      .where(and(eq(pricing.id, id), isNull(pricing.deleted_at)))
      .limit(1);
    return plan;
  }

  static async findWorkspaceBySubscriptionId(subscriptionId: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.stripe_subscription_id, subscriptionId),
          isNull(workspaces.deleted_at),
        ),
      )
      .limit(1);
    return workspace;
  }
}
