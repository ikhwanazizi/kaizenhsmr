// src/app/data/modulesData.ts

export type Module = {
  name: string;
  description: string;
  link: string;
};

export const modules: Module[] = [
  {
    name: "Personnel Hub",
    description:
      "One-stop personnel hub delivering reliable employee data, improving collaboration between HR, managers, and leadership",
    link: "/hrms/personnel-hub",
  },
  {
    name: "Payroll Management",
    description:
      "Automated payroll system streamlining salary processing, statutory compliance, deductions, and allowances, ensuring accurate, timely, and secure payment for employees.",
    link: "/hrms/payroll-management",
  },
  {
    name: "Leave Management",
    description:
      "Centralized leave tracking system managing entitlements, balances, approvals, and compliance with company policies, improving transparency and workforce planning efficiency.",
    link: "/hrms/leave-management",
  },
  {
    name: "Leave Passage",
    description:
      "Exclusive benefit module enabling organizations to reward employees with paid vacation entitlements, enhancing satisfaction, loyalty, and long-term workforce commitment.",
    link: "/hrms/leave-passage",
  },
  {
    name: "Claims Management",
    description:
      "Streamlined claims submission and approval process with built-in validations, ensuring faster reimbursements, transparency, and reduced administrative workload for HR teams.",
    link: "/hrms/claims-management",
  },
  {
    name: "Time & Attendance",
    description:
      "Real-time attendance tracking with clock-in/out integrations, improving accuracy, workforce visibility, and compliance while reducing errors and manual HR intervention.",
    link: "/hrms/time-attendance",
  },
  {
    name: "Recruitment",
    description:
      "End-to-end recruitment system managing job requisitions, applicants, interviews, and budgets with analytics for efficient hiring and workforce planning.",
    link: "/hrms/recruitment",
  },
  {
    name: "Loan Management",
    description:
      "Flexible employee loan benefit system supporting multiple loan types, repayment schedules, and approvals, promoting financial wellness and employee retention.",
    link: "/hrms/loan-management",
  },
  {
    name: "Loan Interest Subsidy",
    description:
      "Automated management of employer-subsidized loan interest benefits, ensuring transparency, accuracy, and compliance while supporting employee financial wellbeing initiatives effectively.",
    link: "/hrms/loan-interest-subsidy",
  },
  {
    name: "GIS & GHS",
    description:
      "Comprehensive module managing Group Insurance and Hospitalization benefits, ensuring accurate coverage, claims processing, and compliance with organizational policies.",
    link: "/hrms/gis-ghs",
  },
  {
    name: "ESOS Management",
    description:
      "Streamlined administration of stock option grants, vesting schedules, and compliance, empowering organizations to reward employees and retain high-value talent",
    link: "/hrms/esos-management",
  },
  {
    name: "ESPP Management",
    description:
      "Enables local employees to purchase global listed company shares through payroll deductions, promoting ownership, loyalty, and alignment with organizational success.",
    link: "/hrms/espp-management",
  },
  {
    name: "Training Management",
    description:
      "Comprehensive training administration system managing courses, schedules, budgets, and analytics, supporting skill development, compliance, and continuous workforce learning initiatives.",
    link: "/hrms/training-management",
  },
  {
    name: "Competency Management",
    description:
      "Tracks and assesses employee skills, identifies gaps, and supports targeted development to align workforce competencies with strategic organizational objectives.",
    link: "/hrms/competency-management",
  },
  {
    name: "Training Needs Analysis (TNA)",
    description:
      "Identifies training gaps by comparing competencies with requirements, enabling organizations to align learning programs with workforce and business needs.",
    link: "/hrms/training-needs-analysis",
  },
  {
    name: "Performance Management",
    description:
      "Robust system supporting 360-degree assessments, multiple appraisers, customizable appraisal forms, and weighted scoring, ensuring fair evaluations and continuous improvement.",
    link: "/hrms/performance-management",
  },
  {
    name: "Employee Self Service (ESS)",
    description:
      "Empowers employees to access records, submit requests, and update details independently, reducing HR workload while enhancing transparency and employee engagement.",
    link: "/hrms/employee-self-service",
  },
  {
    name: "Mobile App",
    description:
      "Mobile-first platform providing on-the-go access to HR services, approvals, and notifications, enhancing convenience, productivity, and workforce connectivity anytime.",
    link: "/hrms/mobile-app",
  },
  {
    name: "BI Dashboard Analytics",
    description:
      "Transforms HR data into interactive dashboards and insights, enabling real-time monitoring, predictive analysis, and data-driven strategic workforce decisions.",
    link: "/hrms/bi-dashboard-analytics",
  },
  {
    name: "Configurator",
    description:
      "Easily assemble and name new modules on the fly, assign access rights, and streamline HR processes with unmatched flexibility and control",
    link: "/hrms/module-configurator",
  },
];
