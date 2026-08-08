"""
NyayaAI Drafting Service — Week 5 upgrade
Generates court-ready Indian legal documents using AI.
Supports: RTI, FIR complaint, bail application, legal notice,
          affidavit, consumer complaint, vakalatnama
"""
from __future__ import annotations
import re
from app.models.schemas import DraftRequest, DraftResponse, Language
from app.services.llm_router import get_llm

# ── Prompts ──────────────────────────────────────────────────────

PROMPTS: dict[str, str] = {

"rti": """You are an expert Indian legal drafter. Write a complete RTI application.

Applicant: {applicant_name}
Public Authority: {public_authority}
Information Requested: {information_needed}
Purpose: {purpose}
Language: {language}

Write a formal RTI application under the Right to Information Act, 2005.
Include: proper salutation, reference to Section 6(1) of RTI Act 2005,
clear statement of information sought, preferred format of information,
BPL status if applicable, date, signature line, enclosures list.
Make it ready to submit — complete and properly formatted.""",

"fir_complaint": """You are an expert Indian legal drafter. Write a police complaint / FIR application.

Complainant: {complainant_name}, {complainant_address}
Accused: {accused_name}
Incident: {incident_description}
Date of Incident: {incident_date}
Place: {incident_place}
Witnesses: {witnesses}
Relief Sought: {relief}
Language: {language}

Write a formal complaint letter addressed to the Station House Officer (SHO).
Include: complainant details, precise incident description, IPC sections attracted,
names of accused, request for FIR registration under Section 154 CrPC,
and request for investigation. Make it ready to submit.""",

"bail_application": """You are a senior Indian advocate. Draft a regular bail application.

Accused: {accused_name}
Case: {case_number}, {court_name}
Offence: {offence_section}
Grounds for Bail: {bail_grounds}
Language: {language}

Draft a formal bail application under Section 437/439 CrPC.
Include: case details, grounds for bail (citing D.K. Basu, Satender Kumar Antil v. CBI),
undertaking to appear, surety offer, prayer clause.
Cite relevant Supreme Court judgments on bail. Make it court-ready.""",

"legal_notice": """You are an expert Indian legal drafter. Draft a legal notice.

Sender: {sender_name}, {sender_address}
Recipient: {recipient_name}, {recipient_address}
Subject Matter: {subject}
Legal Basis: {legal_basis}
Demand: {demand}
Response Deadline: {deadline} days
Language: {language}

Draft a formal legal notice. Include: LEGAL NOTICE heading, parties,
factual background, legal provisions violated, specific demand,
consequences of non-compliance, response deadline.
Sign off as advocate or party as appropriate.""",

"affidavit": """You are an expert Indian legal drafter. Draft a sworn affidavit.

Deponent: {deponent_name}, {deponent_address}, Age: {deponent_age}
Purpose: {purpose}
Facts to Affirm: {facts}
Language: {language}

Draft a formal affidavit for Indian court submission.
Include: title, deponent details, sworn statements numbered clearly,
verification clause referencing CPC Order XIX, place and date lines,
signature/thumb impression line, notary/oath commissioner attestation block.""",

"consumer_complaint": """You are an expert Indian legal drafter. Draft a consumer complaint.

Complainant: {complainant_name}, {complainant_address}
Opposite Party: {opposite_party}, {opposite_party_address}
Product/Service: {product_service}
Deficiency/Defect: {complaint_details}
Amount Paid: {amount}
Relief Sought: {relief}
Language: {language}

Draft a consumer complaint under the Consumer Protection Act, 2019.
Address it to the appropriate District Consumer Disputes Redressal Commission.
Include: parties, facts, deficiency in service, prayer for relief
(refund + compensation + litigation costs), list of documents enclosed.""",

"vakalatnama": """You are an expert Indian legal drafter. Draft a Vakalatnama.

Client: {client_name}, {client_address}
Advocate: {advocate_name}, Bar Council No: {bar_council_no}
Court: {court_name}
Case: {case_title}
Language: {language}

Draft a standard Vakalatnama (Power of Attorney for legal proceedings).
Include: authorisation to appear, sign, file, withdraw, compromise,
receive notices, and take all necessary steps in the matter.
Include standard clauses used in Indian courts.""",

}

# ── Field definitions per draft type ─────────────────────────────

