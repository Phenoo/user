import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const pay = action({
  args: {
    price: v.string(),
  },
  handler: async (ctx, { price }) => {
    const clerkUser = await ctx.auth.getUserIdentity();
    const user = await ctx.runQuery(api.users.currentUser);

    if (!user || !clerkUser) {
      throw new Error("User not authenticated!");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    const domain = process.env.NEXT_PUBLIC_HOSTING_URL!;

    const session: Stripe.Response<Stripe.Checkout.Session> =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: price,
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          userId: user._id,
        },
        success_url: `${domain}/dashboard/success?session_id=${user.subscriptionId}`,
        cancel_url: `${domain}`,
      });
    return session.url;
  },
});

type Metadata = {
  userId: Id<"users">;
};

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async ({ runQuery, runMutation }, { signature, payload }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    try {
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret
      );
      const completedEvent = event.data.object as Stripe.Checkout.Session & {
        metadata: Metadata;
      };

      if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
          completedEvent.subscription as string
        );

        const userId = completedEvent.metadata.userId;

        await runMutation(internal.users.updateSubscription, {
          userId,
          subscriptionId: subscription.id,
          endsOn: subscription.items.data[0].current_period_end || 0 * 1000,
          subscriptionStatus: subscription.status as
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "trialing"
            | "unpaid",
          subscriptionPlan: getPlan(subscription.items.data[0].id) as
            | "FREE"
            | "STUDENT"
            | "STUDENTPRO"
            | undefined,
        });
      }

      if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          completedEvent.subscription as string
        );

        await runMutation(internal.users.updateSubscriptionById, {
          subscriptionId: subscription.id,
          endsOn: subscription.ended_at || 0 * 1000,
        });
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error: (error as { message: string }).message };
    }
  },
});

export function getPlan(priceId: string) {
  let message;
  switch (priceId) {
    case process.env.STRIPE_STUDENT_PRICE_ID:
      message = "STUDENT";
    case process.env.STRIPE_PRO_PRICE_ID:
      message = "STUDENTPRO";
    case process.env.STRIPE_STUDENT_YEARLY_PRICE_ID:
      message = "STUDENT_YEAR";
    case process.env.STRIPE_PRO_YEARLY_PRICE_ID:
      message = "STUDENTPRO_YEAR";
  }

  return message;
}
