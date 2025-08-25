// components/resume/ResumePreview.tsx
"use client";

interface ResumePreviewProps {
  data: any;
  template: string;
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  // Fonction de rendu basique pour l'aperçu
  const renderPreview = () => {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{data.personal.fullName}</h1>
          <p className="text-lg text-gray-600">{data.personal.title}</p>
          <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
            <span>{data.personal.email}</span>
            <span>{data.personal.phone}</span>
            <span>{data.personal.location}</span>
          </div>
        </div>

        {/* Résumé */}
        {data.personal.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Profil</h2>
            <p className="text-gray-700">{data.personal.summary}</p>
          </div>
        )}

        {/* Expériences */}
        {data.experiences.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Expériences Professionnelles</h2>
            {data.experiences.map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{exp.position}</h3>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-600">{exp.company} - {exp.location}</p>
                <p className="text-gray-700 text-sm mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formation */}
        {data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Formation</h2>
            {data.education.map((edu: any, index: number) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <span className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-gray-600">{edu.school}</p>
                <p className="text-gray-700 text-sm">{edu.field}</p>
              </div>
            ))}
          </div>
        )}

        {/* Compétences */}
        {data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Aperçu du CV</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Télécharger PDF
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {renderPreview()}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Note sur l'aperçu</h4>
        <p className="text-yellow-700 text-sm">
          Cet aperçu est une version simplifiée. Le rendu final utilisera le template sélectionné 
          "{template}" avec une mise en forme complète et professionnelle.
        </p>
      </div>
    </div>
  );
}