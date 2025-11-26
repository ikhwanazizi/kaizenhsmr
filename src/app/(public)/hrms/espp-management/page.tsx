"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules, Module } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";
import { getRandomModules } from "@/utils/moduleHelpers";

const CURRENT_MODULE_LINK = "/hrms/espp-management";

const EsppManagement = () => {
  const [relatedModules, setRelatedModules] = useState<Module[]>([]);

  useEffect(() => {
    setRelatedModules(getRandomModules(4, CURRENT_MODULE_LINK));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 bg-slate-100">
        <Container className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            ESPP Management
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Enabling Global Share Participation
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              For multinational organizations, Employee Share Purchase Plans
              (ESPP) provide local employees with access to global ownership
              opportunities. Our ESPP Management module simplifies
              administration while ensuring compliance with international
              frameworks.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Global Share Access
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Employees can participate in purchasing shares of the parent or
              holding company listed overseas, often at discounted prices
              through payroll deductions.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Automated Contribution Tracking
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              The module manages subscription amounts, deductions, and purchase
              cycles automatically, ensuring accuracy and transparency
              throughout the process.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Employee Empowerment
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Through self-service, employees can view contribution history,
              share purchases, and accumulated holdings, building stronger
              engagement and a sense of global belonging.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Compliance and Reporting
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              The module supports compliance with both local regulations and
              international stock exchange requirements, while providing
              audit-ready reports for HR and finance teams.
            </p>
          </Container>
        </div>
        <div className="bg-slate-100">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                With ESPP Management, organizations can extend global benefits,
                empower local employees, and strengthen retention by fostering a
                shared sense of ownership across borders.
              </p>
            </div>
          </Container>
        </div>
      </div>

      {/* Related Modules Section */}
      <RelatedModulesSection modules={relatedModules} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EsppManagement;
