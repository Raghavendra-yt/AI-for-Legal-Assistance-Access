import React, { useState, useEffect } from "react";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import VoicePoweredOrbPage from "@/demo";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import LiquidMetalButtonDemo from "@/components/LiquidMetalButtonDemo";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";
import ProgressiveFluxLoaderDemo from "@/components/ProgressiveFluxLoaderDemo";
import PromptInputBoxDemo from "@/components/PromptInputBoxDemo";
import DottedSurfaceDemo from "@/components/DottedSurfaceDemo";
import { Button } from "@/components/ui/button";
import { Scale, FileText, Compass, BookOpen, Sparkles, Printer, Copy, Download, RotateCcw, ChevronRight } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export function App() {
  const { t } = useLanguage();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  const [activeTab, setActiveTab] = useState<"voice" | "drafting" | "qa" | "statutes" | "demo">("voice");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("legal_notice_money");
  const [formFields, setFormFields] = useState<Record<string, any>>({});
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);

  // QA state
  const [qaQuery, setQaQuery] = useState("");
  const [qaAnswer, setQaAnswer] = useState<any>(null);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [qaProgress, setQaProgress] = useState(0);

  // Drafting progress state
  const [draftingProgress, setDraftingProgress] = useState(0);

  // Statutes state
  const [statutoryTopics, setStatutoryTopics] = useState<any>({});

  // Fetch templates and statutes on load
  useEffect(() => {
    fetch(`${API_BASE}/api/draft/templates`)
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
          setSelectedTemplateId(data.templates[0]?.id || "legal_notice_money");
        }
      })
      .catch((err) => console.warn("Templates load error:", err));

    fetch(`${API_BASE}/api/statutes/topics`)
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) setStatutoryTopics(data.topics);
      })
      .catch((err) => console.warn("Statutes load error:", err));
  }, []);

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleFieldChange = (key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAutoFillFromVoice = (templateId: string, entities: Record<string, any>, rawTranscript: string) => {
    setSelectedTemplateId(templateId);
    setFormFields((prev) => ({
      ...prev,
      ...entities,
      factual_timeline: entities.factual_timeline || rawTranscript,
    }));
    setActiveTab("drafting");
  };

  const handleGenerateDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDrafting(true);
    setDraftingProgress(8);

    let currentPct = 8;
    const progressInterval = setInterval(() => {
      // Smoothly advance through phase thresholds while backend processes
      currentPct += (90 - currentPct) * 0.16;
      setDraftingProgress(Math.min(92, Math.round(currentPct)));
    }, 280);

    try {
      const res = await fetch(`${API_BASE}/api/draft/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplateId,
          fields: formFields,
        }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setDraftingProgress(100);
      // Wait exactly 1 second before loader disappears to let user see completion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGeneratedDraft(data);
    } catch (err: any) {
      clearInterval(progressInterval);
      setDraftingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Draft generation error: " + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedDraft) return;
    try {
      const res = await fetch(`${API_BASE}/api/draft/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedDraft.title,
          draft_text: generatedDraft.draft_text,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedDraft.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert("Error downloading PDF: " + err.message);
    }
  };

  const handleAskQA = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsQaLoading(true);
    setQaProgress(8);

    let currentPct = 8;
    const progressInterval = setInterval(() => {
      // Smoothly advance through phase thresholds while backend processes
      currentPct += (90 - currentPct) * 0.16;
      setQaProgress(Math.min(92, Math.round(currentPct)));
    }, 280);

    try {
      const res = await fetch(`${API_BASE}/api/legal-qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setQaProgress(100);
      // Wait exactly 1 second before loader disappears to let user see completion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setQaAnswer(data);
    } catch (err: any) {
      clearInterval(progressInterval);
      setQaProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("QA error: " + err.message);
    } finally {
      setIsQaLoading(false);
    }
  };

  const [isTranslatingDraft, setIsTranslatingDraft] = useState(false);
  const [isTranslatingQa, setIsTranslatingQa] = useState(false);

  const handleTranslateDraft = async (targetLang: string) => {
    if (!generatedDraft?.draft_text) return;
    setIsTranslatingDraft(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: generatedDraft.draft_text,
          target_language: targetLang,
        }),
      });
      const data = await res.json();
      if (data.translated_text) {
        setGeneratedDraft((prev: any) => ({
          ...prev,
          draft_text: data.translated_text,
          translated_to: data.target_language_name,
        }));
      }
    } catch (err: any) {
      alert("Translation error: " + err.message);
    } finally {
      setIsTranslatingDraft(false);
    }
  };

  const handleTranslateQa = async (targetLang: string) => {
    if (!qaAnswer?.answer) return;
    setIsTranslatingQa(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: qaAnswer.answer,
          target_language: targetLang,
        }),
      });
      const data = await res.json();
      if (data.translated_text) {
        setQaAnswer((prev: any) => ({
          ...prev,
          answer: data.translated_text,
          translated_to: data.target_language_name,
        }));
      }
    } catch (err: any) {
      alert("Translation error: " + err.message);
    } finally {
      setIsTranslatingQa(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#16171A] text-gray-100 flex flex-col font-sans selection:bg-gray-700 selection:text-white relative overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#1F2023]/95 backdrop-blur-md border-b border-[#333333] px-4 md:px-6 py-3 flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        {/* Top Left: Brand Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E3033] border border-[#444444] flex items-center justify-center text-lg shadow-lg shadow-black/50 shrink-0">
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
        <nav className="flex items-center gap-1 bg-[#16171A] border border-[#333333] rounded-full p-1 text-xs shadow-inner overflow-x-auto max-w-[45vw] sm:max-w-none scrollbar-none">
          <button
            onClick={() => setActiveTab("voice")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "voice"
                ? "bg-white text-[#1F2023] font-bold shadow-md shadow-white/10"
                : "text-gray-400 hover:text-white hover:bg-[#2E3033]/60"
            }`}
          >
            <span>🎙️</span> {t.navVoice}
          </button>
          <button
            onClick={() => setActiveTab("drafting")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "drafting"
                ? "bg-white text-[#1F2023] font-bold shadow-md shadow-white/10"
                : "text-gray-400 hover:text-white hover:bg-[#2E3033]/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> {t.navDrafting}
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "qa"
                ? "bg-white text-[#1F2023] font-bold shadow-md shadow-white/10"
                : "text-gray-400 hover:text-white hover:bg-[#2E3033]/60"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> {t.navQa}
          </button>
          <button
            onClick={() => setActiveTab("statutes")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "statutes"
                ? "bg-white text-[#1F2023] font-bold shadow-md shadow-white/10"
                : "text-gray-400 hover:text-white hover:bg-[#2E3033]/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> {t.navStatutes}
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "demo"
                ? "bg-gradient-to-r from-gray-100 to-gray-300 text-[#1F2023] font-bold shadow-md shadow-white/10"
                : "text-gray-400 hover:text-white hover:bg-[#2E3033]/60"
            }`}
          >
            <span>⚡</span> {t.navDemo}
          </button>
        </nav>

        {/* Top Right: Translate Section & Action Button */}
        <div className="flex items-center gap-3">
          {/* Translate Section moved to Top Right */}
          <LanguageSelector />

          <div className="h-6 w-px bg-[#333333] hidden sm:block" />

          <LiquidMetalButton
            label={t.topVoiceBtn}
            onClick={() => setActiveTab("voice")}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col">
        {/* TAB 1: AI LEGAL CHATBOT SEARCH PAGE */}
        {activeTab === "voice" && (
          <VoiceAssistant onAutoFillToDrafting={handleAutoFillFromVoice} />
        )}

        {/* TAB 2: COURT DRAFTING STUDIO */}
        {activeTab === "drafting" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.draftingTitle}</h2>
              <p className="text-sm text-zinc-400">
                {t.draftingSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="lg:col-span-5 bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl">
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    {t.selectTemplateLabel}
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-[#16171A] border border-[#444444] rounded-xl p-3 text-sm text-white outline-none focus:border-[#666666] transition"
                  >
                    {templates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title}
                      </option>
                    ))}
                  </select>
                </div>

                {currentTemplate && (
                  <div className="mb-5 p-3 rounded-xl bg-[#24252A] border-l-4 border-amber-400 text-xs">
                    <span className="font-bold text-gray-200 block mb-0.5">{currentTemplate.statute}</span>
                    <p className="text-gray-400">{currentTemplate.description}</p>
                  </div>
                )}

                <form onSubmit={handleGenerateDraft} className="space-y-4">
                  <div className="space-y-3">
                    {currentTemplate?.fields?.map((f: any) => (
                      <div key={f.key}>
                        <label className="text-xs font-medium text-gray-300 block mb-1">
                          {f.label}:
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            value={formFields[f.key] || ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={f.placeholder}
                            rows={3}
                            className="w-full bg-[#16171A] border border-[#444444] rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#666666] transition"
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            value={formFields[f.key] || ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full bg-[#16171A] border border-[#444444] rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#666666] transition"
                            required
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormFields({})}
                      className="text-xs bg-[#2E3033] border-[#444444] text-gray-300 hover:bg-[#3A3A40] hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t.btnReset}
                    </Button>
                    <LiquidMetalButton
                      label={isDrafting ? t.btnSynthesizing : t.btnGenerate}
                      onClick={() => handleGenerateDraft()}
                    />
                  </div>
                </form>
              </div>

              {/* Document Sheet Viewer */}
              <div className="lg:col-span-7 bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl flex flex-col min-h-[620px]">
                <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Judicial Document View</span>
                    <h3 className="text-base font-bold text-white metallic-text">{generatedDraft?.title || t.previewTitle}</h3>
                  </div>
                  {generatedDraft && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Document Translation Bar */}
                      <div className="flex items-center gap-1 bg-[#16171A] p-1 rounded-lg border border-[#333333] text-xs">
                        <span className="text-[10px] text-gray-400 font-semibold px-1">Translate Doc:</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isTranslatingDraft}
                          onClick={() => handleTranslateDraft("hi")}
                          className="text-[11px] h-7 px-2 hover:bg-[#2E3033] text-amber-300 font-medium"
                          title="Translate court draft to Hindi"
                        >
                          {isTranslatingDraft ? "..." : "हिन्दी"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isTranslatingDraft}
                          onClick={() => handleTranslateDraft("te")}
                          className="text-[11px] h-7 px-2 hover:bg-[#2E3033] text-cyan-300 font-medium"
                          title="Translate court draft to Telugu"
                        >
                          {isTranslatingDraft ? "..." : "తెలుగు"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isTranslatingDraft}
                          onClick={() => handleTranslateDraft("ta")}
                          className="text-[11px] h-7 px-2 hover:bg-[#2E3033] text-emerald-300 font-medium"
                          title="Translate court draft to Tamil"
                        >
                          {isTranslatingDraft ? "..." : "தமிழ்"}
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedDraft.draft_text);
                          alert("Draft copied to clipboard!");
                        }}
                        className="text-xs bg-[#2E3033] border-[#444444] text-gray-200 hover:bg-[#3A3A40] hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" /> {t.btnCopy}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleDownloadPDF}
                        className="text-xs bg-white text-[#1F2023] font-bold hover:bg-gray-200"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> {t.btnExportPdf}
                      </Button>
                    </div>
                  )}
                </div>

                {isDrafting ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-full max-w-sm sm:max-w-md">
                      <ProgressiveFluxLoader
                        value={draftingProgress}
                        phases={t.draftingLoaderPhases}
                        className="gap-2.5 w-full"
                        barClassName="h-3"
                        textClassName="text-xs sm:text-sm md:text-base text-gray-200 font-semibold"
                      />
                    </div>
                  </div>
                ) : !generatedDraft ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8">
                    <FileText className="w-12 h-12 mb-3 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">{t.previewEmptyTitle}</h4>
                    <p className="text-xs max-w-sm text-gray-500">
                      {t.previewEmptyDesc}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 bg-[#16171A] border border-[#333333] rounded-xl p-6 font-mono text-xs leading-relaxed text-gray-200 overflow-y-auto max-h-[650px] shadow-inner whitespace-pre-wrap">
                    {generatedDraft.draft_text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CITIZEN RIGHTS NAVIGATOR & LEGAL QA */}
        {activeTab === "qa" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.qaTitle}</h2>
              <p className="text-sm text-gray-400">
                {t.qaSubtitle}
              </p>
            </div>

            <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-6 shadow-2xl space-y-4">
              <span className="text-xs font-semibold text-gray-300 block">{t.faqsLabel}</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => {
                    const q = "Can police arrest a woman after sunset under the new Bharatiya Nagarik Suraksha Sanhita (BNSS)?";
                    setQaQuery(q);
                    handleAskQA(q);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#2E3033] hover:bg-[#3A3A40] text-gray-300 border border-[#444444] transition"
                >
                  ⚖️ {t.faq1}
                </button>
                <button
                  onClick={() => {
                    const q = "What is the legal procedure if a cheque bounces under Section 138 of Negotiable Instruments Act?";
                    setQaQuery(q);
                    handleAskQA(q);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#2E3033] hover:bg-[#3A3A40] text-gray-300 border border-[#444444] transition"
                >
                  💳 {t.faq2}
                </button>
                <button
                  onClick={() => {
                    const q = "Who is eligible for 100% Free Legal Aid under NALSA Section 12 in India?";
                    setQaQuery(q);
                    handleAskQA(q);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#2E3033] hover:bg-[#3A3A40] text-gray-300 border border-[#444444] transition"
                >
                  🏛️ {t.faq3}
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <textarea
                  value={qaQuery}
                  onChange={(e) => setQaQuery(e.target.value)}
                  placeholder={t.qaPlaceholder}
                  rows={3}
                  className="w-full bg-[#16171A] border border-[#444444] rounded-xl p-3 text-sm text-white outline-none focus:border-[#666666] transition"
                />
                <div className="flex items-center gap-3">
                  <LiquidMetalButton
                    label={isQaLoading ? t.btnConsultingAi : t.btnConsultAi}
                    onClick={() => handleAskQA(qaQuery)}
                  />
                  <LiquidMetalButton
                    viewMode="icon"
                    onClick={() => handleAskQA(qaQuery)}
                  />
                </div>
              </div>

              {isQaLoading ? (
                <div className="mt-6 p-8 rounded-xl bg-[#16171A] border border-[#333333] flex items-center justify-center">
                  <div className="w-full max-w-sm sm:max-w-md">
                    <ProgressiveFluxLoader
                      value={qaProgress}
                      phases={t.qaLoaderPhases}
                      className="gap-2.5 w-full"
                      barClassName="h-3"
                      textClassName="text-xs sm:text-sm md:text-base text-gray-200 font-semibold"
                    />
                  </div>
                </div>
              ) : qaAnswer ? (
                <div className="mt-6 p-6 rounded-xl bg-[#16171A] border border-[#333333] space-y-3 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#333333]">
                    <span className="text-xs font-semibold text-gray-300">{t.guidanceOutputLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-[#2E3033] px-2 py-0.5 rounded-md border border-[#444444] text-xs">
                        <span className="text-[10px] text-gray-400 font-mono">Translate:</span>
                        <button
                          type="button"
                          onClick={() => handleTranslateQa("hi")}
                          disabled={isTranslatingQa}
                          className="text-[11px] text-amber-300 hover:text-white px-1 font-semibold"
                          title="Translate guidance to Hindi"
                        >
                          {isTranslatingQa ? "..." : "हिन्दी"}
                        </button>
                        <span className="text-gray-500">|</span>
                        <button
                          type="button"
                          onClick={() => handleTranslateQa("te")}
                          disabled={isTranslatingQa}
                          className="text-[11px] text-cyan-300 hover:text-white px-1 font-semibold"
                          title="Translate guidance to Telugu"
                        >
                          {isTranslatingQa ? "..." : "తెలుగు"}
                        </button>
                        <span className="text-gray-500">|</span>
                        <button
                          type="button"
                          onClick={() => handleTranslateQa("ta")}
                          disabled={isTranslatingQa}
                          className="text-[11px] text-emerald-300 hover:text-white px-1 font-semibold"
                          title="Translate guidance to Tamil"
                        >
                          {isTranslatingQa ? "..." : "தமிழ்"}
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-400">{qaAnswer.engine}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {qaAnswer.answer}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB 4: STATUTORY COMPENDIUM */}
        {activeTab === "statutes" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.compendiumTitle}</h2>
              <p className="text-sm text-gray-400">
                {t.compendiumSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(statutoryTopics).map(([key, topic]: [string, any]) => (
                <div key={key} className="bg-[#1F2023] border border-[#333333] hover:border-[#555555] rounded-2xl p-6 space-y-3 shadow-xl transition-all">
                  <h3 className="text-base font-bold text-white metallic-text">{topic.title}</h3>
                  <span className="text-xs font-semibold text-gray-300 block">{topic.statute}</span>
                  <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
                    {topic.key_points?.map((pt: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STANDALONE SHADER & BUTTON SHOWCASE */}
        {activeTab === "demo" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight metallic-text">{t.showcaseTitle}</h2>
              <p className="text-sm text-gray-400">
                {t.showcaseSubtitle}
              </p>
            </div>

            {/* Liquid Metal Button Showcase */}
            <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 space-y-6 shadow-2xl">
              <div className="border-b border-[#333333] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Liquid Metal Material Shader</span>
                <h3 className="text-lg font-bold text-white metallic-text">Interactive Liquid Metal Buttons (Text & Icon Modes)</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features dynamic procedural liquid metal fragment shaders (`@paper-design/shaders`), 3D perspective depth, specular highlights, and touch ripple physics.
                </p>
              </div>

              {/* Exact Demo Component requested */}
              <div className="p-8 rounded-xl bg-[#16171A] border border-[#333333] flex items-center justify-center">
                <LiquidMetalButtonDemo />
              </div>
            </div>

            {/* Progressive Flux Loader Showcase */}
            <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 space-y-6 shadow-2xl">
              <div className="border-b border-[#333333] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Framer Motion Kinetic Physics</span>
                <h3 className="text-lg font-bold text-white metallic-text">Progressive Flux Loader (3D Letter Fly-In & Sweeping Glow)</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features 3D perspective fly-in phase labels, character-staggered kinetic motion, specular sheen reflection, and accessible progressbar roles.
                </p>
              </div>

              {/* Exact Demo Component requested */}
              <div className="p-8 rounded-xl bg-[#16171A] border border-[#333333] flex items-center justify-center">
                <ProgressiveFluxLoaderDemo />
              </div>
            </div>

            {/* 3D Voice Neural Orb Showcase */}
            <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 space-y-6 shadow-2xl">
              <div className="border-b border-[#333333] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">OGL 3D Shader Sphere</span>
                <h3 className="text-lg font-bold text-white metallic-text">Voice Powered Neural Orb Standalone</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features WebGL Ray-marched procedural noise and Web Audio RMS microphone listener.
                </p>
              </div>

              <div className="rounded-xl bg-[#16171A] border border-[#333333] p-4">
                <VoicePoweredOrbPage />
              </div>
            </div>

            {/* AI Prompt Box Showcase */}
            <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 space-y-6 shadow-2xl">
              <div className="border-b border-[#333333] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Radix UI + Lucide + Micro-interactions</span>
                <h3 className="text-lg font-bold text-white metallic-text">AI Prompt Box Standalone Demo (Radial Gradient)</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features Search / Think / Canvas animated pills, Radix Tooltip popups, image dropzone, expandable textarea, and reactive action buttons.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#333333]">
                <PromptInputBoxDemo />
              </div>
            </div>

            {/* Dotted Surface Three.js Wave Showcase */}
            <div className="bg-[#1F2023] border border-[#333333] rounded-2xl p-8 space-y-6 shadow-2xl">
              <div className="border-b border-[#333333] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Three.js WebGL Particle System</span>
                <h3 className="text-lg font-bold text-white metallic-text">Dotted Surface Wave (Smoothed Motion & Dark Luminescence)</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features 2,400 particle buffer points with dynamic harmonic sine undulation, dark ambient fog, and delta-time motion smoothing.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#333333]">
                <DottedSurfaceDemo />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
