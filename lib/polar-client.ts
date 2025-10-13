export class PolarClient {
  private baseUrl =
    process.env.NODE_ENV === "development"
      ? "https://sandbox-api.polar.sh/v1"
      : "https://api.polar.sh/v1";
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Polar API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getSubscription(subscriptionId: string) {
    return this.request(`/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd }),
    });
  }

  async updateSubscription(subscriptionId: string, priceId: string) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ price_id: priceId }),
    });
  }

  async createCheckoutSession(
    priceId: string,
    customerEmail: string,
    metadata: Record<string, string>
  ) {
    return this.request("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        price_id: priceId,
        customer_email: customerEmail,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        metadata,
      }),
    });
  }

  async getCustomerPortalUrl(customerId: string) {
    return this.request(`/customers/${customerId}/portal`);
  }

  async getCustomerPortalSession(customerId: string) {
    return this.request(`/customer-portal/sessions`, {
      method: "POST",
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });
  }

  async listSubscriptions(customerId: string) {
    return this.request(`/subscriptions?customer_id=${customerId}`);
  }

  async reactivateSubscription(subscriptionId: string) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ cancel_at_period_end: false }),
    });
  }
}

export const polarClient = new PolarClient(
  process.env.POLAR_ACCESS_TOKEN || ""
);
