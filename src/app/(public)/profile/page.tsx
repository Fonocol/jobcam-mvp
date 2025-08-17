// src/app/(public)/profile/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type RecruiterPayload = {
  id: string;
  userId: string;
  companyId?: string | null;
  User: { id: string; name: string; email: string };
  company?: { id: string; name: string; description?: string | null; region?: string | null } | null;
};

type CandidatePayload = {
  id: string;
  userId: string;
  headline?: string | null;
  location?: string | null;
  resumeUrl?: string | null;
  User: { id: string; name: string; email: string };
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [recruiter, setRecruiter] = useState<RecruiterPayload | null>(null);
  const [candidate, setCandidate] = useState<CandidatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // local editable state
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [companyRegion, setCompanyRegion] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }
    setRole((session.user as any).role ?? null);
    const uid = (session.user as any).id;

    async function load() {
      try {

        setLoading(true);
        if ((session!.user as any).role === "RECRUITER") {
          const res = await fetch(`/api/recruiters?userId=${uid}`);
          if (!res.ok) throw new Error(await res.text());
          const data: RecruiterPayload = await res.json();
          setRecruiter(data);
          setName(data.User?.name ?? "");
          setCompanyName(data.company?.name ?? "");
          setCompanyDesc(data.company?.description ?? "");
          setCompanyRegion(data.company?.region ?? "");
        } else {
          const res = await fetch(`/api/candidates?userId=${uid}`);
          if (!res.ok) throw new Error(await res.text());
          const data: CandidatePayload = await res.json();
          setCandidate(data);
          setName(data.User?.name ?? "");
          setHeadline(data.headline ?? "");
          setLocation(data.location ?? "");
          setResumeUrl(data.resumeUrl ?? "");
        }
      } catch (err: any) {
        setError(err?.message ?? "Load error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session, status]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setSaving(true);
    setError(null);
    try {
      if ((session.user as any).role === "RECRUITER") {
        const body = {
          name,
          company: { name: companyName, description: companyDesc, region: companyRegion },
        };
        const res = await fetch("/api/recruiters", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
        const json = await res.json();
        setRecruiter(json.recruiter);
      } else {
        const body = { name, headline, location, resumeUrl };
        const res = await fetch("/api/candidates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
        const json = await res.json();
        setCandidate(json.candidate);
      }
      alert("Profil mis à jour !");
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!session?.user) return <div>Connectez-vous pour accéder au profil</div>;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: 20 }}>
      <h1>Mon profil</h1>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <div>
          <label>Nom</label>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {role === "RECRUITER" && (
          <>
            <h2>Entreprise</h2>
            <div>
              <label>Nom de l'entreprise</label>
              <br />
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label>Description</label>
              <br />
              <textarea value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)} />
            </div>
            <div>
              <label>Région</label>
              <br />
              <input value={companyRegion} onChange={(e) => setCompanyRegion(e.target.value)} />
            </div>
          </>
        )}

        {role === "CANDIDATE" && (
          <>
            <h2>Candidat</h2>
            <div>
              <label>Résumé / Headline</label>
              <br />
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </div>
            <div>
              <label>Localisation</label>
              <br />
              <input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label>URL CV (resumeUrl)</label>
              <br />
              <input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
            </div>
          </>
        )}

        <div>
          <button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
