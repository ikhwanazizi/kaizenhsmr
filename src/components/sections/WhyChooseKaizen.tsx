import React from "react";
import Container from "../layout/Container";
import { Smartphone, Building2, Globe } from "lucide-react";

const WhyChooseKaizen = () => {
  return (
    <div className="py-20 bg-white">
      <Container>
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Why Choose Kaizen?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all transform group-hover:scale-110">
              <Building2 size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">28 Years Experience</h3>
            <p className="text-gray-600 leading-relaxed">
              Award-winning HR solution with decades of expertise and proven
              track record in the market
            </p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all transform group-hover:scale-110">
              <Globe size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Global Workforce</h3>
            <p className="text-gray-600 leading-relaxed">
              Total HR Solutions for your Global Workforce management needs
              across different regions
            </p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all transform group-hover:scale-110">
              <Smartphone size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Mobile-First</h3>
            <p className="text-gray-600 leading-relaxed">
              Access your HR services anytime, anywhere with our intuitive
              mobile application
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default WhyChooseKaizen;
