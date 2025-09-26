"use client";

import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";

// Data for the core features sections for Leave Passage
const coreFeatures = [
  {
    icon: "✈️",
    title: "Exclusive Employee Benefit",
    description:
      "Leave Passage allows employees to enjoy fully paid vacation entitlements, typically covering airfare or travel packages. This benefit is often extended based on seniority or years of service, making it a symbol of recognition and appreciation.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "⚖️",
    title: "Policy-Driven Flexibility",
    description:
      "The module accommodates varying eligibility criteria and entitlements according to organizational policies. Whether based on grading, length of service, or specific agreements, rules can be configured to ensure fairness and compliance.",
    bgColor: "bg-white",
  },
  {
    icon: "🖥️",
    title: "Streamlined Administration",
    description:
      "HR teams can manage entitlements, track usage, and generate reports to monitor benefit utilization. By automating these processes, the system reduces administrative workload and ensures accuracy.",
    bgColor: "bg-slate-50",
  },
  {
    icon: "❤️",
    title: "Enhancing Employee Engagement",
    description:
      "More than a financial perk, Leave Passage promotes employee well-being, strengthens retention, and supports a positive work culture by recognizing contributions in a meaningful way.",
    bgColor: "bg-white",
  },
];

// Data for the related modules grid.
const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const LeavePassage = () => {
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

export default LeavePassage;
