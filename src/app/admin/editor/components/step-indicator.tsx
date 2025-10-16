// src/app/admin/editor/components/step-indicator.tsx
"use client";

import { Check } from "lucide-react";

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
  totalSteps,
}: StepIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress Text */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Post
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
          {/* Progress Fill Line */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isClickable = stepNumber < currentStep;

            return (
              <div key={label} className="flex flex-col items-center">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && setStep(stepNumber)}
                  disabled={!isClickable}
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-300 ease-out
                    ${
                      isCompleted
                        ? "bg-blue-600 dark:bg-blue-500 text-white cursor-pointer hover:scale-110 hover:shadow-lg"
                        : isCurrent
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}

                  {/* Glow Effect for Current Step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-blue-600 dark:bg-blue-500 animate-ping opacity-20" />
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <span
                    className={`
                      text-sm font-medium transition-colors duration-300
                      ${
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : isCompleted
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-500"
                      }
                    `}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Percentage (Optional) */}
      <div className="mt-4 flex items-center justify-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Progress: {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  );
}
