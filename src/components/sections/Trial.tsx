import React from "react";
import Container from "../layout/Container";
import { CheckCircle } from "lucide-react";

const Trial = () => {
  return (
    <div className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Don't Just Settle for a Demo — Experience the Difference!
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            While most vendors only show you a glimpse, we let you truly
            experience our HR solution with a risk-free, 3-month trial. No
            commitment, full support, and complete guidance included.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Use your own data
                </h3>
                <p className="text-gray-600">
                  Import and work with your actual employee data to see real
                  results.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Run a full Payroll UAT
                </h3>
                <p className="text-gray-600">
                  Test our payroll system thoroughly with your specific
                  requirements.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  See real results, not just promises
                </h3>
                <p className="text-gray-600">
                  Experience actual outcomes and benefits in your business
                  environment.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl">
              <p className="text-gray-700 font-medium mb-4">
                We are confident our solution will deliver exactly what your
                business needs. After all, choosing the right HR system is a
                long-term investment in your people, not just a cost.
              </p>
              <p className="text-blue-600 font-semibold">
                Why guess when you can be sure? Start your free trial today and
                experience the KaiZen difference!
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl opacity-20 blur"></div>
            <img
              src="https://www.kaizenhr.my/wp-content/uploads/2015/01/business.webp"
              alt="Trial Experience"
              className="mt-20 ml-30 rounded-2xl relative z-10 w-lg"
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Trial;
