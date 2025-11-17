"use client";

import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";

// Data for the related modules grid.
const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const PersonnelHub = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 bg-slate-100">
        <Container className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Personnel Hub
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              The Core of Your HR System
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              At the heart of every HR solution lies the Personnel Hub, designed
              to centralize and safeguard all employee information in one
              secure, accessible place. It is the foundation upon which every
              other HR process is built.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Centralized Employee Records
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Personnel Hub ensures that every employee detail—from personal
              information and employment history to job assignments and
              benefits—is captured, organized, and always up to date. No more
              scattered files or siloed systems; everything lives in one
              reliable source of truth.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Smarter Data Management
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              With its intuitive structure, the module enables HR teams to
              quickly access records, generate reports, and comply with
              statutory requirements. It reduces duplication, minimizes errors,
              and ensures consistency across payroll, leave, claims, and
              performance management.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Supporting Growth and Scalability
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              As your organization evolves, Personnel Hub scales with you. New
              employees, roles, and departments can be seamlessly added, keeping
              the system aligned with your business structure.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Foundation for Integration
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Because it underpins every other module—Payroll, Leave, Training,
              Performance—the Personnel Hub is not just a database, but the
              backbone of the entire HR ecosystem, enabling smooth cross-module
              integration and reliable decision-making.
            </p>
          </Container>
        </div>
        <div className="bg-slate-100">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                With Personnel Hub, your HR team gains a trusted, centralized,
                and future-ready foundation to manage your most valuable asset,
                your people.
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

export default PersonnelHub;
