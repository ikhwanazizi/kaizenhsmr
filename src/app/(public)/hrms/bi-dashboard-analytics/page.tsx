"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules, Module } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";
import { getRandomModules } from "@/utils/moduleHelpers";

const CURRENT_MODULE_LINK = "/hrms/bi-dashboard-analytics";

const BIDashboardAnalytics = () => {
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
            BI Dashboard Analytics
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Turning HR Data into Decisions
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Data is only powerful when it drives action. Our BI Dashboard
              Analytics module transforms complex HR data into clear, actionable
              insights for smarter decision-making.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Real-Time Insights
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Interactive dashboards display live HR metrics—from headcount
              trends to attrition analysis—enabling leaders to monitor
              organizational health at a glance.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Customizable Dashboards
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Tailor dashboards by department, role, or strategic priority,
              ensuring every manager sees the data most relevant to their
              responsibilities.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Predictive Analytics
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Go beyond historical reports with advanced analytics that help
              identify risks, forecast trends, and support proactive workforce
              planning.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Data-Driven Decisions
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              By consolidating payroll, leave, attendance, training, and
              performance data, the module empowers management to make faster,
              evidence-based HR and business decisions.
            </p>
          </Container>
        </div>
        <div className="bg-slate-100">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                With BI Dashboard Analytics, organizations can turn HR data into
                strategic intelligence, driving efficiency, foresight, and
                stronger workforce management.
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

export default BIDashboardAnalytics;
