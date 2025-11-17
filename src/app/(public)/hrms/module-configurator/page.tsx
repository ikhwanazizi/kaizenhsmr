"use client";

import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { modules } from "@/data/ModulesData";
import RelatedModulesSection from "@/components/sections/RelatedModulesSection";

// Data for the related modules grid.
const relatedModules = [modules[0], modules[1], modules[2], modules[3]];

const ModuleConfigurator = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 bg-slate-100">
        <Container className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Module Configurator
          </h1>
        </Container>
      </div>

      {/* Core Features - Full-Width Sections */}
      <div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Redefining Flexibility in HR Systems
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Our HR system features a powerful Configurator module, designed to
              deliver unmatched flexibility and control. With Configurator,
              organizations can assemble and name new modules on the fly,
              tailoring the system to specific business needs without waiting
              for custom development.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Built on Object-Oriented Architecture
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              The secret lies in our object-oriented design. Every screen and
              report in the system is treated as an independent object, capable
              of running on its own. This approach allows users to pluck any
              object—whether a screen or report—and group them together to form
              a brand-new module, complete with its own name, access rights, and
              seamless integration into the HR ecosystem.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Simplifying User Experience
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Configurator also enhances usability for new recruits. Instead of
              navigating the full HR system, users can be assigned personalized
              modules that contain only the functions they need, making
              onboarding faster and reducing learning curves.
            </p>
          </Container>
        </div>
        <div className="bg-slate-50">
          <Container className="py-20 text-center">
            <div className="text-5xl mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Eliminating Process Gaps
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Beyond personalization, Configurator can be used to create
              process-specific checklists, ensuring critical payroll or HR steps
              are not missed. By grouping related tasks into logical modules,
              organizations can streamline workflows and maintain compliance
              effortlessly.
            </p>
          </Container>
        </div>
        <div className="bg-white">
          <Container className="py-20 text-center ">
            <div>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed ">
                Chat with us to discover how the Configurator can make your HR
                system adaptive, efficient, and future-ready.
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

export default ModuleConfigurator;
