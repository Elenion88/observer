"""Observer CLI: turn a client QMS PDF + auditor inputs into an audit packet."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from observer.extract import extract_fields
from observer.templates import (
    fill_attendance,
    fill_audit_plan,
    fill_audit_report,
    fill_intimation,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = REPO_ROOT / "templates_blank"

# (output_key, template_filename, filler_fn)
STAGE1_FILES = [
    ("stage1_plan", "ARS_F-006 (a) Audit Plan (Stage-1).docx", fill_audit_plan),
    ("stage1_intimation", "ARS_F-007 (a) Intimation to organization (Stage-1).docx", fill_intimation),
    ("attendance", "ARS_F-008 Attendance Sheet - All.docx", fill_attendance),
    ("stage1_report", "ARS_F-011-IMS – Audit Report Stage-01-IMS Blank Report.docx", fill_audit_report),
]

STAGE2_FILES = [
    ("stage2_plan", "ARS_F-006 (b) Audit Plan (Stage-2).docx", fill_audit_plan),
    ("stage2_intimation", "ARS_F-007 (b) Intimation to organization (Stage-2).docx", fill_intimation),
    ("stage2_report", "ARS_F-012-IMS -Audit Report Stage-02-IMS-Blank Report.docx", fill_audit_report),
]


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="observer",
        description="Generate an ISO 9001 audit packet from a client QMS PDF.",
    )
    parser.add_argument("qms_pdf", type=Path, help="Client QMS manual (PDF)")
    parser.add_argument("auditor_json", type=Path, help="Auditor inputs (JSON)")
    parser.add_argument("out_dir", type=Path, help="Output directory for filled .docx files")
    parser.add_argument(
        "--stage",
        choices=["1", "2", "both"],
        default="1",
        help="Which audit stage to produce (default: 1).",
    )
    parser.add_argument(
        "--cache-fields",
        type=Path,
        default=None,
        help="Optional path to cache/load extracted fields (avoids re-running the LLM).",
    )
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)

    print(f"[1/3] auditor inputs: {args.auditor_json}")
    auditor = json.loads(args.auditor_json.read_text())

    print(f"[2/3] extracting from {args.qms_pdf.name} ...")
    fields = extract_fields(args.qms_pdf, cache_path=args.cache_fields)
    print("      extracted:")
    for k, v in fields.items():
        v_str = v if isinstance(v, str) else json.dumps(v)
        v_str = v_str.replace("\n", " | ")
        print(f"        {k:24s} = {v_str[:110]}")

    plan: list[tuple[str, str, callable]] = []
    if args.stage in ("1", "both"):
        plan.extend(STAGE1_FILES)
    if args.stage in ("2", "both"):
        plan.extend(STAGE2_FILES)

    print(f"[3/3] filling {len(plan)} templates -> {args.out_dir}/")
    org_slug = (fields.get("organization_name", "client") or "client").split()[0].lower()
    for key, filename, filler in plan:
        blank = TEMPLATES_DIR / filename
        out = args.out_dir / f"{org_slug}_{key}.docx"
        filler(blank, fields, auditor, out)
        print(f"        {out.name}")

    print("done.")


if __name__ == "__main__":
    main()
