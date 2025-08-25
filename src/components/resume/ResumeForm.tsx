// components/resume/ResumeForm.tsx
"use client";

import { useState } from "react";
import PersonalForm from "./sections/PersonalForm";
import ExperienceForm from "./sections/ExperienceForm";
import EducationForm from "./sections/EducationForm";
import SkillsForm from "./sections/SkillsForm";
import ProjectsForm from "./sections/ProjectsForm";

const SECTIONS = [
  { id: 'personal', label: 'Informations Personnelles', icon: '👤' },
  { id: 'experience', label: 'Expériences', icon: '💼' },
  { id: 'education', label: 'Formation', icon: '🎓' },
  { id: 'skills', label: 'Compétences', icon: '⚡' },
  { id: 'projects', label: 'Projets', icon: '🚀' },
  { id: 'languages', label: 'Langues', icon: '🌐' },
];

interface ResumeFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
  const [activeSection, setActiveSection] = useState('personal');

  const updateSection = (section: string, value: any) => {
    onChange({
      ...data,
      [section]: value
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalForm
            data={data.personal}
            onChange={(personal) => updateSection('personal', personal)}
          />
        );
      case 'experience':
        return (
          <ExperienceForm
            experiences={data.experiences}
            onChange={(experiences) => updateSection('experiences', experiences)}
          />
        );
      case 'education':
        return (
          <EducationForm
            education={data.education}
            onChange={(education) => updateSection('education', education)}
          />
        );
      case 'skills':
        return (
          <SkillsForm
            skills={data.skills}
            onChange={(skills) => updateSection('skills', skills)}
          />
        );
      case 'projects':
        return (
          <ProjectsForm
            projects={data.projects}
            onChange={(projects) => updateSection('projects', projects)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Navigation latérale */}
      <div className="lg:w-64 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Sections</h3>
        <nav className="space-y-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de la section */}
      <div className="flex-1">
        {renderSection()}
      </div>
    </div>
  );
}