"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode = "en" | "hi" | "te" | "ta" | "kn" | "bn" | "mr" | "gu" | "ml" | "pa";

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechCode: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", speechCode: "en-IN", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speechCode: "hi-IN", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechCode: "te-IN", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechCode: "ta-IN", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", speechCode: "kn-IN", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", speechCode: "bn-IN", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", speechCode: "mr-IN", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", speechCode: "gu-IN", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", speechCode: "ml-IN", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", speechCode: "pa-IN", flag: "🇮🇳" },
];

export interface SpokenSimulations {
  salary: { title: string; text: string };
  cheque: { title: string; text: string };
  consumer: { title: string; text: string };
  rti: { title: string; text: string };
}

export interface LoaderPhaseItem {
  at: number;
  label: string;
}

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  navVoice: string;
  navDrafting: string;
  navQa: string;
  navStatutes: string;
  navDemo: string;
  topVoiceBtn: string;

  // Voice Assistant
  voiceTitle: string;
  voiceSubtitle: string;
  simulationsLabel: string;
  simulations: SpokenSimulations;
  orbLabel: string;
  voiceActive: string;
  voiceIdle: string;
  voiceListeningHeadline: string;
  voiceIdleHeadline: string;
  voiceListeningDesc: string;
  voiceIdleDesc: string;
  btnStartVoice: string;
  btnStopVoice: string;
  liveTranscriptLabel: string;
  transcriptPlaceholder: string;
  btnRunNlp: string;
  btnAnalyzingNlp: string;
  intelTag: string;
  intelHeading: string;
  btnPlayAudio: string;
  btnStopAudio: string;
  noDisputeTitle: string;
  noDisputeDesc: string;
  classifiedCategoryLabel: string;
  confidenceSuffix: string;
  spokenAdviceLabel: string;
  statutesLabel: string;
  nerLabel: string;
  bridgeTitle: string;
  bridgeDesc: string;
  bridgeBtn: string;
  voiceLoaderPhases: LoaderPhaseItem[];

  // Drafting
  draftingTitle: string;
  draftingSubtitle: string;
  selectTemplateLabel: string;
  btnReset: string;
  btnGenerate: string;
  btnSynthesizing: string;
  previewTitle: string;
  btnCopy: string;
  btnExportPdf: string;
  previewEmptyTitle: string;
  previewEmptyDesc: string;
  draftingLoaderPhases: LoaderPhaseItem[];

  // Rights Navigator (QA)
  qaTitle: string;
  qaSubtitle: string;
  faqsLabel: string;
  faq1: string;
  faq2: string;
  faq3: string;
  qaPlaceholder: string;
  btnConsultAi: string;
  btnConsultingAi: string;
  guidanceOutputLabel: string;
  qaLoaderPhases: LoaderPhaseItem[];

  // Compendium
  compendiumTitle: string;
  compendiumSubtitle: string;

  // Showcase
  showcaseTitle: string;
  showcaseSubtitle: string;
}

