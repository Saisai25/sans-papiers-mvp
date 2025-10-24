"use client";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const segments = pathname.split("/");

  const change = (code: string) => {
    start(() => {
      segments[1] = code;
      router.replace(segments.join("/") || "/");
    });
  };

  return (
    <div className="flex gap-2 text-sm">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => change(l.code)}
          disabled={pending || l.code === current}
          className={`px-2 py-1 rounded ${
            l.code === current ? "bg-black text-white" : "border hover:bg-gray-50"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
