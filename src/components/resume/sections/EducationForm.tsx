// components/resume/sections/EducationForm.tsx
"use client";

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function EducationForm({ education, onChange }: EducationFormProps) {
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    onChange([...education, newEducation]);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange(
      education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const removeEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Formation</h3>
        <button
          onClick={addEducation}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Ajouter une formation
        </button>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Formation #{index + 1}</h4>
            <button
              onClick={() => removeEducation(edu.id)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Établissement *</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nom de l'école/université"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diplôme *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Bachelor, Master, Licence, etc."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Domaine d'étude</label>
            <input
              type="text"
              value={edu.field}
              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Informatique, Data Science, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Début</label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fin</label>
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={edu.description}
              onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Matières principales, projets académiques, mentions..."
            />
          </div>
        </div>
      ))}

      {education.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Aucune formation ajoutée</p>
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter votre première formation
          </button>
        </div>
      )}
    </div>
  );
}