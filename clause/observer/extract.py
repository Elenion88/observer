"""LLM-driven extraction of client info from a QMS PDF."""
from __future__ import annotations

import json
import os
from pathlib import Path

from openai import OpenAI
from pypdf import PdfReader

MODEL = "google/gemini-2.5-flash-lite"

SCHEMA = {
    "type": "object",
    "properties": {
        "organization_name": {"type": "string"},
        "postal_address": {"type": "string"},
        "audit_site": {
            "type": "string",
            "description": "Physical site(s) being audited; usually same as postal address unless multi-site.",
        },
        "contact_person": {"type": "string"},
        "contact_designation": {
            "type": "string",
            "description": "Job title of the contact person (e.g. Managing Director, Quality Manager).",
        },
        "contact_number": {"type": "string"},
        "contact_email": {"type": "string"},
        "audit_scope": {
            "type": "string",
            "description": "One-sentence statement of what the organization does. Pull from the QMS scope section verbatim where possible.",
        },
        "standards": {
            "type": "array",
            "items": {"type": "string"},
            "description": "ISO standards covered (e.g. 'ISO 9001:2015').",
        },
        "employee_count": {
            "type": "string",
            "description": "Total employees if stated. Empty string if not present.",
        },
        "iaf_code": {
            "type": "string",
            "description": "IAF / NACE industry classification code if stated. Empty string if not present.",
        },
    },
    "required": [
        "organization_name",
        "postal_address",
        "audit_site",
        "contact_person",
        "contact_designation",
        "contact_number",
        "contact_email",
        "audit_scope",
        "standards",
        "employee_count",
        "iaf_code",
    ],
    "additionalProperties": False,
}

PROMPT = """You are an ISO 9001 lead auditor's assistant. Extract the following fields from
the client's Quality Management System (QMS) manual that follows. Return ONLY the JSON
object matching the schema. If a field is not present in the QMS, return an empty string
(or empty array for `standards`).

QMS MANUAL TEXT:
---
{qms_text}
---
"""


def _resolve_api_key() -> str:
    key = os.environ.get("OPENROUTER_API_KEY")
    if key:
        return key
    env_path = Path.home() / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("OPENROUTER_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("OPENROUTER_API_KEY not set in env or ~/.env")


def extract_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(p.extract_text() or "" for p in reader.pages)


def extract_fields(qms_pdf: Path, *, cache_path: Path | None = None) -> dict:
    """Extract client fields from a QMS PDF. If cache_path exists, load from it."""
    if cache_path and cache_path.exists():
        return json.loads(cache_path.read_text())

    text = extract_pdf_text(qms_pdf)
    client = OpenAI(api_key=_resolve_api_key(), base_url="https://openrouter.ai/api/v1")
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You extract structured data from technical documents. Return strict JSON only.",
            },
            {"role": "user", "content": PROMPT.format(qms_text=text)},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "audit_fields", "strict": True, "schema": SCHEMA},
        },
        temperature=0,
    )
    fields = json.loads(resp.choices[0].message.content)
    if cache_path:
        cache_path.write_text(json.dumps(fields, indent=2))
    return fields
