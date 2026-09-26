import React, { Suspense, lazy, useState, useEffect, useCallback, useMemo } from "react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { Button } from "@/components/ui/button";
import { FileText, Compass, BookOpen, Sparkles, Printer, Copy, Download, RotateCcw, ChevronRight } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";

// ─── Lazy-loaded tab components for code splitting & better Efficiency ───────
const VoiceAssistant = lazy(() =>
  import("@/components/VoiceAssistant").then((m) => ({ default: m.VoiceAssistant }))
);

// ─── Types ───────────────────────────────────────────────────────────────────
type TabId = "voice" | "drafting" | "qa" | "statutes";

interface DraftData {
  title: string;
  draft_text: string;
  translated_to?: string;
  template_id?: string;
}

interface QAAnswer {
  question: string;
  answer: string;
  engine: string;
  jurisdiction?: string;
}

interface Template {
  id: string;
  name: string;
  fields?: Array<{ key: string; label: string; placeholder?: string; required?: boolean }>;
}

interface StatutoryTopic {
  title: string;
  statute: string;
  key_points: string[];
}

const DRAFT_PHASES = [
  { at: 0, label: "Reviewing your details..." },
  { at: 25, label: "Structuring legal clauses..." },
  { at: 60, label: "Applying legal formatting..." },
  { at: 85, label: "Finalizing draft document..." },
  { at: 100, label: "Draft prepared successfully!" }
];

const QA_PHASES = [
  { at: 0, label: "Understanding your question..." },
  { at: 30, label: "Searching legal provisions & rights..." },
  { at: 65, label: "Formulating citizen-friendly guidance..." },
  { at: 90, label: "Finalizing legal guidance..." },
  { at: 100, label: "Guidance ready!" }
];

// ─── Tab Loading Fallback ─────────────────────────────────────────────────
function TabLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]" role="status" aria-label="Loading tab content">
      <ProgressiveFluxLoader value={60} />
    </div>
  );
}