const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "NyayaSahayak",
    appSubtitle: "AI Legal Assistance • Liquid Metal Neural Suite",
    navVoice: "Nyaya Vani (Voice Orb)",
    navDrafting: "Court Drafter",
    navQa: "Rights Navigator",
    navStatutes: "Compendium",
    navDemo: "Shader Showcase",
    topVoiceBtn: "Voice Consult",

    voiceTitle: "🎙️ Voice Legal Assistant (Nyaya Vani)",
    voiceSubtitle: "Speak your legal dispute. The 3D WebGL neural orb reacts dynamically to your voice while Google Gemini extracts legal intents and maps Indian statutes.",
    simulationsLabel: "Spoken Simulations:",
    simulations: {
      salary: {
        title: "💼 'Withheld 2 Months Salary'",
        text: "My employer NextGen Cloud Labs in Bengaluru has withheld my salary for the last two months amounting to 2 lakh 85 thousand rupees after my resignation. HR is ignoring my emails."
      },
      cheque: {
        title: "💳 'Bounced Cheque of ₹6.5 Lakhs'",
        text: "A business client Sanjay Singhal from Delhi issued me an ICICI bank cheque of 6 lakh 50 thousand rupees which bounced due to funds insufficient on 12th January."
      },
      consumer: {
        title: "🛒 'Defective Refrigerator Warranty Refused'",
        text: "I purchased a smart double-door refrigerator for 72 thousand rupees from an online store and it stopped cooling within 10 days. The company is refusing replacement or refund."
      },
      rti: {
        title: "🔍 'RTI for Municipal Road Tender'",
        text: "The municipal corporation in Gurugram awarded a road repair tender in Ward 12, but no work was done. I need certified copies of the tender contract and expenses under RTI."
      }
    },
    orbLabel: "3D Neural Orb",
    voiceActive: "Voice Active",
    voiceIdle: "Awaiting Input",
    voiceListeningHeadline: "Listening to your legal dispute...",
    voiceIdleHeadline: "Speak Naturally in Any Indian Dialect",
    voiceListeningDesc: "Voice is being analyzed. Click button or speak naturally.",
    voiceIdleDesc: "Click below to begin or test the liquid metal controls.",
    btnStartVoice: "Start Voice Consult",
    btnStopVoice: "Stop Voice",
    liveTranscriptLabel: "Live Spoken Transcript:",
    transcriptPlaceholder: "Your spoken words will appear here... (You can also type or edit)",
    btnRunNlp: "Run NLP Analysis",
    btnAnalyzingNlp: "Analyzing...",
    intelTag: "Legal Intelligence Suite",
    intelHeading: "NLP Extraction & Statutory Remedies",
    btnPlayAudio: "Play Guidance",
    btnStopAudio: "Stop Audio",
    noDisputeTitle: "No Spoken Dispute Analyzed Yet",
    noDisputeDesc: "Speak into the 3D Voice Orb or click one of the 1-click simulations to see our NLP pipeline classify your dispute and extract statutory sections.",
    classifiedCategoryLabel: "Classified Dispute Category",
    confidenceSuffix: "% NLP Confidence",
    spokenAdviceLabel: "Conversational Spoken Advice:",
    statutesLabel: "Applicable Indian Statutes & Penal Provisions:",
    nerLabel: "Extracted Legal Entities (NER):",
    bridgeTitle: "Court-Ready Indian Legal Notice",
    bridgeDesc: "Transfer extracted entities directly into the formal Indian court template.",
    bridgeBtn: "Auto-Fill Drafter",
    voiceLoaderPhases: [
      { at: 0, label: "capturing speech audio" },
      { at: 25, label: "acoustic transcription" },
      { at: 55, label: "extracting indian statutes" },
      { at: 80, label: "synthesizing advocate advice" },
      { at: 100, label: "legal intelligence ready" },
    ],

    draftingTitle: "📜 Automated Legal Drafting Studio",
    draftingSubtitle: "Generate advocate-level, court-ready Indian legal notices, consumer complaints, and RTI applications.",
    selectTemplateLabel: "Select Document Template:",
    btnReset: "Reset",
    btnGenerate: "Generate Draft",
    btnSynthesizing: "Synthesizing...",
    previewTitle: "Document Preview",
    btnCopy: "Copy",
    btnExportPdf: "Export PDF",
    previewEmptyTitle: "Court Document Sheet Awaiting Generation",
    previewEmptyDesc: "Fill the statutory details on the left, or use the Nyaya Vani Voice Orb to automatically extract and populate these fields.",
    draftingLoaderPhases: [
      { at: 0, label: "verifying statutory templates" },
      { at: 30, label: "formatting high court clauses" },
      { at: 65, label: "structuring factual timeline" },
      { at: 85, label: "finalizing legal notice" },
      { at: 100, label: "draft complete" },
    ],

    qaTitle: "🧭 Citizen Rights Navigator",
    qaSubtitle: "Ask questions about Indian law, police powers, bail, consumer disputes, tenant rights, and employment contracts.",
    faqsLabel: "Frequently Asked Queries:",
    faq1: "⚖️ Arrest of Women after Sunset (BNSS)",
    faq2: "💳 Cheque Dishonour Procedure (Sec 138 NI Act)",
    faq3: "🏛️ NALSA Free Legal Aid Eligibility",
    qaPlaceholder: "Describe your legal issue (e.g., 'Landlord refusing to refund deposit in Bengaluru...')",
    btnConsultAi: "Consult AI",
    btnConsultingAi: "Consulting...",
    guidanceOutputLabel: "Guidance Output",
    qaLoaderPhases: [
      { at: 0, label: "indexing citizen dispute" },
      { at: 35, label: "cross-referencing indian statutes" },
      { at: 70, label: "formulating rights guidance" },
      { at: 100, label: "guidance prepared" },
    ],

    compendiumTitle: "🏛️ Indian Statutory Compendium",
    compendiumSubtitle: "Key rights, statutes, and procedural remedies under the Indian legal framework.",

    showcaseTitle: "⚡ Shader & Micro-Interactions Showcase",
    showcaseSubtitle: "Explore the WebGL shaders and physics micro-animations powering NyayaSahayak."
  },

  hi: {
    appName: "न्यायसहायक",
    appSubtitle: "एआई कानूनी सहायता • लिक्विड मेटल न्यूरल सूट",
    navVoice: "न्याय वाणी (वॉइस ऑर्ब)",
    navDrafting: "कोर्ट ड्राफ्टर",
    navQa: "अधिकार मार्गदर्शक",
    navStatutes: "कानून संग्रह",
    navDemo: "शेडर लैब",
    topVoiceBtn: "वॉइस परामर्श",

    voiceTitle: "🎙️ वॉइस कानूनी सहायक (न्याय वाणी)",
    voiceSubtitle: "अपनी कानूनी समस्या बोलकर बताएं। 3D वेबजीएल न्यूरल ऑर्ब आपकी आवाज पर प्रतिक्रिया देगा और एआई भारतीय कानूनों का विश्लेषण करेगा।",
    simulationsLabel: "एक-क्लिक बोली गई सिमुलेशन:",
    simulations: {
      salary: {
        title: "💼 '2 महीने का वेतन रुका हुआ'",
        text: "बेंगलुरु में मेरे नियोक्ता नेक्स्टजेन क्लाउड लैब्स ने इस्तीफे के बाद मेरे 2 लाख 85 हजार रुपये के पिछले दो महीने के वेतन को रोक लिया है। एचआर मेरे ईमेल का जवाब नहीं दे रहा है।"
      },
      cheque: {
        title: "💳 '₹6.5 लाख का चेक बाउंस'",
        text: "दिल्ली के व्यापारी संजय सिंघल ने मुझे 6 लाख 50 हजार रुपये का आईसीआईसीआई बैंक चेक दिया, जो 12 जनवरी को खाते में अपर्याप्त धनराशि के कारण बाउंस हो गया।"
      },
      consumer: {
        title: "🛒 'खराब फ्रिज वारंटी से इंकार'",
        text: "मैंने ऑनलाइन स्टोर से 72 हजार रुपये का स्मार्ट डबल-डोर रेफ्रिजरेटर खरीदा और 10 दिनों में ही इसने ठंडा करना बंद कर दिया। कंपनी इसे बदलने या रिफंड देने से मना कर रही है।"
      },
      rti: {
        title: "🔍 'सड़क टेंडर हेतु आरटीआई'",
        text: "गुरुग्राम नगर निगम ने वार्ड 12 में सड़क मरम्मत का टेंडर जारी किया, लेकिन कोई काम नहीं हुआ। मुझे आरटीआई के तहत टेंडर अनुबंध और खर्च की प्रमाणित प्रतियां चाहिए।"
      }
    },
    orbLabel: "3D न्यूरल ऑर्ब",
    voiceActive: "आवाज सक्रिय",
    voiceIdle: "प्रतीक्षारत",
    voiceListeningHeadline: "आपकी कानूनी समस्या सुन रहे हैं...",
    voiceIdleHeadline: "अपनी भाषा या बोली में सहजता से बोलें",
    voiceListeningDesc: "आवाज का विश्लेषण जारी है। बोलने के बाद बटन दबाएं।",
    voiceIdleDesc: "शुरू करने के लिए नीचे बटन पर क्लिक करें।",
    btnStartVoice: "वॉइस परामर्श शुरू करें",
    btnStopVoice: "रोकें",
    liveTranscriptLabel: "लाइव बोली गई ट्रांसक्रिप्ट:",
    transcriptPlaceholder: "आपके बोले गए शब्द यहाँ दिखाई देंगे... (आप लिख या संपादित भी कर सकते हैं)",
    btnRunNlp: "एनएलपी विश्लेषण चलाएं",
    btnAnalyzingNlp: "विश्लेषण जारी...",
    intelTag: "कानूनी बुद्धिमत्ता सूट",
    intelHeading: "एनएलपी निष्कर्षण और कानूनी उपचार",
    btnPlayAudio: "सलाह सुनें",
    btnStopAudio: "ऑडियो रोकें",
    noDisputeTitle: "अभी तक कोई मामला विश्लेषित नहीं हुआ",
    noDisputeDesc: "3D वॉइस ऑर्ब में बोलें या किसी सिमुलेशन पर क्लिक करके एआई द्वारा कानूनी धाराओं का विश्लेषण देखें।",
    classifiedCategoryLabel: "वर्गीकृत कानूनी श्रेणी",
    confidenceSuffix: "% एनएलपी सटीकता",
    spokenAdviceLabel: "बातचीत के रूप में कानूनी सलाह:",
    statutesLabel: "लागू भारतीय कानून और दंडात्मक धाराएं:",
    nerLabel: "निकाली गई कानूनी इकाइयाँ (NER):",
    bridgeTitle: "न्यायालय हेतु तैयार कानूनी नोटिस",
    bridgeDesc: "निकाले गए विवरण सीधे औपचारिक भारतीय अदालती प्रारूप में स्थानांतरित करें।",
    bridgeBtn: "ड्राफ्टर में भरें",
    voiceLoaderPhases: [
      { at: 0, label: "ध्वनि रिकॉर्ड हो रही है" },
      { at: 25, label: "वाक् ट्रांसक्रिप्शन जारी" },
      { at: 55, label: "भारतीय कानून विश्लेषण" },
      { at: 80, label: "अधिवक्ता सलाह तैयार" },
      { at: 100, label: "कानूनी रिपोर्ट तैयार" },
    ],

    draftingTitle: "📜 स्वचालित कानूनी प्रारूपण स्टूडियो",
    draftingSubtitle: "अधिवक्ता-स्तरीय भारतीय कानूनी नोटिस, उपभोक्ता शिकायतें और आरटीआई आवेदन तैयार करें।",
    selectTemplateLabel: "दस्तावेज़ प्रारूप चुनें:",
    btnReset: "रीसेट",
    btnGenerate: "ड्राफ्ट बनाएं",
    btnSynthesizing: "तैयार हो रहा है...",
    previewTitle: "दस्तावेज़ पूर्वावलोकन",
    btnCopy: "कॉपी करें",
    btnExportPdf: "पीडीएफ निर्यात",
    previewEmptyTitle: "दस्तावेज़ निर्माण की प्रतीक्षा में",
    previewEmptyDesc: "बाईं ओर विवरण भरें या वॉइस ऑर्ब द्वारा स्वतः जानकारी प्राप्त करें।",
    draftingLoaderPhases: [
      { at: 0, label: "कानूनी प्रारूप सत्यापन" },
      { at: 30, label: "उच्च न्यायालय खंड संयोजन" },
      { at: 65, label: "तथ्य समयरेखा संरचना" },
      { at: 85, label: "अंतिम नोटिस समीक्षा" },
      { at: 100, label: "ड्राफ्ट पूर्ण" },
    ],

    qaTitle: "🧭 नागरिक अधिकार मार्गदर्शक",
    qaSubtitle: "भारतीय कानून, पुलिस अधिकार, जमानत, उपभोक्ता विवाद और रोजगार अनुबंधों पर प्रश्न पूछें।",
    faqsLabel: "सामान्य प्रश्न:",
    faq1: "⚖️ सूर्यास्त के बाद महिलाओं की गिरफ्तारी (BNSS नियम)",
    faq2: "💳 चेक बाउंस की कानूनी प्रक्रिया (धारा 138)",
    faq3: "🏛️ नालसा (NALSA) मुफ्त कानूनी सहायता पात्रता",
    qaPlaceholder: "अपनी कानूनी समस्या लिखें (जैसे: 'मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा...')",
    btnConsultAi: "सलाह लें",
    btnConsultingAi: "परामर्श जारी...",
    guidanceOutputLabel: "कानूनी मार्गदर्शन",
    qaLoaderPhases: [
      { at: 0, label: "नागरिक प्रश्न का विश्लेषण" },
      { at: 35, label: "भारतीय संहिताओं का संदर्भ" },
      { at: 70, label: "अधिकार चेकलिस्ट निर्माण" },
      { at: 100, label: "मार्गदर्शन तैयार" },
    ],

    compendiumTitle: "🏛️ भारतीय कानून व अधिकार संग्रह",
    compendiumSubtitle: "भारतीय कानूनी ढांचे के अंतर्गत मुख्य अधिकार, क़ानून और प्रक्रियात्मक उपचार।",

    showcaseTitle: "⚡ शेडर और इंटरैक्शन लैब",
    showcaseSubtitle: "न्यायसहायक को संचालित करने वाले वेबजीएल शेडर्स और माइक्रो-एनिमेशन का अनुभव करें।"
  },

  te: {
    appName: "న్యాయసహాయక్",
    appSubtitle: "ఏఐ న్యాయ సహాయం • లిక్విడ్ మెటల్ న్యూరల్ సూట్",
    navVoice: "న్యాయ వాణి (వాయిస్ ఆర్బ్)",
    navDrafting: "కోర్టు డ్రాఫ్టర్",
    navQa: "హక్కుల మార్గదర్శి",
    navStatutes: "చట్టాల సంకలనం",
    navDemo: "షేడర్ ల్యాబ్",
    topVoiceBtn: "వాయిస్ సంప్రదింపు",

    voiceTitle: "🎙️ వాయిస్ న్యాయ సహాయకుడు (న్యాయ వాణి)",
    voiceSubtitle: "మీ న్యాయ సమస్యను మాట్లాడండి. 3D వెబ్‌జీఎల్ న్యూరల్ ఆర్బ్ మీ వాయిస్‌కు ప్రతిస్పందిస్తూ గూగుల్ జెమినీ ద్వారా చట్టబద్ధమైన సెక్షన్లను గుర్తిస్తుంది.",
    simulationsLabel: "1-క్లిక్ వాయిస్ నమూనాలు:",
    simulations: {
      salary: {
        title: "💼 '2 నెలల జీతం నిలిపివేత'",
        text: "బెంగళూరులోని నా యజమాని నెక్స్ట్‌జెన్ క్లౌడ్ ల్యాబ్స్ నా రాజీనామా తర్వాత గత రెండు నెలల జీతం 2 లక్షల 85 వేల రూపాయలను నిలిపివేశారు. హెచ్‌ఆర్ నా ఇమెయిల్‌లకు స్పందించడం లేదు."
      },
      cheque: {
        title: "💳 '₹6.5 లక్షల చెక్ బౌన్స్'",
        text: "ఢిల్లీకి చెందిన క్లయింట్ సంజయ్ సింఘాల్ నాకు 6 లక్షల 50 వేల రూపాయల ఐసీఐసీఐ బ్యాంక్ చెక్ ఇచ్చారు, అది జనవరి 12న ఖాతాలో నిధులు సరిపోక బౌన్స్ అయింది."
      },
      consumer: {
        title: "🛒 'రిఫ్రిజిరేటర్ వారంటీ తిరస్కరణ'",
        text: "నేను ఆన్‌లైన్ స్టోర్ నుండి 72 వేల రూపాయల స్మార్ట్ రిఫ్రిజిరేటర్‌ను కొన్నాను, అది 10 రోజుల్లోనే పాడైపోయింది. కంపెనీ రీప్లేస్‌మెంట్ లేదా రీఫండ్ ఇవ్వడానికి నిరాకరిస్తోంది."
      },
      rti: {
        title: "🔍 'రోడ్డు టెండర్ పై ఆర్‌టీఐ'",
        text: "మున్సిపల్ కార్పొరేషన్ వార్డ్ 12లో రోడ్డు మరమ్మతు టెండర్ ఇచ్చింది, కానీ ఏ పనీ జరగలేదు. నాకు ఆర్‌టీఐ కింద టెండర్ కాంట్రాక్ట్ ధృవీకరించిన కాపీలు కావాలి."
      }
    },
    orbLabel: "3D న్యూరల్ ఆర్బ్",
    voiceActive: "వాయిస్ యాక్టివ్",
    voiceIdle: "వేచి చూస్తోంది",
    voiceListeningHeadline: "మీ న్యాయ సమస్యను వింటోంది...",
    voiceIdleHeadline: "తెలుగులో లేదా మీకు నచ్చిన భాషలో మాట్లాడండి",
    voiceListeningDesc: "వాయిస్ విశ్లేషణ జరుగుతోంది. మాట్లాడిన తర్వాత ఆపండి.",
    voiceIdleDesc: "ప్రారంభించడానికి క్రింది బటన్‌ను క్లిక్ చేయండి.",
    btnStartVoice: "వాయిస్ సంప్రదింపు ప్రారంభించండి",
    btnStopVoice: "ఆపండి",
    liveTranscriptLabel: "లైవ్ మాట్లాడిన వ్రాతపూర్వక రూపం:",
    transcriptPlaceholder: "మీరు మాట్లాడిన పదాలు ఇక్కడ కనిపిస్తాయి... (మీరు టైప్ కూడా చేయవచ్చు)",
    btnRunNlp: "ఎన్ఎల్‌పీ విశ్లేషణ",
    btnAnalyzingNlp: "విశ్లేషిస్తోంది...",
    intelTag: "న్యాయ నిఘా సూట్",
    intelHeading: "ఎన్ఎల్‌పీ విశ్లేషణ & చట్టపరమైన పరిష్కారాలు",
    btnPlayAudio: "సలహా వినండి",
    btnStopAudio: "ఆడియో ఆపండి",
    noDisputeTitle: "ఇంకా ఎటువంటి కేసు విశ్లేషించబడలేదు",
    noDisputeDesc: "3D ఆర్బ్‌లో మాట్లాడండి లేదా 1-క్లిక్ నమూనాపై క్లిక్ చేసి చట్టపరమైన సెక్షన్లను చూడండి.",
    classifiedCategoryLabel: "వర్గీకరించబడిన వివాద విభాగం",
    confidenceSuffix: "% ఎన్ఎల్‌పీ ఖచ్చితత్వం",
    spokenAdviceLabel: "వాయిస్ రూపంలో న్యాయ సలహా:",
    statutesLabel: "వర్తించే భారతీయ చట్టాలు & సెక్షన్లు:",
    nerLabel: "గుర్తించిన న్యాయపరమైన వివరాలు (NER):",
    bridgeTitle: "కోర్టు-సిద్ధ న్యాయ నోటీసు",
    bridgeDesc: "ఈ వివరాలను నేరుగా భారతీయ న్యాయ నోటీసు ఫార్మాట్‌కు బదిలీ చేయండి.",
    bridgeBtn: "డ్రాఫ్టర్‌లో పూరించండి",
    voiceLoaderPhases: [
      { at: 0, label: "వాయిస్ రికార్డ్ అవుతోంది" },
      { at: 25, label: "తెలుగు ఆడియో అనువాదం" },
      { at: 55, label: "చట్టాల గుర్తింపు" },
      { at: 80, label: "న్యాయ సలహా రూపకల్పన" },
      { at: 100, label: "విశ్లేషణ పూర్తయింది" },
    ],

    draftingTitle: "📜 ఆటోమేటెడ్ లీగల్ డ్రాఫ్టింగ్ స్టూడియో",
    draftingSubtitle: "అడ్వొకేట్-స్థాయి లీగల్ నోటీసులు, వినియోగదారు ఫిర్యాదులు, ఆర్‌టీఐ దరఖాస్తులను సులభంగా రూపొందించండి.",
    selectTemplateLabel: "పత్ర టెంప్లేట్ ఎంచుకోండి:",
    btnReset: "రీసెట్",
    btnGenerate: "డ్రాఫ్ట్ తయారుచేయి",
    btnSynthesizing: "రూపొందిస్తోంది...",
    previewTitle: "పత్రం ప్రివ్యూ",
    btnCopy: "కాపీ చేయి",
    btnExportPdf: "పీడీఎఫ్ ఎగుమతి",
    previewEmptyTitle: "పత్రం తయారీ కోసం వేచి ఉంది",
    previewEmptyDesc: "ఎడమవైపు వివరాలను పూరించండి లేదా వాయిస్ ఆర్బ్ ద్వారా ఆటో-ఫిల్ చేయండి.",
    draftingLoaderPhases: [
      { at: 0, label: "టెంప్లేట్ ధృవీకరణ" },
      { at: 30, label: "హైకోర్టు నిబంధనల అమరిక" },
      { at: 65, label: "వాస్తవాల కాలక్రమం" },
      { at: 85, label: "నోటీసు తుది పరిశీలన" },
      { at: 100, label: "డ్రాఫ్ట్ సిద్ధమైంది" },
    ],

    qaTitle: "🧭 పౌర హక్కుల మార్గదర్శి",
    qaSubtitle: "భారతీయ చట్టాలు, పోలీస్ అధికారాలు, బెయిల్, వినియోగదారుల హక్కులు, ఉద్యోగ ఒప్పందాలపై ప్రశ్నలు అడగండి.",
    faqsLabel: "తరచుగా అడిగే ప్రశ్నలు:",
    faq1: "⚖️ సూర్యాస్తమయం తర్వాత మహిళల అరెస్ట్ (BNSS నిబంధనలు)",
    faq2: "💳 చెక్ బౌన్స్ చట్టపరమైన విధానం (సెక్షన్ 138)",
    faq3: "🏛️ నల్సా (NALSA) ఉచిత న్యాయ సహాయం అర్హత",
    qaPlaceholder: "మీ చట్టపరమైన సమస్యను వివరించండి (ఉదా: 'ఇంటి యజమాని అడ్వాన్స్ తిరిగి ఇవ్వడం లేదు...')",
    btnConsultAi: "సలహా తీసుకోండి",
    btnConsultingAi: "పరిశీలిస్తోంది...",
    guidanceOutputLabel: "న్యాయ మార్గదర్శకత్వం",
    qaLoaderPhases: [
      { at: 0, label: "సమస్య విశ్లేషణ" },
      { at: 35, label: "చట్టాల రిఫరెన్స్ తనిఖీ" },
      { at: 70, label: "హక్కుల గైడ్ రూపకల్పన" },
      { at: 100, label: "సలహా సిద్ధం" },
    ],

    compendiumTitle: "🏛️ భారతీయ చట్టాల సంకలనం",
    compendiumSubtitle: "భారతీయ న్యాయ వ్యవస్థ ప్రకారం కీలక హక్కులు, చట్టాలు మరియు పరిష్కారాలు.",

    showcaseTitle: "⚡ షేడర్ & మైక్రో-యానిమేషన్స్ ప్రదర్శన",
    showcaseSubtitle: "న్యాయసహాయక్ వెనుక ఉన్న వెబ్‌జీఎల్ షేడర్స్ మరియు ఫిజిక్స్ యానిమేషన్స్ అనుభవించండి."
  },

  ta: {
    appName: "நியாயசஹாயக்",
    appSubtitle: "ஏஐ சட்ட உதவி • லிக்விட் மெட்டல் நியூரல் சூட்",
    navVoice: "நியாய வாணி (குரல் கோளம்)",
    navDrafting: "நீதிமன்ற வரைவு",
    navQa: "உரிமைகள் வழிகாட்டி",
    navStatutes: "சட்டத் தொகுப்பு",
    navDemo: "ஷேடர் ஆய்வகம்",
    topVoiceBtn: "குரல் ஆலோசனை",

    voiceTitle: "🎙️ குரல் சட்ட உதவியாளர் (நியாய வாணி)",
    voiceSubtitle: "உங்கள் சட்டச் சிக்கலைத் தமிழில் பேசுங்கள். 3D நியூரல் கோளம் உங்கள் குரலுக்குப் பதிலளித்து இந்திய சட்டப் பிரிவுகளைப் பிரித்தெடுக்கும்.",
    simulationsLabel: "1-கிளிக் குரல் மாதிரிகள்:",
    simulations: {
      salary: {
        title: "💼 '2 மாத ஊதியம் நிறுத்திவைப்பு'",
        text: "பெங்களூரில் உள்ள எனது நிறுவனம் எனது ராஜினாமாவுக்குப் பிறகு 2 லட்சத்து 85 ஆயிரம் ரூபாய் ஊதியத்தை நிறுத்தி வைத்துள்ளது. நிர்வாகம் பதிலளிக்கவில்லை."
      },
      cheque: {
        title: "💳 '₹6.5 லட்சம் காசோலை பவுன்ஸ்'",
        text: "தில்லியைச் சேர்ந்த சஞ்சய் சிங்கால் வழங்கிய 6 லட்சத்து 50 ஆயிரம் ரூபாய்க்கான வங்கி காசோலை போதிய பணமின்மையால் பவுன்ஸ் ஆகிவிட்டது."
      },
      consumer: {
        title: "🛒 'பழுதான குளிர்சாதனப் பெட்டி'",
        text: "ஆன்லைன் தளத்தில் 72 ஆயிரம் ரூபாய்க்கு வாங்கிய குளிர்சாதனப் பெட்டி 10 நாட்களில் இயங்கவில்லை. நிறுவனம் மாற்றித் தர மறுக்கிறது."
      },
      rti: {
        title: "🔍 'சாலை ஒப்பந்தம் குறித்த ஆர்டிஐ'",
        text: "மாநகராட்சி வார்டு 12-ல் சாலைப் பணிக்கு ஒப்பந்தம் வழங்கியது, ஆனால் எந்தப் பணியும் நடக்கவில்லை. எனக்கு ஆர்டிஐ மூலம் சான்றளிக்கப்பட்ட நகல்கள் வேண்டும்."
      }
    },
    orbLabel: "3D நியூரல் கோளம்",
    voiceActive: "குரல் செயல்படுகிறது",
    voiceIdle: "காத்திருக்கிறது",
    voiceListeningHeadline: "உங்கள் சட்டப் பிரச்சினையைக் கேட்கிறது...",
    voiceIdleHeadline: "தமிழில் அல்லது உங்கள் மொழியில் இயல்பாகப் பேசுங்கள்",
    voiceListeningDesc: "குரல் ஆய்வு செய்யப்படுகிறது. பேசிய பின் நிறுத்தவும்.",
    voiceIdleDesc: "தொடங்க கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும்.",
    btnStartVoice: "குரல் ஆலோசனையைத் தொடங்கு",
    btnStopVoice: "நிறுத்து",
    liveTranscriptLabel: "நேரலை பேச்சு உரை:",
    transcriptPlaceholder: "நீங்கள் பேசும் வார்த்தைகள் இங்கே தோன்றும்... (நீங்கள் தட்டச்சு செய்யலாம்)",
    btnRunNlp: "சட்ட ஆய்வு செய்",
    btnAnalyzingNlp: "ஆய்வு செய்கிறது...",
    intelTag: "சட்ட நுண்ணறிவுத் தொகுப்பு",
    intelHeading: "சட்டப் பிரிவுகள் மற்றும் தீர்வுகள்",
    btnPlayAudio: "ஆலோசனையைக் கேள்",
    btnStopAudio: "ஆடியோவை நிறுத்து",
    noDisputeTitle: "இன்னும் வழக்கு எதுவும் பகுப்பாய்வு செய்யப்படவில்லை",
    noDisputeDesc: "3D கோளத்தில் பேசுங்கள் அல்லது மாதிரி வழக்கைத் தேர்ந்தெடுத்து சட்டப் பிரிவுகளைப் பாருங்கள்.",
    classifiedCategoryLabel: "வகைப்படுத்தப்பட்ட சட்டப் பிரிவு",
    confidenceSuffix: "% துல்லியம்",
    spokenAdviceLabel: "பேச்சு வடிவிலான சட்ட ஆலோசனை:",
    statutesLabel: "பொருந்தக்கூடிய இந்தியச் சட்டங்கள்:",
    nerLabel: "பதிவு செய்யப்பட்ட விவரங்கள்:",
    bridgeTitle: "நீதிமன்ற சட்டப்பூர்வ நோட்டீஸ்",
    bridgeDesc: "விவரங்களை நேரடியாக நீதிமன்ற நோட்டீஸ் வடிவத்திற்கு மாற்றவும்.",
    bridgeBtn: "வரைவில் நிரப்பு",
    voiceLoaderPhases: [
      { at: 0, label: "குரல் பதிவு செய்யப்படுகிறது" },
      { at: 25, label: "தமிழ் உரை மாற்றம்" },
      { at: 55, label: "இந்திய சட்டங்கள் ஆய்வு" },
      { at: 80, label: "வழக்கறிஞர் ஆலோசனை தயார்" },
      { at: 100, label: "சட்ட அறிக்கை தயார்" },
    ],

    draftingTitle: "📜 தானியங்கி சட்ட வரைவு அரங்கம்",
    draftingSubtitle: "வழக்கறிஞர் அளவிலான சட்ட நோட்டீஸ்கள், நுகர்வோர் புகார்கள், தகவல் அறியும் உரிமை விண்ணப்பங்களை உருவாக்குங்கள்.",
    selectTemplateLabel: "நோட்டீஸ் மாதிரி தேர்வு:",
    btnReset: "மீட்டமை",
    btnGenerate: "வரைவை உருவாக்கு",
    btnSynthesizing: "உருவாக்குகிறது...",
    previewTitle: "ஆவண முன்னோட்டம்",
    btnCopy: "நகலெடு",
    btnExportPdf: "PDF ஏற்றுமதி",
    previewEmptyTitle: "ஆவணம் உருவாக்கக் காத்திருக்கிறது",
    previewEmptyDesc: "இடதுபுறத்தில் விவரங்களை நிரப்புங்கள் அல்லது குரல் மூலம் நிரப்பவும்.",
    draftingLoaderPhases: [
      { at: 0, label: "சட்ட மாதிரி சரிபார்ப்பு" },
      { at: 30, label: "நீதிமன்ற விதிமுறைகள் அமைப்பு" },
      { at: 65, label: "காலவரிசை கட்டமைப்பு" },
      { at: 85, label: "நோட்டீஸ் இறுதி ஆய்வு" },
      { at: 100, label: "வரைவு தயார்" },
    ],

    qaTitle: "🧭 குடிமக்கள் உரிமைகள் வழிகாட்டி",
    qaSubtitle: "இந்திய சட்டம், காவல் அதிகாரங்கள், ஜாமீன், நுகர்வோர் உரிமைகள் குறித்துக் கேளுங்கள்.",
    faqsLabel: "அடிக்கடி கேட்கப்படும் கேள்விகள்:",
    faq1: "⚖️ சூரிய அஸ்தமனத்திற்குப் பின் பெண்கள் கைது (BNSS)",
    faq2: "💳 காசோலை பவுன்ஸ் சட்ட நடைமுறை (பிரிவு 138)",
    faq3: "🏛️ நல்சா (NALSA) இலவச சட்ட உதவி தகுதி",
    qaPlaceholder: "உங்கள் சட்ட சிக்கலை விவரியுங்கள்...",
    btnConsultAi: "ஆலோசனை பெறு",
    btnConsultingAi: "ஆலோசிக்கிறது...",
    guidanceOutputLabel: "வழிகாட்டுதல் முடிவு",
    qaLoaderPhases: [
      { at: 0, label: "சிக்கல் ஆய்வு" },
      { at: 35, label: "சட்டக் குறிப்புகள் சரிபார்ப்பு" },
      { at: 70, label: "உரிமை வழிகாட்டி உருவாக்கம்" },
      { at: 100, label: "ஆலோசனை தயார்" },
    ],

    compendiumTitle: "🏛️ இந்திய சட்டங்களின் தொகுப்பு",
    compendiumSubtitle: "இந்திய அரசியலமைப்பு மற்றும் சட்டங்களின் கீழான உரிமைகள் மற்றும் தீர்வுகள்.",

    showcaseTitle: "⚡ ஷேடர் மற்றும் இடைமுக ஆய்வகம்",
    showcaseSubtitle: "நியாயசஹாயக்கின் பின்னணியில் உள்ள அதிநவீன வெப்ஜிஎல் தொழில்நுட்பம்."
  },

  kn: {
    appName: "ನ್ಯಾಯಸಹಾಯಕ್",
    appSubtitle: "ಎಐ ಕಾನೂನು ನೆರವು • ಲಿಕ್ವಿಡ್ ಮೆಟಲ್ ನ್ಯೂರಲ್ ಸೂಟ್",
    navVoice: "ನ್ಯಾಯ ವಾಣಿ (ಧ್ವನಿ ಗೋಳ)",
    navDrafting: "ಕೋರ್ಟ್ ಡ್ರಾಫ್ಟರ್",
    navQa: "ಹಕ್ಕುಗಳ ಮಾರ್ಗದರ್ಶಿ",
    navStatutes: "ಕಾನೂನು ಸಂಪುಟ",
    navDemo: "ಶೇಡರ್ ಲ್ಯಾಬ್",
    topVoiceBtn: "ಧ್ವನಿ ಸಮಾಲೋಚನೆ",
    voiceTitle: "🎙️ ಧ್ವನಿ ಕಾನೂನು ಸಹಾಯಕ (ನ್ಯಾಯ ವಾಣಿ)",
    voiceSubtitle: "ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ. 3D ನ್ಯೂರಲ್ ಗೋಳವು ನಿಮ್ಮ ಧ್ವನಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಿ ಭಾರತೀಯ ಕಾನೂನುಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ.",
    simulationsLabel: "1-ಕ್ಲಿಕ್ ಧ್ವನಿ ಮಾದರಿಗಳು:",
    simulations: {
      salary: {
        title: "💼 '2 ತಿಂಗಳ ವೇತನ ತಡೆಹಿಡಿಯಲಾಗಿದೆ'",
        text: "ಬೆಂಗಳೂರಿನಲ್ಲಿರುವ ನನ್ನ ಕಂಪನಿಯು ರಾಜೀನಾಮೆಯ ನಂತರ ನನ್ನ 2 ಲಕ್ಷ 85 ಸಾವಿರ ರೂಪಾಯಿಗಳ ವೇತನವನ್ನು ತಡೆಹಿಡಿದಿದೆ. ಹೆಚ್‌ಆರ್ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿಲ್ಲ."
      },
      cheque: {
        title: "💳 '₹6.5 ಲಕ್ಷ ಚೆಕ್ ಬೌನ್ಸ್'",
        text: "ವ್ಯಾಪಾರಿ ಸಂಜಯ್ ಸಿಂಘಾಲ್ ನೀಡಿದ 6 ಲಕ್ಷ 50 ಸಾವಿರ ರೂಪಾಯಿಗಳ ಐಸಿಐಸಿಐ ಬ್ಯಾಂಕ್ ಚೆಕ್ ಹಣದ ಕೊರತೆಯಿಂದ ಬೌನ್ಸ್ ಆಗಿದೆ."
      },
      consumer: {
        title: "🛒 'ದೋಷಯುಕ್ತ ರೆಫ್ರಿಜರೇಟರ್'",
        text: "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಖರೀದಿಸಿದ 72 ಸಾವಿರ ರೂಪಾಯಿಗಳ ರೆಫ್ರಿಜರೇಟರ್ 10 ದಿನಗಳಲ್ಲಿ ಕೆಟ್ಟಿದೆ. ಕಂಪನಿಯು ವಾಪಸ್ ಪಡೆಯಲು ನಿರಾಕರಿಸುತ್ತಿದೆ."
      },
      rti: {
        title: "🔍 'ರಸ್ತೆ ಟೆಂಡರ್ ಆರ್‌ಟಿಐ'",
        text: "ವಾರ್ಡ್ 12 ರಲ್ಲಿ ರಸ್ತೆ ದುರಸ್ತಿ ಟೆಂಡರ್ ನೀಡಲಾಗಿದ್ದರೂ ಯಾವುದೇ ಕೆಲಸ ನಡೆದಿಲ್ಲ. ನನಗೆ ಆರ್‌ಟಿಐ ಅಡಿಯಲ್ಲಿ ದಾಖಲೆಗಳು ಬೇಕು."
      }
    },
    orbLabel: "3D ನ್ಯೂರಲ್ ಗೋಳ",
    voiceActive: "ಧ್ವನಿ ಸಕ್ರಿಯ",
    voiceIdle: "ನಿರೀಕ್ಷೆಯಲ್ಲಿದೆ",
    voiceListeningHeadline: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಆಲಿಸುತ್ತಿದೆ...",
    voiceIdleHeadline: "ಕನ್ನಡದಲ್ಲಿ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ",
    voiceListeningDesc: "ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ. ಮಾತನಾಡಿದ ನಂತರ ನಿಲ್ಲಿಸಿ.",
    voiceIdleDesc: "ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    btnStartVoice: "ಧ್ವನಿ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ",
    btnStopVoice: "ನಿಲ್ಲಿಸಿ",
    liveTranscriptLabel: "ಲೈವ್ ಮಾತುಗಳ ಪಠ್ಯ:",
    transcriptPlaceholder: "ನೀವು ಮಾತನಾಡುವ ಮಾತುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ...",
    btnRunNlp: "ಎನ್‌ಎಲ್‌ಪಿ ವಿಶ್ಲೇಷಣೆ",
    btnAnalyzingNlp: "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    intelTag: "ಕಾನೂನು ಗುಪ್ತಚರ ಸೂಟ್",
    intelHeading: "ಕಾನೂನು ಪರಿಹಾರಗಳು & ಸೆಕ್ಷನ್‌ಗಳು",
    btnPlayAudio: "ಸಲಹೆ ಆಲಿಸಿ",
    btnStopAudio: "ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ",
    noDisputeTitle: "ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಕರಣ ವಿಶ್ಲೇಷಿಸಲಾಗಿಲ್ಲ",
    noDisputeDesc: "3D ಗೋಳದಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ 1-ಕ್ಲಿಕ್ ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ.",
    classifiedCategoryLabel: "ವಿವಾದದ ವರ್ಗ",
    confidenceSuffix: "% ನಿಖರತೆ",
    spokenAdviceLabel: "ಮಾತಿನ ರೂಪದ ಕಾನೂನು ಸಲಹೆ:",
    statutesLabel: "ಅನ್ವಯವಾಗುವ ಭಾರತೀಯ ಕಾನೂನುಗಳು:",
    nerLabel: "ಹೊರತೆಗೆಯಲಾದ ಕಾನೂನು ಮಾಹಿತಿ:",
    bridgeTitle: "ಕೋರ್ಟ್-ಸಿದ್ಧ ಕಾನೂನು ನೋಟಿಸ್",
    bridgeDesc: "ಈ ವಿವರಗಳನ್ನು ಭಾರತೀಯ ಕಾನೂನು ನೋಟಿಸ್ ಫಾರ್ಮ್ಯಾಟ್‌ಗೆ ವರ್ಗಾಯಿಸಿ.",
    bridgeBtn: "ಡ್ರಾಫ್ಟರ್‌ನಲ್ಲಿ ಭರ್ತಿ ಮಾಡಿ",
    voiceLoaderPhases: [
      { at: 0, label: "ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ" },
      { at: 25, label: "ಕನ್ನಡ ಆಡಿಯೋ ಪರಿವರ್ತನೆ" },
      { at: 55, label: "ಕಾನೂನುಗಳ ವಿಶ್ಲೇಷಣೆ" },
      { at: 80, label: "ವಕೀಲರ ಸಲಹೆ ಸಿದ್ಧತೆ" },
      { at: 100, label: "ವರದಿ ಸಿದ್ಧವಾಗಿದೆ" },
    ],
    draftingTitle: "📜 ಸ್ವಯಂಚಾಲಿತ ಕಾನೂನು ಡ್ರಾಫ್ಟಿಂಗ್ ಸ್ಟುಡಿಯೋ",
    draftingSubtitle: "ವಕೀಲರ ಮಟ್ಟದ ಕಾನೂನು ನೋಟಿಸ್‌ಗಳು ಮತ್ತು ಆರ್‌ಟಿಐ ಅರ್ಜಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.",
    selectTemplateLabel: "ಪತ್ರದ ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ:",
    btnReset: "ರೀಸೆಟ್",
    btnGenerate: "ಡ್ರಾಫ್ಟ್ ರಚಿಸಿ",
    btnSynthesizing: "ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    previewTitle: "ದಾಖಲೆ ಪೂರ್ವವೀಕ್ಷಣೆ",
    btnCopy: "ಕಾಪಿ ಮಾಡಿ",
    btnExportPdf: "ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್",
    previewEmptyTitle: "ದಾಖಲೆ ರಚನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
    previewEmptyDesc: "ಎಡಭಾಗದಲ್ಲಿ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಪಡೆದುಕೊಳ್ಳಿ.",
    draftingLoaderPhases: [
      { at: 0, label: "ಟೆಂಪ್ಲೇಟ್ ಪರಿಶೀಲನೆ" },
      { at: 30, label: "ನ್ಯಾಯಾಲಯದ ನಿಯಮಗಳ ಜೋಡಣೆ" },
      { at: 65, label: "ಸಮಯರೇಖೆ ರಚನೆ" },
      { at: 85, label: "ಅಂತಿಮ ಪರಿಶೀಲನೆ" },
      { at: 100, label: "ಡ್ರಾಫ್ಟ್ ಸಿದ್ಧವಾಗಿದೆ" },
    ],
    qaTitle: "🧭 ನಾಗರಿಕ ಹಕ್ಕುಗಳ ಮಾರ್ಗದರ್ಶಿ",
    qaSubtitle: "ಭಾರತೀಯ ಕಾನೂನುಗಳು, ಪೊಲೀಸ್ ಅಧಿಕಾರಗಳು ಮತ್ತು ಜಾಮೀನಿನ ಕುರಿತು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
    faqsLabel: "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು:",
    faq1: "⚖️ ಸೂರ್ಯಾಸ್ತದ ನಂತರ ಮಹಿಳೆಯರ ಬಂಧನ (BNSS)",
    faq2: "💳 ಚೆಕ್ ಬೌನ್ಸ್ ಕಾನೂನು ಪ್ರಕ್ರಿಯೆ (ಸೆಕ್ಷನ್ 138)",
    faq3: "🏛️ ನಲ್ಸಾ (NALSA) ಉಚಿತ ಕಾನೂನು ನೆರವು",
    qaPlaceholder: "ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ಬರೆಯಿರಿ...",
    btnConsultAi: "ಸಲಹೆ ಪಡೆಯಿರಿ",
    btnConsultingAi: "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    guidanceOutputLabel: "ಮಾರ್ಗದರ್ಶನ",
    qaLoaderPhases: [
      { at: 0, label: "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆ" },
      { at: 35, label: "ಕಾನೂನುಗಳ ಉಲ್ಲೇಖ" },
      { at: 70, label: "ಹಕ್ಕುಗಳ ಗೈಡ್ ತಯಾರಿಕೆ" },
      { at: 100, label: "ಸಲಹೆ ಸಿದ್ಧ" },
    ],
    compendiumTitle: "🏛️ ಭಾರತೀಯ ಕಾನೂನು ಸಂಪುಟ",
    compendiumSubtitle: "ಭಾರತೀಯ ನಾಗರಿಕರ ಹಕ್ಕುಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು.",
    showcaseTitle: "⚡ ಶೇಡರ್ ಮತ್ತು ಇಂಟರಾಕ್ಷನ್ ಲ್ಯಾಬ್",
    showcaseSubtitle: "ನ್ಯಾಯಸಹಾಯಕ್ ತಂತ್ರಜ್ಞಾನ ಪ್ರದರ್ಶನ."
  },

  bn: {
    appName: "ন্যায়সহায়ক",
    appSubtitle: "এআই আইনি সহায়তা • লিকুইড মেটাল নিউরাল স্যুট",
    navVoice: "ন্যায় বাণী (ভয়েস অর্ব)",
    navDrafting: "কোর্ট ড্রাফটার",
    navQa: "অধিকার নির্দেশিকা",
    navStatutes: "আইন সংকলন",
    navDemo: "শেডার ল্যাব",
    topVoiceBtn: "আইনি পরামর্শ",
    voiceTitle: "🎙️ ভয়েস আইনি সহকারী (ন্যায় বাণী)",
    voiceSubtitle: "আপনার আইনি সমস্যা বাংলায় বলুন। 3D নিউরাল অর্ব আপনার কণ্ঠে সাড়া দিয়ে প্রাসঙ্গিক ভারতীয় আইন বিশ্লেষণ করবে।",
    simulationsLabel: "১-ক্লিক ভয়েস নমুনা:",
    simulations: {
      salary: {
        title: "💼 '২ মাসের বেতন আটকে রাখা'",
        text: "আমার পদত্যাগের পর বেঙ্গালুরুর কোম্পানি আমার গত দুই মাসের ২ লাখ ৮৫ হাজার টাকা বেতন আটকে রেখেছে। এইচআর কোনো উত্তর দিচ্ছে না।"
      },
      cheque: {
        title: "💳 '₹৬.৫ লাখের চেক বাউন্স'",
        text: "দিল্লির ব্যবসায়ী সঞ্জয় সিংহল আমাকে ৬ লাখ ৫০ হাজার টাকার আইসিআইসিআই ব্যাংকের চেক দিয়েছিলেন যা পর্যাপ্ত তহবিলের অভাবে বাউন্স হয়েছে।"
      },
      consumer: {
        title: "🛒 'ত্রুটিপূর্ণ রেফ্রিজারেটর'",
        text: "অনলাইন স্টোর থেকে ৭২ হাজার টাকায় কেনা রেফ্রিজারেটর ১০ দিনের মধ্যে কাজ করা বন্ধ করে দিয়েছে। কোম্পানি পরিবর্তন করতে অস্বীকার করছে।"
      },
      rti: {
        title: "🔍 'রাস্তা সংস্কারের আরটিআই'",
        text: "পৌরসভা ১২ নম্বর ওয়ার্ডে রাস্তা সংস্কারের টেন্ডার দিলেও কোনো কাজ হয়নি। আমার আরটিআই-এর অধীনে চুক্তির কপি দরকার।"
      }
    },
    orbLabel: "3D নিউরাল অর্ব",
    voiceActive: "ভয়েস সক্রিয়",
    voiceIdle: "অপেক্ষারত",
    voiceListeningHeadline: "আপনার সমস্যা শোনা হচ্ছে...",
    voiceIdleHeadline: "বাংলায় বা যেকোনো ভারতীয় ভাষায় বলুন",
    voiceListeningDesc: "ভয়েস বিশ্লেষণ চলছে। কথা বলা শেষ হলে থামান।",
    voiceIdleDesc: "শুরু করতে নিচের বোতামে ক্লিক করুন।",
    btnStartVoice: "ভয়েস পরামর্শ শুরু করুন",
    btnStopVoice: "থামান",
    liveTranscriptLabel: "লাইভ ট্রান্সক্রিপ্ট:",
    transcriptPlaceholder: "আপনার কথাগুলো এখানে লিখিত আকারে আসবে...",
    btnRunNlp: "এনএলপি বিশ্লেষণ",
    btnAnalyzingNlp: "বিশ্লেষণ চলছে...",
    intelTag: "আইনি বুদ্ধিমত্তা স্যুট",
    intelHeading: "এনএলপি ফলাফল ও আইনি প্রতিকার",
    btnPlayAudio: "পরামর্শ শুনুন",
    btnStopAudio: "অডিও বন্ধ করুন",
    noDisputeTitle: "এখনো কোনো মামলা বিশ্লেষণ করা হয়নি",
    noDisputeDesc: "3D অর্বে কথা বলুন বা একটি নমুনা নির্বাচন করুন।",
    classifiedCategoryLabel: "চিহ্নিত আইনি বিভাগ",
    confidenceSuffix: "% সঠিকতা",
    spokenAdviceLabel: "কথোপকথনমূলক আইনি পরামর্শ:",
    statutesLabel: "প্রযোজ্য ভারতীয় আইন ও ধারা:",
    nerLabel: "চিহ্নিত বিবরণসমূহ:",
    bridgeTitle: "আদালত-উপযোগী আইনি নোটিশ",
    bridgeDesc: "তথ্যগুলো সরাসরি আনুষ্ঠানিক ভারতীয় নোটিশ ফরম্যাটে রূপান্তর করুন।",
    bridgeBtn: "ড্রাফটারে স্থানান্তর",
    voiceLoaderPhases: [
      { at: 0, label: "ভয়েস রেকর্ড হচ্ছে" },
      { at: 25, label: "বাংলা অডিও প্রতিলিপিকরণ" },
      { at: 55, label: "ভারতীয় আইন বিশ্লেষণ" },
      { at: 80, label: "আইনি পরামর্শ প্রস্তুতি" },
      { at: 100, label: "প্রতিবেদন প্রস্তুত" },
    ],
    draftingTitle: "📜 স্বয়ংক্রিয় আইনি ড্রাফটিং স্টুডিও",
    draftingSubtitle: "আইনজীবী-মানের নোটিশ, ভোক্তা অভিযোগ এবং আরটিআই আবেদনপত্র তৈরি করুন।",
    selectTemplateLabel: "নথির ধরন নির্বাচন করুন:",
    btnReset: "রিসেট",
    btnGenerate: "ড্রাফট তৈরি করুন",
    btnSynthesizing: "তৈরি হচ্ছে...",
    previewTitle: "নথির পূর্বরূপ",
    btnCopy: "কপি করুন",
    btnExportPdf: "পিডিএফ ডাউনলোড",
    previewEmptyTitle: "নথি তৈরির অপেক্ষায়",
    previewEmptyDesc: "বাঁদিকের তথ্য পূরণ করুন বা ভয়েস অর্বের সাহায্য নিন।",
    draftingLoaderPhases: [
      { at: 0, label: "টেমপ্লেট যাচাইকরণ" },
      { at: 30, label: "আদালতের নিয়মাবলী গঠন" },
      { at: 65, label: "ঘটনাপঞ্জি বিন্যাস" },
      { at: 85, label: "চূড়ান্ত নোটিশ পর্যালোচনা" },
      { at: 100, label: "ড্রাফট সম্পন্ন" },
    ],
    qaTitle: "🧭 নাগরিক অধিকার নির্দেশিকা",
    qaSubtitle: "ভারতীয় আইন, পুলিশের ক্ষমতা, জামিন ও শ্রম অধিকার সম্পর্কে প্রশ্ন করুন।",
    faqsLabel: "সাধারণ প্রশ্নসমূহ:",
    faq1: "⚖️ সূর্যাস্তের পর নারী গ্রেফতারের নিয়ম (BNSS)",
    faq2: "💳 চেক বাউন্সের আইনি প্রক্রিয়া (ধারা ১৩৮)",
    faq3: "🏛️ নালসা (NALSA) বিনামূল্যে আইনি সহায়তা",
    qaPlaceholder: "আপনার আইনি সমস্যা লিখুন...",
    btnConsultAi: "পরামর্শ নিন",
    btnConsultingAi: "বিশ্লেষণ চলছে...",
    guidanceOutputLabel: "আইনি পরামর্শ",
    qaLoaderPhases: [
      { at: 0, label: "প্রশ্ন বিশ্লেষণ" },
      { at: 35, label: "আইন রেফারেন্স যাচাই" },
      { at: 70, label: "অধিকার গাইড তৈরি" },
      { at: 100, label: "পরামর্শ প্রস্তুত" },
    ],
    compendiumTitle: "🏛️ ভারতীয় আইন সংকলন",
    compendiumSubtitle: "নাগরিক অধিকার ও সংবিধিবদ্ধ প্রতিকার।",
    showcaseTitle: "⚡ শেডার ও মাইক্রো-ইন্টারঅ্যাকশন",
    showcaseSubtitle: "উন্নত প্রযুক্তি ও ভিজ্যুয়াল শেডার্স।"
  },

  mr: {
    appName: "न्यायसहायक",
    appSubtitle: "एआय कायदेशीर सहाय्य • लिक्विड मेटल न्यूरल सूट",
    navVoice: "न्याय वाणी (व्हॉइस ऑर्ब)",
    navDrafting: "कोर्ट ड्राफ्टर",
    navQa: "हक्क मार्गदर्शक",
    navStatutes: "कायदा संग्रह",
    navDemo: "शेडर लॅब",
    topVoiceBtn: "व्हॉइस सल्ला",
    voiceTitle: "🎙️ व्हॉइस कायदेशीर सहाय्यक (न्याय वाणी)",
    voiceSubtitle: "आपली कायदेशीर समस्या मराठीत बोला. 3D न्यूरल ऑर्ब आपल्या आवाजावर प्रक्रिया करून कायदेशीर कलमे शोधून काढेल.",
    simulationsLabel: "1-क्लिक व्हॉइस नमुने:",
    simulations: {
      salary: {
        title: "💼 '२ महिन्यांचा पगार थकीत'",
        text: "माझ्या राजीनाम्यानंतर बेंगळुरूतील कंपनीने माझे २ लाख ८५ हजार रुपयांचे दोन महिन्यांचे वेतन रोखून ठेवले आहे. एचआर प्रतिसाद देत नाही."
      },
      cheque: {
        title: "💳 '₹६.५ लाखांचा चेक बाउंस'",
        text: "संजय सिंघल यांनी दिलेला ६ लाख ५० हजार रुपयांचा आयसीआयसीआय बँकेचा चेक खात्यात पुरेशी रक्कम नसल्याने बाउंस झाला."
      },
      consumer: {
        title: "🛒 'दोषपूर्ण रेफ्रिजरेटर वॉरंटी'",
        text: "मी ऑनलाईन ७२ हजार रुपयांचा रेफ्रिजरेटर खरेदी केला जो १० दिवसांत बंद पडला. कंपनी तो बदलून देण्यास नकार देत आहे."
      },
      rti: {
        title: "🔍 'रस्ता दुरुस्तीबाबत आरटीआय'",
        text: "महानगरपालिकेने प्रभाग १२ मध्ये रस्ता दुरुस्तीची निविदा काढली पण काम झाले नाही. मला आरटीआय अंतर्गत कागदपत्रे हवी आहेत."
      }
    },
    orbLabel: "3D न्यूरल ऑर्ब",
    voiceActive: "आवाज सक्रिय",
    voiceIdle: "प्रतीक्षेत",
    voiceListeningHeadline: "तुमची कायदेशीर समस्या ऐकत आहे...",
    voiceIdleHeadline: "मराठीत किंवा कोणत्याही भारतीय भाषेत बोला",
    voiceListeningDesc: "आवाजाचे विश्लेषण चालू आहे. बोलून झाल्यावर थांबवा.",
    voiceIdleDesc: "सुरू करण्यासाठी खालील बटण दाबा.",
    btnStartVoice: "सल्ला सुरू करा",
    btnStopVoice: "थांबवा",
    liveTranscriptLabel: "थेट आवाजाचे मजकूर रूपांतर:",
    transcriptPlaceholder: "तुम्ही बोललेले शब्द येथे दिसतील...",
    btnRunNlp: "एनएलपी विश्लेषण",
    btnAnalyzingNlp: "विश्लेषण सुरू...",
    intelTag: "कायदेशीर गुप्तचर सूट",
    intelHeading: "कायदेशीर उपाय आणि कलमे",
    btnPlayAudio: "सल्ला ऐका",
    btnStopAudio: "ऑडिओ थांबवा",
    noDisputeTitle: "अद्याप कोणतीही केस विश्लेषित नाही",
    noDisputeDesc: "3D ऑर्बमध्ये बोला किंवा नमुना निवडा.",
    classifiedCategoryLabel: "कायदेशीर श्रेणी",
    confidenceSuffix: "% अचूकता",
    spokenAdviceLabel: "तोंडी कायदेशीर सल्ला:",
    statutesLabel: "लागू होणारे भारतीय कायदे:",
    nerLabel: "काढून घेतलेले कायदेशीर तपशील:",
    bridgeTitle: "न्यायालयीन कायदेशीर नोटीस",
    bridgeDesc: "हे तपशील थेट अधिकृत न्यायालयीन नोटीसमध्ये भरा.",
    bridgeBtn: "ड्राफ्टरमध्ये भरा",
    voiceLoaderPhases: [
      { at: 0, label: "आवाज रेकॉर्ड होत आहे" },
      { at: 25, label: "मराठी ऑडिओ रूपांतरण" },
      { at: 55, label: "कायद्यांचे विश्लेषण" },
      { at: 80, label: "वकिलांचा सल्ला तयार" },
      { at: 100, label: "अहवाल तयार आहे" },
    ],
    draftingTitle: "📜 स्वयंचलित कायदेशीर मसुदा कक्ष",
    draftingSubtitle: "वकील-स्तरीय कायदेशीर नोटिसा आणि आरटीआय अर्ज तयार करा.",
    selectTemplateLabel: "कागदपत्राचा प्रकार निवडा:",
    btnReset: "रीसेट",
    btnGenerate: "मसुदा तयार करा",
    btnSynthesizing: "तयार होत आहे...",
    previewTitle: "दस्तऐवज पूर्वावलोकन",
    btnCopy: "कॉपी करा",
    btnExportPdf: "पीडीएफ डाउनलोड",
    previewEmptyTitle: "दस्तऐवज निर्मितीची प्रतीक्षा",
    previewEmptyDesc: "डावीकडील माहिती भरा किंवा व्हॉइस ऑर्ब वापरा.",
    draftingLoaderPhases: [
      { at: 0, label: "मसुदा पडताळणी" },
      { at: 30, label: "न्यायालयीन नियम रचना" },
      { at: 65, label: "घटनेची कालरेषा" },
      { at: 85, label: "अंतिम नोटीस तपासणी" },
      { at: 100, label: "मसुदा पूर्ण" },
    ],
    qaTitle: "🧭 नागरिक हक्क मार्गदर्शक",
    qaSubtitle: "भारतीय कायदे, पोलीस अधिकार आणि जामीन याविषयी प्रश्न विचारा.",
    faqsLabel: "नेहमी विचारले जाणारे प्रश्न:",
    faq1: "⚖️ सूर्यास्तानंतर महिलांना अटक करण्याचे नियम (BNSS)",
    faq2: "💳 चेक बाउंस कायदेशीर प्रक्रिया (कलम १३८)",
    faq3: "🏛️ नालसा (NALSA) मोफत कायदेशीर सहाय्य",
    qaPlaceholder: "आपली कायदेशीर समस्या येथे लिहा...",
    btnConsultAi: "सल्ला घ्या",
    btnConsultingAi: "विश्लेषण सुरू...",
    guidanceOutputLabel: "मार्गदर्शन",
    qaLoaderPhases: [
      { at: 0, label: "प्रश्न विश्लेषण" },
      { at: 35, label: "कायदे संदर्भ तपासणी" },
      { at: 70, label: "मार्गदर्शक तयार करणे" },
      { at: 100, label: "सल्ला तयार" },
    ],
    compendiumTitle: "🏛️ भारतीय कायदे संग्रह",
    compendiumSubtitle: "नागरिकांचे कायदेशीर हक्क आणि उपाय.",
    showcaseTitle: "⚡ शेडर आणि परस्परसंवाद लॅब",
    showcaseSubtitle: "न्यायसहायक तंत्रज्ञान प्रात्यक्षिक."
  },

  gu: {
    appName: "ન્યાયસહાયક",
    appSubtitle: "એઆઈ કાનૂની સહાય • લિક્વિડ મેટલ ન્યુરલ સ્યુટ",
    navVoice: "ન્યાય વાણી (વોઇસ ઑર્બ)",
    navDrafting: "કોર્ટ ડ્રાફ્ટર",
    navQa: "અધિકાર માર્ગદર્શક",
    navStatutes: "કાયદા સંગ્રહ",
    navDemo: "શેડર લેબ",
    topVoiceBtn: "વોઇસ સલાહ",
    voiceTitle: "🎙️ વોઇસ કાનૂની સહાયક (ન્યાય વાણી)",
    voiceSubtitle: "તમારી કાનૂની સમસ્યા ગુજરાતીમાં બોલો. 3D ન્યુરલ ઑર્બ તમારા અવાજ પર પ્રતિક્રિયા આપી કાયદાઓનું વિશ્લેષણ કરશે.",
    simulationsLabel: "1-ક્લિક બોલાયેલા નમૂના:",
    simulations: {
      salary: {
        title: "💼 '2 મહિનાનો પગાર અટકાવ્યો'",
        text: "મારા રાજીનામા પછી કંપનીએ મારો ૨ લાખ ૮૫ હજાર રૂપિયાનો બે મહિનાનો પગાર અટકાવી રાખ્યો છે. એચઆર કોઈ જવાબ આપતું નથી."
      },
      cheque: {
        title: "💳 '₹૬.૫ લાખનો ચેક બાઉન્સ'",
        text: "સંજય સિંઘલ દ્વારા આપવામાં આવેલ ૬ લાખ ૫૦ હજાર રૂપિયાનો ચેક ખાતામાં અપૂરતા ભંડોળને કારણે બાઉન્સ થયો છે."
      },
      consumer: {
        title: "🛒 'ખામીયુક્ત રેફ્રિજરેટર'",
        text: "મેં ઓનલાઇન ૭૨ હજાર રૂપિયાનું રેફ્રિજરેટર ખરીદ્યું જે ૧૦ દિવસમાં બંધ થઈ ગયું. કંપની બદલી આપવાની ના પાડે છે."
      },
      rti: {
        title: "🔍 'રસ્તાના કામ અંગે આરટીઆઈ'",
        text: "નગરપાલિકાએ વોર્ડ ૧૨ માં રસ્તા સમારકામનું ટેન્ડર બહાર પાડ્યું પણ કામ થયું નથી. મને આરટીઆઈ હેઠળ પ્રમાણિત નકલો જોઈએ છે."
      }
    },
    orbLabel: "3D ન્યુરલ ઑર્બ",
    voiceActive: "અવાજ સક્રિય",
    voiceIdle: "પ્રતીક્ષારત",
    voiceListeningHeadline: "તમારી કાનૂની સમસ્યા સાંભળી રહ્યા છીએ...",
    voiceIdleHeadline: "ગુજરાતીમાં અથવા તમારી ભાષામાં બોલો",
    voiceListeningDesc: "અવાજનું વિશ્લેષણ ચાલુ છે.",
    voiceIdleDesc: "શરૂ કરવા માટે નીચે ક્લિક કરો.",
    btnStartVoice: "સલાહ શરૂ કરો",
    btnStopVoice: "બંધ કરો",
    liveTranscriptLabel: "લાઇવ બોલાયેલ લખાણ:",
    transcriptPlaceholder: "તમારા બોલાયેલા શબ્દો અહીં લખાશે...",
    btnRunNlp: "એનએલપી વિશ્લેષણ",
    btnAnalyzingNlp: "વિશ્લેષણ ચાલુ...",
    intelTag: "કાનૂની ગુપ્તચર સ્યુટ",
    intelHeading: "કાનૂની ઉપાયો અને કલમો",
    btnPlayAudio: "સલાહ સાંભળો",
    btnStopAudio: "ઑડિયો બંધ કરો",
    noDisputeTitle: "હજી કોઈ કેસ વિશ્લેષિત થયો નથી",
    noDisputeDesc: "3D ઑર્બમાં બોલો અથવા નમૂનો પસંદ કરો.",
    classifiedCategoryLabel: "કાનૂની શ્રેણી",
    confidenceSuffix: "% ચોકસાઈ",
    spokenAdviceLabel: "મૌખિક કાનૂની સલાહ:",
    statutesLabel: "લાગુ પડતા ભારતીય કાયદા:",
    nerLabel: "તારવેલી વિગતો:",
    bridgeTitle: "કોર્ટ કાનૂની નોટિસ",
    bridgeDesc: "વિગતો સીધી ભારતીય કોર્ટ નોટિસમાં ટ્રાન્સફર કરો.",
    bridgeBtn: "ડ્રાફ્ટરમાં ભરો",
    voiceLoaderPhases: [
      { at: 0, label: "અવાજ રેકોર્ડ થાય છે" },
      { at: 25, label: "ગુજરાતી લખાણ રૂપાંતરણ" },
      { at: 55, label: "કાયદાઓનું વિશ્લેષણ" },
      { at: 80, label: "વકીલ સલાહ તૈયાર" },
      { at: 100, label: "રિપોર્ટ તૈયાર છે" },
    ],
    draftingTitle: "📜 કાનૂની ડ્રાફ્ટિંગ સ્ટુડિયો",
    draftingSubtitle: "વકીલ-સ્તરની કાનૂની નોટિસો અને આરટીઆઈ અરજીઓ તૈયાર કરો.",
    selectTemplateLabel: "દસ્તાવેજ નમૂનો પસંદ કરો:",
    btnReset: "રીસેટ",
    btnGenerate: "ડ્રાફ્ટ બનાવો",
    btnSynthesizing: "તૈયાર થઈ રહ્યું છે...",
    previewTitle: "દસ્તાવેજ પૂર્વાવલોકન",
    btnCopy: "કૉપિ કરો",
    btnExportPdf: "પીડીએફ ડાઉનલોડ",
    previewEmptyTitle: "દસ્તાવેજ નિર્માણની રાહ જોવાઈ રહી છે",
    previewEmptyDesc: "ડાબી બાજુએ વિગતો ભરો અથવા વૉઇસ ઑર્બનો ઉપયોગ કરો.",
    draftingLoaderPhases: [
      { at: 0, label: "ટેમ્પલેટ ચકાસણી" },
      { at: 30, label: "કોર્ટ નિયમ માળખું" },
      { at: 65, label: "સમયરેખા ગોઠવણી" },
      { at: 85, label: "અંતિમ નોટિસ સમીક્ષા" },
      { at: 100, label: "ડ્રાફ્ટ પૂર્ણ" },
    ],
    qaTitle: "🧭 નાગરિક અધિકાર માર્ગદર્શક",
    qaSubtitle: "ભારતીય કાયદા, પોલીસ સત્તા અને જામીન વિશે પ્રશ્નો પૂછો.",
    faqsLabel: "સામાન્ય પ્રશ્નો:",
    faq1: "⚖️ સૂર્યાસ્ત પછી મહિલાઓની ધરપકડ (BNSS)",
    faq2: "💳 ચેક બાઉન્સ કાનૂની પ્રક્રિયા (કલમ ૧૩૮)",
    faq3: "🏛️ નાલસા (NALSA) મફત કાનૂની સહાય",
    qaPlaceholder: "તમારી કાનૂની સમસ્યા લખો...",
    btnConsultAi: "સલાહ મેળવો",
    btnConsultingAi: "વિશ્લેષણ શરૂ...",
    guidanceOutputLabel: "માર્ગદર્શન પરિણામ",
    qaLoaderPhases: [
      { at: 0, label: "પ્રશ્ન વિશ્લેષણ" },
      { at: 35, label: "કાયદા સંદર્ભ તપાસ" },
      { at: 70, label: "માર્ગદર્શિકા નિર્માણ" },
      { at: 100, label: "સલાહ તૈયાર" },
    ],
    compendiumTitle: "🏛️ ભારતીય કાયદા સંગ્રહ",
    compendiumSubtitle: "નાગરિકોના કાનૂની અધિકારો અને ઉપાયો.",
    showcaseTitle: "⚡ શેડર અને ઇન્ટરેક્શન લેબ",
    showcaseSubtitle: "ન્યાયસહાયક ટેકનોલોજી."
  },

  ml: {
    appName: "ന്യായസഹായക്",
    appSubtitle: "എഐ നിയമ സഹായം • ലിക്വിഡ് മെറ്റൽ ന്യൂറൽ സ്യൂട്ട്",
    navVoice: "ന്യായ വാണി (വോയ്സ് ഓർബ്)",
    navDrafting: "കോടതി ഡ്രാഫ്റ്റർ",
    navQa: "അവകാശ വഴികാട്ടി",
    navStatutes: "നിയമ സംഗ്രഹം",
    navDemo: "ഷേഡർ ലാബ്",
    topVoiceBtn: "വോയ്സ് കൺസൾട്ട്",
    voiceTitle: "🎙️ വോയ്സ് നിയമ സഹായി (ന്യായ വാണി)",
    voiceSubtitle: "നിങ്ങളുടെ നിയമ പ്രശ്നം മലയാളത്തിൽ സംസാരിക്കുക. 3D ന്യൂറൽ ഓർബ് നിങ്ങളുടെ ശബ്ദം വിശകലനം ചെയ്ത് പ്രസക്തമായ വകുപ്പുകൾ കണ്ടെത്തും.",
    simulationsLabel: "1-ക്ലിക്ക് വോയ്സ് മാതൃകകൾ:",
    simulations: {
      salary: {
        title: "💼 '2 മാസത്തെ ശമ്പളം തടഞ്ഞുവെച്ചു'",
        text: "ബെംഗളൂരുവിലെ കമ്പനി എന്റെ രാജിക്ക് ശേഷം കഴിഞ്ഞ രണ്ട് മാസത്തെ 2 ലക്ഷത്തി 85 ആയിരം രൂപ ശമ്പളം തടഞ്ഞുവെച്ചിരിക്കുകയാണ്. മാനേജ്മെന്റ് മറുപടി നൽകുന്നില്ല."
      },
      cheque: {
        title: "💳 '₹6.5 ലക്ഷത്തിന്റെ ചെക്ക് മടങ്ങി'",
        text: "ബിസിനസ്സ് ഇടപാടുകാരൻ നൽകിയ 6 ലക്ഷത്തി 50 ആയിരം രൂപയുടെ ചെക്ക് അക്കൗണ്ടിൽ പണമില്ലാത്തതിനാൽ മടങ്ങിപ്പോയി."
      },
      consumer: {
        title: "🛒 'തകരാറിലായ റഫ്രിജറേറ്റർ'",
        text: "ഓൺലൈൻ വഴി 72 ആയിരം രൂപയ്ക്ക് വാങ്ങിയ ഫ്രിഡ്ജ് 10 ദിവസത്തിനകം പ്രവർത്തനരഹിതമായി. കമ്പനി മാറ്റിത്തരാൻ വിസമ്മതിക്കുന്നു."
      },
      rti: {
        title: "🔍 'റോഡ് ടെൻഡർ വിവരാവകാശം'",
        text: "റോഡ് അറ്റകുറ്റപ്പണിക്ക് ടെൻഡർ അനുവദിച്ചെങ്കിലും യാതൊരു പണിയും നടന്നില്ല. എനിക്ക് വിവരാവകാശ പ്രകാരം രേഖകൾ വേണം."
      }
    },
    orbLabel: "3D ന്യൂറൽ ഓർബ്",
    voiceActive: "ശബ്ദം സജീവം",
    voiceIdle: "കാത്തിരിക്കുന്നു",
    voiceListeningHeadline: "നിങ്ങളുടെ പ്രശ്നം കേൾക്കുന്നു...",
    voiceIdleHeadline: "മലയാളത്തിൽ സ്വാഭാവികമായി സംസാരിക്കുക",
    voiceListeningDesc: "ശബ്ദ വിശകലനം നടക്കുന്നു. സംസാരിച്ച ശേഷം നിർത്തുക.",
    voiceIdleDesc: "തുടങ്ങാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.",
    btnStartVoice: "വോയ്സ് കൺസൾട്ടേഷൻ",
    btnStopVoice: "നിർത്തുക",
    liveTranscriptLabel: "തത്സമയ സംഭാഷണ രേഖ:",
    transcriptPlaceholder: "നിങ്ങൾ സംസാരിക്കുന്ന വാക്കുകൾ ഇവിടെ ദൃശ്യമാകും...",
    btnRunNlp: "വിശകലനം നടത്തുക",
    btnAnalyzingNlp: "വിശകലനം ചെയ്യുന്നു...",
    intelTag: "നിയമ ഇന്റലിജൻസ് സ്യൂട്ട്",
    intelHeading: "നിയമ വകുപ്പുകളും പരിഹാരങ്ങളും",
    btnPlayAudio: "ഉപദേശം കേൾക്കുക",
    btnStopAudio: "ഓഡിയോ നിർത്തുക",
    noDisputeTitle: "ഇതുവരെ കേസുകളൊന്നും വിശകലനം ചെയ്തിട്ടില്ല",
    noDisputeDesc: "3D ഓർബിൽ സംസാരിക്കുക അല്ലെങ്കിൽ ഒരു മാതൃക തിരഞ്ഞെടുക്കുക.",
    classifiedCategoryLabel: "തരംതിരിച്ച നിയമ വിഭാഗം",
    confidenceSuffix: "% കൃത്യത",
    spokenAdviceLabel: "വോയ്സ് നിയമോപദേശം:",
    statutesLabel: "ബാധകമായ ഇന്ത്യൻ നിയമങ്ങൾ:",
    nerLabel: "കണ്ടെത്തിയ വിവരങ്ങൾ:",
    bridgeTitle: "കോടതി ലീഗൽ നോട്ടീസ്",
    bridgeDesc: "ഈ വിവരങ്ങൾ നേരിട്ട് കോടതി നോട്ടീസ് ഫോർമാറ്റിലേക്ക് മാറ്റുക.",
    bridgeBtn: "ഡ്രാഫ്റ്ററിലേക്ക് ചേർക്കുക",
    voiceLoaderPhases: [
      { at: 0, label: "ശബ്ദം റെക്കോർഡ് ചെയ്യുന്നു" },
      { at: 25, label: "മലയാളം ടെക്സ്റ്റ് ആക്കുന്നു" },
      { at: 55, label: "നിയമ വകുപ്പുകൾ പരിശോധിക്കുന്നു" },
      { at: 80, label: "അഭിഭാഷക ഉപദേശം തയ്യാറാക്കുന്നു" },
      { at: 100, label: "റിപ്പോർട്ട് തയ്യാർ" },
    ],
    draftingTitle: "📜 ഓട്ടോമേറ്റഡ് ലീഗൽ ഡ്രാഫ്റ്റിംഗ് സ്റ്റുഡിയോ",
    draftingSubtitle: "അഭിഭാഷക നിലവാരത്തിലുള്ള ലീഗൽ നോട്ടീസുകളും വിവരാവകാശ അപേക്ഷകളും തയ്യാറാക്കുക.",
    selectTemplateLabel: "നോട്ടീസ് മാതൃക തിരഞ്ഞെടുക്കുക:",
    btnReset: "റീസെറ്റ്",
    btnGenerate: "ഡ്രാഫ്റ്റ് തയ്യാറാക്കുക",
    btnSynthesizing: "തയ്യാറാക്കുന്നു...",
    previewTitle: "രേഖയുടെ പ്രിവ്യൂ",
    btnCopy: "പകർപ്പStub",
    btnExportPdf: "പിഡിഎഫ് ഡൗൺലോഡ്",
    previewEmptyTitle: "രേഖ നിർമ്മാണത്തിനായി കാത്തിരിക്കുന്നു",
    previewEmptyDesc: "ഇടതുവശത്ത് വിവരങ്ങൾ നൽകുക അല്ലെങ്കിൽ വോയ്സ് ഓർബ് ഉപയോഗിക്കുക.",
    draftingLoaderPhases: [
      { at: 0, label: "ടെംപ്ലേറ്റ് പരിശോധിക്കുന്നു" },
      { at: 30, label: "കോടതി നിബന്ധനകൾ ക്രമീകരിക്കുന്നു" },
      { at: 65, label: "വിവരങ്ങൾ ചിട്ടപ്പെടുത്തുന്നു" },
      { at: 85, label: "അന്തിമ പരിശോധന" },
      { at: 100, label: "ഡ്രാഫ്റ്റ് തയ്യാറായി" },
    ],
    qaTitle: "🧭 പൗരാവകാശ വഴികാട്ടി",
    qaSubtitle: "ഇന്ത്യൻ നിയമങ്ങൾ, പോലീസ് അധികാരങ്ങൾ, ജാമ്യം എന്നിവയെക്കുറിച്ച് ചോദിക്കുക.",
    faqsLabel: "പ്രധാന ചോദ്യങ്ങൾ:",
    faq1: "⚖️ സൂര്യാസ്തമയത്തിനു ശേഷം സ്ത്രീകളെ അറസ്റ്റ് ചെയ്യുന്നത് (BNSS)",
    faq2: "💳 ചെക്ക് മടങ്ങൽ നിയമനടപടികൾ (വകുപ്പ് 138)",
    faq3: "🏛️ നൽസ (NALSA) സൗജന്യ നിയമസഹായം",
    qaPlaceholder: "നിങ്ങളുടെ നിയമ പ്രശ്നം വിശദീകരിക്കുക...",
    btnConsultAi: "ഉപദേശം തേടുക",
    btnConsultingAi: "വിശകലനം ചെയ്യുന്നു...",
    guidanceOutputLabel: "മാർഗ്ഗനിർദ്ദേശം",
    qaLoaderPhases: [
      { at: 0, label: "ചോദ്യം പരിശോധിക്കുന്നു" },
      { at: 35, label: "നിയമ പരാമർശങ്ങൾ തിരയുന്നു" },
      { at: 70, label: "വഴികാട്ടി തയ്യാറാക്കുന്നു" },
      { at: 100, label: "ഉപദേശം തയ്യാർ" },
    ],
    compendiumTitle: "🏛️ ഇന്ത്യൻ നിയമ സംഗ്രഹം",
    compendiumSubtitle: "പൗരന്മാരുടെ അവകാശങ്ങളും പരിഹാരങ്ങളും.",
    showcaseTitle: "⚡ ഷേഡർ & ഇന്ററാക്ഷൻ ലാബ്",
    showcaseSubtitle: "ന്യായസഹായക് സാങ്കേതികവിദ്യ."
  },

  pa: {
    appName: "ਨਿਆਇਸਹਾਇਕ",
    appSubtitle: "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ • ਲਿਕਵਿਡ ਮੈਟਲ ਨਿਊਰਲ ਸੂਟ",
    navVoice: "ਨਿਆਇ ਬਾਣੀ (ਵਾਇਸ ਔਰਬ)",
    navDrafting: "ਕੋਰਟ ਡਰਾਫਟਰ",
    navQa: "ਅਧਿਕਾਰ ਗਾਈਡ",
    navStatutes: "ਕਾਨੂੰਨ ਸੰਗ੍ਰਹਿ",
    navDemo: "ਸ਼ੇਡਰ ਲੈਬ",
    topVoiceBtn: "ਵਾਇਸ ਸਲਾਹ",
    voiceTitle: "🎙️ ਵਾਇਸ ਕਾਨੂੰਨੀ ਸਹਾਇਕ (ਨਿਆਇ ਬਾਣੀ)",
    voiceSubtitle: "ਆਪਣੀ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ। 3D ਨਿਊਰਲ ਔਰਬ ਤੁਹਾਡੀ ਆਵਾਜ਼ ਸੁਣ ਕੇ ਭਾਰਤੀ ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੇਗਾ।",
    simulationsLabel: "1-ਕਲਿੱਕ ਵਾਇਸ ਨਮੂਨੇ:",
    simulations: {
      salary: {
        title: "💼 '2 ਮਹੀਨੇ ਦੀ ਤਨਖਾਹ ਰੋਕੀ'",
        text: "ਮੇਰੇ ਅਸਤੀਫੇ ਤੋਂ ਬਾਅਦ ਕੰਪਨੀ ਨੇ ਮੇਰੀ 2 ਲੱਖ 85 ਹਜ਼ਾਰ ਰੁਪਏ ਦੀ ਦੋ ਮਹੀਨਿਆਂ ਦੀ ਤਨਖਾਹ ਰੋਕ ਲਈ ਹੈ। ਐਚਆਰ ਕੋਈ ਜਵਾਬ ਨਹੀਂ ਦੇ ਰਿਹਾ।"
      },
      cheque: {
        title: "💳 '₹6.5 ਲੱਖ ਦਾ ਚੈੱਕ ਬਾਊਂਸ'",
        text: "ਸੰਜੇ ਸਿੰਘਲ ਵੱਲੋਂ ਦਿੱਤਾ ਗਿਆ 6 ਲੱਖ 50 ਹਜ਼ਾਰ ਰੁਪਏ ਦਾ ਚੈੱਕ ਖਾਤੇ ਵਿੱਚ ਪੈਸੇ ਨਾ ਹੋਣ ਕਾਰਨ ਬਾਊਂਸ ਹੋ ਗਿਆ ਹੈ।"
      },
      consumer: {
        title: "🛒 'ਖਰਾਬ ਫਰਿੱਜ ਵਾਰੰਟੀ ਇਨਕਾਰ'",
        text: "ਮੈਂ ਆਨਲਾਈਨ 72 ਹਜ਼ਾਰ ਰੁਪਏ ਦਾ ਫਰਿੱਜ ਖਰੀਦਿਆ ਜੋ 10 ਦਿਨਾਂ ਵਿੱਚ ਖਰਾਬ ਹੋ ਗਿਆ। ਕੰਪਨੀ ਬਦਲਣ ਤੋਂ ਇਨਕਾਰ ਕਰ ਰਹੀ ਹੈ।"
      },
      rti: {
        title: "🔍 'ਸੜਕ ਮੁਰੰਮਤ ਆਰਟੀਆਈ'",
        text: "ਨਗਰ ਨਿਗਮ ਨੇ ਸੜਕ ਮੁਰੰਮਤ ਦਾ ਟੈਂਡਰ ਜਾਰੀ ਕੀਤਾ ਪਰ ਕੋਈ ਕੰਮ ਨਹੀਂ ਹੋਇਆ। ਮੈਨੂੰ ਆਰਟੀਆਈ ਰਾਹੀਂ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ।"
      }
    },
    orbLabel: "3D ਨਿਊਰਲ ਔਰਬ",
    voiceActive: "ਆਵਾਜ਼ ਸਰਗਰਮ",
    voiceIdle: "ਉਡੀਕ ਵਿੱਚ",
    voiceListeningHeadline: "ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਸੁਣ ਰਹੇ ਹਾਂ...",
    voiceIdleHeadline: "ਪੰਜਾਬੀ ਜਾਂ ਕਿਸੇ ਵੀ ਭਾਰਤੀ ਬੋਲੀ ਵਿੱਚ ਬੋਲੋ",
    voiceListeningDesc: "ਆਵਾਜ਼ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਜਾਰੀ ਹੈ।",
    voiceIdleDesc: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਹੇਠਾਂ ਕਲਿੱਕ ਕਰੋ।",
    btnStartVoice: "ਸਲਾਹ ਸ਼ੁਰੂ ਕਰੋ",
    btnStopVoice: "ਰੋਕੋ",
    liveTranscriptLabel: "ਲਾਈਵ ਬੋਲੇ ਗਏ ਸ਼ਬਦ:",
    transcriptPlaceholder: "ਤੁਹਾਡੇ ਬੋਲੇ ਸ਼ਬਦ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ...",
    btnRunNlp: "ਵਿਸ਼ਲੇਸ਼ਣ ਚਲਾਓ",
    btnAnalyzingNlp: "ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...",
    intelTag: "ਕਾਨੂੰਨੀ ਇੰਟੈਲੀਜੈਂਸ ਸੂਟ",
    intelHeading: "ਕਾਨੂੰਨੀ ਉਪਾਅ ਅਤੇ ਧਾਰਾਵਾਂ",
    btnPlayAudio: "ਸਲਾਹ ਸੁਣੋ",
    btnStopAudio: "ਆਡੀਓ ਬੰਦ ਕਰੋ",
    noDisputeTitle: "ਅਜੇ ਕੋਈ ਕੇਸ ਦਰਜ ਨਹੀਂ ਹੋਇਆ",
    noDisputeDesc: "3D ਔਰਬ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਨਮੂਨਾ ਚੁਣੋ।",
    classifiedCategoryLabel: "ਕਾਨੂੰਨੀ ਸ਼੍ਰੇਣੀ",
    confidenceSuffix: "% ਸ਼ੁੱਧਤਾ",
    spokenAdviceLabel: "ਕਾਨੂੰਨੀ ਸਲਾਹ:",
    statutesLabel: "ਲਾਗੂ ਭਾਰਤੀ ਕਾਨੂੰਨ:",
    nerLabel: "ਦਰਜ ਵੇਰਵੇ:",
    bridgeTitle: "ਅਦਾਲਤੀ ਕਾਨੂੰਨੀ ਨੋਟਿਸ",
    bridgeDesc: "ਵੇਰਵੇ ਸਿੱਧੇ ਅਦਾਲਤੀ ਨੋਟਿਸ ਵਿੱਚ ਭਰੋ।",
    bridgeBtn: "ਡਰਾਫਟਰ ਵਿੱਚ ਭਰੋ",
    voiceLoaderPhases: [
      { at: 0, label: "ਆਵਾਜ਼ ਰਿਕਾਰਡ ਹੋ ਰਹੀ ਹੈ" },
      { at: 25, label: "ਪੰਜਾਬੀ ਟੈਕਸਟ ਵਿੱਚ ਤਬਦੀਲੀ" },
      { at: 55, label: "ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ ਦੀ ਜਾਂਚ" },
      { at: 80, label: "ਵਕੀਲ ਸਲਾਹ ਤਿਆਰੀ" },
      { at: 100, label: "ਰਿਪੋਰਟ ਤਿਆਰ ਹੈ" },
    ],
    draftingTitle: "📜 ਆਟੋਮੇਟਿਡ ਕਾਨੂੰਨੀ ਡਰਾਫਟਿੰਗ ਸਟੂਡੀਓ",
    draftingSubtitle: "ਵਕੀਲ ਪੱਧਰ ਦੇ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਅਤੇ ਆਰਟੀਆਈ ਅਰਜ਼ੀਆਂ ਤਿਆਰ ਕਰੋ।",
    selectTemplateLabel: "ਦਸਤਾਵੇਜ਼ ਚੁਣੋ:",
    btnReset: "ਰੀਸੈਟ",
    btnGenerate: "ਡਰਾਫਟ ਬਣਾਓ",
    btnSynthesizing: "ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ...",
    previewTitle: "ਦਸਤਾਵੇਜ਼ ਝਲਕ",
    btnCopy: "ਕਾਪੀ ਕਰੋ",
    btnExportPdf: "ਪੀਡੀਐਫ ਡਾਊਨਲੋਡ",
    previewEmptyTitle: "ਦਸਤਾਵੇਜ਼ ਤਿਆਰੀ ਦੀ ਉਡੀਕ",
    previewEmptyDesc: "ਖੱਬੇ ਪਾਸੇ ਵੇਰਵੇ ਭਰੋ ਜਾਂ ਵਾਇਸ ਔਰਬ ਵਰਤੋ।",
    draftingLoaderPhases: [
      { at: 0, label: "ਟੈਂਪਲੇਟ ਜਾਂਚ" },
      { at: 30, label: "ਅਦਾਲਤੀ ਨਿਯਮ ਰਚਨਾ" },
      { at: 65, label: "ਵੇਰਵੇ ਤਰਤੀਬ" },
      { at: 85, label: "ਅੰਤਿਮ ਨੋਟਿਸ ਸਮੀਖਿਆ" },
      { at: 100, label: "ਡਰਾਫਟ ਮੁਕੰਮਲ" },
    ],
    qaTitle: "🧭 ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਗਾਈਡ",
    qaSubtitle: "ਭਾਰਤੀ ਕਾਨੂੰਨ, ਪੁਲਿਸ ਅਧਿਕਾਰਾਂ ਅਤੇ ਜ਼ਮਾਨਤ ਬਾਰੇ ਸਵਾਲ ਪੁੱਛੋ।",
    faqsLabel: "ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ:",
    faq1: "⚖️ ਸੂਰਜ ਡੁੱਬਣ ਤੋਂ ਬਾਅਦ ਔਰਤਾਂ ਦੀ ਗ੍ਰਿਫ਼ਤਾਰੀ (BNSS)",
    faq2: "💳 ਚੈੱਕ ਬਾਊਂਸ ਕਾਨੂੰਨੀ ਪ੍ਰਕਿਰਿਆ (ਧਾਰਾ 138)",
    faq3: "🏛️ ਨਾਲਸਾ (NALSA) ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ",
    qaPlaceholder: "ਆਪਣੀ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਲਿਖੋ...",
    btnConsultAi: "ਸਲਾਹ ਲਵੋ",
    btnConsultingAi: "ਜਾਂਚ ਜਾਰੀ...",
    guidanceOutputLabel: "ਸੇਧ ਨਤੀਜਾ",
    qaLoaderPhases: [
      { at: 0, label: "ਸਵਾਲ ਦੀ ਜਾਂਚ" },
      { at: 35, label: "ਕਾਨੂੰਨ ਹਵਾਲੇ ਖੋਜ" },
      { at: 70, label: "ਅਧਿਕਾਰ ਗਾਈਡ ਤਿਆਰੀ" },
      { at: 100, label: "ਸਲਾਹ ਤਿਆਰ" },
    ],
    compendiumTitle: "🏛️ ਭਾਰਤੀ ਕਾਨੂੰਨ ਸੰਗ੍ਰਹਿ",
    compendiumSubtitle: "ਨਾਗਰਿਕਾਂ ਦੇ ਅਧਿਕਾਰ ਅਤੇ ਉਪਾਅ।",
    showcaseTitle: "⚡ ਸ਼ੇਡਰ ਅਤੇ ਇੰਟਰੈਕਸ਼ਨ ਲੈਬ",
    showcaseSubtitle: "ਨਿਆਇਸਹਾਇਕ ਤਕਨਾਲੋਜੀ।"
  }
};

interface LanguageContextType {
  language: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem("nyayasahayak_lang") as LanguageCode;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch (e) {}
    return "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("nyayasahayak_lang", lang);
    } catch (e) {}
  };

  const languageInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, languageInfo, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
