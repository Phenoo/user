import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingComponent() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="loader-container">
        <div className="loader">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face left"></div>
          <div className="face right"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>
    </div>
  );
}
