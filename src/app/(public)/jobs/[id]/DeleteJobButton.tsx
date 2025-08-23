"use client";

import { useState } from "react";

export default function DeleteJobButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = confirm("Supprimer cette offre ? Cette action est irréversible.");
        if (!ok) {
          e.preventDefault();
          return;
        }
        setLoading(true);
      }}
      disabled={loading}
      className="inline-flex items-center px-3 py-2 rounded-md bg-red-600 text-white text-sm hover:opacity-95 disabled:opacity-60"
    >
      {loading ? "Suppression..." : "Supprimer"}
    </button>
  );
}
