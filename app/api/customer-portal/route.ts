import { type NextRequest } from "next/server";
import { polarClient } from "@/lib/polar-client";
import { CommonErrors, successResponse, handleApiError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return CommonErrors.badRequest("Customer ID is required");
    }

    const session = await polarClient.getCustomerPortalSession(customerId);

    return successResponse(session);
  } catch (error) {
    console.error("Customer portal error:", error);
    return handleApiError(error, "Failed to create customer portal session");
  }
}
