import React, { useState, useRef, useEffect } from "react";
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from "@/context/LanguageContext";
import { Languages, Check, ChevronDown } from "lucide-react";

export function LanguageSelector() {
  const { language, languageInfo, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5" ref={dropdownRef}>
      {/* Primary Translate Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F2023] hover:bg-[#2A2B30] text-gray-100 border border-[#444444] shadow-md shadow-black/40 text-xs font-medium transition-all duration-200 hover:border-[#555555] focus:outline-none"
          title="Translate page into Hindi, Telugu, and other Indian languages"
        >
          <Languages className="w-3.5 h-3.5 text-gray-300" />
          <span className="font-bold text-white tracking-wide">
            Translate:
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#2E3033] border border-[#444444] text-[11px] text-gray-200 font-semibold">
            {languageInfo.nativeName}
          </span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Multilingual Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1F2023] border border-[#333333] shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3.5 py-1.5 border-b border-[#333333] mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                🇮🇳 Translate into Indian Languages
              </span>
              <span className="text-[10px] text-gray-500 font-mono">10 Languages</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-0.5 px-1.5 scrollbar-thin scrollbar-thumb-[#444444]">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all text-left ${
                      isSelected
                        ? "bg-white text-[#1F2023] font-bold shadow-md shadow-white/10"
                        : "text-gray-300 hover:bg-[#2E3033] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`block font-semibold ${isSelected ? "text-[#1F2023]" : "text-white"}`}>
                            {lang.nativeName}
                          </span>
                          <span className={`text-[10px] ${isSelected ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                            ({lang.name})
                          </span>
                        </div>
                        <span className={`text-[9px] ${isSelected ? "text-gray-700" : "text-gray-500"}`}>
                          Voice code: {lang.speechCode}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#1F2023] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Direct 1-Click Translation Action Button for Hindi & EN */}
      <div className="flex items-center gap-1 bg-[#16171A] p-0.5 rounded-full border border-[#333333]">
        <button
          type="button"
          onClick={() => handleSelect("hi")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            language === "hi"
              ? "bg-white text-[#1F2023] font-bold shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-[#2E3033]"
          }`}
          title="Translate page to Hindi (हिन्दी)"
        >
          हिन्दी (Hindi)
        </button>
        <button
          type="button"
          onClick={() => handleSelect("en")}
          className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-all ${
            language === "en"
              ? "bg-white text-[#1F2023] font-bold shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-[#2E3033]"
          }`}
          title="Translate page to English"
        >
          EN
        </button>
      </div>
    </div>
  );
}

export default LanguageSelector;
