// import { ConvexHttpClient } from "convex/browser"
// import { api } from "../convex/_generated/api"
// import type { Id } from "../convex/_generated/dataModel"

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// export async function updateUserSubscriptionInDB(
//   userId: string,
//   subscriptionData: {
//     subscriptionId: string | null
//     customerId: string
//     status: string
//     plan: "FREE" | "STUDENT" | "PRO"
//     currentPeriodEnd: number | null
//     cancelAtPeriodEnd: boolean
//   },
// ) {
//   try {
//     if (!subscriptionData.subscriptionId) {
//       // Handle subscription deletion - downgrade to FREE
//       await convex.mutation(api.subscriptions.updateUserSubscription, {
//         userId: userId as Id<"users">,
//         subscriptionData: {
//           subscriptionId: "",
//           status: "canceled",
//           plan: "FREE",
//           currentPeriodEnd: 0,
//           cancelAtPeriodEnd: false,
//           stripeCustomerId: subscriptionData.customerId,
//         },
//       })
//     } else {
//       await convex.mutation(api.subscriptions.updateUserSubscription, {
//         userId: userId as Id<"users">,
//         subscriptionData: {
//           subscriptionId: subscriptionData.subscriptionId,
//           status: subscriptionData.status,
//           plan: subscriptionData.plan,
//           currentPeriodEnd: subscriptionData.currentPeriodEnd || 0,
//           cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
//           stripeCustomerId: subscriptionData.customerId,
//         },
//       })
//     }
//   } catch (error) {
//     console.error("Error updating user subscription in database:", error)
//     throw error
//   }
// }

// export async function updateUserStripeCustomerIdInDB(userId: string, customerId: string) {
//   try {
//     await convex.mutation(api.subscriptions.updateStripeCustomerId, {
//       userId: userId as Id<"users">,
//       stripeCustomerId: customerId,
//     })
//   } catch (error) {
//     console.error("Error updating user Stripe customer ID in database:", error)
//     throw error
//   }
// }

// export async function logSubscriptionEventInDB(
//   userId: string,
//   stripeEventId: string,
//   eventType: string,
//   subscriptionId?: string,
//   customerId?: string,
//   data?: any,
// ) {
//   try {
//     await convex.mutation(api.subscriptions.logSubscriptionEvent, {
//       userId: userId as Id<"users">,
//       stripeEventId,
//       eventType,
//       subscriptionId,
//       customerId,
//       data,
//     })
//   } catch (error) {
//     console.error("Error logging subscription event in database:", error)
//     throw error
//   }
// }
