"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Types partagés avec /api/flow/next
type Locale = "fr" | "en" | "ar";
type QType = "radio" | "number" | "text";
type Option = { value: string; label: string };
type Question = { id: string; type: QType; label: string; options?: Option[] };

// Réponses attendues des APIs
type FlowNextOk = { ok: true; question: Question | null };
type FlowNextErr = { ok: false; error: string };
type FlowNextResponse = FlowNextOk | FlowNextErr;

type SaveAnswersOk = { ok: true };
type SaveAnswersErr = { ok: false; error: string };
type SaveAnswersResponse = SaveAnswersOk | SaveAnswersErr;

type DecisionOk = { ok: true; pathway: string; citations: string[] };
type DecisionErr = { ok: false; error: string };
type DecisionResponse = DecisionOk | DecisionErr;

// Type guards (aucun any)
function isLocale(v: unknown): v is Locale {
  return v === "fr" || v === "en" || v === "ar";
}
function normalizeLocale(v: unknown): Locale {
  return typeof v === "string" && isLocale(v) ? v : "fr";
}
function isOption(v: unknown): v is Option {
  return typeof v === "object" && v !== null &&
         typeof (v as Record<string, unknown>).value === "string" &&
         typeof (v as Record<string, unknown>).label === "string";
}
function isQuestion(v: unknown): v is Question {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  const hasCore =
    typeof r.id === "string" &&
    (r.type === "radio" || r.type === "number" || r.type === "text") &&
    typeof r.label === "string";
  if (!hasCore) return false;
  if (r.options === undefined) return true;
  if (!Array.isArray(r.options)) return false;
  return r.options.every(isOption);
}
function isFlowNextResponse(v: unknown): v is FlowNextResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) {
    // ok: true -> question: Question | null
    return "question" in r && (r.question === null || isQuestion(r.question));
  }
  if (r.ok === false) {
    return typeof r.error === "string";
  }
  return false;
}
function isSaveAnswersResponse(v: unknown): v is SaveAnswersResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) return true;
  if (r.ok === false) return typeof r.error === "string";
  return false;
}
function isDecisionResponse(v: unknown): v is DecisionResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) {
    return typeof r.pathway === "string" && Array.isArray(r.citations);
  }
  if (r.ok === false) {
    return typeof r.error === "string";
  }
  return false;
}

export default function StartPage() {
  const p = useParams();
  const candidate =
    typeof p?.locale === "string" ? p.locale : Array.isArray(p?.locale) ? p.locale[0] : "fr";
  const l = normalizeLocale(candidate);

  const router = useRouter();

  const [caseId, setCaseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const t = useMemo(() => {
    return {
      title: l === "en" ? "Questionnaire" : l === "ar" ? "الأسئلة" : "Parcours questions",
      required: l === "en"
        ? "Please answer to continue."
        : l === "ar" ? "يرجى الإجابة للمتابعة."
        : "Merci de répondre pour continuer.",
      next: l === "en" ? "Next" : l === "ar" ? "التالي" : "Suivant",
      recap: l === "en" ? "See recap" : l === "ar" ? "عرض الملخص" : "Voir le récapitulatif",
      init: l === "en" ? "Initializing…" : l === "ar" ? "جاري التهيئة…" : "Initialisation…",
      error_generic: l === "en"
        ? "An error occurred. Please try again."
        : l === "ar" ? "حدث خطأ. يرجى المحاولة مجددًا."
        : "Une erreur est survenue. Réessaie dans un instant.",
    };
  }, [l]);

  // 1) Créer le dossier
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/api/case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: l }),
        });
        const j: unknown = await res.json();
        const ok = typeof j === "object" && j !== null &&
          (j as Record<string, unknown>).ok === true &&
          typeof (j as Record<string, unknown>).case === "object" &&
          (j as Record<string, { id?: unknown }>).case?.id &&
          typeof (j as Record<string, { id: unknown }>).case.id === "string";
        if (!ok) throw new Error("CREATE_CASE_FAILED");
        if (!cancelled) setCaseId((j as { case: { id: string } }).case.id);
      } catch {
        if (!cancelled) setErr(t.error_generic);
      }
    })();
    return () => { cancelled = true; };
  }, [l, t.error_generic]);

  // 2) Charger la première question dès qu’on a un caseId
  useEffect(() => {
    if (!caseId) return;
    void fetchNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function fetchNextQuestion() {
    try {
      setErr(null);
      const res = await fetch("/api/flow/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: l, answers }),
      });
      const j: unknown = await res.json();
      if (!isFlowNextResponse(j)) {
        throw new Error("FLOW_BAD_SHAPE");
      }
      if (j.ok === false) {
        throw new Error(j.error);
      }
      setQuestion(j.question);
    } catch {
      setErr(t.error_generic);
    }
  }

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  async function next() {
    if (!question) {
      await finalize();
      return;
    }
    if (!answers[question.id]) {
      alert(t.required);
      return;
    }
    await fetchNextQuestion();
  }

  async function finalize() {
    if (!caseId) {
      alert(t.init);
      return;
    }
    try {
      setLoading(true);
      setErr(null);

      // Enregistrer les réponses
      {
        const res = await fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId, answers }),
        });
        const j: unknown = await res.json();
        if (!isSaveAnswersResponse(j) || j.ok !== true) {
          throw new Error("SAVE_FAILED");
        }
      }

      // Calcul de la décision
      {
        const res = await fetch("/api/decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId }),
        });
        const j: unknown = await res.json();
        if (!isDecisionResponse(j) || j.ok !== true) {
          throw new Error("DECISION_FAILED");
        }
      }

      // Redirection récap
      location.assign(`/${l}/recap?caseId=${encodeURIComponent(caseId)}`);
    } catch {
      setErr(t.error_generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">{t.title}</h1>

        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          {question ? (
            <>
              <label className="block text-lg font-medium">{question.label}</label>

              {question.type === "radio" ? (
                <div className="space-y-2">
                  {(question.options ?? []).map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={question.id}
                        value={opt.value}
                        checked={answers[question.id] === opt.value}
                        onChange={(ev) => setAnswer(question.id, ev.target.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : question.type === "number" ? (
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 w-40"
                  value={answers[question.id] ?? ""}
                  onChange={(ev) => setAnswer(question.id, ev.target.value)}
                  placeholder="0"
                />
              ) : (
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={answers[question.id] ?? ""}
                  onChange={(ev) => setAnswer(question.id, ev.target.value)}
                  placeholder=""
                />
              )}
            </>
          ) : (
            <p className="text-gray-600">
              {loading ? "…" : "C’est terminé. Vous pouvez voir le récapitulatif."}
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={question ? next : finalize}
              className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-60"
              disabled={loading || !caseId}
              title={!caseId ? t.init : ""}
            >
              {question ? t.next : t.recap}
            </button>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      </div>
    </main>
  );
}






