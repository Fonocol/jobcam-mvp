// components/resume/sections/PersonalForm.tsx
"use client";

interface PersonalData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photo?: string;
  summary: string;
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
}

interface PersonalFormProps {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
}

export default function PersonalForm({ data, onChange }: PersonalFormProps) {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateLink = (platform: string, value: string) => {
    onChange({
      ...data,
      links: {
        ...data.links,
        [platform]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informations Personnelles</h3>
      
      {/* Photo de profil */}
      <div>
        <label className="block text-sm font-medium mb-2">Photo de profil</label>
        <div className="flex items-center gap-4">
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400">👤</span>
            </div>
          )}
          <div className="flex-1">
            <input
              type="url"
              placeholder="URL de votre photo"
              value={data.photo || ''}
              onChange={(e) => updateField('photo', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Collez l'URL d'une image (LinkedIn, Gravatar, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Nom complet */}
      <div>
        <label className="block text-sm font-medium mb-2">Nom complet *</label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Prénom Nom"
          required
        />
      </div>

      {/* Titre */}
      <div>
        <label className="block text-sm font-medium mb-2">Titre professionnel *</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Développeur Fullstack, Data Scientist, etc."
          required
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="email@exemple.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="+33 6 12 34 56 78"
          />
        </div>
      </div>

      {/* Localisation */}
      <div>
        <label className="block text-sm font-medium mb-2">Localisation</label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => updateField('location', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Paris, France"
        />
      </div>

      {/* Liens sociaux */}
      <div>
        <label className="block text-sm font-medium mb-2">Liens professionnels</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 text-gray-500">🔗</span>
            <input
              type="url"
              placeholder="LinkedIn"
              value={data.links.linkedin || ''}
              onChange={(e) => updateLink('linkedin', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 text-gray-500">🐙</span>
            <input
              type="url"
              placeholder="GitHub"
              value={data.links.github || ''}
              onChange={(e) => updateLink('github', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 text-gray-500">🌐</span>
            <input
              type="url"
              placeholder="Portfolio"
              value={data.links.portfolio || ''}
              onChange={(e) => updateLink('portfolio', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div>
        <label className="block text-sm font-medium mb-2">Résumé professionnel</label>
        <textarea
          value={data.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Décrivez brièvement votre parcours, vos compétences et vos objectifs professionnels..."
        />
        <p className="text-xs text-gray-500 mt-1">
          2-3 phrases qui résument votre profil
        </p>
      </div>
    </div>
  );
}