import "./globals.css";

import type { Metadata } from "next";
import { Urbanist, Lato } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "@/components/ui/sonner";
import ModalProvider from "@/components/modal-provider";
import { NextIntlClientProvider } from "next-intl";

import GoogleAnalytics from "@/components/GoogleAnalytics";

const urbanist = Urbanist({
  variable: "--font-body",
  subsets: ["latin"],
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
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased ${urbanist.className} `}>
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
                {GA_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_ID} />}

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
