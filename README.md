# ⚖️ NyayaSahayak (न्यायसहायक) — AI for Legal Assistance & Access

> **AI-Powered Indian Legal Drafting Studio & Natural Language Voice Legal Assistant**

NyayaSahayak bridges the justice gap in India by translating intricate laws into plain English, empowering citizens with **voice-driven natural language consultation**, and generating court-ready legal notices, consumer complaints, affidavits, and RTI applications.

---

## 🌟 Key Features

### 🎙️ 1. Nyaya Vani — NLP Voice Legal Assistant
- **Multilingual Spoken Input**: Citizens speak naturally in English, Hindi, or Hinglish via their microphone.
- **Natural Language Entity Extraction (NER)**: Automatically extracts claimant name, respondent/company, amounts (e.g. ₹2,85,000), dates, and timelines.
- **Statutory Intent Mapping**: Maps everyday complaints to Indian statutes (*BNS 2023, BNSS 2023, Section 138 NI Act, Consumer Protection Act 2019, RTI Act 2005*).
- **Text-to-Speech (TTS) Voice Guidance**: Plays conversational legal advice aloud with an animated audio visualizer.
- **⚡ 1-Click Drafter Bridge**: Automatically transfers spoken entities directly into court drafting templates with zero typing required.

### 📜 2. Automated Court Drafting Studio
- **5 Court-Ready Indian Templates**:
  1. **Legal Notice for Recovery of Dues / Unpaid Salary** (*Indian Contract Act 1872 & Order 37 CPC*)
  2. **Statutory Cheque Bounce Notice** (*Section 138 & 142 Negotiable Instruments Act 1881*)
  3. **Consumer Complaint Petition** (*Section 35 Consumer Protection Act 2019*)
  4. **RTI Application** (*Section 6(1) Right to Information Act 2005*)
  5. **General Sworn Affidavit** (*Indian Oaths Act 1969 & Notaries Act*)
- **1-Click Auto-Fill Demos**: Instant test scenarios for salary, cheque, consumer, and RTI disputes.
- **Printable Court PDF Export**: Generates court-formatted legal PDFs via ReportLab with standardized judicial margins.

### 🧭 3. Citizen Rights Navigator & Compendium
- Grounded Indian statutory Q&A and procedural checklists.
- 100% Free Legal Aid eligibility checker under Section 12 of the Legal Services Authorities Act (NALSA).

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js (Optional, UI is served directly by FastAPI)

### 2. Run the Application
```bash
# Clone the repository
git clone https://github.com/Raghavendra-yt/AI-for-Legal-Assistance-Access.git
cd AI-for-Legal-Assistance-Access

# Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run Backend & Frontend (Unified Server)
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Open in Browser
Visit **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in Chrome or Edge.

---

## 🛡️ Disclaimer
*NyayaSahayak is an informational and technological tool designed to foster legal literacy and improve access to justice in India. The drafts and guidance generated do not establish an advocate-client relationship and should be reviewed by a certified legal practitioner prior to judicial filing.*
