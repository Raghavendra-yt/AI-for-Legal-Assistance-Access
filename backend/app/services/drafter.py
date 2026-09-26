import os
from io import BytesIO
from typing import Dict, Any, List, Optional
try:
    from google import genai
    HAS_NEW_GENAI = True
except ImportError:
    import google.generativeai as genai
    HAS_NEW_GENAI = False

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.core.config import settings

# Predefined Indian Legal Draft Templates & Guided Fields
DRAFT_TEMPLATES = {
    "legal_notice_money": {
        "id": "legal_notice_money",
        "title": "Legal Notice for Recovery of Dues / Unpaid Salary",
        "statute": "Indian Contract Act, 1872 & Order 37 CPC",
        "description": "Formal advocate legal demand notice demanding outstanding dues, unpaid professional fees, or security deposit refund with interest and 15-day compliance window.",
        "default_cure_days": 15,
        "required_fields": [
            {"key": "sender_name", "label": "Sender / Claimant Full Name", "placeholder": "e.g., Rajesh Kumar Sharma"},
            {"key": "sender_address", "label": "Sender Address & Contact", "placeholder": "Flat 302, Green Enclave, Indiranagar, Bengaluru - 560038"},
            {"key": "recipient_name", "label": "Recipient / Defaulter Name & Title", "placeholder": "The Managing Director, TechCorp Solutions Pvt Ltd"},
            {"key": "recipient_address", "label": "Recipient Address", "placeholder": "Plot 12, Electronic City Phase 1, Bengaluru - 560100"},
            {"key": "dispute_type", "label": "Nature of Transaction", "placeholder": "Unpaid Salary / Vendor Invoice / Security Deposit"},
            {"key": "claim_amount", "label": "Principal Amount Claimed (INR)", "placeholder": "₹2,50,000"},
            {"key": "interest_rate", "label": "Interest Rate Claimed (% per annum)", "placeholder": "18% p.a. from due date"},
            {"key": "factual_timeline", "label": "Chronology of Events & Facts", "placeholder": "State dates of employment/invoice, promises made, delivery of service, repeated follow-ups, and failure to pay."},
            {"key": "advocate_name", "label": "Advocate Name (Optional / Leave blank for Self-Draft)", "placeholder": "Adv. S. Ramanathan, Karnataka High Court"}
        ]
    },
    "cheque_bounce_138": {
        "id": "cheque_bounce_138",
        "title": "Statutory Notice under Section 138 of Negotiable Instruments Act",
        "statute": "Section 138 & 142, Negotiable Instruments Act, 1881",
        "description": "Mandatory 30-day statutory notice dispatched within 30 days of receiving the bank memo of dishonour, granting 15 days to repay before criminal prosecution.",
        "default_cure_days": 15,
        "required_fields": [
            {"key": "sender_name", "label": "Payee / Complainant Name", "placeholder": "Amitabh Sen"},
            {"key": "sender_address", "label": "Payee Address", "placeholder": "14/2 Park Street, Kolkata - 700016"},
            {"key": "recipient_name", "label": "Drawer / Accused Name", "placeholder": "Vikas Agarwal, Director of Agarwal Infra"},
            {"key": "recipient_address", "label": "Drawer Address", "placeholder": "7B Salt Lake Sector V, Kolkata - 700091"},
            {"key": "cheque_number", "label": "Cheque Number & Date", "placeholder": "Cheque No. 492014 dated 10/01/2026"},
            {"key": "bank_details", "label": "Drawn on Bank & Branch", "placeholder": "HDFC Bank, Salt Lake Branch"},
            {"key": "cheque_amount", "label": "Cheque Amount (INR)", "placeholder": "₹5,00,000/-"},
            {"key": "dishonour_reason", "label": "Reason as per Bank Return Memo", "placeholder": "Funds Insufficient / Account Closed"},
            {"key": "memo_date", "label": "Date of Bank Return Memo", "placeholder": "18/01/2026"}
        ]
    },
    "consumer_complaint": {
        "id": "consumer_complaint",
        "title": "Consumer Complaint Petition before DCDRC",
        "statute": "Section 35, Consumer Protection Act, 2019",
        "description": "Formal complaint petition for filing before the District Consumer Disputes Redressal Commission for deficiency in service, unfair trade practices, or defective goods.",
        "default_cure_days": 30,
        "required_fields": [
            {"key": "sender_name", "label": "Complainant Name & Particulars", "placeholder": "Sunita Verma, Aged 42 years"},
            {"key": "sender_address", "label": "Complainant Address & Email", "placeholder": "B-404, Regency Heights, Andheri West, Mumbai - 400053"},
            {"key": "recipient_name", "label": "Opposite Party (Company / Retailer / Builder)", "placeholder": "QuickDeliver Logistics Pvt Ltd & Electronic MegaStore"},
            {"key": "recipient_address", "label": "Opposite Party Registered Office", "placeholder": "Corporate Tower 3, Bandra Kurla Complex, Mumbai - 400051"},
            {"key": "transaction_date", "label": "Date of Purchase / Service Booking", "placeholder": "05/12/2025"},
            {"key": "consideration_paid", "label": "Consideration / Price Paid (INR)", "placeholder": "₹84,999/-"},
            {"key": "deficiency_details", "label": "Details of Deficiency / Unfair Trade Practice", "placeholder": "Received damaged refrigerator; service center refused warranty repair citing false water damage."},
            {"key": "compensation_sought", "label": "Relief & Compensation Claimed", "placeholder": "Full refund of ₹84,999 with 12% interest, plus ₹50,000 for mental agony and ₹25,000 litigation costs."}
        ]
    },
    "rti_application": {
        "id": "rti_application",
        "title": "RTI Application under Section 6(1)",
        "statute": "Section 6(1), Right to Information Act, 2005",
        "description": "Citizen application seeking official records, file notings, inspection of works, or status reports from Central or State Public Information Officers (CPIO / SPIO).",
        "default_cure_days": 30,
        "required_fields": [
            {"key": "sender_name", "label": "Applicant Full Name", "placeholder": "Pooja Hegde"},
            {"key": "sender_address", "label": "Applicant Postal Address & Phone", "placeholder": "House No. 89, Sector 15, Gurugram, Haryana - 122001"},
            {"key": "recipient_name", "label": "Public Authority / Department", "placeholder": "The Central Public Information Officer (CPIO), Municipal Corporation of Gurugram"},
            {"key": "recipient_address", "label": "Public Authority Office Address", "placeholder": "Civil Lines, Gurugram, Haryana - 122001"},
            {"key": "information_points", "label": "Specific Information / Questions Sought", "placeholder": "1. Daily progress report of road repair work on Ward 12.\n2. Certified copies of tender contracts awarded.\n3. Expenditure incurred till date."},
            {"key": "fee_details", "label": "Application Fee Particulars (₹10)", "placeholder": "Postal Order / Court Fee Stamp No. 23F 889211"}
        ]
    },
    "sworn_affidavit": {
        "id": "sworn_affidavit",
        "title": "General Sworn Affidavit / Declaration",
        "statute": "Indian Oaths Act, 1969 & Notaries Act, 1952",
        "description": "Standard verified affidavit format for official submission to government departments, universities, banks, or courts, complete with deponent declaration and verification clause.",
        "default_cure_days": 0,
        "required_fields": [
            {"key": "sender_name", "label": "Deponent Name (Son/Daughter/Wife of)", "placeholder": "Rohan Mehra, S/o Late Sh. Suresh Mehra, aged about 34 years"},
            {"key": "sender_address", "label": "Permanent Address", "placeholder": "Flat 201, Shanti Niketan, Civil Lines, Jaipur, Rajasthan"},
            {"key": "purpose", "label": "Purpose of Affidavit", "placeholder": "Name change / Loss of original documents / Financial declaration / Address confirmation"},
            {"key": "statement_facts", "label": "Numbered Declarations / Facts Sworn", "placeholder": "1. That I am a citizen of India and permanent resident at the above address.\n2. That my name in Aadhaar is Rohan Mehra whereas in 10th marksheet it is Rohan M..."},
            {"key": "place_date", "label": "Place and Execution Date", "placeholder": "Jaipur, 26th September 2026"}
        ]
    }
}


