import React from "react";
import MiniFeatureCard from "../ui/MiniFeatureCard";
import {
  Users,
  Calculator,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  Smartphone,
  PieChart,
} from "lucide-react";

const DetailedFeatures = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Detailed Feature Modules
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniFeatureCard
          icon={Users}
          title="Personnel Hub"
          description="Self-service portal"
        />
        <MiniFeatureCard
          icon={Calculator}
          title="Payroll"
          description="Accurate processing"
        />
        <MiniFeatureCard
          icon={Clock}
          title="Time & Attendance"
          description="Cloud-based tracking"
        />
        <MiniFeatureCard
          icon={Calendar}
          title="Leave Management"
          description="Mobile-friendly"
        />
        <MiniFeatureCard
          icon={FileText}
          title="Claims"
          description="Paperless expenses"
        />
        <MiniFeatureCard
          icon={BarChart3}
          title="Appraisal"
          description="Team empowerment"
        />
        <MiniFeatureCard
          icon={Smartphone}
          title="Mobile App"
          description="HR at fingertips"
        />
        <MiniFeatureCard
          icon={PieChart}
          title="Athena BI"
          description="Power of insights"
        />
      </div>
    </div>
  );
};

export default DetailedFeatures;
