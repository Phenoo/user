import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl border bg-card shadow-sm">
      <div className="h-6 w-32 mb-4">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="h-64 flex items-end gap-3">
        {[40, 80, 120, 70, 100, 50].map((h, i) => (
          <motion.div
            key={i}
            animate={{
              height: [h * 0.6, h, h * 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-8 rounded-md bg-muted"
            style={{ height: h }}
          />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
