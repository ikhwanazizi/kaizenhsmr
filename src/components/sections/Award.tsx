import React from "react";
import Container from "../layout/Container";
import { Award as AwardIcon } from "lucide-react";

const Award = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <Container>
        <div>
          <div className="grid grid-cols-[240px_1fr_240px] gap-8 items-start mb-8">
            {/* First Image - Left Side */}
            <div className="flex items-center justify-center w-60 h-60">
              <img
                src="/apicta.png"
                alt="msc_apicta"
                className="w-40 h-40 object-contain"
              />
            </div>

            {/* Center Content */}
            <div className="text-center">
              {/* Heading */}
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                MSC-APICTA Malaysia Award Winner
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed">
                KaiZen stands as the only HR solution in Malaysia to be
                nominated twice in consecutive years and ultimately crowned{" "}
                <strong>WINNER</strong> of the prestigious MSC-APICTA Malaysia
                Award for Best Software Applications category. This rare
                distinction reflects not only the unmatched strength of our
                product, but also its relevance, innovation, and enduring impact
                within the HR technology industry.
              </p>
            </div>

            {/* Second Image - Right Side */}
            <div className="flex items-center justify-center w-60 h-60">
              <img
                src="/Module_Brochure_Kaizen_Draft.png"
                alt="msc_apicta award"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Award Trophy Image */}
          <div className="mt-8">
            <img
              src="/api/placeholder/300/150"
              alt="MSC-APICTA Award Trophy"
              className="mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Award;
