import type { Metadata } from "next";
import { Urbanist, Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "@/components/ui/sonner";
import ModalProvider from "@/components/modal-provider";
import { NextIntlClientProvider } from "next-intl";

import { getMessages } from "next-intl/server";

const urbanist = Urbanist({
  variable: "--font-body",
  subsets: ["latin"],
});
const lato = Lato({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "900", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Usoro - Study",
    default: "Usoro - Study",
  },
  description:
    "Student Management System, which centralises academic planning and make students focus on what really matters.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased ${urbanist.className} ${lato.className}`}>
          <ConvexClientProvider>
            <NextIntlClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
              >
                {children}
                <ModalProvider />
                <Toaster />
              </ThemeProvider>
            </NextIntlClientProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
