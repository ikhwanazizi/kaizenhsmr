// src/components/sections/HROffering.tsx
import React, { useState } from "react";
import Container from "../layout/Container";
import { hrmsSubmenus } from "../../data/submenus"; // Adjust path as needed
import { LucideIcon } from "lucide-react";

type Category =
  | "All"
  | "Core HR"
  | "Workforce Ops"
  | "Talent & Development"
  | "Employee Benefits"
  | "Intelligence & Tools";

interface ModuleItem {
  icon: LucideIcon;
  name: string;
  path: string;
  category: Category;
}

const HROffering = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  // Categorize modules
  const categorizedModules: ModuleItem[] = hrmsSubmenus.map((module) => {
    let category: Category = "Core HR";

    // Core HR modules
    if (
      ["Personnel Hub", "Payroll Management", "Employee Self Service"].includes(
        module.name
      )
    ) {
      category = "Core HR";
    }
    // Workforce Operations
    else if (
      [
        "Time & Attendance",
        "Leave Management",
        "Leave Passage",
        "Claims Management",
      ].includes(module.name)
    ) {
      category = "Workforce Ops";
    }
    // Talent & Development
    else if (
      [
        "Recruitment",
        "Performance Management",
        "Training Management",
        "Competency Management",
        "Training Needs Analysis",
      ].includes(module.name)
    ) {
      category = "Talent & Development";
    }
    // Employee Benefits
    else if (
      [
        "Loan Management",
        "Loan Interest Subsidy",
        "GIS & GHS",
        "ESOS Management",
        "ESPP Management",
      ].includes(module.name)
    ) {
      category = "Employee Benefits";
    }
    // Intelligence & Tools
    else if (
      ["Mobile App", "BI Dashboard Analytics", "Module Configurator"].includes(
        module.name
      )
    ) {
      category = "Intelligence & Tools";
    }

    return {
      icon: module.icon,
      name: module.name,
      path: module.path,
      category,
    };
  });

  const filteredModules =
    activeCategory === "All"
      ? categorizedModules
      : categorizedModules.filter((m) => m.category === activeCategory);

  const categories: Category[] = [
    "All",
    "Core HR",
    "Workforce Ops",
    "Talent & Development",
    "Employee Benefits",
    "Intelligence & Tools",
  ];

  return (
    <div className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Comprehensive HR Offering
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Complete HR modules designed to streamline your workforce management
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <a
                key={index}
                href={module.path}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 group block"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {module.name}
                  </h3>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default HROffering;
