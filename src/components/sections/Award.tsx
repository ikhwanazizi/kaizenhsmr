import React from "react";
import Container from "../layout/Container";
import { Award as AwardIcon } from "lucide-react";

const Award = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <Container>
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6">
            <AwardIcon className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            MSC-APICTA Malaysia Award Winner
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            KaiZen stands as the only HR solution in Malaysia to be nominated
            twice in consecutive years and ultimately crowned{" "}
            <strong>WINNER</strong> of the prestigious MSC-APICTA Malaysia Award
            for Best Software Applications category. This rare distinction
            reflects not only the unmatched strength of our product, but also
            its proven relevance, innovation, and enduring impact within the HR
            technology industry.
          </p>

          {/* Image */}
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
