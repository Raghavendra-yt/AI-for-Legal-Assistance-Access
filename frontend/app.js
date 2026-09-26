// NYAYASAHAYAK FRONTEND CLIENT ENGINE

const API_BASE = window.location.origin.includes(":5173") 
  ? "http://localhost:8000" 
  : window.location.origin;

let availableTemplates = [];
let currentTemplate = null;
let currentGeneratedDraft = null;

// Realistic Pre-loaded Indian Legal Case Scenarios for 1-Click Auto-Fill Demo
const SAMPLE_CASES = {
  salary: {
    template_id: "legal_notice_money",
    fields: {
      sender_name: "Aakash Verma",
      sender_address: "Flat 402, Shivalik Residency, Outer Ring Road, Bengaluru, Karnataka - 560103",
      recipient_name: "The Managing Director / HR Director, NextGen Cloud Labs Pvt. Ltd.",
      recipient_address: "Embassy TechVillage, Tower 2A, Devarabisanahalli, Bengaluru - 560103",
      dispute_type: "Unpaid Salary for 2 Months & Full & Final Settlement Dues",
      claim_amount: "₹2,85,000/- (Rupees Two Lakhs Eighty-Five Thousand only)",
      interest_rate: "18% per annum",
      factual_timeline: "1. The Claimant worked as Senior Backend Engineer from 15th April 2023 until resignation on 31st December 2025.\n2. The Claimant served the full statutory notice period of 60 days up to 28th February 2026 and completed all project handovers.\n3. The Company issued relieving letter acknowledging satisfactory exit but failed to credit salary for January & February 2026, totaling ₹2,85,000.\n4. Repeated emails to HR and Accounts dated 5th March, 15th March, and 22nd March were met with vague promises and willful non-payment.",
      advocate_name: "Adv. K. R. Nambiar, High Court of Karnataka"
    }
  },
  cheque: {
    template_id: "cheque_bounce_138",
    fields: {
      sender_name: "Rameshwar Dayal & Sons (Proprietor Rajesh Dayal)",
      sender_address: "Shop No. 18, Grain Market, Chandni Chowk, Delhi - 110006",
      recipient_name: "Sanjay Singhal, Director of Singhal Agro Foods Pvt. Ltd.",
      recipient_address: "C-14, Lawrence Road Industrial Area, Delhi - 110035",
      cheque_number: "Cheque No. 602914 dated 05/01/2026",
      bank_details: "ICICI Bank Ltd., Connaught Place Branch, New Delhi",
      cheque_amount: "₹6,50,000/- (Rupees Six Lakhs Fifty Thousand only)",
      dishonour_reason: "FUNDS INSUFFICIENT",
      memo_date: "12/01/2026"
    }
  },
  consumer: {
    template_id: "consumer_complaint",
    fields: {
      sender_name: "Pooja Hegde, W/o Sh. Arvind Hegde",
      sender_address: "Plot 42, Sector 21, Gandhinagar, Gujarat - 382021",
      recipient_name: "SmartElectronics Retail India Pvt. Ltd. & CoolFrost Refrigeration Ltd.",
      recipient_address: "Regional Customer Service Office, Sarkhej-Gandhinagar Highway, Ahmedabad - 380054",
      transaction_date: "14th November 2025",
      consideration_paid: "₹72,499/- paid via Credit Card",
      deficiency_details: "1. Complainant purchased a 450L Double-Door Smart Refrigerator on 14/11/2025 with 5-year warranty.\n2. Within 12 days of delivery, the cooling compressor failed completely, spoiling food items worth ₹8,000.\n3. Authorized service technician visited on 02/12/2025 (Job Card #CF-9821) and certified internal manufacturing gas leakage.\n4. The Opposite Party refused replacement or refund, falsely alleging voltage fluctuation, despite stabilizer installation.",
      compensation_sought: "Full refund of ₹72,499/- with 18% interest, ₹35,000/- for food spoilage & mental agony, and ₹15,000/- legal expenses."
    }
  },
  rti: {
    template_id: "rti_application",
    fields: {
      sender_name: "Vikas Ramachandran",
      sender_address: "House 24, 7th Cross, Malleshwaram, Bengaluru, Karnataka - 560003",
      recipient_name: "The Public Information Officer (PIO), Bruhat Bengaluru Mahanagara Palike (BBMP)",
      recipient_address: "BBMP Head Office, Corporation Circle, Hudson Circle, Bengaluru - 560002",
      information_points: "1. Certified copy of the tender sanctioned for asphalt road repair on 7th Cross Malleshwaram for financial year 2025-26.\n2. Name and contact details of the contractor awarded the tender.\n3. Exact date of commencement and scheduled completion of road works.\n4. Copy of the quality inspection report submitted by the BBMP Executive Engineer prior to payment clearance.",
      fee_details: "Indian Postal Order (IPO) No. 44G 981240 of ₹10/- attached herewith"
    }
  }
};

