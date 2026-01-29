// src/data/careerData.ts

export interface Job {
  name: string;
  // Optional: description?: string;
}

export interface Field {
  name: string;
  jobs: Job[];
  // Optional: description?: string;
}

export interface Industry {
  name: string;
  color: string; // hex for planet glow/gradient
  fields: Field[];
}

export const careerData = {
  hub: {
    name: "Career Universe",
    color: "#ffffff", // subtle white/glow
  },
  industries: [
    {
      name: "Information Technology",
      color: "#a0d4ff", // light blue
      fields: [
        { name: "Software Development", jobs: [{ name: "Frontend Developer" }, { name: "Backend Developer" }, { name: "Full-Stack Engineer" }] },
        { name: "Cybersecurity", jobs: [{ name: "Security Analyst" }, { name: "Ethical Hacker" }] },
        { name: "Data & AI", jobs: [{ name: "Data Analyst" }, { name: "Machine Learning Engineer" }] },
      ],
    },
    {
      name: "Health Science",
      color: "#ffcccc", // soft pink/red
      fields: [
        { name: "Nursing & Patient Care", jobs: [{ name: "Registered Nurse" }, { name: "Clinical Officer" }] },
        { name: "Pharmacy", jobs: [{ name: "Pharmacist" }, { name: "Pharmacy Technician" }] },
      ],
    },
    {
      name: "Manufacturing",
      color: "#ffcc99", // orange
      fields: [
        { name: "Production & Assembly", jobs: [{ name: "Machine Operator" }, { name: "Quality Control Inspector" }] },
        { name: "Engineering Maintenance", jobs: [{ name: "Maintenance Technician" }] },
      ],
    },
    {
      name: "Transportation & Logistics",
      color: "#99ffcc", // teal/green
      fields: [
        { name: "Airfield Operations", jobs: [{ name: "Air Traffic Controller" }, { name: "Aviation Manager" }] },
        { name: "Distribution & Supply Chain", jobs: [{ name: "Logistics Coordinator" }, { name: "Warehouse Supervisor" }] },
      ],
    },
    {
      name: "Hospitality & Tourism",
      color: "#ff99cc", // magenta/pink
      fields: [
        { name: "Hotel & Restaurant Management", jobs: [{ name: "Hotel Manager" }, { name: "Chef" }] },
        { name: "Tour Guiding", jobs: [{ name: "Tour Guide" }] },
      ],
    },
    {
      name: "Architecture & Construction",
      color: "#cc99ff", // purple
      fields: [
        { name: "Building Design", jobs: [{ name: "Architect" }, { name: "Draftsperson" }] },
        { name: "Construction Management", jobs: [{ name: "Site Supervisor" }] },
      ],
    },
    // Add more if needed, e.g., Finance, Agriculture, Education from screenshots/context
  ] as Industry[],
};