def build_statutory_fallback_draft(template_id: str, data: Dict[str, Any]) -> str:
    """Generate authentic, highly detailed, court-ready Indian legal draft templates."""
    sender_name = data.get("sender_name", "[NAME OF SENDER / CLAIMANT]")
    sender_address = data.get("sender_address", "[SENDER ADDRESS]")
    recipient_name = data.get("recipient_name", "[NAME OF RECIPIENT / DEFAULTER]")
    recipient_address = data.get("recipient_address", "[RECIPIENT ADDRESS]")
    advocate_name = data.get("advocate_name") or "ADVOCATE ON BEHALF OF CLIENT"

    if template_id == "legal_notice_money":
        claim = data.get("claim_amount", "₹[AMOUNT]")
        interest = data.get("interest_rate", "18% per annum")
        dispute_type = data.get("dispute_type", "Recovery of Dues")
        timeline = data.get("factual_timeline", "A valid contractual and financial relationship existed between the parties wherein services were rendered and payment defaults occurred.")

        return f"""BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE / SPEED POST / EMAIL

LEGAL NOTICE FOR RECOVERY OF OUTSTANDING DUES
Under the Provisions of the Indian Contract Act, 1872 & Order 37 of the Code of Civil Procedure, 1908

DATE: 26th September 2026

TO,
{recipient_name}
{recipient_address}

FROM,
{advocate_name}
Advocate, High Court of Judicature
Office: Legal Chambers, Court Complex
Representing: {sender_name}, residing at {sender_address} (hereinafter referred to as "my Client")

SUBJECT: STATUTORY DEMAND NOTICE FOR PAYMENT OF OUTSTANDING SUM OF {claim} TOGETHER WITH ACCRUED INTEREST @ {interest}

SIR/MADAM,

Under instructions from and on behalf of my Client, {sender_name}, I do hereby serve upon you this formal Legal Notice:

1. That my Client is a law-abiding citizen engaged in lawful commerce/profession, having an impeccable track record and reputation in the community.

2. That on or around the dates mentioned hereunder, a binding contractual agreement and understanding was executed between you and my Client regarding {dispute_type}. In pursuance thereof, my Client faithfully, diligently, and completely performed all reciprocal promises and obligations.

3. STATEMENT OF FACTS & CHRONOLOGY:
{timeline}

4. That despite receipt and unconditional acceptance of the deliverables/services rendered by my Client, and despite repeated reminders through written correspondences, telephonic conversations, and formal demands, you have wilfully, maliciously, and wrongfully withheld the lawful principal dues amounting to {claim}.

5. That your aforesaid conduct constitutes a flagrant breach of trust, unjust enrichment, and a clear breach of contract under Section 73 of the Indian Contract Act, 1872, causing severe financial duress and mental agony to my Client. Furthermore, your deceptive inducements may attract penal consequences under Section 318(4) of the Bharatiya Nyaya Sanhita, 2023 (formerly Section 420 IPC) for cheating and dishonest inducement.

6. DEMAND & NOTICE TO COMPLY:
I, therefore, through this Legal Notice, call upon you to make payment of the aforesaid principal sum of {claim}, together with interest calculated @ {interest} from the date the amount fell due until actual realization, within a strict period of FIFTEEN (15) DAYS from the date of receipt of this notice, failing which:
   (a) My Client shall be constrained to initiate appropriate Civil Proceedings, including a Summary Suit under Order XXXVII of the Code of Civil Procedure, 1908, holding you liable for all costs and consequences;
   (b) My Client shall file criminal complaints before the competent Magistrate under the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS);
   (c) You shall be held exclusively liable for all litigation fees, court fees, advocate expenses, and damages incurred.

A copy of this Legal Notice is retained in my office for future legal record and judicial production.

Yours sincerely,

_________________________
[{advocate_name}]
Advocate for the Claimant
"""

    elif template_id == "cheque_bounce_138":
        chq_no = data.get("cheque_number", "[CHEQUE NUMBER]")
        chq_amt = data.get("cheque_amount", "₹[AMOUNT]")
        bank_details = data.get("bank_details", "[BANK NAME]")
        memo_date = data.get("memo_date", "[DATE]")
        reason = data.get("dishonour_reason", "Funds Insufficient")

        return f"""STATUTORY NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

(DELIVERED VIA SPEED POST WITH AD / COURIER / EMAIL)

DATE: 26th September 2026

TO,
{recipient_name}
{recipient_address}

FROM,
{sender_name}
{sender_address}

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 READ WITH SECTION 142 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 REGARDING DISHONOUR OF CHEQUE NO. {chq_no} FOR AN AMOUNT OF {chq_amt}.

SIR/MADAM,

Take notice that:

1. In discharge of your legally enforceable debt, liability, and pecuniary obligations towards the Complainant ({sender_name}), you issued a post-dated cheque in favour of the Complainant bearing particulars:
   - Cheque Number: {chq_no}
   - Cheque Amount: {chq_amt}
   - Drawn on: {bank_details}

2. You assured and represented to the Complainant that the aforesaid cheque was good for payment and would be promptly honored upon presentation.

3. Relying upon your express representation, the Complainant presented the aforesaid cheque for encashment through their bankers. However, to the utter shock and dismay of the Complainant, the cheque was returned dishonoured and unpaid with bank return memo dated {memo_date} with the remarks: "{reason}".

4. That under Section 138 of the Negotiable Instruments Act, 1881, the dishonour of a cheque for insufficiency of funds or exceeding arrangements constitutes a strict liability cognizable criminal offence punishable with imprisonment for a term which may extend up to TWO (2) YEARS, or with fine which may extend to TWICE the amount of the cheque, or with both.

5. STATUTORY 15-DAY DEMAND:
The Complainant hereby calls upon you to pay the entire cheque amount of {chq_amt} (Rupees {chq_amt} only) within FIFTEEN (15) DAYS from the date of receipt of this statutory notice.

6. TAKE FURTHER NOTICE that if you fail to make payment of the said amount within the stipulated period of 15 days, the Complainant shall institute criminal proceedings against you under Section 138 and Section 142 of the Negotiable Instruments Act, 1881, and relevant penal provisions of the Bharatiya Nyaya Sanhita, 2023, before the competent Court of the Judicial Magistrate, at your sole risk, cost, and legal consequences.

Yours faithfully,

_________________________
{sender_name}
Complainant / Payee
"""

    elif template_id == "consumer_complaint":
        price = data.get("consideration_paid", "₹[AMOUNT]")
        tx_date = data.get("transaction_date", "[DATE]")
        deficiency = data.get("deficiency_details", "Deficiency in service and unfair trade practice.")
        relief = data.get("compensation_sought", "Full refund and compensation.")

        return f"""BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION (DCDRC)
AT [NAME OF DISTRICT / CITY]

CONSUMER COMPLAINT NO. ________ / 2026

IN THE MATTER OF:
{sender_name}
Residing at: {sender_address}
... COMPLAINANT

VERSUS

{recipient_name}
Having registered office at: {recipient_address}
... OPPOSITE PARTY (OP)

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE, UNFAIR TRADE PRACTICE, AND PRODUCT LIABILITY

MOST RESPECTFULLY SHOWETH:

1. PARTICULARS OF THE COMPLAINANT:
The Complainant is an individual citizen and a "Consumer" within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having purchased goods / availed services for valuable consideration from the Opposite Party for personal use and not for any commercial purpose.

2. PARTICULARS OF THE OPPOSITE PARTY:
The Opposite Party is a commercial enterprise engaged in the manufacturing, retail, or provision of services to consumers within the territorial and pecuniary jurisdiction of this Hon'ble Commission.

3. FACTS OF THE CASE:
(a) That on {tx_date}, the Complainant purchased / booked services from the Opposite Party upon payment of total consideration of {price} vide Invoice / Receipt No. ____________.
(b) That upon delivery / performance, the Complainant discovered severe defects, malpractices, and deficiencies, particulars whereof are as follows:
{deficiency}
(c) That the Complainant repeatedly lodged grievances, support tickets, and written communications requesting rectification, replacement, or refund. However, the Opposite Party arbitrarily, unlawfully, and callously rejected the legitimate grievance of the Complainant.

4. CAUSE OF ACTION & JURISDICTION:
The cause of action arose within the territorial limits of this Hon'ble Commission where the transaction took place and where the Complainant resides. The total consideration and compensation claimed falls well within the pecuniary jurisdiction of the District Commission (up to ₹50 Lakhs under CPA 2019 rules).

5. PRAYER / RELIEFS SOUGHT:
In the premises aforesaid, the Complainant most respectfully prays that this Hon'ble Commission may be pleased to:
(a) Direct the Opposite Party to refund the sum of {price} along with interest @ 18% p.a. from the date of payment until realization;
(b) Direct the Opposite Party to pay compensation for mental harassment, financial distress, and deficiency in service;
(c) Award litigation costs of ₹25,000/- incurred by the Complainant;
(d) Grant any other relief deemed fit and proper in the interest of justice.

PLACE: _____________________
DATE: 26th September 2026

_____________________________
COMPLAINANT IN PERSON
"""

    elif template_id == "rti_application":
        points = data.get("information_points", "1. Details of the matter.\n2. Certified copies of file notings.")
        fee = data.get("fee_details", "Postal Order / Court Fee Stamp of ₹10/-")

        return f"""APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

TO,
The Central Public Information Officer (CPIO) / State Public Information Officer (SPIO)
{recipient_name}
{recipient_address}

1. FULL NAME OF THE APPLICANT:
{sender_name}

2. ADDRESS FOR CORRESPONDENCE:
{sender_address}

3. PARTICULARS OF INFORMATION SOUGHT:
The applicant requests certified true copies / inspection / records regarding the following specific points:
{points}

4. PERIOD TO WHICH THE INFORMATION RELATES:
From: [START DATE] To: [END DATE]

5. WHETHER THE INFORMATION SOUGHT CONCERNS LIFE OR LIBERTY OF A PERSON:
[NO / YES] (If yes, mandatory disclosure within 48 hours under Section 7(1) proviso).

6. APPLICATION FEE DETAILS:
An application fee of ₹10/- (Rupees Ten only) has been affixed/tendered via {fee}, in accordance with the Right to Information (Regulation of Fee and Cost) Rules.

7. CITIZENSHIP DECLARATION:
I hereby state that I am a citizen of India and am exercising my fundamental right to information under Section 3 of the Right to Information Act, 2005.

PLACE: _______________________
DATE: 26th September 2026

_____________________________
SIGNATURE OF THE APPLICANT
"""

    elif template_id == "sworn_affidavit":
        purpose = data.get("purpose", "Official Sworn Declaration")
        facts = data.get("statement_facts", "1. That I am a permanent citizen of India.\n2. That all contents stated herein are true.")
        place = data.get("place_date", "New Delhi, 26th September 2026")

        return f"""AFFIDAVIT

BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE
AT {place}

I, {sender_name}, residing at {sender_address}, do hereby solemnly affirm, depose, and declare on oath as under:

PURPOSE: {purpose}

1. That I am the deponent herein, fully competent and conversant with the facts deposed herein below.

{facts}

VERIFICATION

I, the deponent abovenamed, do hereby solemnly declare and verify that the contents of paragraphs 1 to ____ of the above affidavit are true and correct to the best of my knowledge, belief, and records, and that no material part thereof is false, concealed, or misstated.

Verified at {place} on this 26th day of September, 2026.

_____________________________
DEPONENT

ATTESTATION & NOTARIAL CERTIFICATE
Solemnly affirmed and signed before me by the deponent who is personally known to me / identified by __________________________.

NOTARY PUBLIC / OATH COMMISSIONER
"""

    return f"Standard Indian Legal Draft for {template_id}\n\nClient: {sender_name}\nOpposite Party: {recipient_name}"


