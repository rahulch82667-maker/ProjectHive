import Image from "next/image";


export default function LogoHeader() {
  return (
    <div className="mb-8">
      <div className="flex justify-center mb-6">
        <Image
          src="/Images/Hive_logo.png"
          alt="ProjectHive Logo"
          width={150}
          height={50}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
}
