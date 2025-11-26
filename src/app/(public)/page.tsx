// src/app/(public)/page.tsx

// Import components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HROffering from "@/components/sections/HROffering";
import WhyChooseKaizen from "@/components/sections/WhyChooseKaizen";
import Award from "@/components/sections/Award";
import Hero from "@/components/sections/Hero";
import Trial from "@/components/sections/Trial";

import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Award Section */}
      <Award />

      {/* Trial Section */}
      <Trial />

      {/* HR Solutions Section */}
      <HROffering />

      {/* Why Choose Kaizen Section */}
      <WhyChooseKaizen />

      {/* Footer */}
      <Footer />
    </div>
  );
}
