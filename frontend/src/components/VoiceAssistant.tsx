import React, { useState, useEffect, useRef } from "react";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Scale,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  FileText,
  X,
  MessageSquare,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  isVoiceInput?: boolean;
  timestamp: string;
  intent?: string;
  intentTitle?: string;
  confidenceScore?: number;
  statutes?: string[];
  spokenResponse?: string;
  templateId?: string | null;
  extractedEntities?: Record<string, any>;
  engine?: string;
  attachments?: { name: string; type: string; size: number }[];
}

interface VoiceAssistantProps {
  onAutoFillToDrafting?: (templateId: string, fields: Record<string, any>, transcript: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onAutoFillToDrafting }) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
  const { t, languageInfo, language } = useLanguage();

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Voice recording & Modal state
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  // TTS audio playback state
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const speechRecognizerRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Initialize Speech Recognition when language changes
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = languageInfo.speechCode;

      recognizer.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        if (text) {
          setLiveTranscript(text);
        }
      };

      recognizer.onerror = (e: any) => {
        console.warn("Speech recognition error:", e.error);
        if (e.error === "not-allowed") {
          alert("Microphone permission was not granted. Please enable it in browser settings or use the 1-click dispute buttons!");
        }
        setIsRecording(false);
      };

      recognizer.onend = () => {
        setIsRecording(false);
      };

      speechRecognizerRef.current = recognizer;
    }

    return () => {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (_) {}
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [languageInfo.speechCode]);

  // Speech Synthesis Speaker
  const speakResponse = (text: string, messageId: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean text for speech
    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/₹/g, "rupees ");

    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = languageInfo.speechCode;
    u.rate = 0.96;
    u.pitch = 1.0;

    u.onstart = () => setCurrentlySpeakingId(messageId);
    u.onend = () => setCurrentlySpeakingId(null);
    u.onerror = () => setCurrentlySpeakingId(null);

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
  };

  // Open Voice Mic Modal and begin listening
  const handleOpenMic = () => {
    setLiveTranscript("");
    setIsMicModalOpen(true);
    setIsRecording(true);

    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.lang = languageInfo.speechCode;
        speechRecognizerRef.current.start();
      } catch (err) {
        console.warn("Speech recognition already active or error:", err);
      }
    }
  };

  // Close Mic Modal and submit spoken voice query
  const handleStopAndSubmitVoice = () => {
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    setIsMicModalOpen(false);

    const queryToSend = liveTranscript.trim();
    if (queryToSend) {
      handleSubmitQuery(queryToSend, true);
    }
  };

  // Cancel Mic modal without sending
  const handleCancelMic = () => {
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    setIsMicModalOpen(false);
    setLiveTranscript("");
  };

  // Main Submit Handler (Dispatches query and coordinates speech mode)
  const handleSubmitQuery = async (queryText: string, isVoice: boolean = false, files?: File[]) => {
    if (!queryText.trim() && (!files || files.length === 0)) return;
    if (isProcessing) return;

    const attachedFiles = files?.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: queryText || (files && files.length > 0 ? `[Attached file: ${files.map(f => f.name).join(", ")}]` : ""),
      isVoiceInput: isVoice,
      attachments: attachedFiles,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);
    setLoadingProgress(8); // Phase 1: capturing / analyzing query

    // Smoothly progress through realistic stages while awaiting response
    let currentPct = 8;
    const progressInterval = setInterval(() => {
      // Smooth asymptotic advance towards 90%
      currentPct += (90 - currentPct) * 0.16;
      setLoadingProgress(Math.min(92, Math.round(currentPct)));
    }, 250);

    try {
      // 1. Query Voice NLP pipeline for intent, entities & spoken advice
      const nlpPromise = fetch(`${API_BASE}/api/voice/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: queryText }),
      }).then((res) => (res.ok ? res.json() : null)).catch(() => null);

      // 2. Query Legal QA engine for statutory guidance
      const qaPromise = fetch(`${API_BASE}/api/legal-qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      }).then((res) => (res.ok ? res.json() : null)).catch(() => null);

      const [nlpData, qaData] = await Promise.all([nlpPromise, qaPromise]);
      clearInterval(progressInterval);

      // SYNC ANIMATION: Response received -> glide smoothly to 100% (legal intelligence ready)
      setLoadingProgress(100);

      // CRITICAL USER REQUIREMENT:
      // "the text will be appar fully and diass appear in 1 seacond dalay."
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMsgId = `bot-${Date.now()}`;
      const statutes = nlpData?.statutory_references || qaData?.relevant_statutes || [];
      const spokenAdvice = nlpData?.spoken_response || qaData?.answer?.slice(0, 300) || "I have analyzed your legal issue under Indian law.";
      
      const responseText = qaData?.answer || nlpData?.spoken_response || "Your query has been analyzed under the Indian legal framework.";

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: "assistant",
        text: responseText,
        isVoiceInput: isVoice,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intent: nlpData?.detected_intent,
        intentTitle: nlpData?.intent_title,
        confidenceScore: nlpData?.confidence_score,
        statutes: statutes,
        spokenResponse: spokenAdvice,
        templateId: nlpData?.auto_fill_template_id,
        extractedEntities: nlpData?.extracted_entities,
        engine: qaData?.engine || nlpData?.engine || "Nyaya AI Engine",
      };

      // Disappear loading animation after the 1-second delay and append assistant message
      setIsProcessing(false);
      setMessages((prev) => [...prev, assistantMsg]);

      // CRITICAL REQUIREMENT:
      // "And the responce in speek mode will activate when the user gives the input in voice."
      if (isVoice && spokenAdvice) {
        speakResponse(spokenAdvice, assistantMsgId);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsProcessing(false);

      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "We encountered an error analyzing your legal issue. Please try again or check your connectivity.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery(inputText, false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto w-full relative">
      {messages.length === 0 ? (
        /* Middle of the web page: Only "Ask, speak, or search any Indian legal issue" and the text input box */
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-3xl mx-auto my-auto text-center animate-in fade-in duration-300">
          <h2
            style={{ fontFamily: "'Roboto', sans-serif" }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-8 max-w-2xl text-center leading-tight font-roboto roboto-gradient-headline"
          >
            {language === "hi"
              ? "अपनी कानूनी समस्या बोलें या खोजें"
              : language === "te"
              ? "మీ చట్టపరమైన సమస్యను మాట్లాడండి లేదా శోధించండి"
              : "Ask, speak, or search any Indian legal issue"}
          </h2>

          <div className="w-full space-y-3">
            <PromptInputBox
              isLoading={isProcessing}
              placeholder={
                language === "hi"
                  ? "कानूनी प्रश्न पूछें, धारा खोजें या माइक दबाएं... (Enter दबाएं)"
                  : language === "te"
                  ? "చట్టపరమైన ప్రశ్నను అడగండి లేదా మైక్ నొక్కండి... (Enter to send)"
                  : "Ask any Indian legal question, dispute, or notice request... (Enter to send)"
              }
              onSend={(formattedMsg, files) => handleSubmitQuery(formattedMsg, false, files)}
              onMicClick={handleOpenMic}
              showSearchToggle={false}
              showThinkToggle={false}
              showCanvasToggle={false}
              className="border-[#444444] bg-[#1F2023] shadow-2xl"
            />
            <div className="flex items-center justify-center px-2 text-[11px] text-gray-500 font-mono">
              <span>🌐 {languageInfo.nativeName} ({languageInfo.speechCode}) • Voice queries speak back automatically</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Session Bar with Reset Button */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-[#2A2B30] bg-[#16171A]/80">
            <span className="text-xs text-gray-400 font-mono">
              Legal Session ({messages.length} {messages.length === 1 ? "query" : "queries"})
            </span>
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-[#2E3033] hover:bg-[#3A3A40] border border-[#444444] transition flex items-center gap-1.5"
              title="Start a new search query"
            >
              <RotateCcw className="w-3 h-3" />
              <span>New Search</span>
            </button>
          </div>

          {/* ── Chat Messages Container ───────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">

        {/* Message Stream */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-in fade-in duration-200`}
          >
            {/* User Message Bubble */}
            {msg.sender === "user" ? (
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 bg-[#2A2B30] border border-[#444444] shadow-xl text-gray-100">
                <div className="flex items-center gap-2 mb-1.5 text-[10px] text-gray-400">
                  {msg.isVoiceInput ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      <Mic className="w-2.5 h-2.5 animate-pulse" />
                      Voice Input
                    </span>
                  ) : (
                    <span className="text-gray-400 font-medium">Text Query</span>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.text}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1 border-t border-[#3A3B40]">
                    {msg.attachments.map((att, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#1F2023] border border-[#444444] px-2.5 py-1 rounded-lg text-gray-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate max-w-[180px] font-medium">{att.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {(att.size / 1024).toFixed(0)} KB
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Assistant Response Bubble */
              <div className="max-w-[95%] sm:max-w-[85%] bg-[#1F2023] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.24)] border border-[#333333] space-y-4">
                {/* Header with Avatar, Intent badge, & Audio Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#333333]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2E3033] border border-[#444444] flex items-center justify-center text-sm shadow-sm">
                      ⚖️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">
                        {msg.intentTitle || "Nyaya Legal Analysis"}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">{msg.engine}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speak / Stop Audio Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentlySpeakingId === msg.id) {
                          stopAudio();
                        } else {
                          speakResponse(msg.spokenResponse || msg.text, msg.id);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                        currentlySpeakingId === msg.id
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                          : "bg-[#2E3033] hover:bg-[#3A3A40] text-gray-200 border-[#444444]"
                      }`}
                      title={currentlySpeakingId === msg.id ? "Stop Speaking" : "Play Spoken Voice Advice"}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Play Audio</span>
                        </>
                      )}
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="p-1.5 rounded-lg bg-[#2E3033] hover:bg-[#3A3A40] text-gray-400 hover:text-white border border-[#444444] transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Spoken Advice Highlight Box */}
                {msg.spokenResponse && (
                  <div className="p-3.5 rounded-xl bg-[#16171A] border border-[#333333] text-xs text-gray-200 leading-relaxed flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5">📢</span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                        Conversational Spoken Guidance
                      </span>
                      <p>{msg.spokenResponse}</p>
                    </div>
                  </div>
                )}

                {/* Main Legal Analysis Text */}
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Statutory Pills */}
                {msg.statutes && msg.statutes.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                      Statutory Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.statutes.map((statute, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#2E3033] border border-[#444444] text-gray-200"
                        >
                          ⚖️ {statute}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bridge to Court Drafter */}
                {msg.templateId && onAutoFillToDrafting && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#16171A] border border-[#333333] flex flex-wrap items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-white block">Court-Ready Indian Legal Draft Available</span>
                        <span className="text-[11px] text-gray-400">
                          Auto-populate formal court notice with these details.
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onAutoFillToDrafting(msg.templateId!, msg.extractedEntities || {}, msg.text)}
                      className="text-xs bg-white text-black font-semibold hover:bg-gray-200 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Auto-Fill Drafter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading / Synthesizing Indicator */}
        {isProcessing && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-[#2E3033] border border-[#444444] flex items-center justify-center text-sm shrink-0 shadow-md">
              ⚖️
            </div>
            <div className="bg-[#1F2023] rounded-2xl p-4 sm:p-5 border border-[#333333] shadow-2xl w-full max-w-sm sm:max-w-md">
              <ProgressiveFluxLoader
                value={loadingProgress}
                phases={t.voiceLoaderPhases}
                className="gap-2.5 w-full"
                barClassName="h-3"
                textClassName="text-xs sm:text-sm font-semibold text-gray-200 tracking-wide"
              />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ── Bottom AI Prompt Box (Theme: #1F2023 with Search, Think, Canvas removed) ── */}
      <div className="p-3 sm:p-4 border-t border-[#333333] bg-[#16171A]/95 backdrop-blur-md sticky bottom-0 z-20">
        <div className="w-full max-w-4xl mx-auto space-y-2">
          <PromptInputBox
            isLoading={isProcessing}
            placeholder={
              language === "hi"
                ? "कानूनी प्रश्न पूछें, धारा खोजें या माइक दबाएं... (Enter दबाएं)"
                : language === "te"
                ? "చట్టపరమైన ప్రశ్నను అడగండి లేదా మైక్ నొక్కండి... (Enter to send)"
                : "Ask any Indian legal question, dispute, or notice request... (Enter to send)"
            }
            onSend={(formattedMsg, files) => handleSubmitQuery(formattedMsg, false, files)}
            onMicClick={handleOpenMic}
            showSearchToggle={false}
            showThinkToggle={false}
            showCanvasToggle={false}
            className="border-[#444444] bg-[#1F2023]"
          />

          <div className="flex flex-wrap items-center justify-between px-2 text-[10px] text-gray-400 font-mono">
            <span>
              🌐 {languageInfo.nativeName} ({languageInfo.speechCode}) • Voice queries speak back automatically
            </span>
            <span>BNS • BNSS • CPA 2019 • NI Act 1881</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ── 3D Voice Orb Modal (Appears when user hits Mic option) ───── */}
      {isMicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1F2023] border border-[#444444] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close / Cancel Button */}
            <button
              type="button"
              onClick={handleCancelMic}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2E3033] border border-[#444444] text-gray-400 hover:text-white transition"
              title="Close Voice Assistant"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Language & Listening Status Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Listening in {languageInfo.nativeName} ({languageInfo.speechCode})</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white metallic-text">
                Speak your Legal Dispute
              </h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Microphone is active. Speak clearly about your legal issue.
              </p>
            </div>

            {/* High-Performance Voice Ripple Visualizer */}
            <div className="w-56 h-56 relative rounded-full flex items-center justify-center p-4 bg-[#16171A] border border-[#333333] shadow-2xl overflow-hidden" aria-label="Microphone activity indicator">
              <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 ${voiceDetected || isRecording ? "bg-emerald-500/20 scale-105 shadow-lg shadow-emerald-500/30" : "bg-blue-500/10"}`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/50" : "bg-[#2E3033] text-gray-300"}`}>
                  {isRecording ? (
                    <Mic className="w-12 h-12 animate-pulse" aria-hidden="true" />
                  ) : (
                    <MicOff className="w-12 h-12 text-gray-500" aria-hidden="true" />
                  )}
                </div>
              </div>
              {(voiceDetected || isRecording) && (
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 pointer-events-none animate-ping" />
              )}
            </div>

            {/* Real-time Spoken Transcript Box */}
            <div className="w-full bg-[#16171A] border border-[#333333] rounded-xl p-3 min-h-[60px] text-xs text-gray-200 shadow-inner flex items-center justify-center">
              {liveTranscript ? (
                <p className="font-sans leading-relaxed text-gray-100">{liveTranscript}</p>
              ) : (
                <span className="text-gray-500 italic">
                  Listening... Your spoken words will appear here in real-time.
                </span>
              )}
            </div>

            {/* 1-Click Simulation Chips inside Modal for Easy Testing */}
            <div className="w-full space-y-1.5 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-center">
                Or click a sample spoken dispute:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLiveTranscript(t.simulations.salary.text)}
                  className="px-2.5 py-1 rounded-full bg-[#2E3033] border border-[#444444] text-gray-300 hover:text-white hover:border-[#555555] transition"
                >
                  💼 Salary Dispute
                </button>
                <button
                  type="button"
                  onClick={() => setLiveTranscript(t.simulations.cheque.text)}
                  className="px-2.5 py-1 rounded-full bg-[#2E3033] border border-[#444444] text-gray-300 hover:text-white hover:border-[#555555] transition"
                >
                  💳 Cheque Bounce
                </button>
                <button
                  type="button"
                  onClick={() => setLiveTranscript(t.simulations.consumer.text)}
                  className="px-2.5 py-1 rounded-full bg-[#2E3033] border border-[#444444] text-gray-300 hover:text-white hover:border-[#555555] transition"
                >
                  🛒 Warranty Refused
                </button>
              </div>
            </div>

            {/* Complete & Submit Action Button */}
            <div className="flex flex-wrap items-center gap-4 pt-3 w-full justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelMic}
                className="h-[46px] px-6 rounded-full text-xs font-semibold bg-[#2E3033] border-[#444444] text-gray-300 hover:bg-[#3A3A40] hover:text-white transition shadow-md shrink-0"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleStopAndSubmitVoice}
                className="h-[46px] px-8 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 shrink-0"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Complete & Send Dispute</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