def generate_draft_with_gemini(template_id: str, data: Dict[str, Any]) -> str:
    """Use Google Gemini 1.5 Pro / Flash to synthesize highly customized, court-ready Indian legal documents."""
    prompt = f"""You are a Senior Advocate and Master Legal Drafter at the Supreme Court of India and High Courts.
Draft a complete, formal, highly professional, and court-ready Indian legal document.

Draft Category: {template_id}
Document Title: {DRAFT_TEMPLATES.get(template_id, {}).get('title')}
Governing Statutes: Bharatiya Nyaya Sanhita 2023 (BNS), Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS), Consumer Protection Act 2019, Negotiable Instruments Act 1881, Indian Contract Act 1872, or RTI Act 2005.

CASE PARTICULARS & USER INPUTS:
{data}

REQUIREMENTS:
1. Follow standard Indian judicial & advocate drafting conventions (all uppercase headers, clear numbering, formal legal recitals, statutory citations, prayer/demand clauses).
2. Incorporate exact statutory sections relevant to the claim.
3. Make the draft complete, polished, and ready to print without placeholders whenever data is provided.
4. Conclude with appropriate verification clauses, signature blocks, and advocate endorsement.
5. Do NOT include markdown code blocks or meta conversational text—return only the pure legal document."""

    try:
        if HAS_NEW_GENAI:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        else:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
    except Exception as e:
        print(f"Gemini drafting error: {e}. Reverting to statutory template engine.")
    
    return build_statutory_fallback_draft(template_id, data)


