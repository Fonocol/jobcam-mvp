// components/resume/sections/SkillsForm.tsx
"use client";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const CATEGORIES = [
  'Technique',
  'Langages',
  'Frameworks',
  'Outils',
  'Soft Skills',
  'Langues',
  'Certifications'
];

export default function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      category: 'Technique',
      level: 3
    };
    onChange([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: string, value: string | number) => {
    onChange(
      skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter(skill => skill.id !== id));
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Compétences</h3>
        <button
          onClick={addSkill}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Ajouter une compétence
        </button>
      </div>

      {/* Formulaire d'ajout rapide */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Ajout rapide</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="React, Python, Leadership..."
            className="flex-1 px-3 py-2 border rounded-md"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                const skillNames = target.value.split(',').map(s => s.trim()).filter(Boolean);
                
                if (skillNames.length > 0) {
                  const newSkills = skillNames.map(name => ({
                    id: Date.now().toString() + Math.random(),
                    name,
                    category: 'Technique',
                    level: 3
                  }));
                  
                  onChange([...skills, ...newSkills]);
                  target.value = '';
                }
                
                e.preventDefault();
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="React, Python, Leadership..."]') as HTMLInputElement;
              const skillNames = input.value.split(',').map(s => s.trim()).filter(Boolean);
              
              if (skillNames.length > 0) {
                const newSkills = skillNames.map(name => ({
                  id: Date.now().toString() + Math.random(),
                  name,
                  category: 'Technique',
                  level: 3
                }));
                
                onChange([...skills, ...newSkills]);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Saisissez plusieurs compétences séparées par des virgules
        </p>
      </div>

      {/* Compétences par catégorie */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-3">{category}</h4>
          <div className="space-y-3">
            {categorySkills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                    className="w-full px-3 py-1 border rounded-md text-sm"
                    placeholder="Nom de la compétence"
                  />
                </div>
                
                <select
                  value={skill.category}
                  onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={skill.level}
                  onChange={(e) => updateSkill(skill.id, 'level', parseInt(e.target.value))}
                  className="px-2 py-1 border rounded-md text-sm"
                >
                  <option value={1}>Débutant</option>
                  <option value={2}>Intermédiaire</option>
                  <option value={3}>Avancé</option>
                  <option value={4}>Expert</option>
                  <option value={5}>Maîtrise</option>
                </select>

                <button
                  onClick={() => removeSkill(skill.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Aucune compétence ajoutée</p>
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter votre première compétence
          </button>
        </div>
      )}
    </div>
  );
}