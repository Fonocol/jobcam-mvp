// components/resume/VisualResumeEditor.tsx
"use client";

import { useState } from "react";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import TemplateSelector from "./TemplateSelector";

interface VisualResumeEditorProps {
  resume?: any;
  onSaved: () => void;
  onCancel: () => void;
}

export default function VisualResumeEditor({ 
  resume, 
  onSaved, 
  onCancel 
}: VisualResumeEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [resumeData, setResumeData] = useState(resume?.content || getDefaultResumeData());
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const handleSave = async () => {
    try {
      const response = await fetch('/api/resumes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resume?.id,
          title: `${resumeData.personal.fullName} - CV`,
          content: resumeData,
          layout: selectedTemplate
        })
      });
      
      if (response.ok) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">
            {resume ? 'Modifier le CV' : 'Créer un nouveau CV'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>

        <div className="flex border-b">
          <button
            className={`px-6 py-3 ${activeTab === 'edit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('edit')}
          >
            Édition
          </button>
          <button
            className={`px-6 py-3 ${activeTab === 'preview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('preview')}
          >
            Aperçu
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResumeForm
                data={resumeData}
                onChange={setResumeData}
              />
            </div>
            <div className="lg:col-span-1">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <ResumePreview
            data={resumeData}
            template={selectedTemplate}
          />
        )}
      </div>
    </div>
  );
}

function getDefaultResumeData() {
  return {
    personal: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      links: {
        linkedin: '',
        github: '',
        portfolio: ''
      }
    },
    experiences: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: []
  };
}