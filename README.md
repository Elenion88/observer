# Observer

AI back-office for ISO 9001 lead auditors. Drop in a client's QMS PDF, get a filled audit packet (Stage-1 plan, intimation letter, attendance sheet, audit report — and the same for Stage-2) in seconds. Live demo: https://observer.kokomo.quest

Built for the May 2026 MadeThis hackathon.

## Repo layout

- [`clause/`](clause/) — Python pipeline: extracts structured fields from a QMS PDF via LLM, fills 7 `.docx` audit templates.
- [`observer-web/`](observer-web/) — Next.js web app: upload UI, document workflow, evidence capture, deployment to `observer.kokomo.quest`.

Each subdirectory has its own README with setup/run instructions.

## Stack

- **Pipeline**: Python 3.14, `uv`, `python-docx`, OpenRouter (Gemini 2.5 Flash Lite, ~$0.006/audit)
- **Web**: Next.js 15 (App Router), Prisma + SQLite, TailwindCSS
- **Hosting**: self-hosted on a Tailscale node behind Caddy

## Why

ISO 9001 lead auditors spend hours filling boilerplate forms before they ever set foot on-site. The form content is mostly mechanical lookup from the client's Quality Management System manual. Observer automates that lookup so auditors keep judgment work (findings, recommendations) and offload the typing.
