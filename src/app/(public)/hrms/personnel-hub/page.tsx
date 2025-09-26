"use client";

import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";

// Data for the core features sections.
// Added a `bgColor` property to easily manage the alternating background colors.
const coreFeatures = [
  {
    icon: "🎯",
    title: "The Core of Your HR System",
    description:
      "At the heart of every HR solution, the Personnel Hub centralizes and safeguards all employee information in one secure, accessible place. It is the foundation upon which every other HR process is built.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "📂",
    title: "Centralized Employee Records",
    description:
      "Ensures every employee detail—from personal information and employment history to job assignments and benefits—is captured, organized, and always up to date. No more scattered files or siloed systems.",
    bgColor: "bg-white",
  },
  {
    icon: "💡",
    title: "Smarter Data Management",
    description:
      "Quickly access records, generate reports, and comply with statutory requirements. This intuitive module reduces duplication, minimizes errors, and ensures data consistency across the entire HR suite.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "🚀",
    title: "Supporting Growth and Scalability",
    description:
      "As your organization evolves, Personnel Hub scales with you. New employees, roles, and departments can be seamlessly added, keeping the system perfectly aligned with your business structure.",
    bgColor: "bg-white",
  },
  {
    icon: "🔗",
    title: "Foundation for Integration",
    description:
      "As the backbone of the HR ecosystem, it enables smooth cross-module integration with Payroll, Leave, and Performance, ensuring reliable data for critical decision-making.",
    bgColor: "bg-slate-50",
  },
];

const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const PersonnelHub = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 bg-gradient-to-br from-[#008080] to-[#006666] text-white overflow-hidden relative">
        <Container className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Personnel Hub
          </h1>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
            vulputate, libero et sollicitudin porta, lectus nisi commodo turpis,
            nec tincidunt nulla enim vitae justo.
          </p>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        {coreFeatures.map((feature, index) => (
          <div key={index} className={feature.bgColor}>
            <Container className="py-20 text-center">
              <div className="text-5xl mb-5">{feature.icon}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {feature.title}
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </Container>
          </div>
        ))}
      </div>

      {/* Related Modules Section */}
      <RelatedModulesSection modules={relatedModules} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PersonnelHub;
