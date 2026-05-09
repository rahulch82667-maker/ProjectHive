import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MainLayout from "@/components/layout/MainLayout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </div>
  );
}
