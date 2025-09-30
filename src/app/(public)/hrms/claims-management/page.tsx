"use client";

import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";

// Data for the core features sections
const coreFeatures = [
  {
    icon: "📂",
    title: "Centralized Claim Processing",
    description:
      "Employees can easily submit claims for travel, meals, medical, or other business expenses. All submissions are captured in one place, reducing paperwork and manual tracking.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "🛡️",
    title: "Automated Policy Enforcement",
    description:
      "Built-in rules help enforce company policies—covering claim categories, limits, and eligibility. This minimizes discrepancies, prevents over-claims, and ensures compliance with both internal policies and statutory requirements.",
    bgColor: "bg-white",
  },
  {
    icon: "🔄",
    title: "Smooth Approval Workflows",
    description:
      "Configurable approval routes allow claims to flow seamlessly from employee to manager, with notifications keeping the process efficient and transparent. Delays are reduced, and accountability is clear.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "💰",
    title: "Integrated with Payroll",
    description:
      "Approved claims feed directly into Payroll Management, ensuring timely and accurate reimbursements. No double entry, no missed payments—just clean, integrated data.",
    bgColor: "bg-white",
  },
];

// Data for the related modules grid.
const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const ClaimsManagement = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 bg-white">
        <Container className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Leave Passage
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
            Rewarding Employees with Travel Benefits. Our Leave Passage module
            helps organizations recognize and reward employees, fostering
            loyalty and satisfaction.
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

export default ClaimsManagement;
