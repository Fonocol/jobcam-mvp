"use client";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800"
};

export default function ApplicationStatusBadge({ status }: { status?: string | null }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
    }`}>
      {status === "PENDING" && "En attente"}
      {status === "REVIEWED" && "En cours"}
      {status === "ACCEPTED" && "Accepté"}
      {status === "REJECTED" && "Rejeté"}
      {!status && "Non spécifié"}
    </span>
  );
}