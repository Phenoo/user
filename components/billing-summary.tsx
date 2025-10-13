// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   CreditCard,
//   Calendar,
//   AlertTriangle,
//   CheckCircle,
//   DollarSign,
// } from "lucide-react";
// // import { useSubscription } from "@/hooks/use-subscription";
// import { BillingPortalButton } from "./billing-portal-button";
// import Link from "next/link";
// import type { Id } from "../convex/_generated/dataModel";

// interface BillingSummaryProps {
//   userId: Id<"users">;
//   showActions?: boolean;
// }

// export function BillingSummary({
//   userId,
//   showActions = true,
// }: BillingSummaryProps) {
//   const { subscription, isLoading, planConfig } = useSubscription(userId);

//   if (isLoading) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="animate-pulse space-y-4">
//             <div className="h-4 bg-muted rounded w-1/3"></div>
//             <div className="h-8 bg-muted rounded w-1/2"></div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!subscription) {
//     return null;
//   }

//   const nextBillingDate = subscription.currentPeriodEnd
//     ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     : null;

//   const getStatusColor = () => {
//     if (subscription.isActive) return "text-green-600";
//     if (subscription.isPastDue) return "text-yellow-600";
//     if (subscription.isCanceled) return "text-red-600";
//     return "text-muted-foreground";
//   };

//   const getStatusIcon = () => {
//     if (subscription.isActive)
//       return <CheckCircle className="h-4 w-4 text-green-500" />;
//     if (subscription.isPastDue)
//       return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
//     return <AlertTriangle className="h-4 w-4 text-red-500" />;
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <CreditCard className="h-5 w-5" />
//           Billing Summary
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {/* Current Plan */}
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="font-medium">{subscription.plan} Plan</p>
//             <p className="text-sm text-muted-foreground">
//               {subscription.plan === "FREE"
//                 ? "No billing required"
//                 : `$${planConfig.price}/month`}
//             </p>
//           </div>
//           <Badge
//             variant={subscription.plan === "FREE" ? "secondary" : "default"}
//           >
//             {subscription.plan}
//           </Badge>
//         </div>

//         {/* Status */}
//         {subscription.plan !== "FREE" && (
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {getStatusIcon()}
//               <span className={`text-sm font-medium ${getStatusColor()}`}>
//                 {subscription.isActive
//                   ? "Active"
//                   : subscription.isPastDue
//                     ? "Payment Required"
//                     : "Inactive"}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Next Billing */}
//         {nextBillingDate && subscription.isActive && (
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <Calendar className="h-4 w-4" />
//             <span>
//               {subscription.cancelAtPeriodEnd ? "Expires" : "Next billing"}:{" "}
//               {nextBillingDate}
//             </span>
//           </div>
//         )}

//         {/* Cancellation Notice */}
//         {subscription.cancelAtPeriodEnd && (
//           <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
//             <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
//               <AlertTriangle className="h-4 w-4" />
//               <span className="text-sm">
//                 Subscription ends {nextBillingDate}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Actions */}
//         {showActions && (
//           <div className="space-y-2 pt-2">
//             {subscription.plan === "FREE" ? (
//               <Link href="/pricing">
//                 <Button className="w-full">
//                   <DollarSign className="h-4 w-4 mr-2" />
//                   Upgrade Plan
//                 </Button>
//               </Link>
//             ) : (
//               <div className="flex gap-2">
//                 <Link href="/dashboard/billing" className="flex-1">
//                   <Button variant="outline" className="w-full bg-transparent">
//                     Manage Billing
//                   </Button>
//                 </Link>
//                 {subscription.stripeCustomerId && (
//                   <BillingPortalButton
//                     customerId={subscription.stripeCustomerId}
//                     variant="outline"
//                     size="default"
//                   >
//                     Stripe Portal
//                   </BillingPortalButton>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
