import "./globals.css";

import { Urbanist } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "@/components/ui/sonner";
import ModalProvider from "@/components/modal-provider";
import { NextIntlClientProvider } from "next-intl";

import GoogleAnalytics from "@/components/GoogleAnalytics";
import { generateMetadata } from "@/utils";

const urbanist = Urbanist({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = generateMetadata();

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
