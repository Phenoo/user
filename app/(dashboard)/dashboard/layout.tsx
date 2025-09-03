import HeaderComponent from "./components/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeaderComponent />
      <main className="min-h-screen h-full bg-gradient-to-br from-blue-50 to-red-50 flex flex-col pt-28">
        {children}
      </main>
    </>
  );
}
