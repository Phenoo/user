import { stripe } from "./stripe"
import { SUBSCRIPTION_PLANS } from "./stripe"

export async function createStripeCustomer(email: string, userId: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })
    return customer
  } catch (error) {
    console.error("Error creating Stripe customer:", error)
    throw error
  }
}

export async function getOrCreateStripeCustomer(email: string, userId: string) {
  try {
    // First, try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0]
    }

    // Create new customer if none exists
    return await createStripeCustomer(email, userId)
  } catch (error) {
    console.error("Error getting or creating Stripe customer:", error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  try {
    if (cancelAtPeriodEnd) {
      // Cancel at period end (user keeps access until current period ends)
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
      return subscription
    } else {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId)
      return subscription
    }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return subscription
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    throw error
  }
}

export async function changeSubscriptionPlan(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "create_prorations",
    })

    return updatedSubscription
  } catch (error) {
    console.error("Error changing subscription plan:", error)
    throw error
  }
}

export function getPlanFromPriceId(priceId: string): "FREE" | "STUDENT" | "PRO" {
  if (priceId === SUBSCRIPTION_PLANS.STUDENT.priceId || priceId === process.env.STRIPE_STUDENT_YEARLY_PRICE_ID) {
    return "STUDENT"
  }

  if (priceId === SUBSCRIPTION_PLANS.PRO.priceId || priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
    return "PRO"
  }

  return "FREE"
}

export function isSubscriptionActive(status: string): boolean {
  return ["active", "trialing"].includes(status)
}

export function isSubscriptionPastDue(status: string): boolean {
  return status === "past_due"
}

export function isSubscriptionCanceled(status: string): boolean {
  return ["canceled", "incomplete_expired", "unpaid"].includes(status)
}
