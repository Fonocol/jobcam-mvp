// components/resume/TemplateSelector.tsx
"use client";

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  layout: string;
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Moderne',
    category: 'Moderne',
    thumbnail: '/templates/modern.jpg',
    layout: 'modern'
  },
  {
    id: 'classic',
    name: 'Classique',
    category: 'Classique',
    thumbnail: '/templates/classic.jpg',
    layout: 'classic'
  },
  {
    id: 'creative',
    name: 'Créatif',
    category: 'Créatif',
    thumbnail: '/templates/creative.jpg',
    layout: 'creative'
  },
  {
    id: 'minimalist',
    name: 'Minimaliste',
    category: 'Minimaliste',
    thumbnail: '/templates/minimalist.jpg',
    layout: 'minimalist'
  }
];

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Modèles de CV</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(template.id)}
          >
            <div className="aspect-[3/4] bg-gray-200 rounded mb-2 flex items-center justify-center">
              <span className="text-gray-400">📄</span>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm">{template.name}</h4>
              <p className="text-xs text-gray-500">{template.category}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Conseils de sélection</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Moderne</strong>: Secteurs tech et créatifs</li>
          <li>• <strong>Classique</strong>: Finance, droit, consulting</li>
          <li>• <strong>Créatif</strong>: Design, marketing, arts</li>
          <li>• <strong>Minimaliste</strong>: Tous secteurs, format sobre</li>
        </ul>
      </div>
    </div>
  );
}