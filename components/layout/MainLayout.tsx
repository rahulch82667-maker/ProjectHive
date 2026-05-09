import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className = "" }) => {
  return (
    <main className={`flex-grow ${className}`}>
      {children}
    </main>
  );
};

export default MainLayout;
