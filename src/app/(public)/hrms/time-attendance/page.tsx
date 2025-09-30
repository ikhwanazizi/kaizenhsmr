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
    icon: "⏰",
    title: "Real-Time Attendance Capture",
    description:
      "From biometric devices to mobile check-ins, the system integrates multiple methods of recording attendance, ensuring accuracy and minimizing manual errors. Employees’ clock-in and clock-out records are instantly available for review.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "🗓️",
    title: "Smarter Scheduling",
    description:
      "Supervisors can plan and manage shifts, overtime, and rosters with ease. The module helps balance workloads, avoid scheduling conflicts, and ensure optimal resource allocation.",
    bgColor: "bg-white",
  },
  {
    icon: "⚖️",
    title: "Policy and Compliance Support",
    description:
      "Rules for working hours, overtime, rest days, and public holidays are built in, ensuring that attendance data aligns with company policy and statutory requirements.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "🔗",
    title: "Integrated with Payroll and Leave",
    description:
      "Attendance data flows directly into Payroll and Leave Management, ensuring correct pay calculations and reducing discrepancies. This integration eliminates redundant work and builds trust among employees.",
    bgColor: "bg-white",
  },
];

// Data for the related modules grid.
const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const TimeAttendance = () => {
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

export default TimeAttendance;
