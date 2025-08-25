// components/resume/sections/ProjectsForm.tsx
"use client";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export default function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: []
    };
    onChange([...projects, newProject]);
  };

  const updateProject = (id: string, field: string, value: any) => {
    onChange(
      projects.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const removeProject = (id: string) => {
    onChange(projects.filter(project => project.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projets</h3>
        <button
          onClick={addProject}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Ajouter un projet
        </button>
      </div>

      {projects.map((project, index) => (
        <div key={project.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Projet #{index + 1}</h4>
            <button
              onClick={() => removeProject(project.id)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom du projet *</label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateProject(project.id, 'name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Nom du projet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lien (optionnel)</label>
              <input
                type="url"
                value={project.link || ''}
                onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://mon-projet.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Technologies</label>
              <input
                type="text"
                placeholder="React, Node.js, Python (séparés par des virgules)"
                onBlur={(e) => {
                  const techs = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  updateProject(project.id, 'technologies', techs);
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={project.description}
              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Décrivez le projet, votre rôle, les technologies utilisées et les résultats obtenus..."
            />
          </div>

          {project.technologies.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Technologies utilisées</label>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {projects.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Aucun projet ajouté</p>
          <button
            onClick={addProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter votre premier projet
          </button>
        </div>
      )}
    </div>
  );
}