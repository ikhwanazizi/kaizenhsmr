"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules, Module } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";
import { getRandomModules } from "@/utils/moduleHelpers";

const CURRENT_MODULE_LINK = "/hrms/esos-management";

const EsosManagement = () => {
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
            ESOS Management
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Empowering Employees with Ownership Opportunities
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Employee Share Option Schemes (ESOS) are a powerful way to reward
              and retain talent. Our ESOS Management module streamlines the
              administration of stock option grants and vesting schedules with
              precision.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Simplified Grant Administration
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Organizations can easily manage the granting of stock options,
              track allocations, and monitor employee eligibility, all within a
              centralized system.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Vesting Schedule Tracking
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Automated tools handle vesting timelines, ensuring employees
              receive their entitlements accurately and on time, without the
              risk of manual errors.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Employee Transparency
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Through self-service, employees can view their option grants,
              vesting status, and exercise rights, promoting transparency and
              boosting motivation.
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
              The module provides audit-ready reports to ensure compliance with
              corporate governance and regulatory requirements, while also
              supporting strategic decision-making.
            </p>
          </Container>
        </div>
        <div className="bg-slate-100">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                With ESOS Management, organizations can align employee interests
                with business growth, enhance retention, and reduce
                administrative complexity in managing stock option schemes.
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

export default EsosManagement;
