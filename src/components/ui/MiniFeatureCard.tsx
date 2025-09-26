import React from "react";
import { LucideIcon } from "lucide-react";

interface MiniFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
}

const MiniFeatureCard: React.FC<MiniFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  iconColor = "text-blue-600",
}) => {
  return (
    <div className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`${iconColor} mb-3 flex justify-center`}>
        <Icon size={32} />
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default MiniFeatureCard;
