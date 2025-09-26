import React from "react";
import { LucideIcon } from "lucide-react";

interface CardProps {
  icon?: LucideIcon; // optional Lucide icon
  iconColor?: string;
  title: string;
  description: string;
  borderColor?: string; // optional top border color (blue, green, etc.)
  align?: "center" | "left";
  linkText?: string;
}

const FeatureCard: React.FC<CardProps> = ({
  icon: Icon,
  iconColor = "text-blue-600",
  title,
  description,
  borderColor,
  align = "left",
  linkText,
}) => {
  return (
    <div
      className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 ${
        borderColor ? `border-t-4 ${borderColor}` : ""
      }`}
    >
      {Icon && (
        <div
          className={`${iconColor} mb-6 ${
            align === "center" ? "flex justify-center" : ""
          }`}
        >
          <Icon size={48} />
        </div>
      )}
      <h3
        className={`text-2xl font-semibold mb-4 ${
          align === "center" ? "text-center" : ""
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-gray-600 mb-4 ${
          align === "center" ? "text-center" : ""
        }`}
      >
        {description}
      </p>
      {linkText && (
        <div
          className={`${iconColor} font-medium ${
            align === "center" ? "text-center" : ""
          }`}
        >
          {linkText} →
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
