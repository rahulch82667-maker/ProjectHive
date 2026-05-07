import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  imageSrc?: string;
}

export default function AuthLayout({
  children,
  imageSrc = "/Images/Auth_img.png",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#fdf6ee] p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-row overflow-hidden min-h-[600px]">
        {/* LEFT SIDE - Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src={imageSrc}
            alt="Authentication background"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
