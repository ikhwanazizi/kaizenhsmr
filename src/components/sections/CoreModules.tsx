import React from "react";
import FeatureCard from "../ui/FeatureCard";
import {
  Calculator,
  UserCheck,
  Network,
  TrendingUp,
  Zap,
  Diamond,
} from "lucide-react";

const CoreModules = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <FeatureCard
        icon={Calculator}
        title="Core HR and Payroll"
        description="Complete payroll processing with compliance and accuracy at its core"
        borderColor="border-blue-500"
        iconColor="text-blue-600"
        linkText="Learn More"
      />
      <FeatureCard
        icon={UserCheck}
        title="Talent Management"
        description="Attract, develop, and retain top talent with comprehensive talent solutions"
        borderColor="border-green-500"
        iconColor="text-green-600"
        linkText="Learn More"
      />
      <FeatureCard
        icon={Network}
        title="Workforce Management"
        description="Optimize workforce scheduling, time tracking, and productivity management"
        borderColor="border-purple-500"
        iconColor="text-purple-600"
        linkText="Learn More"
      />
      <FeatureCard
        icon={TrendingUp}
        title="Sales Performance Management"
        description="Drive sales excellence with performance tracking and incentive management"
        borderColor="border-orange-500"
        iconColor="text-orange-600"
        linkText="Learn More"
      />
      <FeatureCard
        icon={Zap}
        title="Digital Adoption"
        description="Accelerate digital transformation with modern HR technology solutions"
        borderColor="border-red-500"
        iconColor="text-red-600"
        linkText="Learn More"
      />
      <FeatureCard
        icon={Diamond}
        title="Artificial Intelligence"
        description="Leverage AI-powered insights for smarter HR decisions and automation"
        borderColor="border-indigo-500"
        iconColor="text-indigo-600"
        linkText="Learn More"
      />
    </div>
  );
};

export default CoreModules;
