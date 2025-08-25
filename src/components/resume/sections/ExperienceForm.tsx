// components/resume/sections/ExperienceForm.tsx
"use client";

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  skills: string[];
}

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export default function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      skills: []
    };
    onChange([...experiences, newExperience]);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onChange(
      experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Expériences Professionnelles</h3>
        <button
          onClick={addExperience}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Ajouter une expérience
        </button>
      </div>

      {experiences.map((experience, index) => (
        <div key={experience.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Expérience #{index + 1}</h4>
            <button
              onClick={() => removeExperience(experience.id)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entreprise *</label>
              <input
                type="text"
                value={experience.company}
                onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Poste *</label>
              <input
                type="text"
                value={experience.position}
                onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Développeur Fullstack"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lieu</label>
              <input
                type="text"
                value={experience.location}
                onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Paris, France"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Début</label>
                <input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fin</label>
                <input
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                  disabled={experience.current}
                  className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                />
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={experience.current}
                    onChange={(e) => updateExperience(experience.id, 'current', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Poste actuel</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={experience.description}
              onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Décrivez vos responsabilités et réalisations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Compétences</label>
            <input
              type="text"
              placeholder="React, Node.js, Python (séparés par des virgules)"
              onBlur={(e) => {
                const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                updateExperience(experience.id, 'skills', skills);
              }}
              className="w-full px-3 py-2 border rounded-md"
            />
            {experience.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {experience.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {experiences.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Aucune expérience ajoutée</p>
          <button
            onClick={addExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter votre première expérience
          </button>
        </div>
      )}
    </div>
  );
}