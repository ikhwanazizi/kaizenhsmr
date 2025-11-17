import React from "react";
import Container from "../layout/Container";
import { Star } from "lucide-react";

const Hero = () => {
  return (
    <div className="pt-16 bg-gradient-to-br from-[#008080] to-[#006666] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <Container className=" py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              Malaysia's Tier 1 Enterprise HR Solution
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Kaizen HRMS
            </h1>
            <h2 className="text-2xl lg:text-3xl font-light opacity-90 leading-relaxed">
              Elevate your HR. Backed by 28 Years of track record and best
              practices.
            </h2>
            <p className="text-lg opacity-80 leading-relaxed">
              Backed by 28 years of proven best practice, our all-in-one HR
              solution delivers unmatched depth, coverage, and reliability.
              Explore our extensive solution offerings, you'll agree we're
              Malaysia's most complete and comprehensive HR system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/company/contact-us">
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg">
                  Start Free Trial
                </button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4  rounded-2xl opacity-20 blur"></div>
            <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden transform">
              <iframe
                className="w-full aspect-video"
                src="https://www.youtube.com/embed/p4-USNtPYrY"
                title="KaizenHR Dashboard"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
