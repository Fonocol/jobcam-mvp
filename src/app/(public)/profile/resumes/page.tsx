// app/(candidate)/profile/resumes/page.tsx (version mise à jour)
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import VisualResumeEditor from "@/components/resume/VisualResumeEditor";

interface Resume {
  id: string;
  title: string;
  layout: string;
  content: any;
  isPrimary: boolean;
  isPublic: boolean;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const ResumeCard = ({
  resume,
  onSetPrimary,
  onEdit,
  onDelete,
}: {
  resume: Resume;
  onSetPrimary: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="p-4 border rounded-lg mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{resume.title}</h3>
          <p className="text-sm text-gray-600">
            Modèle: {resume.layout} • 
            Modifié: {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
          {resume.isPrimary && (
            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              CV Principal
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Éditer
          </button>
          {!resume.isPrimary && (
            <button 
              onClick={onSetPrimary}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Définir principal
            </button>
          )}
          {!resume.isPrimary && (
            <button 
              onClick={onDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-3">
          <button className="text-blue-600 hover:underline flex items-center">
            📄 Prévisualiser
          </button>
          <button className="text-green-600 hover:underline flex items-center">
            📥 Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ResumesPage() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const userId = session?.user?.id;

  async function fetchResumes() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/resumes/list", {
        headers: { "x-user-id": userId },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (e) {
      console.error(e);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, [userId]);

  async function handleCreateFromProfile() {
    if (!userId) return;
    try {
      const response = await fetch('/api/resumes/create-from-profile', {
        method: 'POST',
        headers: { 'x-user-id': userId },
      });
      if (response.ok) {
        const newResume = await response.json();
        setEditingResume(newResume);
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Error creating resume from profile:', error);
    }
  }

  // ... (les autres fonctions restent similaires)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes CVs</h1>
        <p className="text-gray-600">
          Créez et gérez vos CVs professionnels avec notre éditeur visuel intuitif.
        </p>
      </div>

      {showEditor ? (
        <VisualResumeEditor
          resume={editingResume}
          onSaved={() => {
            setShowEditor(false);
            setEditingResume(null);
            fetchResumes();
          }}
          onCancel={() => {
            setShowEditor(false);
            setEditingResume(null);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">🔄</span>
                </div>
                <h3 className="text-lg font-semibold">À partir du profil</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Créez un CV automatiquement à partir de vos informations de profil.
              </p>
              <button
                onClick={handleCreateFromProfile}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Générer depuis le profil
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600">🆕</span>
                </div>
                <h3 className="text-lg font-semibold">Nouveau CV vierge</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Commencez avec un CV vide et ajoutez vos informations manuellement.
              </p>
              <button
                onClick={() => {
                  setEditingResume(null);
                  setShowEditor(true);
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Créer un nouveau CV
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600">📤</span>
                </div>
                <h3 className="text-lg font-semibold">Importer un CV</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Importez un CV existant (PDF, Word) pour l'ajouter à votre collection.
              </p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                Importer un fichier
              </button>
            </div>
          </div>

          {/* ... le reste de l'affichage des CVs existants */}
        </>
      )}
    </div>
  );
}