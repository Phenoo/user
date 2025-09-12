import React from "react";

const BillingPage = () => {
  return <div></div>;
};

export default BillingPage;

// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
//   CreditCard,
//   Download,
//   AlertTriangle,
//   CheckCircle,
//   Crown,
//   ArrowUpRight,
//   Settings,
//   Receipt,
//   Clock,
// } from "lucide-react";
// import { SubscriptionStatus } from "@/components/subscription-status";
// import { BillingPortalButton } from "@/components/billing-portal-button";
// import Link from "next/link";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";

// export default function BillingPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const currentUser = useQuery(api.users.currentUser);

//   // Note: In a real app, you'd get the current user from Clerk or your auth system
//   const subscription = useQuery(
//     api.subscriptions.getUserSubscription,
//     currentUser ? { userId: currentUser._id } : "skip"
//   );

//   // const cancelSubscription = useMutation(api.stripe.cancelSubscription);
//   // const reactivateSubscription = useMutation(api.stripe.reactivateSubscription);

//   // Mock billing data (in real app, this would come from Stripe/Convex)
//   const billingData = {
//     paymentMethod: {
//       brand: "visa",
//       last4: "4242",
//       expMonth: 12,
//       expYear: 2025,
//     },
//     invoices: [
//       {
//         id: "in_1234567890",
//         date: Date.now() - 30 * 24 * 60 * 60 * 1000,
//         amount: 9.99,
//         status: "paid",
//         description: "Student Plan - Monthly",
//         downloadUrl: "#",
//       },
//       {
//         id: "in_0987654321",
//         date: Date.now() - 60 * 24 * 60 * 60 * 1000,
//         amount: 9.99,
//         status: "paid",
//         description: "Student Plan - Monthly",
//         downloadUrl: "#",
//       },
//       {
//         id: "in_1122334455",
//         date: Date.now() - 90 * 24 * 60 * 60 * 1000,
//         amount: 9.99,
//         status: "paid",
//         description: "Student Plan - Monthly",
//         downloadUrl: "#",
//       },
//     ],
//   };

//   const formatDate = (timestamp: number) => {
//     return new Date(timestamp).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "paid":
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case "pending":
//         return <Clock className="h-4 w-4 text-yellow-500" />;
//       case "failed":
//         return <AlertTriangle className="h-4 w-4 text-red-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-muted-foreground" />;
//     }
//   };

//   const getStatusVariant = (
//     status: string
//   ): "default" | "secondary" | "destructive" | "outline" => {
//     switch (status) {
//       case "paid":
//         return "default";
//       case "pending":
//         return "secondary";
//       case "failed":
//         return "destructive";
//       default:
//         return "outline";
//     }
//   };

//   const handleCancelSubscription = async () => {
//     if (!currentUser) return;

//     try {
//       setIsLoading(true);
//       await cancelSubscription({ userId: currentUser._id });
//     } catch (error) {
//       console.error("Failed to cancel subscription:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReactivateSubscription = async () => {
//     if (!currentUser) return;

//     try {
//       setIsLoading(true);
//       await reactivateSubscription({ userId: currentUser._id });
//     } catch (error) {
//       console.error("Failed to reactivate subscription:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!currentUser) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b bg-card">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Link
//                 href="/dashboard"
//                 className="text-muted-foreground hover:text-foreground"
//               >
//                 ← Back to Dashboard
//               </Link>
//             </div>
//             <div className="flex items-center gap-4">
//               <Badge variant="secondary" className="text-sm">
//                 Billing Management
//               </Badge>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-4xl mx-auto p-6">
//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <CreditCard className="h-8 w-8 text-primary" />
//             <h1 className="text-3xl font-bold">Billing & Subscription</h1>
//           </div>
//           <p className="text-muted-foreground">
//             Manage your subscription, payment methods, and billing history
//           </p>
//         </div>

//         {/* Current Subscription */}
//         <div className="mb-8">
//           <SubscriptionStatus userId={currentUser._id} showDetails={true} />
//         </div>

//         {/* Payment Method */}
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <CreditCard className="h-5 w-5" />
//               Payment Method
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between p-4 border rounded-lg">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
//                   {billingData.paymentMethod.brand.toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-medium">
//                     •••• •••• •••• {billingData.paymentMethod.last4}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     Expires {billingData.paymentMethod.expMonth}/
//                     {billingData.paymentMethod.expYear}
//                   </p>
//                 </div>
//               </div>
//               <Badge variant="default">Default</Badge>
//             </div>