// Initialize Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  fetchTemplates();
  fetchStatutoryTopics();
  loadSavedApiKey();
});

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll(".view-panel").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(el => el.classList.remove("active"));

  const targetPanel = document.getElementById(`tab-${tabId}`);
  const targetTab = document.getElementById(`nav-${tabId}-btn`);
  
  if (targetPanel) targetPanel.classList.add("active");
  if (targetTab) targetTab.classList.add("active");
}

// Fetch Templates from Backend
async function fetchTemplates() {
  try {
    const res = await fetch(`${API_BASE}/api/draft/templates`);
    const data = await res.json();
    availableTemplates = data.templates || [];

    const select = document.getElementById("template-select");
    select.innerHTML = "";

    availableTemplates.forEach(tmpl => {
      const option = document.createElement("option");
      option.value = tmpl.id;
      option.textContent = tmpl.title;
      select.appendChild(option);
    });

    if (availableTemplates.length > 0) {
      onTemplateChange();
    }
  } catch (err) {
    console.warn("Using offline templates fallback:", err);
  }
}

// Render dynamic form fields based on active template
function onTemplateChange() {
  const select = document.getElementById("template-select");
  const templateId = select.value;
  currentTemplate = availableTemplates.find(t => t.id === templateId) || availableTemplates[0];

  if (!currentTemplate) return;

  // Update meta banner
  document.getElementById("meta-statute").textContent = `STATUTORY AUTHORITY: ${currentTemplate.statute}`;
  document.getElementById("meta-desc").textContent = currentTemplate.description;

  // Build form fields
  const container = document.getElementById("dynamic-form-fields");
  container.innerHTML = "";

  currentTemplate.required_fields.forEach(f => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.className = "field-label";
    label.setAttribute("for", `field-${f.key}`);
    label.textContent = f.label;

    let input;
    if (f.key.includes("timeline") || f.key.includes("details") || f.key.includes("facts") || f.key.includes("points") || f.key.includes("compensation")) {
      input = document.createElement("textarea");
      input.className = "custom-textarea";
      input.rows = 4;
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "custom-input";
    }

    input.id = `field-${f.key}`;
    input.name = f.key;
    input.placeholder = f.placeholder;
    input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    container.appendChild(group);
  });
}

// 1-Click Auto Fill Demo
function loadSampleCase(caseKey) {
  const sample = SAMPLE_CASES[caseKey];
  if (!sample) return;

  const select = document.getElementById("template-select");
  select.value = sample.template_id;
  onTemplateChange();

  // Populate fields
  setTimeout(() => {
    Object.entries(sample.fields).forEach(([key, val]) => {
      const el = document.getElementById(`field-${key}`);
      if (el) el.value = val;
    });
  }, 50);
}

// Clear Form
function resetForm() {
  document.getElementById("drafting-form").reset();
}

