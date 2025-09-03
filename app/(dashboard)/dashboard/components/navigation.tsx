"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Brain, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Study",
    link: "/dashboard/study",
    icon: BookOpen,
  },
  {
    name: "Flashcards",
    link: "/dashboard/flashcards",
    icon: Brain,
  },
  {
    name: "Analytics",
    link: "/dashboard/analytics",
    icon: BarChart3,
  },
];

// export function Navigation() {
//   const pathname = usePathname();
//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     const index = navLinks.findIndex((link) => link.link === pathname);
//     if (index !== -1) {
//       setActiveIndex(index);
//     }
//   }, [pathname]);

//   return (
//     <nav className="relative flex gap-1 w-fit bg-white p-1 rounded-3xl shadow-lg border border-gray-100">
//       <motion.div
//         className="absolute top-1 bottom-1 bg-gray-100 rounded-3xl"
//         initial={false}
//         animate={{
//           left: `${activeIndex * 25}%`,
//           width: "25%",
//         }}
//         transition={{
//           type: "spring",
//           stiffness: 300,
//           damping: 30,
//         }}
//       />

//       {navLinks.map((item, index) => {
//         const Icon = item.icon;
//         const isActive = pathname === item.link;

//         return (
//           <Link
//             key={item.name}
//             href={item.link}
//             className={cn(
//               "relative flex items-center gap-1 px-4 py-2 rounded-3xl text-sm font-medium transition-all duration-200 ease-in-out z-10",
//               "hover:text-foreground",
//               isActive
//                 ? "text-foreground"
//                 : "text-muted-foreground hover:text-foreground"
//             )}
//           >
//             <Icon
//               className={cn(
//                 "h-5 w-5 transition-transform duration-200",
//                 isActive && "scale-110"
//               )}
//             />
//             {isActive && (
//               <motion.span
//                 className="relative whitespace-nowrap"
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: 1, width: "auto" }}
//                 exit={{ opacity: 0, width: 0 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 {item.name}
//               </motion.span>
//             )}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }

export function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex gap-1 w-[310px] bg-white p-1 justify-between rounded-3xl relative">
      {navLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.link;

        return (
          <Link
            key={item.name}
            href={item.link}
            className={cn(
              "relative flex items-center gap-1 px-4 py-2 rounded-3xl text-sm font-medium transition-colors duration-200 ease-in-out",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 rounded-3xl bg-[#ddd]"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <Icon
              className={cn(
                "h-6 w-6 relative z-10 p-1 transition-transform duration-200",
                isActive && "scale-110"
              )}
            />
            {isActive && <span className="relative z-10">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 z-10 p-4 w-full">
      <nav className="md:hidden    flex gap-1 w-[310px] mx-auto bg-white p-1 justify-between rounded-3xl relative">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.link;

          return (
            <Link
              key={item.name}
              href={item.link}
              className={cn(
                "relative flex items-center gap-1 px-4 py-2 rounded-3xl text-sm font-medium transition-colors duration-200 ease-in-out",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-3xl bg-[#ddd]"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                className={cn(
                  "h-6 w-6 relative z-10 p-1 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              {isActive && (
                <span className="relative z-10 text-xs">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
