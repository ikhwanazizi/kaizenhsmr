import React from "react";
import Container from "@/components/layout/Container";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="bg-slate-50 pt-16">
          <Container className="py-20 text-center lg:py-28">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              About Us
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-gray-600 md:text-xl">
              From a pioneering idea to Malaysia’s most comprehensive HR
              solution.
            </p>
            {/* Image added here */}
            <div className="mt-12">
              <img
                src="/images/about-us-hero.jpg" // You'll need to place your image file here
                alt="Kaizen HRMS Team collaborating"
                className="mx-auto rounded-lg shadow-lg object-cover w-full md:max-w-4xl h-64 md:h-96"
              />
            </div>
          </Container>
        </div>

        {/* Content Section */}
        <div className="py-20 lg:py-24">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
                <p>
                  Established in 1997, kaizen HRMS has been a trusted name in HR
                  technology for over 28 years, embedding best practices into
                  every module we deliver. We began with a clear mission: to
                  simplify HR with a foundational suite of Payroll, Personnel,
                  Leave, and Claims modules. From the outset, we understood the
                  importance of precision, compliance, and user-friendly design,
                  empowering HR professionals to focus on people, not paperwork.
                </p>
                <p>
                  Today, our vision has grown into a comprehensive platform of
                  more than 20 fully integrated modules, spanning Core HR,
                  Compensation & Benefits, Strategic HR Management, and advanced
                  innovations like Business Analytics. This expansion reflects
                  our commitment to keeping pace with evolving business needs
                  while shaping the future of HR.
                </p>

                {/* Highlighted Quote/Award Section */}
                <div className="border-l-4 border-blue-600 bg-blue-50 p-6 my-10 rounded-r-md">
                  <p className="font-medium text-gray-800">
                    Kaizen HRMS is proud to be the only Malaysian HR solution
                    nominated twice consecutively and ultimately winning the
                    prestigious MSC-APICTA Award for Best Software Applications,
                    a recognition that underscores our product strength,
                    innovation, and industry relevance.
                  </p>
                </div>

                <p>
                  With nearly three decades of proven excellence, kaizen HRMS is
                  widely recognized as Malaysia’s Tier 1 Enterprise HR Solution,
                  helping leading organizations across industries build smarter,
                  more productive, and engaged workforces.
                </p>
              </div>
            </div>
          </Container>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
