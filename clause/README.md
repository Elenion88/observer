# Observer

AI back-office for ISO 9001 lead auditors. Drop in a client's QMS PDF, get a filled audit packet (Stage-1 plan, intimation letter, attendance sheet, audit report — and the same for Stage-2) in 5 seconds.

## Setup

```bash
cd clause
echo "OPENROUTER_API_KEY=sk-..." >> ~/.env
uv sync
```

## Run

```bash
uv run python -m observer.cli <qms.pdf> <auditor.json> <out_dir> [--stage 1|2|both]
```

Example (Syndeticom, both stages):

```bash
uv run python -m observer.cli \
  path/to/qms_manual.pdf \
  sample_inputs/syndeticom.json \
  /tmp/out --stage both --cache-fields /tmp/syndeticom_fields.json
```

Produces 7 .docx files in `/tmp/out/`:

```
syndeticom_stage1_plan.docx
syndeticom_stage1_intimation.docx
syndeticom_attendance.docx
syndeticom_stage1_report.docx
syndeticom_stage2_plan.docx
syndeticom_stage2_intimation.docx
syndeticom_stage2_report.docx
```

## Auditor inputs JSON

Fields the QMS can't supply (audit dates, team, contract no.):

```json
{
  "client_reference": "2025/SYN/001",
  "intimation_date": "2025-08-01",
  "contract_number": "ARS-2025-0042",
  "audit_stage": "Stage 1",
  "audit_date_range": "8/4-9/2025",
  "audit_man_days": "6",
  "audit_team": [
    {"name": "Seth Shea", "role": "Lead Auditor"},
    {"name": "Allyssa Shea", "role": "Auditor"},
    {"name": "McKinley Butler", "role": "Observer"}
  ]
}
```

## What gets filled vs. left for the auditor

**Filled by Observer** (from QMS + auditor JSON):
- Org name, address, audit site, contact person/designation/number/email
- Audit scope (verbatim from QMS where possible)
- Audit dates, man-days, team, client reference, contract number

**Left blank for the auditor**:
- Audit findings (clause-by-clause C/NC/OBS) — judgment calls during the audit
- Recommendation, sign-offs
- Attendee signatures (people sign in person)

## Cost

~56K input tokens × $0.10/M = **~$0.006 per audit** with `google/gemini-2.5-flash-lite` via OpenRouter. Caching the extraction (`--cache-fields path.json`) makes re-fills free.

## Layout

```
observer/
├── extract.py      # QMS PDF → structured fields via LLM
├── templates.py    # 4 fillers shared across both stages
└── cli.py          # entry point
templates_blank/    # 7 ARS .docx templates
sample_inputs/      # example auditor inputs
```