def generate_legal_draft(template_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Main drafting coordinator."""
    template_info = DRAFT_TEMPLATES.get(template_id)
    if not template_info:
        template_id = "legal_notice_money"
        template_info = DRAFT_TEMPLATES[template_id]

    is_gemini_active = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
    
    if is_gemini_active:
        draft_text = generate_draft_with_gemini(template_id, data)
        engine_used = f"Google Gemini ({settings.GEMINI_MODEL})"
    else:
        draft_text = build_statutory_fallback_draft(template_id, data)
        engine_used = "Indian Statutory Drafting Engine (Add GEMINI_API_KEY for dynamic AI generation)"

    return {
        "template_id": template_id,
        "title": template_info["title"],
        "statute": template_info["statute"],
        "engine_used": engine_used,
        "draft_text": draft_text,
        "timestamp": "2026-09-26T10:00:00+05:30"
    }


def export_draft_to_pdf(title: str, draft_text: str) -> bytes:
    """Generate a clean, court-ready printable PDF using ReportLab."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=14
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        alignment=4, # Justify
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=8
    )

    story = []
    story.append(Paragraph(title.upper(), title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=14))

    for paragraph in draft_text.split('\n\n'):
        clean_para = paragraph.strip().replace('\n', '<br/>')
        if clean_para:
            story.append(Paragraph(clean_para, body_style))
            story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
