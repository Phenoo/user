import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingComponent() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
