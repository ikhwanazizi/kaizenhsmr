// src/app/(public)/page.tsx
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HROffering from "@/components/sections/HROffering";
import WhyChooseKaizen from "@/components/sections/WhyChooseKaizen";
import Award from "@/components/sections/Award";
import Hero from "@/components/sections/Hero";
import Trial from "@/components/sections/Trial";

// ADD THESE
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Award />
      <Trial />
      <HROffering />
      <WhyChooseKaizen />
      <Footer />
    </div>
  );
}
