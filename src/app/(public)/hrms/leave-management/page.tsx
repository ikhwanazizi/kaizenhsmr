"use client";

import React, { useState, useEffect } from "react";
import ModulePageLayout from "@/components/layout/ModulePageLayout";
import { modules, Module } from "@/data/ModulesData";
import { getRandomModules } from "@/utils/moduleHelpers";

const CURRENT_MODULE_LINK = "/hrms/leave-management";

const pageData = {
  pageTitle: "Leave Management",
  pageDescription:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  coreFeatures: [
    {
      title: "Simple, Compliant, and Transparent",
      description:
        "Managing employee leave can be complex, but our Leave Management module makes it effortless, transparent, and fully compliant with company policy and statutory regulations.",
      bgColor: "bg-slate-50",
      layout: "right-media" as const,
      media: {
        type: "image" as const,
        src: "/images/leave-management/centralized-records.jpg",
        alt: "Centralized leave records dashboard",
      },
      containerClassName: "py-24",
      descriptionClassName: "mx-0", // Override centering for left-aligned layout
    },
    {
      title: "Centralized Leave Records",
      description:
        "All leave applications, balances, and approvals are captured in one system, ensuring accurate, up-to-date records for easy tracking and reporting.",
      bgColor: "bg-slate-50",
      layout: "left-media" as const,
      media: {
        type: "image" as const,
        src: "/images/leave-management/centralized-records.jpg",
        alt: "Centralized leave records dashboard",
      },
      containerClassName: "py-24",
      descriptionClassName: "mx-0", // Override centering for left-aligned layout
    },
    {
      title: "Policy Compliance Built-In",
      description:
        "The module supports diverse leave types and rules are automated to enforce eligibility and statutory compliance across all departments.",
      bgColor: "bg-white",
      layout: "right-media" as const,
      media: {
        type: "image" as const,
        src: "/images/leave-management/policy-compliance.jpg",
        alt: "Policy compliance interface",
      },
      containerClassName: "py-24",
      descriptionClassName: "mx-0",
    },
    {
      title: "Automated Workflow",
      description:
        "Streamline your leave approval process with customizable workflows that route requests to the right managers automatically.",
      bgColor: "bg-blue-50",
      layout: "center" as const,
      media: {
        type: "video" as const,
        src: "/videos/leave-workflow-demo.mp4",
        alt: "/images/leave-management/workflow-poster.jpg", // Video poster
      },
      containerClassName: "py-24 text-center",
    },
    {
      title: "Real-time Analytics",
      description:
        "Get insights into leave patterns, team availability, and compliance metrics with comprehensive reporting tools.",
      bgColor: "bg-gray-50",
      layout: "full-width" as const,
      media: {
        type: "image" as const,
        src: "/images/leave-management/analytics-dashboard-wide.jpg",
        alt: "Analytics dashboard showing leave metrics",
      },
      containerClassName: "py-0 pb-24",
    },
  ],
  // relatedModules removed from here
};

// Custom section component for this specific module
const CustomLeaveSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-8">
            Ready to Transform Your Leave Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies that have streamlined their HR processes
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Request Demo
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaveManagementPage = () => {
  const [relatedModules, setRelatedModules] = useState<Module[]>([]);

  useEffect(() => {
    setRelatedModules(getRandomModules(4, CURRENT_MODULE_LINK));
  }, []);

  return (
    <ModulePageLayout
      pageTitle={pageData.pageTitle}
      pageDescription={pageData.pageDescription}
      coreFeatures={pageData.coreFeatures}
      relatedModules={relatedModules}
      heroClassName="bg-gradient-to-br from-blue-50 to-indigo-100"
      heroContentClassName="py-24 text-center"
    >
      {/* Custom section specific to leave management */}
      <CustomLeaveSection />
    </ModulePageLayout>
  );
};

export default LeaveManagementPage;
