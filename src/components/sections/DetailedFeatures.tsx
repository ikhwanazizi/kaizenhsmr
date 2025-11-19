// src/components/sections/DetailedFeatures.tsx
import React from "react";
import Link from "next/link";
import { hrmsSubmenus } from "@/data/submenus"; // Import the data directly

const DetailedFeatures = () => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {hrmsSubmenus.map((module, index) => (
          <Link
            href={module.path}
            key={index}
            className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white h-full"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mb-4">
              <module.icon size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 text-center group-hover:text-blue-700 transition-colors">
              {module.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DetailedFeatures;
