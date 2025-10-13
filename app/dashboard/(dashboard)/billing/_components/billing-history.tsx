"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingPortalButton } from "@/components/billing-portal-button";

const BillingHistory = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const billingData = {
    paymentMethod: {
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
    },
    invoices: [
      {
        id: "in_1234567890",
        date: Date.now() - 30 * 24 * 60 * 60 * 1000,
        amount: 9.99,
        status: "paid",
        description: "Student Plan - Monthly",
        downloadUrl: "#",
      },
      {
        id: "in_0987654321",
        date: Date.now() - 60 * 24 * 60 * 60 * 1000,
        amount: 9.99,
        status: "paid",
        description: "Student Plan - Monthly",
        downloadUrl: "#",
      },
      {
        id: "in_1122334455",
        date: Date.now() - 90 * 24 * 60 * 60 * 1000,
        amount: 9.99,
        status: "paid",
        description: "Student Plan - Monthly",
        downloadUrl: "#",
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Billing History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {billingData.invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(invoice.status)}
                <div>
                  <p className="font-medium">{invoice.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(invoice.date)} • Invoice #{invoice.id.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">${invoice.amount}</p>
                  <Badge
                    variant={getStatusVariant(invoice.status)}
                    className="text-xs"
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <BillingPortalButton customerId="" variant="outline">
            View All Invoices
          </BillingPortalButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingHistory;
