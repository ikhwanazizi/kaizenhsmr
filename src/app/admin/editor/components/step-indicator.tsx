// src/app/admin/editor/components/step-indicator.tsx
"use client";

import { CheckCircle } from "lucide-react";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  setStep: (step: number) => void;
};

export default function StepIndicator({
  currentStep,
  steps,
  setStep,
}: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-center p-4">
      <ol className="flex items-center space-x-4">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={label} className="flex items-center">
              <button
                onClick={() => isCompleted && setStep(stepNumber)}
                disabled={!isCompleted}
                className={`flex items-center space-x-2 ${
                  isCompleted ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle size={16} /> : stepNumber}
                </span>
                <span
                  className={`text-sm ${
                    isCurrent
                      ? "font-bold text-blue-600"
                      : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>

              {stepNumber < steps.length && (
                <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
