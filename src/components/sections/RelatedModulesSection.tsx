import React from "react";
import Container from "@/components/layout/Container";

// Define the type for a single module
type Module = {
  name: string;
  description: string;
  link: string;
};

// Define the props for the component
interface RelatedModulesSectionProps {
  modules: Module[];
  title?: string; // Make the title an optional prop
}

const RelatedModulesSection = ({
  modules,
  title = "One System. Infinite HR Possibilities", // Default title
}: RelatedModulesSectionProps) => {
  return (
    <div className="bg-slate-50">
      <Container className="py-24">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-blue-600 text-4xl mb-2">📊</div>
                  <p className="text-blue-500 text-sm">Module Image</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                  {module.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {module.description}
                </p>
                <a
                  href={module.link}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm group"
                >
                  Read More
                  <svg
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default RelatedModulesSection;
