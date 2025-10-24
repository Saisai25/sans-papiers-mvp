"use client";

export function DownloadCsvButton({
  label = "Exporter CSV",
  status,
  locale,
}: {
  label?: string;
  status?: string;
  locale?: string;
}) {
  const onClick = async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (locale) params.set("locale", locale);

      const res = await fetch(`/api/admin/export?${params.toString()}`, {
        headers: {
          "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "",
        },
      });
      if (!res.ok) {
        alert("Export impossible (401 si token manquant).");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cases-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Erreur export CSV.");
    }
  };

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
      title="Télécharger la liste des dossiers au format CSV"
    >
      {label}
    </button>
  );
}
