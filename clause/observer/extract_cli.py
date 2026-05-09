"""Standalone extract entry point — prints JSON to stdout for the web app to consume."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from observer.extract import extract_fields


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: python -m observer.extract_cli <qms.pdf> [cache.json]", file=sys.stderr)
        sys.exit(1)
    qms = Path(sys.argv[1])
    cache = Path(sys.argv[2]) if len(sys.argv) >= 3 else None
    fields = extract_fields(qms, cache_path=cache)
    json.dump(fields, sys.stdout)


if __name__ == "__main__":
    main()