// Handle Generate Draft Submission
async function handleGenerateDraft(e) {
  e.preventDefault();
  const btn = document.getElementById("generate-btn");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="status-dot"></span> Drafting Under Indian Law...`;
  btn.disabled = true;

  const templateId = document.getElementById("template-select").value;
  const fields = {};

  currentTemplate.required_fields.forEach(f => {
    const el = document.getElementById(`field-${f.key}`);
    if (el) fields[f.key] = el.value.trim();
  });

  try {
    const res = await fetch(`${API_BASE}/api/draft/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: templateId, fields })
    });

    if (!res.ok) throw new Error(`Server returned error ${res.status}`);
    const data = await res.json();
    currentGeneratedDraft = data;

    renderDocumentPreview(data);
  } catch (err) {
    alert("Draft generation error: " + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Render Formatted Legal Sheet
function renderDocumentPreview(data) {
  document.getElementById("empty-state").style.display = "none";
  const draftContent = document.getElementById("draft-content");
  draftContent.style.display = "block";
  draftContent.textContent = data.draft_text;

  document.getElementById("preview-title").textContent = data.title;
  document.getElementById("preview-statute-tag").textContent = data.statute || "INDIAN JUDICIAL DRAFT";
  document.getElementById("draft-engine-tag").textContent = `⚡ ${data.engine_used}`;

  // Scroll to sheet smoothly
  document.getElementById("document-viewport").scrollTo({ top: 0, behavior: "smooth" });
}

// Copy Draft
function copyDraftText() {
  if (!currentGeneratedDraft || !currentGeneratedDraft.draft_text) {
    alert("Please generate a draft first.");
    return;
  }
  navigator.clipboard.writeText(currentGeneratedDraft.draft_text);
  alert("Legal draft copied to clipboard!");
}

// Print Draft
function printDraft() {
  if (!currentGeneratedDraft || !currentGeneratedDraft.draft_text) {
    alert("Please generate a draft first.");
    return;
  }
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>${currentGeneratedDraft.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; margin: 40px; color: #000; }
          pre { white-space: pre-wrap; font-family: inherit; }
        </style>
      </head>
      <body>
        <pre>${currentGeneratedDraft.draft_text}</pre>
        <script>window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Download Court PDF
async function downloadDraftPDF() {
  if (!currentGeneratedDraft || !currentGeneratedDraft.draft_text) {
    alert("Please generate a draft first before exporting to PDF.");
    return;
  }

  const btn = document.getElementById("btn-download-pdf");
  const origText = btn.innerHTML;
  btn.innerHTML = "⏳ Generating PDF...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/draft/export-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: currentGeneratedDraft.title,
        draft_text: currentGeneratedDraft.draft_text
      })
    });

    if (!res.ok) throw new Error("Failed to export PDF");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentGeneratedDraft.title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("Error downloading PDF: " + err.message);
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

// CITIZEN RIGHTS NAVIGATOR (TAB 2)
async function handleAskQA(e) {
  e.preventDefault();
  const input = document.getElementById("qa-query-input");
  const query = input.value.trim();
  if (!query) return;

  const btn = document.getElementById("qa-submit-btn");
  btn.innerHTML = "Consulting Indian Statutes...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/legal-qa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    document.getElementById("qa-result-box").style.display = "block";
    document.getElementById("qa-answer-text").textContent = data.answer;
    document.getElementById("qa-engine-badge").textContent = data.engine;
  } catch (err) {
    alert("Consultation error: " + err.message);
  } finally {
    btn.innerHTML = `<span class="btn-sparkle">🔍</span> Consult NyayaSahayak`;
    btn.disabled = false;
  }
}

function askPredefinedQuery(text) {
  document.getElementById("qa-query-input").value = text;
  document.getElementById("qa-form").dispatchEvent(new Event("submit"));
}

function copyQAResult() {
  const text = document.getElementById("qa-answer-text").textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
  alert("Legal guidance copied to clipboard!");
}

// STATUTORY COMPENDIUM (TAB 3)
async function fetchStatutoryTopics() {
  try {
    const res = await fetch(`${API_BASE}/api/statutes/topics`);
    const data = await res.json();
    const grid = document.getElementById("statutes-grid");
    grid.innerHTML = "";

    Object.values(data.topics || {}).forEach(t => {
      const card = document.createElement("div");
      card.className = "statute-card glass-panel";

      const h3 = document.createElement("h3");
      h3.textContent = t.title;

      const act = document.createElement("div");
      act.className = "card-act";
      act.textContent = t.statute;

      const ul = document.createElement("ul");
      t.key_points.forEach(pt => {
        const li = document.createElement("li");
        li.textContent = pt;
        ul.appendChild(li);
      });

      card.appendChild(h3);
      card.appendChild(act);
      card.appendChild(ul);
      grid.appendChild(card);
    });
  } catch (err) {
    console.warn("Error fetching statutory topics:", err);
  }
}

// Key Modal Management
function openKeyModal() {
  document.getElementById("key-modal").style.display = "flex";
}

function closeKeyModal() {
  document.getElementById("key-modal").style.display = "none";
}

function saveKeySettings() {
  const key = document.getElementById("modal-gemini-key").value.trim();
  if (key) {
    localStorage.setItem("nyaya_gemini_key", key);
    alert("Gemini Key saved to local storage! (For persistent backend use, place GEMINI_API_KEY in the .env file).");
  }
  closeKeyModal();
}

function loadSavedApiKey() {
  const savedKey = localStorage.getItem("nyaya_gemini_key");
  if (savedKey) {
    const input = document.getElementById("modal-gemini-key");
    if (input) input.value = savedKey;
  }
}

// ==========================================================
// NYAYA VANI - VOICE NLP ENGINE & SPEECH SYNTHESIS
// ==========================================================

let isVoiceListening = false;
let speechRecognizer = null;
let currentSpeechUtterance = null;
let lastProcessedVoiceData = null;