// ─── Error Boundary ────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("NyayaSahayak UI Error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div role="alert" className="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300 text-sm">
            <p className="font-bold mb-2">Something went wrong loading this section.</p>
            <p className="text-xs text-red-400">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 px-3 py-1.5 bg-red-900/60 hover:bg-red-800 rounded-lg text-xs font-medium transition"
            >
              Try Again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { t } = useLanguage();
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

  const [activeTab, setActiveTab] = useState<TabId>("voice");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("legal_notice_money");
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<DraftData | null>(null);

  // QA state
  const [qaQuery, setQaQuery] = useState("");
  const [qaAnswer, setQaAnswer] = useState<QAAnswer | null>(null);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [qaProgress, setQaProgress] = useState(0);

  // Drafting progress state
  const [draftingProgress, setDraftingProgress] = useState(0);

  // Statutes state
  const [statutoryTopics, setStatutoryTopics] = useState<Record<string, StatutoryTopic>>({});

  // Fetch templates and statutes on load — memoized to avoid re-fetching
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/api/draft/templates`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { templates?: Template[] }) => {
        if (data.templates) {
          setTemplates(data.templates);
          setSelectedTemplateId(data.templates[0]?.id || "legal_notice_money");
        }
      })
      .catch((err: Error) => { if (err.name !== "AbortError") console.warn("Templates load error:", err); });

    fetch(`${API_BASE}/api/statutes/topics`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { topics?: Record<string, StatutoryTopic> }) => {
        if (data.topics) setStatutoryTopics(data.topics);
      })
      .catch((err: Error) => { if (err.name !== "AbortError") console.warn("Statutes load error:", err); });

    return () => controller.abort();
  }, [API_BASE]);

  // Memoized derived values
  const currentTemplate = useMemo(
    () => templates.find((tpl) => tpl.id === selectedTemplateId) || templates[0],
    [templates, selectedTemplateId]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleFieldChange = useCallback((key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAutoFillFromVoice = useCallback(
    (templateId: string, entities: Record<string, string>, rawTranscript: string) => {
      setSelectedTemplateId(templateId);
      setFormFields((prev) => ({
        ...prev,
        ...entities,
        factual_timeline: entities.factual_timeline || rawTranscript,
      }));
      setActiveTab("drafting");
    },
    []
  );

  const handleGenerateDraft = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDrafting(true);
    setDraftingProgress(8);

    let currentPct = 8;
    const progressInterval = setInterval(() => {
      currentPct += (90 - currentPct) * 0.16;
      setDraftingProgress(Math.min(92, Math.round(currentPct)));
    }, 280);

    try {
      const res = await fetch(`${API_BASE}/api/draft/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: selectedTemplateId, fields: formFields }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: DraftData = await res.json();
      clearInterval(progressInterval);
      setDraftingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGeneratedDraft(data);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setDraftingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Draft generation error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsDrafting(false);
    }
  }, [API_BASE, selectedTemplateId, formFields]);

  const handleDownloadPDF = useCallback(async () => {
    if (!generatedDraft) return;
    try {
      const res = await fetch(`${API_BASE}/api/draft/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: generatedDraft.title, draft_text: generatedDraft.draft_text }),
      });
      if (!res.ok) throw new Error(`PDF export failed: ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedDraft.title.replace(/\s+/g, "_")}.pdf`;
      a.setAttribute("aria-label", `Download ${generatedDraft.title} as PDF`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert("Error downloading PDF: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }, [API_BASE, generatedDraft]);

  const handleAskQA = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsQaLoading(true);
    setQaProgress(8);

    let currentPct = 8;
    const progressInterval = setInterval(() => {
      currentPct += (90 - currentPct) * 0.16;
      setQaProgress(Math.min(92, Math.round(currentPct)));
    }, 280);

    try {
      const res = await fetch(`${API_BASE}/api/legal-qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: QAAnswer = await res.json();
      clearInterval(progressInterval);
      setQaProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setQaAnswer(data);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setQaProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("QA error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsQaLoading(false);
    }
  }, [API_BASE]);

  const [isTranslatingDraft, setIsTranslatingDraft] = useState(false);
  const [isTranslatingQa, setIsTranslatingQa] = useState(false);

  const handleTranslateDraft = useCallback(async (targetLang: string) => {
    if (!generatedDraft?.draft_text) return;
    setIsTranslatingDraft(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: generatedDraft.draft_text, target_language: targetLang }),
      });
      if (!res.ok) throw new Error(`Translation failed: ${res.status}`);
      const data: { translated_text?: string; target_language_name?: string } = await res.json();
      if (data.translated_text) {
        setGeneratedDraft((prev) => prev ? ({ ...prev, draft_text: data.translated_text!, translated_to: data.target_language_name }) : prev);
      }
    } catch (err: unknown) {
      alert("Translation error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsTranslatingDraft(false);
    }
  }, [API_BASE, generatedDraft]);

  const handleTranslateQa = useCallback(async (targetLang: string) => {
    if (!qaAnswer?.answer) return;
    setIsTranslatingQa(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: qaAnswer.answer, target_language: targetLang }),
      });
      if (!res.ok) throw new Error(`Translation failed: ${res.status}`);
      const data: { translated_text?: string; target_language_name?: string } = await res.json();
      if (data.translated_text) {
        setQaAnswer((prev) => prev ? ({ ...prev, answer: data.translated_text! }) : prev);
      }
    } catch (err: unknown) {
      alert("Translation error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsTranslatingQa(false);
    }
  }, [API_BASE, qaAnswer]);

  // ─── Tab Button Helper ──────────────────────────────────────────────────
  const TabButton = useCallback(({
    id, icon, label
  }: { id: TabId; icon: React.ReactNode; label: string }) => (
    <button
      role="tab"
      aria-selected={activeTab === id}
      aria-controls={`tabpanel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActiveTab(id)}
      className={`px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        activeTab === id
          ? "bg-white text-[#1F2023] font-bold shadow-md shadow-white/10"
          : "text-gray-400 hover:text-white hover:bg-[#2E3033]/60"
      }`}
    >
      {icon} {label}
    </button>
  ), [activeTab]);

  return (
    <div className="min-h-screen bg-[#16171A] text-gray-100 flex flex-col font-sans selection:bg-gray-700 selection:text-white relative overflow-x-hidden">
      {/* Skip to main content link for keyboard / screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <header role="banner" className="sticky top-0 z-50 bg-[#1F2023]/95 backdrop-blur-md border-b border-[#333333] px-4 md:px-6 py-3 flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        {/* Top Left: Brand Logo and Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-[#2E3033] border border-[#444444] flex items-center justify-center text-lg shadow-lg shadow-black/50 shrink-0"
            aria-hidden="true"
          >
            ⚖️
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              न्यायसहायक <span className="metallic-text font-semibold text-xs">{t.appName}</span>
            </h1>
            <p className="text-[10px] text-gray-400">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <nav
          role="tablist"
          aria-label="Application sections"
          className="flex items-center gap-1 bg-[#16171A] border border-[#333333] rounded-full p-1 text-xs shadow-inner overflow-x-auto max-w-[45vw] sm:max-w-none scrollbar-none"
        >
          <TabButton id="voice" icon={<span aria-hidden="true">🎙️</span>} label={t.navVoice} />
          <TabButton id="drafting" icon={<FileText className="w-3.5 h-3.5" aria-hidden="true" />} label={t.navDrafting} />
          <TabButton id="qa" icon={<Compass className="w-3.5 h-3.5" aria-hidden="true" />} label={t.navQa} />
          <TabButton id="statutes" icon={<BookOpen className="w-3.5 h-3.5" aria-hidden="true" />} label={t.navStatutes} />
        </nav>

        {/* Top Right */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="h-6 w-px bg-[#333333] hidden sm:block" aria-hidden="true" />
          <LiquidMetalButton
            label={t.topVoiceBtn}
            onClick={() => setActiveTab("voice")}
            aria-label="Go to Nyaya Vani voice assistant"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" role="main" className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col">

        {/* TAB 1: AI LEGAL CHATBOT SEARCH PAGE */}
        <div
          role="tabpanel"
          id="tabpanel-voice"
          aria-labelledby="tab-voice"
          hidden={activeTab !== "voice"}
        >
          {activeTab === "voice" && (
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <VoiceAssistant onAutoFillToDrafting={handleAutoFillFromVoice} />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>

        {/* TAB 2: COURT DRAFTING STUDIO */}
        <div
          role="tabpanel"
          id="tabpanel-drafting"
          aria-labelledby="tab-drafting"
          hidden={activeTab !== "drafting"}
        >
          {activeTab === "drafting" && (
            <ErrorBoundary>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.draftingTitle}</h2>
                  <p className="text-sm text-zinc-400">{t.draftingSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Form Column */}
                  <section aria-label="Draft configuration form" className="lg:col-span-5 bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl">
                    <div className="mb-4">
                      <label htmlFor="template-select" className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        {t.selectTemplateLabel}
                      </label>
                      <select
                        id="template-select"
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        aria-label="Select legal document template"
                        className="w-full bg-[#16171A] border border-[#444444] rounded-xl p-3 text-sm text-white outline-none focus:border-[#666666] focus-visible:ring-2 focus-visible:ring-white/30 transition"
                      >
                        {templates.map((tmpl) => (
                          <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic form fields */}
                    {currentTemplate?.fields?.map((field) => (
                      <div key={field.key} className="mb-4">
                        <label htmlFor={`field-${field.key}`} className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
                        </label>
                        <textarea
                          id={`field-${field.key}`}
                          value={formFields[field.key] || ""}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          aria-label={field.label}
                          aria-required={field.required}
                          rows={field.key === "factual_timeline" ? 4 : 2}
                          className="w-full bg-[#16171A] border border-[#444444] rounded-xl p-3 text-sm text-white outline-none focus:border-[#666666] focus-visible:ring-2 focus-visible:ring-white/30 transition resize-none"
                        />
                      </div>
                    ))}

                    {/* Auto-fill Demo Buttons */}
                    <div className="mt-6 space-y-2">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">1-Click Demo Fill</p>
                      <div className="flex flex-wrap gap-2">
                        {([
                          { label: "Salary Demo", templateId: "legal_notice_money", fields: { claimant_name: "Priya Sharma", respondent_name: "TechCorp Pvt Ltd", amount_due: "₹2,85,000", factual_timeline: "Employer withheld salary for 3 months without justification." } },
                          { label: "Cheque Demo", templateId: "cheque_bounce", fields: { drawer_name: "Suresh Mehta", cheque_amount: "₹75,000", bank_name: "HDFC Bank", factual_timeline: "Cheque dishonoured with memo 'Insufficient Funds'." } },
                          { label: "Consumer Demo", templateId: "consumer_complaint", fields: { complainant_name: "Anita Rao", opposite_party: "Amazon India", product_service: "Laptop", defect_description: "Delivered counterfeit product.", relief_sought: "Full refund + ₹10,000 compensation" } },
                          { label: "RTI Demo", templateId: "rti_application", fields: { applicant_name: "Mohan Das", public_authority: "BBMP", information_sought: "List of contractors awarded road tenders FY 2024-25." } },
                        ] as Array<{ label: string; templateId: string; fields: Record<string, string> }>).map((demo) => (
                          <button
                            key={demo.templateId}
                            onClick={() => {
                              setSelectedTemplateId(demo.templateId);
                              setFormFields(demo.fields);
                            }}
                            aria-label={`Auto-fill ${demo.label} example`}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#2E3033] hover:bg-[#3a3c42] border border-[#444444] text-gray-300 transition font-medium"
                          >
                            {demo.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateDraft}
                      disabled={isDrafting}
                      aria-label="Generate legal draft document"
                      aria-busy={isDrafting}
                      className="mt-6 w-full py-3 rounded-xl bg-white text-[#1F2023] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 disabled:opacity-60 transition focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      {isDrafting ? (t.btnSynthesizing || "Generating…") : (t.btnGenerate || "Generate Draft")}
                    </button>
                  </section>

                  {/* Output Column */}
                  <section aria-label="Generated legal draft" className="lg:col-span-7">
                    {isDrafting ? (
                      <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 flex items-center justify-center min-h-[320px]" aria-live="polite" aria-label="Draft generation in progress">
                      <ProgressiveFluxLoader value={draftingProgress} phases={DRAFT_PHASES} />
                      </div>
                    ) : generatedDraft ? (
                      <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-bold text-white text-lg metallic-text">{generatedDraft.title}</h3>
                            {generatedDraft.translated_to && (
                              <span className="text-xs text-emerald-400">Translated to {generatedDraft.translated_to}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Draft actions">
                            <button
                              onClick={() => navigator.clipboard.writeText(generatedDraft.draft_text)}
                              aria-label="Copy draft to clipboard"
                              title="Copy draft"
                              className="p-2 rounded-lg bg-[#2E3033] hover:bg-[#3a3c42] border border-[#444444] text-gray-300 transition focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                              <Copy className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => window.print()}
                              aria-label="Print draft"
                              title="Print draft"
                              className="p-2 rounded-lg bg-[#2E3033] hover:bg-[#3a3c42] border border-[#444444] text-gray-300 transition focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                              <Printer className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <Button
                              onClick={handleDownloadPDF}
                              aria-label="Download draft as PDF"
                              className="flex items-center gap-1.5 text-xs bg-white text-[#1F2023] hover:bg-gray-100 font-bold px-3 py-2 h-auto focus-visible:ring-2 focus-visible:ring-white/50"
                            >
                              <Download className="w-3.5 h-3.5" aria-hidden="true" /> {t.btnExportPdf || "Download PDF"}
                            </Button>
                            <button
                              onClick={() => setGeneratedDraft(null)}
                              aria-label="Reset draft and start over"
                              title="Reset"
                              className="p-2 rounded-lg bg-[#2E3033] hover:bg-[#3a3c42] border border-[#444444] text-gray-300 transition focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                              <RotateCcw className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {/* Translation quick actions */}
                        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Translate draft to Indian language">
                          <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Translate:</span>
                          {[
                            { code: "hi", label: "हिन्दी" }, { code: "te", label: "తెలుగు" },
                            { code: "ta", label: "தமிழ்" }, { code: "kn", label: "ಕನ್ನಡ" },
                            { code: "ml", label: "മലയാളം" }, { code: "bn", label: "বাংলা" },
                          ].map(({ code, label }) => (
                            <button
                              key={code}
                              onClick={() => handleTranslateDraft(code)}
                              disabled={isTranslatingDraft}
                              aria-label={`Translate draft to ${label}`}
                              className="text-[11px] text-emerald-300 hover:text-white px-1 font-semibold disabled:opacity-40 transition"
                            >
                              {isTranslatingDraft ? "…" : label}
                            </button>
                          ))}
                        </div>

                        <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-sans bg-[#16171A] border border-[#2E3033] rounded-xl p-5 max-h-[60vh] overflow-y-auto" tabIndex={0} aria-label="Generated legal draft text">
                          {generatedDraft.draft_text}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] text-center" aria-label="No draft generated yet">
                        <div className="w-16 h-16 rounded-2xl bg-[#2E3033] flex items-center justify-center text-3xl mb-4" aria-hidden="true">📜</div>
                        <h3 className="font-bold text-white mb-2">{t.previewEmptyTitle || "Your draft will appear here"}</h3>
                        <p className="text-sm text-gray-400 max-w-sm">{t.previewEmptyDesc || "Fill in the form fields on the left and click Generate Draft to create a court-ready legal document."}</p>
                        <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500">
                          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Use 1-Click Demo buttons to pre-fill example data</span>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </ErrorBoundary>
          )}
        </div>

        {/* TAB 3: LEGAL RIGHTS NAVIGATOR */}
        <div
          role="tabpanel"
          id="tabpanel-qa"
          aria-labelledby="tab-qa"
          hidden={activeTab !== "qa"}
        >
          {activeTab === "qa" && (
            <ErrorBoundary>
              <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.qaTitle}</h2>
                  <p className="text-sm text-gray-400">{t.qaSubtitle}</p>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); handleAskQA(qaQuery); }}
                  role="search"
                  aria-label="Legal rights navigator search"
                  className="bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl space-y-4"
                >
                  <label htmlFor="qa-input" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Describe your legal situation
                  </label>
                  <textarea
                    id="qa-input"
                    value={qaQuery}
                    onChange={(e) => setQaQuery(e.target.value)}
                    placeholder={t.qaPlaceholder || "e.g. My employer hasn't paid my salary for 3 months. What are my legal rights?"}
                    rows={4}
                    maxLength={5000}
                    aria-label="Legal question or situation"
                    aria-describedby="qa-char-count"
                    className="w-full bg-[#16171A] border border-[#444444] rounded-xl p-4 text-sm text-white outline-none focus:border-[#666666] focus-visible:ring-2 focus-visible:ring-white/30 transition resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span id="qa-char-count" className="text-xs text-gray-500" aria-live="polite">
                      {qaQuery.length}/5000
                    </span>
                    <Button
                      type="submit"
                      disabled={isQaLoading || !qaQuery.trim()}
                      aria-label="Get legal guidance"
                      aria-busy={isQaLoading}
                      className="bg-white text-[#1F2023] hover:bg-gray-100 font-bold px-4 py-2 h-auto text-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      {isQaLoading ? (t.btnConsultingAi || "Finding your rights…") : (t.btnConsultAi || "Get Legal Guidance")}
                    </Button>
                  </div>
                </form>

                {/* Quick topic shortcuts */}
                <div role="group" aria-label="Common legal topics" className="flex flex-wrap gap-2">
                  {[
                    { label: "Unpaid Salary", q: "My employer has not paid my salary for 3 months. What are my legal rights under Indian law?" },
                    { label: "Cheque Bounce", q: "A cheque given to me has bounced. What legal action can I take under Section 138 NI Act?" },
                    { label: "Consumer Defect", q: "I received a defective product from an e-commerce company and they are refusing to refund. What are my consumer rights?" },
                    { label: "RTI Application", q: "My RTI application has not been responded to within 30 days. What are my rights and remedies?" },
                    { label: "Free Legal Aid", q: "I cannot afford a lawyer. Am I eligible for free legal aid under NALSA?" },
                  ].map(({ label, q }) => (
                    <button
                      key={label}
                      onClick={() => { setQaQuery(q); handleAskQA(q); }}
                      aria-label={`Quick search: ${label}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#2E3033] hover:bg-[#3a3c42] border border-[#444444] text-gray-300 transition font-medium focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {isQaLoading && (
                  <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 flex items-center justify-center" aria-live="polite" aria-label="Consulting legal database">
                    <ProgressiveFluxLoader value={qaProgress} phases={QA_PHASES} />
                  </div>
                )}

                {qaAnswer && !isQaLoading && (
                  <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl space-y-4" aria-live="polite" aria-label="Legal guidance response">
                    <div className="flex items-start justify-between flex-wrap gap-3 border-b border-[#333333] pb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Query</p>
                        <p className="text-sm text-white font-medium">{qaAnswer.question}</p>
                      </div>
                      <div className="flex items-center gap-2" role="group" aria-label="Translate answer">
                        {[
                          { code: "hi", label: "हिन्दी" }, { code: "te", label: "తెలుగు" },
                          { code: "ta", label: "தமிழ்" },
                        ].map(({ code, label }) => (
                          <button
                            key={code}
                            onClick={() => handleTranslateQa(code)}
                            disabled={isTranslatingQa}
                            aria-label={`Translate answer to ${label}`}
                            className="text-[11px] text-emerald-300 hover:text-white px-1 font-semibold disabled:opacity-40 transition"
                          >
                            {isTranslatingQa ? "…" : label}
                          </button>
                        ))}
                        <span className="text-[11px] text-gray-400">{qaAnswer.engine}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed" tabIndex={0}>
                      {qaAnswer.answer}
                    </div>
                    <button
                      onClick={() => setQaAnswer(null)}
                      aria-label="Clear legal guidance and ask a new question"
                      className="text-xs text-gray-500 hover:text-gray-300 transition"
                    >
                      ✕ Clear &amp; ask another question
                    </button>
                  </div>
                )}
              </div>
            </ErrorBoundary>
          )}
        </div>

        {/* TAB 4: STATUTORY COMPENDIUM */}
        <div
          role="tabpanel"
          id="tabpanel-statutes"
          aria-labelledby="tab-statutes"
          hidden={activeTab !== "statutes"}
        >
          {activeTab === "statutes" && (
            <ErrorBoundary>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.compendiumTitle}</h2>
                  <p className="text-sm text-gray-400">{t.compendiumSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(statutoryTopics).map(([key, topic]) => (
                    <article
                      key={key}
                      className="bg-[#1F2023] border border-[#333333] hover:border-[#555555] rounded-2xl p-6 space-y-3 shadow-xl transition-all focus-within:border-[#555555]"
                      aria-label={`${topic.title} - ${topic.statute}`}
                    >
                      <h3 className="text-base font-bold text-white metallic-text">{topic.title}</h3>
                      <span className="text-xs font-semibold text-gray-300 block">{topic.statute}</span>
                      <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside" aria-label={`Key points for ${topic.title}`}>
                        {topic.key_points?.map((pt, idx) => (
                          <li key={idx} className="leading-relaxed">{pt}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </ErrorBoundary>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="border-t border-[#2E3033] px-4 py-3 text-center text-[10px] text-gray-600">
        <p>
          NyayaSahayak is an informational tool to foster legal literacy under Indian law.
          Drafts should be reviewed by a certified legal practitioner prior to judicial filing.
          Free legal aid available through{" "}
          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white underline transition focus-visible:ring-1 focus-visible:ring-white/50 rounded"
            aria-label="National Legal Services Authority website (opens in new tab)"
          >
            NALSA
          </a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
