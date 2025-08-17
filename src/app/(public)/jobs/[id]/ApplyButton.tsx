// src/app/jobs/[id]/ApplyButton.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ApplyButton({
  jobId,
  isRecruiter,
  hasApplied,
}: {
  jobId: string;
  isRecruiter: boolean;
  hasApplied: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleApply = () => {
    router.push(`/jobs/${jobId}/apply`);
  };

  const isDisabled = !session || isRecruiter || hasApplied;

  return (
    <div className="mt-8">
      <button
        onClick={handleApply}
        disabled={isDisabled}
        className={`px-4 py-2 rounded ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {hasApplied ? "Déjà postulé" : "Postuler"}
      </button>
      
      {isDisabled && (
        <p className="mt-2 text-sm text-gray-500">
          {!session
            ? "Connectez-vous pour postuler"
            : isRecruiter
            ? "Les recruteurs ne peuvent pas postuler"
            : "Vous avez déjà postulé à cette offre"}
        </p>
      )}
    </div>
  );
}