// Initialize Speech Recognition if supported by browser
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.info("Web Speech API not supported in this browser; simulation mode fully active.");
    return null;
  }

  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-IN"; // English (India) with Hindi/Hinglish phonetic tolerance

  rec.onstart = () => {
    isVoiceListening = true;
    updateVoiceUIState("listening");
  };

  rec.onresult = (event) => {
    let transcriptText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcriptText += event.results[i][0].transcript;
    }
    const input = document.getElementById("voice-transcript-input");
    if (input) input.value = transcriptText;
  };

  rec.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    isVoiceListening = false;
    updateVoiceUIState("ready");
    if (event.error === "not-allowed") {
      alert("Microphone permission denied. You can still use the 1-click spoken simulations or type directly!");
    }
  };

  rec.onend = () => {
    isVoiceListening = false;
    updateVoiceUIState("ready");
  };

  return rec;
}

function toggleVoiceListening() {
  if (!speechRecognizer) {
    speechRecognizer = initSpeechRecognition();
  }

  if (!speechRecognizer) {
    alert("Microphone access is not supported in this browser. Please use the 1-Click Spoken Simulations above!");
    return;
  }

  if (isVoiceListening) {
    speechRecognizer.stop();
    isVoiceListening = false;
    updateVoiceUIState("ready");
  } else {
    try {
      speechRecognizer.start();
    } catch (e) {
      console.warn("Speech restart:", e);
    }
  }
}

function updateVoiceUIState(state) {
  const micBtn = document.getElementById("mic-trigger-btn");
  const heading = document.getElementById("voice-status-heading");
  const sub = document.getElementById("voice-status-sub");

  if (!micBtn || !heading || !sub) return;

  if (state === "listening") {
    micBtn.classList.add("listening");
    heading.textContent = "Listening... Speak your legal dispute";
    sub.textContent = "Listening in real-time. Speak in English, Hindi, or Hinglish...";
  } else if (state === "processing") {
    micBtn.classList.remove("listening");
    heading.textContent = "Processing Legal NLP...";
    sub.textContent = "Categorizing dispute, extracting named entities, and mapping Indian statutes...";
  } else {
    micBtn.classList.remove("listening");
    heading.textContent = "Ready to Listen";
    sub.textContent = "Click the microphone and state your legal dispute in natural language";
  }
}

function clearVoiceTranscript() {
  document.getElementById("voice-transcript-input").value = "";
}

// 1-Click Spoken Simulations (Allows testing immediately without talking aloud)
const SPOKEN_SIMULATIONS = {
  salary: "My employer NextGen Cloud Labs in Bengaluru has withheld my salary for the last two months amounting to 2 lakh 85 thousand rupees after my resignation. HR is ignoring my emails.",
  cheque: "A business client Sanjay Singhal from Delhi issued me an ICICI bank cheque of 6 lakh 50 thousand rupees which bounced due to funds insufficient on 12th January.",
  consumer: "I purchased a smart double-door refrigerator for 72 thousand rupees from an online store and it stopped cooling within 10 days. The company is refusing replacement or refund.",
  rti: "The municipal corporation in Gurugram awarded a road repair tender in Ward 12, but no work was done. I need certified copies of the tender contract and expenses under RTI."
};

function simulateVoiceQuery(simKey) {
  const text = SPOKEN_SIMULATIONS[simKey];
  if (!text) return;

  const input = document.getElementById("voice-transcript-input");
  input.value = text;
  submitVoiceTranscript();
}

