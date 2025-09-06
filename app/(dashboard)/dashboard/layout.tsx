import HeaderComponent from "./components/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeaderComponent />
      <main className="min-h-screen h-full g-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900 dark:to-red-900 flex flex-col pt-28">
        {children}
      </main>
    </>
  );
}