//             <div className="flex gap-3">
//               <BillingPortalButton
//                 userId={currentUser._id}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 <Settings className="h-4 w-4 mr-2" />
//                 Manage Payment Methods
//               </BillingPortalButton>

//               <BillingPortalButton
//                 userId={currentUser._id}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 <Receipt className="h-4 w-4 mr-2" />
//                 Update Billing Info
//               </BillingPortalButton>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Plan Management */}
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Crown className="h-5 w-5" />
//               Plan Management
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="p-4 border rounded-lg">
//                 <h3 className="font-medium mb-2">Current Plan</h3>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Badge variant="default">
//                     {subscription?.plan || "FREE"}
//                   </Badge>
//                   <span className="text-sm text-muted-foreground">
//                     {subscription?.plan === "STUDENT"
//                       ? "$9.99/month"
//                       : subscription?.plan === "PRO"
//                         ? "$19.99/month"
//                         : "Free"}
//                   </span>
//                 </div>
//                 {subscription?.currentPeriodEnd && (
//                   <p className="text-sm text-muted-foreground">
//                     Next billing: {formatDate(subscription.currentPeriodEnd)}
//                   </p>
//                 )}
//               </div>

//               <div className="p-4 border rounded-lg">
//                 <h3 className="font-medium mb-2">Usage This Month</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Flashcard Decks</span>
//                     <span>
//                       8 / {subscription?.plan === "FREE" ? "5" : "Unlimited"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>Study Groups</span>
//                     <span>
//                       3 / {subscription?.plan === "FREE" ? "2" : "Unlimited"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <Separator />

//             <div className="flex gap-3">
//               <Link href="/pricing" className="flex-1">
//                 <Button variant="outline" className="w-full bg-transparent">
//                   <ArrowUpRight className="h-4 w-4 mr-2" />
//                   Change Plan
//                 </Button>
//               </Link>

//               {subscription?.cancelAtPeriodEnd ? (
//                 <Button
//                   variant="outline"
//                   className="flex-1 bg-transparent"
//                   onClick={handleReactivateSubscription}
//                   disabled={isLoading}
//                 >
//                   Reactivate Subscription
//                 </Button>
//               ) : (
//                 <Button
//                   variant="outline"
//                   className="flex-1 bg-transparent"
//                   onClick={handleCancelSubscription}
//                   disabled={isLoading}
//                 >
//                   Cancel Subscription
//                 </Button>
//               )}
//             </div>

//             {subscription?.cancelAtPeriodEnd &&
//               subscription?.currentPeriodEnd && (
//                 <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
//                   <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
//                     <AlertTriangle className="h-4 w-4" />
//                     <span className="text-sm font-medium">
//                       Your subscription will end on{" "}
//                       {formatDate(subscription.currentPeriodEnd)}
//                     </span>
//                   </div>
//                 </div>
//               )}
//           </CardContent>
//         </Card>

//         {/* Billing History */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Receipt className="h-5 w-5" />
//               Billing History
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {billingData.invoices.map((invoice) => (
//                 <div
//                   key={invoice.id}
//                   className="flex items-center justify-between p-4 border rounded-lg"
//                 >
//                   <div className="flex items-center gap-4">
//                     {getStatusIcon(invoice.status)}
//                     <div>
//                       <p className="font-medium">{invoice.description}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {formatDate(invoice.date)} • Invoice #
//                         {invoice.id.slice(-8)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <div className="text-right">
//                       <p className="font-medium">${invoice.amount}</p>
//                       <Badge
//                         variant={getStatusVariant(invoice.status)}
//                         className="text-xs"
//                       >
//                         {invoice.status}
//                       </Badge>
//                     </div>
//                     <Button variant="ghost" size="sm">
//                       <Download className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 text-center">
//               <BillingPortalButton userId={currentUser._id} variant="outline">
//                 View All Invoices
//               </BillingPortalButton>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Help Section */}
//         <Card className="mt-8">
//           <CardHeader>
//             <CardTitle>Need Help?</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="p-4 border rounded-lg">
//                 <h3 className="font-medium mb-2">Billing Questions</h3>
//                 <p className="text-sm text-muted-foreground mb-3">
//                   Have questions about your bill or need to update your payment
//                   information?
//                 </p>
//                 <Button variant="outline" size="sm">
//                   Contact Support
//                 </Button>
//               </div>

//               <div className="p-4 border rounded-lg">
//                 <h3 className="font-medium mb-2">Plan Changes</h3>
//                 <p className="text-sm text-muted-foreground mb-3">
//                   Want to upgrade, downgrade, or learn more about our plans?
//                 </p>
//                 <Link href="/pricing">
//                   <Button variant="outline" size="sm">
//                     View Plans
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