// Submit Transcript to Backend Voice NLP Pipeline
async function submitVoiceTranscript() {
  const transcriptInput = document.getElementById("voice-transcript-input");
  const transcript = transcriptInput.value.trim();

  if (!transcript) {
    alert("Please speak into the microphone or click a simulation button above first.");
    return;
  }

  // Stop listening if active
  if (speechRecognizer && isVoiceListening) {
    speechRecognizer.stop();
  }

  updateVoiceUIState("processing");

  try {
    const res = await fetch(`${API_BASE}/api/voice/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript })
    });

    if (!res.ok) throw new Error(`Voice NLP error: ${res.status}`);
    const data = await res.json();
    lastProcessedVoiceData = data;

    renderVoiceNLPResults(data);
  } catch (err) {
    alert("Error processing voice NLP: " + err.message);
  } finally {
    updateVoiceUIState("ready");
  }
}

// Render Extracted NLP Entities, Intent, and Voice Audio Controls
function renderVoiceNLPResults(data) {
  document.getElementById("voice-empty-placeholder").style.display = "none";
  const resultsCard = document.getElementById("voice-results-content");
  resultsCard.style.display = "block";

  // Intent & Confidence
  document.getElementById("nlp-intent-title").textContent = data.intent_title || data.detected_intent;
  const confPct = Math.round((data.confidence_score || 0.95) * 100);
  document.getElementById("nlp-confidence").textContent = `${confPct}% NLP Confidence`;

  // Spoken Text Summary
  document.getElementById("nlp-spoken-response").textContent = data.spoken_response;

  // Statutes List
  const statutesContainer = document.getElementById("nlp-statutes-list");
  statutesContainer.innerHTML = "";
  (data.statutory_references || []).forEach(st => {
    const chip = document.createElement("span");
    chip.className = "statute-chip-item";
    chip.textContent = `⚖️ ${st}`;
    statutesContainer.appendChild(chip);
  });

  // Entities Grid
  const entitiesGrid = document.getElementById("nlp-entities-grid");
  entitiesGrid.innerHTML = "";
  const entities = data.extracted_entities || {};

  Object.entries(entities).forEach(([key, val]) => {
    if (val) {
      const item = document.createElement("div");
      item.className = "entity-card-item";

      const kSpan = document.createElement("span");
      kSpan.className = "entity-key";
      kSpan.textContent = key.replace(/_/g, " ");

      const vSpan = document.createElement("span");
      vSpan.className = "entity-val";
      vSpan.textContent = typeof val === "object" ? JSON.stringify(val) : val;

      item.appendChild(kSpan);
      item.appendChild(vSpan);
      entitiesGrid.appendChild(item);
    }
  });

  // Show Audio Controls
  document.getElementById("voice-audio-controls").style.display = "block";

  // Automatically start voice playback of legal advice
  playVoiceAudio(data.spoken_response);
}

// Voice Text-To-Speech (TTS)
function playVoiceAudio(textToSpeak) {
  if (!("speechSynthesis" in window)) {
    console.info("SpeechSynthesis not available in this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any currently playing audio

  currentSpeechUtterance = new SpeechSynthesisUtterance(textToSpeak);
  currentSpeechUtterance.lang = "en-IN";
  currentSpeechUtterance.rate = 1.0;
  currentSpeechUtterance.pitch = 1.0;

  const waves = document.getElementById("audio-waves");
  const playLabel = document.getElementById("audio-play-label");
  const playIcon = document.getElementById("audio-play-icon");

  currentSpeechUtterance.onstart = () => {
    if (waves) waves.classList.add("playing");
    if (playLabel) playLabel.textContent = "Stop Voice";
    if (playIcon) playIcon.textContent = "⏹️";
  };

  currentSpeechUtterance.onend = () => {
    if (waves) waves.classList.remove("playing");
    if (playLabel) playLabel.textContent = "Listen Advice";
    if (playIcon) playIcon.textContent = "🔊";
  };

  currentSpeechUtterance.onerror = () => {
    if (waves) waves.classList.remove("playing");
    if (playLabel) playLabel.textContent = "Listen Advice";
    if (playIcon) playIcon.textContent = "🔊";
  };

  window.speechSynthesis.speak(currentSpeechUtterance);
}

function toggleAudioPlayback() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    const waves = document.getElementById("audio-waves");
    if (waves) waves.classList.remove("playing");
    document.getElementById("audio-play-label").textContent = "Listen Advice";
    document.getElementById("audio-play-icon").textContent = "🔊";
  } else if (lastProcessedVoiceData && lastProcessedVoiceData.spoken_response) {
    playVoiceAudio(lastProcessedVoiceData.spoken_response);
  }
}

// 1-Click Bridge: Auto-Fill & Open Legal Drafting Studio from Voice NLP
function autofillAndSwitchToDrafting() {
  if (!lastProcessedVoiceData) return;

  const targetTemplateId = lastProcessedVoiceData.auto_fill_template_id || "legal_notice_money";
  const entities = lastProcessedVoiceData.extracted_entities || {};

  // 1. Switch tab to drafting
  switchTab("drafting");

  // 2. Select corresponding template
  const select = document.getElementById("template-select");
  if (select) {
    select.value = targetTemplateId;
    onTemplateChange();
  }

  // 3. Populate matching fields
  setTimeout(() => {
    Object.entries(entities).forEach(([key, val]) => {
      const el = document.getElementById(`field-${key}`);
      if (el && val) {
        el.value = val;
      }
    });

    // Also populate factual timeline if not already populated
    const timelineEl = document.getElementById("field-factual_timeline") || document.getElementById("field-deficiency_details") || document.getElementById("field-information_points");
    if (timelineEl && (!timelineEl.value || timelineEl.value.length < 10)) {
      timelineEl.value = lastProcessedVoiceData.transcript || "";
    }

    // Scroll drafting card into view
    const formCard = document.querySelector(".form-card");
    if (formCard) formCard.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

