"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules, Module } from "@/data/ModulesData"; // <-- Added 'Module' type
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";
import { getRandomModules } from "@/utils/moduleHelpers";

const CURRENT_MODULE_LINK = "/hrms/time-attendance";

const TimeAttendance = () => {
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
            Time & Attendance
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Accurate Tracking, Smarter Workforce Management and
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Effective workforce management begins with precise attendance
              tracking. Our Time & Attendance module ensures organizations
              capture real-time data while simplifying scheduling and
              compliance.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Real-Time Attendance Capture
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              From biometric devices to mobile check-ins, the system integrates
              multiple methods of recording attendance, ensuring accuracy and
              minimizing manual errors. Employees’ clock-in and clock-out
              records are instantly available for review.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Smarter Scheduling
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Supervisors can plan and manage shifts, overtime, and rosters with
              ease. The module helps balance workloads, avoid scheduling
              conflicts, and ensure optimal resource allocation.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Policy and Compliance Support
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Rules for working hours, overtime, rest days, and public holidays
              are built in, ensuring that attendance data aligns with company
              policy and statutory requirements.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Integrated with Payroll and Leave
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Attendance data flows directly into Payroll and Leave Management,
              ensuring correct pay calculations and reducing discrepancies. This
              integration eliminates redundant work and builds trust among
              employees.
            </p>
          </Container>
        </div>
        <div className="bg-slate-100">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                With Time & Attendance, organizations gain accurate, automated,
                and compliant tracking of employee work hours, leading to better
                efficiency, transparency, and workforce productivity.
              </p>
            </div>
          </Container>
        </div>
      </div>

      {/* 5. This component now uses the 'relatedModules' state. It will be
           empty on the server and then populate on the client, avoiding the error.
      */}
      <RelatedModulesSection modules={relatedModules} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TimeAttendance;
