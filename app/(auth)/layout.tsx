import MainLayout from "@/components/layout/MainLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout className="bg-white min-h-screen flex items-center justify-center">
      {children}
    </MainLayout>
  );
}
