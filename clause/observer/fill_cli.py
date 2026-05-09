"""Standalone fill entry point — fills one or all templates given pre-extracted fields.

Usage:
    python -m observer.fill_cli <fields.json> <auditor.json> <out_dir> [kind ...]

If no kinds given, fills all 7. Prints one path per line for the web app to consume.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from observer.templates import (
    fill_attendance,
    fill_audit_plan,
    fill_audit_report,
    fill_intimation,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = REPO_ROOT / "templates_blank"

KIND_TO_TEMPLATE = {
    "stage1_plan": ("ARS_F-006 (a) Audit Plan (Stage-1).docx", fill_audit_plan),
    "stage1_intimation": ("ARS_F-007 (a) Intimation to organization (Stage-1).docx", fill_intimation),
    "attendance": ("ARS_F-008 Attendance Sheet - All.docx", fill_attendance),
    "stage1_report": ("ARS_F-011-IMS – Audit Report Stage-01-IMS Blank Report.docx", fill_audit_report),
    "stage2_plan": ("ARS_F-006 (b) Audit Plan (Stage-2).docx", fill_audit_plan),
    "stage2_intimation": ("ARS_F-007 (b) Intimation to organization (Stage-2).docx", fill_intimation),
    "stage2_report": ("ARS_F-012-IMS -Audit Report Stage-02-IMS-Blank Report.docx", fill_audit_report),
}


def main() -> None:
    if len(sys.argv) < 4:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    fields_path = Path(sys.argv[1])
    auditor_path = Path(sys.argv[2])
    out_dir = Path(sys.argv[3])
    kinds = sys.argv[4:] or list(KIND_TO_TEMPLATE.keys())

    out_dir.mkdir(parents=True, exist_ok=True)
    fields = json.loads(fields_path.read_text())
    auditor = json.loads(auditor_path.read_text())

    for kind in kinds:
        if kind not in KIND_TO_TEMPLATE:
            print(f"unknown kind: {kind}", file=sys.stderr)
            continue
        template_name, filler = KIND_TO_TEMPLATE[kind]
        out_path = out_dir / f"{kind}.docx"
        filler(TEMPLATES_DIR / template_name, fields, auditor, out_path)
        print(f"{kind}\t{out_path}")


if __name__ == "__main__":
    main()
