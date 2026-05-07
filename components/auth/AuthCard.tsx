interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="bg-white w-full">
      {children}
    </div>
  );
}
