"use client";

export function DownloadPdfButton({ caseId }: { caseId: string }) {
  const onClick = () => {
    const u = `/api/pdf?caseId=${encodeURIComponent(caseId)}`;
    window.open(u, "_blank");
  };
  return (
    <button onClick={onClick} className="px-3 py-2 rounded border hover:bg-gray-50">
      Télécharger le PDF
    </button>
  );
}



