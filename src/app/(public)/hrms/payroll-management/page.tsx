"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules, Module } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";
import { getRandomModules } from "@/utils/moduleHelpers";

const CURRENT_MODULE_LINK = "/hrms/payroll-management";

const PayrollManagement = () => {
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
            Payroll Management
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Accurate, Compliant, and On Time
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Payroll is one of the most critical HR functions, and our Payroll
              Management module ensures it is handled with precision,
              compliance, and efficiency every single time.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Streamlined Payroll Workflows
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Designed to simplify complex calculations, the module automates
              salary processing, tax deductions, statutory contributions, and
              allowances. By minimizing manual effort, HR teams can focus on
              accuracy rather than repetitive tasks.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Compliance Made Easy
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Payroll Management is built to meet Malaysia’s statutory
              requirements, including EPF, SOCSO, EIS, and PCB. Automatic
              updates to statutory tables ensure your organization remains
              compliant without extra effort.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Flexibility for Every Organization
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Whether you are handling multiple pay groups, variable allowances,
              bonuses, or overtime, the system adapts seamlessly to different
              payroll policies and structures. It supports a wide range of
              industries and workforce types.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Integrated with the HR Ecosystem
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Because Payroll is fully integrated with Personnel Hub, Time &
              Attendance, and Leave Management, it eliminates data silos and
              ensures that all calculations reflect real-time updates from
              across the HR system.
            </p>
          </Container>
        </div>
        <div className="bg-slate-100">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                With Payroll Management, you can ensure timely, accurate, and
                compliant salary disbursement, strengthen employee trust while
                reducing administrative burden.
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

export default PayrollManagement;
