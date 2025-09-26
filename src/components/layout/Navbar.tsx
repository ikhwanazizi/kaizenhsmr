"use client";

import React, { useState, useEffect } from "react";
import {
  hrmsSubmenus,
  resourcesSubmenus,
  companySubmenus,
} from "@/data/submenus";

import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(
    null
  );

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
      .animate-slideDown { animation: slideDown 0.3s ease-out; }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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
                onMouseEnter={() => setActiveDropdown("hrms")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-5">
                  <span>HRMS</span>
                  <ChevronDown size={16} />
                </button>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("resources")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-5">
                  <span>Resources</span>
                  <ChevronDown size={16} />
                </button>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("company")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-5">
                  <span>Company</span>
                  <ChevronDown size={16} />
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

      {/* --- HRMS DROPDOWN --- */}
      {activeDropdown === "hrms" && (
        <div
          className="absolute top-full left-0 w-full bg-white shadow-xl z-50 animate-slideDown max-h-[70vh] overflow-y-auto hidden md:block"
          onMouseEnter={() => setActiveDropdown("hrms")}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-3 gap-1">
              {hrmsSubmenus.map((item, index) => (
                <a
                  href={item.path}
                  key={index}
                  onClick={() => setActiveDropdown(null)}
                  className="block"
                >
                  <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="text-blue-600 mt-1">
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

      {/* --- RESOURCES DROPDOWN --- */}
      {activeDropdown === "resources" && (
        <div
          className="absolute top-full left-0 w-full bg-white shadow-xl z-50 animate-slideDown hidden md:block"
          onMouseEnter={() => setActiveDropdown("resources")}
          onMouseLeave={() => setActiveDropdown(null)}
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
                    <div className="text-blue-600 mt-1">
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

      {/* --- COMPANY DROPDOWN --- */}
      {activeDropdown === "company" && (
        <div
          className="absolute top-full left-0 w-full bg-white shadow-xl z-50 animate-slideDown hidden md:block"
          onMouseEnter={() => setActiveDropdown("company")}
          onMouseLeave={() => setActiveDropdown(null)}
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
                    <div className="text-blue-600 mt-1">
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

      {/* Mobile Menu as an Accordion */}
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
                      <item.icon size={18} className="text-blue-600" />
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
                      <item.icon size={18} className="text-blue-600" />
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
                      <item.icon size={18} className="text-blue-600" />
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
