import { polarClient } from "@/lib/polar-client";
import { CommonErrors, successResponse, handleApiError } from "@/lib/api-helpers";
import { getAuthenticatedSubscription } from "@/lib/server/convex-auth";

export async function POST() {
  try {
    const authentication = await getAuthenticatedSubscription();

    if (!authentication) {
      return CommonErrors.unauthorized();
    }

    const customerId = authentication.subscription?.polarCustomerId;
    if (!customerId) {
      return CommonErrors.notFound("No active subscription found");
    }

    const session = await polarClient.getCustomerPortalSession(customerId);

    return successResponse(session);
  } catch (error) {
    console.error("Customer portal error:", error);
    return handleApiError(error, "Failed to create customer portal session");
  }
}