DRAFT_FIELDS: dict[str, list[dict]] = {
    "rti": [
        {"key": "applicant_name",   "label": "Your full name",          "required": True,  "placeholder": "Ramesh Kumar"},
        {"key": "public_authority", "label": "Public authority / office","required": True,  "placeholder": "Municipal Corporation, Delhi"},
        {"key": "information_needed","label": "Information you need",   "required": True,  "placeholder": "Details of road construction tenders 2023-24"},
        {"key": "purpose",          "label": "Purpose (optional)",      "required": False, "placeholder": "Personal use / public interest"},
    ],
    "fir_complaint": [
        {"key": "complainant_name",    "label": "Your name",             "required": True,  "placeholder": "Priya Sharma"},
        {"key": "complainant_address", "label": "Your address",          "required": True,  "placeholder": "123 Gandhi Nagar, Lucknow"},
        {"key": "accused_name",        "label": "Accused person(s)",     "required": True,  "placeholder": "Name and address if known"},
        {"key": "incident_description","label": "What happened",         "required": True,  "placeholder": "Describe the incident in detail"},
        {"key": "incident_date",       "label": "Date of incident",      "required": True,  "placeholder": "15/01/2024"},
        {"key": "incident_place",      "label": "Place of incident",     "required": True,  "placeholder": "Main Bazar, Near Post Office"},
        {"key": "witnesses",           "label": "Witnesses (if any)",    "required": False, "placeholder": "Names of witnesses"},
        {"key": "relief",              "label": "Relief sought",         "required": True,  "placeholder": "Register FIR and arrest accused"},
    ],
    "bail_application": [
        {"key": "accused_name",      "label": "Accused name",            "required": True,  "placeholder": "Mohammad Ali Khan"},
        {"key": "case_number",       "label": "Case / FIR number",       "required": True,  "placeholder": "FIR No. 123/2024, PS Hazratganj"},
        {"key": "court_name",        "label": "Court name",              "required": True,  "placeholder": "Sessions Court, Lucknow"},
        {"key": "offence_section",   "label": "Sections charged under",  "required": True,  "placeholder": "IPC 302, 34"},
        {"key": "bail_grounds",      "label": "Grounds for bail",        "required": True,  "placeholder": "No prior criminal record, family dependent, willing to cooperate"},
    ],
    "legal_notice": [
        {"key": "sender_name",       "label": "Your name",               "required": True,  "placeholder": "Suresh Gupta"},
        {"key": "sender_address",    "label": "Your address",            "required": True,  "placeholder": "45 Civil Lines, Allahabad"},
        {"key": "recipient_name",    "label": "Recipient name",          "required": True,  "placeholder": "XYZ Builder Pvt. Ltd."},
        {"key": "recipient_address", "label": "Recipient address",       "required": True,  "placeholder": "Registered office address"},
        {"key": "subject",           "label": "Subject matter",          "required": True,  "placeholder": "Non-delivery of flat as per agreement"},
        {"key": "legal_basis",       "label": "Legal basis",             "required": True,  "placeholder": "Breach of contract, Consumer Protection Act"},
        {"key": "demand",            "label": "Your demand",             "required": True,  "placeholder": "Refund Rs. 25 lakhs with interest"},
        {"key": "deadline",          "label": "Response deadline (days)","required": True,  "placeholder": "15"},
    ],
    "affidavit": [
        {"key": "deponent_name",    "label": "Your full name",           "required": True,  "placeholder": "Anita Singh"},
        {"key": "deponent_address", "label": "Your address",             "required": True,  "placeholder": "Full residential address"},
        {"key": "deponent_age",     "label": "Your age",                 "required": True,  "placeholder": "35"},
        {"key": "purpose",          "label": "Purpose of affidavit",     "required": True,  "placeholder": "Address proof / Income declaration"},
        {"key": "facts",            "label": "Facts to state",           "required": True,  "placeholder": "List the facts you want to swear to"},
    ],
    "consumer_complaint": [
        {"key": "complainant_name",      "label": "Your name",           "required": True,  "placeholder": "Kavita Joshi"},
        {"key": "complainant_address",   "label": "Your address",        "required": True,  "placeholder": "Full address"},
        {"key": "opposite_party",        "label": "Company / seller name","required": True, "placeholder": "Amazon India / HDFC Bank"},
        {"key": "opposite_party_address","label": "Their address",       "required": True,  "placeholder": "Registered office"},
        {"key": "product_service",       "label": "Product / service",   "required": True,  "placeholder": "Mobile phone / Home loan"},
        {"key": "complaint_details",     "label": "Complaint details",   "required": True,  "placeholder": "Describe defect or deficiency"},
        {"key": "amount",                "label": "Amount paid",         "required": True,  "placeholder": "Rs. 45,000"},
        {"key": "relief",                "label": "Relief sought",       "required": True,  "placeholder": "Refund + Rs. 50,000 compensation"},
    ],
    "vakalatnama": [
        {"key": "client_name",     "label": "Client name",               "required": True,  "placeholder": "Rajiv Malhotra"},
        {"key": "client_address",  "label": "Client address",            "required": True,  "placeholder": "Full address"},
        {"key": "advocate_name",   "label": "Advocate name",             "required": True,  "placeholder": "Adv. Sanjay Verma"},
        {"key": "bar_council_no",  "label": "Bar Council number",        "required": True,  "placeholder": "UP/1234/2015"},
        {"key": "court_name",      "label": "Court name",                "required": True,  "placeholder": "High Court of Allahabad"},
        {"key": "case_title",      "label": "Case title",                "required": True,  "placeholder": "Malhotra v. State of UP"},
    ],
}

DRAFT_LABELS = {
    "rti":               "RTI Application",
    "fir_complaint":     "FIR / Police Complaint",
    "bail_application":  "Bail Application",
    "legal_notice":      "Legal Notice",
    "affidavit":         "Affidavit",
    "consumer_complaint":"Consumer Complaint",
    "vakalatnama":       "Vakalatnama",
}


class DraftingService:

    async def generate(self, request: DraftRequest) -> DraftResponse:
        if request.draft_type not in PROMPTS:
            from fastapi import HTTPException
            raise HTTPException(400, f"Unknown draft type: {request.draft_type}")

        llm = get_llm(language=request.language, task="complex")

        # Build prompt with context values
        ctx = {k: (v or "Not specified") for k, v in request.context.items()}
        ctx["language"] = request.language.value

        template = PROMPTS[request.draft_type]
        try:
            prompt = template.format(**ctx)
        except KeyError as e:
            prompt = template.replace("{" + str(e).strip("'") + "}", "Not specified")
            prompt = re.sub(r"\{[a-z_]+\}", "Not specified", prompt)

        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)

        return DraftResponse(
            draft_type=request.draft_type,
            content=content,
            language=request.language,
            word_count=len(content.split()),
        )

    def get_fields(self, draft_type: str) -> list[dict]:
        return DRAFT_FIELDS.get(draft_type, [])

    def list_types(self) -> list[dict]:
        return [
            {"type": k, "label": v, "fields": len(DRAFT_FIELDS.get(k, []))}
            for k, v in DRAFT_LABELS.items()
        ]
