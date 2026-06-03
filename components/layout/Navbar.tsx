"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  User,
  LogOut,
  Heart,
  LayoutGrid,
  FolderKanban,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { RootState } from "@/store/store";
import { logoutUser } from "@/store/slices/authSlice";
import { logoutApi } from "@/services/auth/auth.api";
import Container from "./Container";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  const navLinks = [
    { name: "Web Themes & Templates", href: "/" },
    { name: "Video", href: "/video" },
    { name: "Photos", href: "/photos" },
  ];

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(logoutUser());
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logoutUser());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <Container>
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/Images/Hive_logo.png"
                alt="ProjectHive Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/" &&
                  (pathname === "/" ||
                    pathname === "/themes" ||
                    pathname === "/templates")) ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative font-semibold text-sm transition-all duration-300 py-1.5 border-b-2 ${
                    isActive
                      ? "text-brown-850 border-brown-700 font-bold"
                      : "text-gray-500 hover:text-brown-700 border-transparent hover:border-brown-200"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4 min-w-[200px] justify-end">
            {loading ? (
              <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse"></div>
            ) : !isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="relative inline-block text-gray-700 hover:text-brown-700 font-medium px-4 py-2 text-sm transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-amber-700 after:transition-all after:duration-300 hover:after:w-full"
                >
                  Log in
                </Link>{" "}
                <Link
                  href="/signup"
                  className="bg-brown-700 hover:bg-brown-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                >
                  <div className="flex flex-col items-end hidden xl:flex">
                    <span className="text-sm font-semibold text-gray-800 leading-none">
                      {user?.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {user?.email}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-brown-50 flex items-center justify-center text-brown-700 border border-brown-100 shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="Avatar"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 lg:hidden">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={18} />
                      Profile
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart size={18} />
                      Favorites
                    </Link>
                    <Link
                      href="/collections"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutGrid size={18} />
                      Collections
                    </Link>
                    <Link
                      href="/my-projects"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FolderKanban size={18} />
                      My Projects
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors font-medium"
                    >
                      <LogOut size={18} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-brown-700 p-2 transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 absolute w-full left-0 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/" &&
                  (pathname === "/" ||
                    pathname === "/themes" ||
                    pathname === "/templates")) ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-brown-850 bg-brown-50 font-bold"
                      : "text-gray-700 hover:text-brown-700 hover:bg-brown-50/50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3 px-3">
              {loading ? (
                <div className="flex items-center gap-3 px-3 py-4 bg-gray-50 rounded-xl animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              ) : !isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="text-center w-full py-3 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-center w-full py-3 bg-brown-700 text-white font-semibold rounded-lg hover:bg-brown-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-4 bg-gray-50 rounded-xl mb-4">
                    <div className="h-12 w-12 rounded-full bg-brown-100 flex items-center justify-center text-brown-700 overflow-hidden">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt="Avatar"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-brown-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={20} />
                    Profile
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-brown-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart size={20} />
                    Favorites
                  </Link>
                  <Link
                    href="/collections"
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-brown-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutGrid size={20} />
                    Collections
                  </Link>
                  <Link
                    href="/my-projects"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-700 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FolderKanban size={18} />
                    My Projects
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-red-600 w-full text-left"
                  >
                    <LogOut size={20} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
