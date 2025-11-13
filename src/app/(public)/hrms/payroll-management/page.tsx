"use client";

import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";

// Data for the core features sections for Payroll Management
const coreFeatures = [
  {
    icon: "⚙️",
    title: "Accurate, Compliant, and On Time",
    description:
      "Payroll is one of the most critical HR functions, and our Payroll Management module ensures it is handled with precision, compliance, and efficiency every single time.",
    bgColor: "bg-slate-100",
  },
  {
    icon: "⚙️",
    title: "Streamlined Payroll Workflows",
    description:
      "Designed to simplify complex calculations, the module automates salary processing, tax deductions, statutory contributions, and allowances. By minimizing manual effort, HR teams can focus on accuracy rather than repetitive tasks.",
    bgColor: "bg-white",
  },
  {
    icon: "🔒",
    title: "Compliance Made Easy",
    description:
      "Payroll Management is built to meet Malaysia’s statutory requirements, including EPF, SOCSO, EIS, and PCB. Automatic updates to statutory tables ensure your organization remains compliant without extra effort.",
    bgColor: "bg-slate-100",
  },
  {
    icon: "🔄",
    title: "Flexibility for Every Organization",
    description:
      "Whether you are handling multiple pay groups, variable allowances, bonuses, or overtime, the system adapts seamlessly to different payroll policies and structures. It supports a wide range of industries and workforce types.",
    bgColor: "bg-white",
  },
  {
    icon: "🔗",
    title: "Integrated with the HR Ecosystem",
    description:
      "Because Payroll is fully integrated with Personnel Hub, Time & Attendance, and Leave Management, it eliminates data silos and ensures that all calculations reflect real-time updates from across the HR system.",
    bgColor: "bg-slate-100",
  },
];

// Data for the related modules grid.
const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const PayrollManagement = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 bg-white">
        <Container className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Payroll Management
          </h1>
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
        <Container className="py-20 text-center bg-white">
          <div>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
              With Payroll Management, you can ensure timely, accurate, and
              compliant salary disbursement, strengthen employee trust while
              reducing administrative burden.
            </p>
          </div>
        </Container>
      </div>

      {/* Related Modules Section */}
      <RelatedModulesSection modules={relatedModules} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PayrollManagement;
