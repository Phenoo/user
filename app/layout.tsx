import type { Metadata } from "next";
import { Urbanist, Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

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
  title: "Usoro - Study",
  description:
    "Student Management System, which centralises academic planning and make students focus on what really matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${urbanist.className} ${lato.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
