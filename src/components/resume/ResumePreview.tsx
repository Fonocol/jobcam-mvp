"use client";

interface ResumePreviewProps {
  data: any;
  template: string;
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  const renderPreview = () => {
    return (
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          {data.personal.photo && (
            <img
              src={data.personal.photo}
              alt={data.personal.fullName}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900">{data.personal.fullName}</h1>
          <p className="text-lg text-gray-600">{data.personal.title}</p>

          <div className="flex justify-center flex-wrap gap-4 mt-3 text-sm text-gray-500">
            {data.personal.email && <span>📧 {data.personal.email}</span>}
            {data.personal.phone && <span>📞 {data.personal.phone}</span>}
            {data.personal.location && <span>📍 {data.personal.location}</span>}
          </div>
        </div>

        {/* Profil / Résumé */}
        {data.personal.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
              Profil
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
          </div>
        )}

        {/* Expériences */}
        {data.experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">
              Expériences professionnelles
            </h2>
            {data.experiences.map((exp: any, idx: number) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{exp.position}</h3>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? "Présent" : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-600">{exp.company} - {exp.location}</p>
                {exp.description && (
                  <p className="text-gray-700 text-sm mt-1">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formation */}
        {data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-1">
              Formation
            </h2>
            {data.education.map((edu: any, idx: number) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                  <span className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-gray-600">{edu.school}</p>
                {edu.field && <p className="text-gray-700 text-sm">{edu.field}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Compétences */}
        {data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Aperçu du CV</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Télécharger PDF
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
        {renderPreview()}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Note sur l'aperçu</h4>
        <p className="text-yellow-700 text-sm">
          Cet aperçu est simplifié. Le rendu final utilisera le template "{template}" 
          avec une mise en forme complète et professionnelle.
        </p>
      </div>
    </div>
  );
}
