// src/components/layout/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  hrmsSubmenus,
  resourcesSubmenus,
  companySubmenus,
} from "@/data/submenus";

// 1. Updated NavLink
// - Removed 'isActive' color logic (text stays gray unless hovered)
// - Changed font-medium to font-semibold for better weight
// - Text color darkened to text-gray-700 for better legibility
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean; // Prop kept for interface compatibility but not used for styling
}) => (
  <Link
    href={href}
    className="group relative flex items-center px-1 py-5 text-sm font-semibold text-gray-700 transition-colors duration-300 hover:text-blue-600"
  >
    <span className="relative z-10">{children}</span>
    {/* Underline only appears on hover */}
    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600 transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100"></span>
  </Link>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(
    null
  );
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");

  const hrmsDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseInsideRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideDownFade {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUpFade {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-8px); }
      }
      .animate-slideDownFade { animation: slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-slideUpFade { animation: slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeDropdown === "hrms" && hrmsDropdownRef.current) {
      hrmsDropdownRef.current.scrollTo({ top: 0 });
      setScrollDirection("down");
    }
  }, [activeDropdown]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const openDropdown = (id: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    isMouseInsideRef.current = true;
    setIsClosing(false);
    setActiveDropdown(id);
  };

  const closeDropdown = () => {
    isMouseInsideRef.current = false;
    closeTimerRef.current = setTimeout(() => {
      if (!isMouseInsideRef.current) {
        setIsClosing(true);
        setTimeout(() => {
          setActiveDropdown(null);
          setIsClosing(false);
        }, 200);
      }
    }, 100);
  };

  const handleDropdownScrollToggle = () => {
    if (hrmsDropdownRef.current) {
      const { current } = hrmsDropdownRef;
      if (scrollDirection === "down") {
        current.scrollTo({ top: current.scrollHeight, behavior: "smooth" });
        setScrollDirection("up");
      } else {
        current.scrollTo({ top: 0, behavior: "smooth" });
        setScrollDirection("down");
      }
    }
  };

  const toggleMobileSubmenu = (submenu: string) => {
    setOpenMobileSubmenu(openMobileSubmenu === submenu ? null : submenu);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
    setOpenMobileSubmenu(null);
  };

  // isSectionActive is no longer needed for text coloring, but kept if logic is needed later
  const isSectionActive = (section: string) => {
    if (section === "hrms") return pathname.startsWith("/hrms");
    if (section === "resources") return pathname.startsWith("/resources");
    if (section === "company") return pathname.startsWith("/company");
    return false;
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group z-50 relative">
            <div className="text-3xl font-bold text-[#008080] tracking-tight group-hover:opacity-80 transition-opacity duration-300">
              kaizen
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-12">
            <div className="flex items-center space-x-8 mx-auto">
              {/* HRMS Dropdown Trigger */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => openDropdown("hrms")}
                onMouseLeave={closeDropdown}
              >
                <button className="group relative flex items-center space-x-1 py-2 text-sm font-semibold text-gray-700 transition-colors duration-300 hover:text-blue-600 outline-none">
                  <span>HRMS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      activeDropdown === "hrms" ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100"></span>
                </button>
              </div>

              {/* Resources Dropdown Trigger */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => openDropdown("resources")}
                onMouseLeave={closeDropdown}
              >
                <button className="group relative flex items-center space-x-1 py-2 text-sm font-semibold text-gray-700 transition-colors duration-300 hover:text-blue-600 outline-none">
                  <span>Resources</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      activeDropdown === "resources" ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100"></span>
                </button>
              </div>

              {/* Direct Links */}
              <NavLink
                href="/resources/blog-articles"
                isActive={pathname.startsWith("/resources/blog-articles")}
              >
                Blog & Articles
              </NavLink>
              <NavLink
                href="/company/developments"
                isActive={pathname.startsWith("/company/developments")}
              >
                Developments
              </NavLink>
              <NavLink
                href="/company/careers"
                isActive={pathname.startsWith("/company/careers")}
              >
                Careers
              </NavLink>

              {/* Company Dropdown Trigger */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => openDropdown("company")}
                onMouseLeave={closeDropdown}
              >
                <button className="group relative flex items-center space-x-1 py-2 text-sm font-semibold text-gray-700 transition-colors duration-300 hover:text-blue-600 outline-none">
                  <span>Company</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      activeDropdown === "company" ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100"></span>
                </button>
              </div>
            </div>

            {/* Desktop Contact Us Button */}
            <Link
              href="/company/contact-us"
              className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-7 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50 relative">
            <button
              onClick={() => {
                if (mobileMenuOpen) {
                  setMobileMenuOpen(false);
                  setOpenMobileSubmenu(null);
                } else {
                  setMobileMenuOpen(true);
                }
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Content Wrapper */}
      <div
        className="absolute top-full left-0 w-full overflow-hidden pointer-events-none"
        style={{ height: activeDropdown ? "auto" : "0" }}
      >
        {/* HRMS DROPDOWN */}
        {activeDropdown === "hrms" && (
          <div
            ref={hrmsDropdownRef}
            className={`w-full bg-white border-t border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-[75vh] overflow-y-auto pointer-events-auto ${
              isClosing ? "animate-slideUpFade" : "animate-slideDownFade"
            }`}
            onMouseEnter={() => openDropdown("hrms")}
            onMouseLeave={closeDropdown}
          >
            <div className="max-w-7xl mx-auto p-8 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hrmsSubmenus.map((item, index) => (
                  <Link
                    href={item.path}
                    key={index}
                    onClick={() => setActiveDropdown(null)}
                    className="group block p-4 rounded-xl hover:bg-blue-50/50 transition-all duration-200 border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed group-hover:text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="sticky bottom-4 w-full flex justify-end pr-8 pointer-events-none">
                <button
                  onClick={handleDropdownScrollToggle}
                  className="bg-blue-600 shadow-lg rounded-full p-3 hover:bg-blue-700 hover:scale-110 transition-all duration-300 pointer-events-auto text-white"
                >
                  {scrollDirection === "down" ? (
                    <ChevronDown size={24} />
                  ) : (
                    <ChevronUp size={24} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES DROPDOWN */}
        {activeDropdown === "resources" && (
          <div
            className={`w-full bg-white border-t border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] pointer-events-auto ${
              isClosing ? "animate-slideUpFade" : "animate-slideDownFade"
            }`}
            onMouseEnter={() => openDropdown("resources")}
            onMouseLeave={closeDropdown}
          >
            <div className="max-w-7xl mx-auto p-8">
              <div className="flex flex-wrap justify-center gap-6">
                {resourcesSubmenus.map((item, index) => (
                  <Link
                    href={item.path}
                    key={index}
                    onClick={() => setActiveDropdown(null)}
                    target={item.name === "Brochure" ? "_blank" : "_self"}
                    rel={item.name === "Brochure" ? "noopener noreferrer" : ""}
                    className="group block w-full md:w-80 p-4 rounded-xl hover:bg-blue-50/50 transition-all duration-200 border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed group-hover:text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMPANY DROPDOWN */}
        {activeDropdown === "company" && (
          <div
            className={`w-full bg-white border-t border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] pointer-events-auto ${
              isClosing ? "animate-slideUpFade" : "animate-slideDownFade"
            }`}
            onMouseEnter={() => openDropdown("company")}
            onMouseLeave={closeDropdown}
          >
            <div className="max-w-7xl mx-auto p-8">
              <div className="flex flex-wrap justify-center gap-6">
                {companySubmenus.map((item, index) => (
                  <Link
                    href={item.path}
                    key={index}
                    onClick={() => setActiveDropdown(null)}
                    className="group block w-full md:w-80 p-4 rounded-xl hover:bg-blue-50/50 transition-all duration-200 border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed group-hover:text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay (Unchanged) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white h-screen w-full overflow-y-auto transition-all duration-500 ease-in-out opacity-100 translate-y-0 pt-24 pb-8 px-6">
          <div className="space-y-4">
            {/* HRMS Section */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleMobileSubmenu("hrms")}
                className={`w-full flex justify-between items-center py-4 text-lg font-medium transition-all ${
                  openMobileSubmenu === "hrms"
                    ? "text-blue-600"
                    : "text-gray-800"
                }`}
              >
                <span className="text-xl tracking-tight">HRMS</span>
                <div
                  className={`p-2 rounded-full transition-colors ${
                    openMobileSubmenu === "hrms"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      openMobileSubmenu === "hrms" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openMobileSubmenu === "hrms"
                    ? "max-h-[2000px] opacity-100 mb-4"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-gray-50 rounded-2xl p-2 space-y-1">
                  {hrmsSubmenus.map((item, index) => (
                    <Link
                      key={index}
                      href={item.path}
                      onClick={handleMobileLinkClick}
                      className="flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-700 hover:bg-white rounded-xl transition-all duration-200"
                    >
                      <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                        <item.icon size={18} />
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleMobileSubmenu("resources")}
                className={`w-full flex justify-between items-center py-4 text-lg font-medium transition-all ${
                  openMobileSubmenu === "resources"
                    ? "text-blue-600"
                    : "text-gray-800"
                }`}
              >
                <span className="text-xl tracking-tight">Resources</span>
                <div
                  className={`p-2 rounded-full transition-colors ${
                    openMobileSubmenu === "resources"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      openMobileSubmenu === "resources" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {openMobileSubmenu === "resources" && (
                <div className="pl-4 space-y-3 mt-2 border-l-2 border-blue-100">
                  {resourcesSubmenus.map((item, index) => (
                    <Link
                      key={index}
                      href={item.path}
                      onClick={handleMobileLinkClick}
                      target={item.name === "Brochure" ? "_blank" : "_self"}
                      className="flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-700 hover:bg-white rounded-xl transition-all duration-200"
                    >
                      <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                        <item.icon size={18} />
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Links */}
            <Link
              href="/resources/blog-articles"
              onClick={handleMobileLinkClick}
              className={`block py-3 text-lg font-semibold border-b border-gray-100 transition-colors ${
                pathname.startsWith("/resources/blog-articles")
                  ? "text-blue-600"
                  : "text-gray-900"
              }`}
            >
              Blog & Articles
            </Link>
            <Link
              href="/company/developments"
              onClick={handleMobileLinkClick}
              className={`block py-3 text-lg font-semibold border-b border-gray-100 transition-colors ${
                pathname.startsWith("/company/developments")
                  ? "text-blue-600"
                  : "text-gray-900"
              }`}
            >
              Developments
            </Link>
            <Link
              href="/company/careers"
              onClick={handleMobileLinkClick}
              className={`block py-3 text-lg font-semibold border-b border-gray-100 transition-colors ${
                pathname.startsWith("/company/careers")
                  ? "text-blue-600"
                  : "text-gray-900"
              }`}
            >
              Careers
            </Link>

            {/* Company Section */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleMobileSubmenu("company")}
                className={`w-full flex justify-between items-center py-4 text-lg font-medium transition-all ${
                  openMobileSubmenu === "company"
                    ? "text-blue-600"
                    : "text-gray-800"
                }`}
              >
                <span className="text-xl tracking-tight">Company</span>
                <div
                  className={`p-2 rounded-full transition-colors ${
                    openMobileSubmenu === "company"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      openMobileSubmenu === "company" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {openMobileSubmenu === "company" && (
                <div className="pl-4 space-y-3 mt-2 border-l-2 border-blue-100">
                  {companySubmenus.map((item, index) => (
                    <Link
                      key={index}
                      href={item.path}
                      onClick={handleMobileLinkClick}
                      className="flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-700 hover:bg-white rounded-xl transition-all duration-200"
                    >
                      <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                        <item.icon size={18} />
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile CTA */}
            <div className="pt-6 pb-4">
              <Link
                href="/company/contact-us"
                onClick={handleMobileLinkClick}
                className="flex items-center justify-center w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-400/20 transition-all active:scale-[0.98]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
