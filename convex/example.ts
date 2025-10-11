// import { Polar } from "@convex-dev/polar";
// import { api, components } from "./_generated/api";
// import { QueryCtx, mutation, query } from "./_generated/server";
// import { v } from "convex/values";
// import { Id } from "./_generated/dataModel";

// // User query to use in the Polar component
// export const getUserInfo = query({
//   args: {},
//   handler: async (ctx) => {
//     // This would be replaced with an actual auth query,
//     // eg., ctx.auth.getUserIdentity() or getAuthUserId(ctx)
//     const user = await ctx.db.query("users").first();
//     if (!user) {
//       throw new Error("User not found");
//     }
//     return user;
//   },
// });

// export const polar = new Polar(components.polar, {
//   products: {
//     premiumMonthly: "5fde8344-5fca-4d0b-adeb-2052cddfd9ed",
//     premiumYearly: "9bc5ed5f-2065-40a4-bd1f-e012e448d82f",
//     premiumPlusMonthly: "db548a6f-ff8c-4969-8f02-5f7301a36e7c",
//     premiumPlusYearly: "9ff9976e-459e-4ebc-8cde-b2ced74f8822",
//   },
//   getUserInfo: async (ctx) => {
//     const user = await ctx.runQuery(api.users.currentUser);
//     return {
//       userId: user?._id as Id<"users">,
//       email: user?.email!,
//     };
//   },
//   organizationToken: "your_organization_token", // Or use POLAR_ORGANIZATION_TOKEN env var
//   webhookSecret: "your_webhook_secret", // Or use POLAR_WEBHOOK_SECRET env var
//   server: "sandbox", // "sandbox" or "production", falls back to POLAR_SERVER env var
// });

// export const MAX_FREE_TODOS = 3;
// export const MAX_PREMIUM_TODOS = 6;

// export const {
//   // If you configure your products by key in the Polar constructor,
//   // this query provides a keyed object of the products.
//   getConfiguredProducts,

//   // Lists all non-archived products, useful if you don't configure products by key.
//   listAllProducts,

//   // Generates a checkout link for the given product IDs.
//   generateCheckoutLink,

//   // Generates a customer portal URL for the current user.
//   generateCustomerPortalUrl,

//   // Changes the current subscription to the given product ID.
//   changeCurrentSubscription,

//   // Cancels the current subscription.
//   cancelCurrentSubscription,
// } = polar.api();
