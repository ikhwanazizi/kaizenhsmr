import React from "react";
import Container from "../layout/Container";
import DetailedFeatures from "./DetailedFeatures";
import CoreModules from "./CoreModules";

import {
  Users,
  Calculator,
  Calendar,
  FileText,
  Clock,
  BarChart3,
  Smartphone,
  PieChart,
  UserCheck,
  Network,
  TrendingUp,
  Zap,
  Diamond,
} from "lucide-react";

const HROffering = () => {
  return (
    <div className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Our Comprehensive HR Offering
          </h2>
          <p className="text-xl text-gray-600">
            Complete HR modules designed to streamline your workforce management
          </p>
        </div>

        {/* Core Modules */}
        {/* <CoreModules /> */}

        {/* Detailed Features Grid */}
        <DetailedFeatures />
      </Container>
    </div>
  );
};

export default HROffering;
