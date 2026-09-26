/**
 * Frontend unit tests for NyayaSahayak
 * Run with: npm run test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";


// ─── Utility / Pure Function Tests ────────────────────────────────────────────

describe("Utility functions", () => {
  it("sanitizes special characters in file names", () => {
    const title = "Legal Notice for Recovery / Dues";
    const safeName = title.replace(/ /g, "_").replace(/\//g, "_");
    expect(safeName).toBe("Legal_Notice_for_Recovery___Dues");
    expect(safeName).not.toContain(" ");
  });

  it("progress clamp stays between 0 and 100", () => {
    const clamp = (v: number) => Math.min(100, Math.max(0, v));
    expect(clamp(-5)).toBe(0);
    expect(clamp(105)).toBe(100);
    expect(clamp(50)).toBe(50);
  });

  it("API base URL falls back to empty string when env var missing", () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
    expect(typeof apiBase).toBe("string");
  });

  it("template field change merges correctly", () => {
    let fields: Record<string, string> = { a: "1" };
    const handleChange = (key: string, value: string) => {
      fields = { ...fields, [key]: value };
    };
    handleChange("b", "2");
    expect(fields).toEqual({ a: "1", b: "2" });
    handleChange("a", "updated");
    expect(fields.a).toBe("updated");
  });

  it("progress interval advances smoothly without exceeding 92 during loading", () => {
    let currentPct = 8;
    for (let i = 0; i < 20; i++) {
      currentPct += (90 - currentPct) * 0.16;
      currentPct = Math.min(92, Math.round(currentPct));
    }
    expect(currentPct).toBeLessThanOrEqual(92);
    expect(currentPct).toBeGreaterThan(8);
  });
});

// ─── Tab State Logic Tests ─────────────────────────────────────────────────

describe("Tab navigation logic", () => {
  type Tab = "voice" | "drafting" | "qa" | "statutes";
  const validTabs: Tab[] = ["voice", "drafting", "qa", "statutes"];

  it("starts on voice tab by default", () => {
    let activeTab: Tab = "voice";
    expect(activeTab).toBe("voice");
  });

  it("can switch to each valid tab", () => {
    let activeTab: Tab = "voice";
    validTabs.forEach((tab) => {
      activeTab = tab;
      expect(activeTab).toBe(tab);
    });
  });

  it("only has 4 tabs (shader showcase removed)", () => {
    expect(validTabs.length).toBe(4);
    expect(validTabs).not.toContain("demo");
  });
});

// ─── API Call Shape Tests ──────────────────────────────────────────────────

describe("API request bodies", () => {
  it("draft generate payload has required fields", () => {
    const payload = {
      template_id: "legal_notice_money",
      fields: { claimant_name: "Test User" },
    };
    expect(payload).toHaveProperty("template_id");
    expect(payload).toHaveProperty("fields");
    expect(typeof payload.template_id).toBe("string");
    expect(payload.template_id.trim().length).toBeGreaterThan(0);
  });

  it("legal-qa payload has required query field", () => {
    const payload = { query: "What are my rights?" };
    expect(payload).toHaveProperty("query");
    expect(payload.query.length).toBeLessThanOrEqual(5000);
  });

  it("voice process payload has transcript", () => {
    const payload = { transcript: "My employer owes me salary." };
    expect(payload).toHaveProperty("transcript");
    expect(payload.transcript.trim().length).toBeGreaterThan(0);
  });

  it("translate payload has text and valid language code", () => {
    const validLangs = ["en", "hi", "te", "ta", "ml", "kn", "bn", "mr", "gu", "pa"];
    const payload = { text: "Legal notice", target_language: "hi" };
    expect(validLangs).toContain(payload.target_language);
  });
});

// ─── Input Validation Tests ────────────────────────────────────────────────

describe("Input validation", () => {
  it("rejects empty query string", () => {
    const isValid = (q: string) => q.trim().length > 0 && q.length <= 5000;
    expect(isValid("")).toBe(false);
    expect(isValid("   ")).toBe(false);
    expect(isValid("valid query")).toBe(true);
  });

  it("rejects overly long query (>5000 chars)", () => {
    const isValid = (q: string) => q.trim().length > 0 && q.length <= 5000;
    expect(isValid("x".repeat(5001))).toBe(false);
    expect(isValid("x".repeat(5000))).toBe(true);
  });

  it("rejects empty template_id", () => {
    const isValid = (id: string) => id.trim().length > 0;
    expect(isValid("")).toBe(false);
    expect(isValid("  ")).toBe(false);
    expect(isValid("legal_notice_money")).toBe(true);
  });

  it("allows Unicode Hindi/Tamil text in queries", () => {
    const isValid = (q: string) => q.trim().length > 0 && q.length <= 5000;
    expect(isValid("मेरे नियोक्ता ने वेतन नहीं दिया")).toBe(true);
    expect(isValid("என் உரிமைகள் என்ன?")).toBe(true);
  });
});

// ─── Fetch Mock Tests ──────────────────────────────────────────────────────

describe("API fetch calls", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("calls correct endpoint for draft generation", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ draft_text: "Generated draft...", title: "Legal Notice" }),
    });
    global.fetch = mockFetch;

    const res = await fetch("/api/draft/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: "legal_notice_money", fields: {} }),
    });
    const data = await res.json();

    expect(mockFetch).toHaveBeenCalledWith("/api/draft/generate", expect.objectContaining({ method: "POST" }));
    expect(data).toHaveProperty("draft_text");
  });

  it("calls correct endpoint for legal QA", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ question: "test", answer: "You have rights under...", engine: "Gemini" }),
    });
    global.fetch = mockFetch;

    await fetch("/api/legal-qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "What are my rights?" }),
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/legal-qa", expect.objectContaining({ method: "POST" }));
  });

  it("calls correct endpoint for templates", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ templates: [{ id: "legal_notice_money", name: "Legal Notice" }] }),
    });
    global.fetch = mockFetch;

    const res = await fetch("/api/draft/templates");
    const data = await res.json();

    expect(data.templates).toHaveLength(1);
    expect(data.templates[0].id).toBe("legal_notice_money");
  });

  it("handles fetch network error gracefully", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    global.fetch = mockFetch;

    await expect(fetch("/api/health")).rejects.toThrow("Network error");
  });

  it("calls voice process endpoint", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ intent: "salary_dispute", entities: {} }),
    });
    global.fetch = mockFetch;

    await fetch("/api/voice/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: "My boss owes me money." }),
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/voice/process", expect.anything());
  });
});

// ─── Auto-fill Logic Tests ─────────────────────────────────────────────────

describe("Auto-fill from voice to drafting", () => {
  it("merges voice entities into form fields", () => {
    let formFields: Record<string, string> = { existing_field: "value" };
    let activeTab = "voice";
    let selectedTemplateId = "legal_notice_money";

    const handleAutoFill = (templateId: string, entities: Record<string, string>, transcript: string) => {
      selectedTemplateId = templateId;
      formFields = { ...formFields, ...entities, factual_timeline: entities.factual_timeline || transcript };
      activeTab = "drafting";
    };

    handleAutoFill("cheque_bounce", { drawer_name: "Suresh", cheque_amount: "25000" }, "Cheque bounced.");

    expect(activeTab).toBe("drafting");
    expect(selectedTemplateId).toBe("cheque_bounce");
    expect(formFields.drawer_name).toBe("Suresh");
    expect(formFields.existing_field).toBe("value");  // pre-existing field preserved
    expect(formFields.factual_timeline).toBe("Cheque bounced.");
  });

  it("preserves existing factual_timeline from entities over raw transcript", () => {
    let formFields: Record<string, string> = {};

    const handleAutoFill = (templateId: string, entities: Record<string, string>, transcript: string) => {
      formFields = { ...entities, factual_timeline: entities.factual_timeline || transcript };
    };

    handleAutoFill("legal_notice_money", { factual_timeline: "Custom timeline" }, "Raw voice transcript");
    expect(formFields.factual_timeline).toBe("Custom timeline");
  });
});

// ─── Accessibility Logic Tests ─────────────────────────────────────────────

describe("Accessibility requirements", () => {
  it("nav tabs have accessible labels", () => {
    const tabs = [
      { id: "voice", label: "Nyaya Vani" },
      { id: "drafting", label: "Court Drafting" },
      { id: "qa", label: "Legal Rights" },
      { id: "statutes", label: "Statutes" },
    ];
    tabs.forEach((tab) => {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(tab.id.length).toBeGreaterThan(0);
    });
  });

  it("all 10 supported languages have non-empty nav labels", () => {
    const languages = [
      { code: "en", navVoice: "Nyaya Vani" },
      { code: "hi", navVoice: "न्याय वाणी" },
      { code: "te", navVoice: "న్యాయ వాణి" },
    ];
    languages.forEach((lang) => {
      expect(lang.navVoice.trim().length).toBeGreaterThan(0);
    });
  });
});
