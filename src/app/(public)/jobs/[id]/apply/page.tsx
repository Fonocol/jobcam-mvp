"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplyPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: params.id,
        candidateId: session?.user.candidateId, 
        message,
        cvUrl
      }),
    });

    if (res.ok) {
      alert("Candidature envoyée !");
      router.push("/");
    } else {
      alert("Erreur lors de l'envoi");
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Postuler à cette offre</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          placeholder="Message de motivation"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border w-full p-2 rounded"
        />
        <input
          type="text"
          placeholder="Lien vers votre CV"
          value={cvUrl}
          onChange={(e) => setCvUrl(e.target.value)}
          className="border w-full p-2 rounded"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Envoyer
        </button>
      </form>
    </main>
  );
}
