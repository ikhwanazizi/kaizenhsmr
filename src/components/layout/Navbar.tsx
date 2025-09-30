"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";

import {
  hrmsSubmenus,
  resourcesSubmenus,
  companySubmenus,
} from "@/data/submenus";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false); // State to handle closing animation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(
    null
  );
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");

  const hrmsDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseInsideRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
      }
      .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
      .animate-slideUp { animation: slideUp 0.2s ease-out forwards; }
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

  // Effect to reset HRMS dropdown scroll when it opens
  useEffect(() => {
    if (activeDropdown === "hrms" && hrmsDropdownRef.current) {
      hrmsDropdownRef.current.scrollTo({ top: 0 });
      setScrollDirection("down");
    }
  }, [activeDropdown]);

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
        // Wait for animation to finish before removing from DOM
        setTimeout(() => {
          setActiveDropdown(null);
          setIsClosing(false);
        }, 200); // This duration MUST match the slideUp animation
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

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 shadow-lg ${
        isScrolled ? "bg-white" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">kaizen</div>
          </a>

          <div className="hidden md:flex items-center justify-between flex-1 ml-8">
            <div className="flex items-center space-x-8 mx-auto">
              <div
                className="relative"
                onMouseEnter={() => openDropdown("hrms")}
                onMouseLeave={closeDropdown}
              >
                <button className="group relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-5">
                  <span>HRMS</span>
                  <ChevronDown size={16} />
                  <span className="absolute bottom-3 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
                </button>
              </div>

              <div
                className="relative"
                onMouseEnter={() => openDropdown("resources")}
                onMouseLeave={closeDropdown}
              >
                <button className="group relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-5">
                  <span>Resources</span>
                  <ChevronDown size={16} />
                  <span className="absolute bottom-3 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
                </button>
              </div>

              <div
                className="relative"
                onMouseEnter={() => openDropdown("company")}
                onMouseLeave={closeDropdown}
              >
                <button className="group relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-5">
                  <span>Company</span>
                  <ChevronDown size={16} />
                  <span className="absolute bottom-3 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
                </button>
              </div>
            </div>

            <a
              href="/company/contact-us"
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-medium transition-colors"
            >
              Contact Us
            </a>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setOpenMobileSubmenu(null);
              }}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* HRMS DROPDOWN */}
      {activeDropdown === "hrms" && (
        <div
          ref={hrmsDropdownRef}
          className={`absolute top-full left-0 w-full bg-white shadow-xl z-50 max-h-[70vh] overflow-y-auto hidden md:block ${
            isClosing ? "animate-slideUp" : "animate-slideDown"
          }`}
          onMouseEnter={() => openDropdown("hrms")}
          onMouseLeave={closeDropdown}
        >
          <div className="max-w-7xl mx-auto p-8 relative">
            <div className="grid grid-cols-3 gap-1">
              {hrmsSubmenus.map((item, index) => (
                <a
                  href={item.path}
                  key={index}
                  onClick={() => setActiveDropdown(null)}
                  className="block"
                >
                  <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="text-blue-600 mt-1 text-xl">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="sticky bottom-4 w-full flex justify-end pr-8 pointer-events-none">
              <button
                onClick={handleDropdownScrollToggle}
                className="bg-white shadow-md rounded-full p-2 hover:bg-blue-50 hover:scale-110 transition-all duration-300 pointer-events-auto"
              >
                {scrollDirection === "down" ? (
                  <ChevronDown size={20} className="text-blue-600" />
                ) : (
                  <ChevronUp size={20} className="text-blue-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOURCES DROPDOWN */}
      {activeDropdown === "resources" && (
        <div
          className={`absolute top-full left-0 w-full bg-white shadow-xl z-50 hidden md:block ${
            isClosing ? "animate-slideUp" : "animate-slideDown"
          }`}
          onMouseEnter={() => openDropdown("resources")}
          onMouseLeave={closeDropdown}
        >
          <div className="max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-3 gap-1">
              {resourcesSubmenus.map((item, index) => (
                <a
                  href={item.path}
                  key={index}
                  onClick={() => setActiveDropdown(null)}
                  className="block"
                >
                  <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="text-blue-600 mt-1 text-xl">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPANY DROPDOWN */}
      {activeDropdown === "company" && (
        <div
          className={`absolute top-full left-0 w-full bg-white shadow-xl z-50 hidden md:block ${
            isClosing ? "animate-slideUp" : "animate-slideDown"
          }`}
          onMouseEnter={() => openDropdown("company")}
          onMouseLeave={closeDropdown}
        >
          <div className="max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-3 gap-1">
              {companySubmenus.map((item, index) => (
                <a
                  href={item.path}
                  key={index}
                  onClick={() => setActiveDropdown(null)}
                  className="block"
                >
                  <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="text-blue-600 mt-1 text-xl">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 w-full max-h-[calc(100vh-4rem)] overflow-y-auto animate-slideDown">
          <div className="px-5 py-4 space-y-2">
            <div>
              <button
                onClick={() => toggleMobileSubmenu("hrms")}
                className="w-full flex justify-between items-center py-2 text-lg font-semibold text-gray-900"
              >
                <span>HRMS</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    openMobileSubmenu === "hrms" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMobileSubmenu === "hrms" && (
                <div className="pl-4 pt-2 space-y-2 border-l-2 border-blue-100">
                  {hrmsSubmenus.map((item, index) => (
                    <a
                      key={index}
                      href={item.path}
                      onClick={handleMobileLinkClick}
                      className="flex items-center space-x-3 p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      <span className="text-blue-600">
                        <item.icon size={20} />
                      </span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleMobileSubmenu("resources")}
                className="w-full flex justify-between items-center py-2 text-lg font-semibold text-gray-900"
              >
                <span>Resources</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    openMobileSubmenu === "resources" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMobileSubmenu === "resources" && (
                <div className="pl-4 pt-2 space-y-2 border-l-2 border-blue-100">
                  {resourcesSubmenus.map((item, index) => (
                    <a
                      key={index}
                      href={item.path}
                      onClick={handleMobileLinkClick}
                      className="flex items-center space-x-3 p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      <span className="text-blue-600">
                        <item.icon size={20} />
                      </span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleMobileSubmenu("company")}
                className="w-full flex justify-between items-center py-2 text-lg font-semibold text-gray-900"
              >
                <span>Company</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    openMobileSubmenu === "company" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMobileSubmenu === "company" && (
                <div className="pl-4 pt-2 space-y-2 border-l-2 border-blue-100">
                  {companySubmenus.map((item, index) => (
                    <a
                      key={index}
                      href={item.path}
                      onClick={handleMobileLinkClick}
                      className="flex items-center space-x-3 p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      <span className="text-blue-600">
                        <item.icon size={20} />
                      </span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-4">
              <a
                href="/company/contact-us"
                onClick={handleMobileLinkClick}
                className="block bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-3 rounded-full font-medium text-center"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
