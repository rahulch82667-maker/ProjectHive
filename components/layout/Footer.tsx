import React from "react";
import Container from "./Container";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <Container>
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-8">
            <Image
              src="/Images/Hive_logo.png"
              alt="ProjectHive Logo"
              width={120}
              height={32}
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Cookies
            </Link>
            <Link href="/support" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Support
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              © {currentYear} ProjectHive. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
