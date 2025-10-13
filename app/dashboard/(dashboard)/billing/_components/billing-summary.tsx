"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Receipt, TrendingUp, Calendar } from "lucide-react";

interface BillingSummaryProps {
  invoices: Array<{
    amount: number;
    status: string;
    invoiceDate: number;
  }>;
}

export function BillingSummary({ invoices }: BillingSummaryProps) {
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const totalSpent = paidInvoices.reduce(
    (sum, inv) => sum + inv.amount / 100,
    0
  );
  const averageInvoice =
    paidInvoices.length > 0 ? totalSpent / paidInvoices.length : 0;

  const lastInvoice = invoices.length > 0 ? invoices[0] : null;
  const lastInvoiceDate = lastInvoice
    ? new Date(lastInvoice.invoiceDate)
    : null;

  const stats = [
    {
      label: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      icon: Receipt,
      description: "All time",
    },
    {
      label: "Average Invoice",
      value: `$${averageInvoice.toFixed(2)}`,
      icon: TrendingUp,
      description: `${paidInvoices.length} invoices`,
    },
    {
      label: "Last Invoice",
      value: lastInvoiceDate
        ? lastInvoiceDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "N/A",
      icon: Calendar,
      description: lastInvoice
        ? `$${(lastInvoice.amount / 100).toFixed(2)}`
        : "No invoices",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
