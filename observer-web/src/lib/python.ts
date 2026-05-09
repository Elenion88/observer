/**
 * Wrappers around the Python CLI in /Users/ayoung/Dev/clause/observer.
 * Spawns `uv run python -m observer.{extract,fill}_cli ...` in a subprocess.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const PY_PROJECT = process.env.OBSERVER_PY_PROJECT ?? "/Users/ayoung/Dev/clause";

async function run(
  args: string[],
  opts: { cwd?: string } = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn("uv", ["run", "python", ...args], {
      cwd: opts.cwd ?? PY_PROJECT,
      env: { ...process.env },
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`python exited ${code}: ${stderr}`));
    });
  });
}

export type ExtractedFields = {
  organization_name: string;
  postal_address: string;
  audit_site: string;
  contact_person: string;
  contact_designation: string;
  contact_number: string;
  contact_email: string;
  audit_scope: string;
  standards: string[];
  employee_count: string;
  iaf_code: string;
};

export async function extractFromQms(qmsPath: string): Promise<ExtractedFields> {
  const { stdout } = await run([
    "-m",
    "observer.extract_cli",
    qmsPath,
  ]);
  return JSON.parse(stdout);
}

export type AuditorInputs = {
  client_reference: string;
  contract_number: string;
  intimation_date: string;
  audit_date_range: string;
  audit_man_days: string;
  audit_stage: string;
  audit_team: { name: string; role: string }[];
};

const KIND_LIST = [
  "stage1_plan",
  "stage1_intimation",
  "attendance",
  "stage1_report",
  "stage2_plan",
  "stage2_intimation",
  "stage2_report",
] as const;
export type DocumentKind = (typeof KIND_LIST)[number];

export async function fillTemplates(
  fields: ExtractedFields,
  auditor: AuditorInputs,
  outDir: string,
  kinds: DocumentKind[] = [...KIND_LIST]
): Promise<{ kind: DocumentKind; filePath: string }[]> {
  await mkdir(outDir, { recursive: true });
  const tmp = await mkdir(path.join(tmpdir(), `observer-${Date.now()}`), {
    recursive: true,
  });
  const fieldsPath = path.join(tmp!, "fields.json");
  const auditorPath = path.join(tmp!, "auditor.json");
  await writeFile(fieldsPath, JSON.stringify(fields));
  await writeFile(auditorPath, JSON.stringify(auditor));

  const { stdout } = await run([
    "-m",
    "observer.fill_cli",
    fieldsPath,
    auditorPath,
    outDir,
    ...kinds,
  ]);

  return stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [kind, filePath] = line.split("\t");
      return { kind: kind as DocumentKind, filePath };
    });
}

/**
 * Vision-label a single image. Calls Gemini Flash Lite via OpenRouter.
 * Returns a one-line label suitable for display under the photo.
 */
export async function labelImage(imagePath: string): Promise<string> {
  // Easiest path: tiny inline Python helper. Avoids re-wiring the OpenAI SDK
  // here just for image inputs.
  const { stdout } = await run(
    [
      "-c",
      `
import sys, base64, json, os
from pathlib import Path
from openai import OpenAI

env = Path.home() / ".env"
key = os.environ.get("OPENROUTER_API_KEY")
if not key and env.exists():
    for line in env.read_text().splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            key = line.split("=",1)[1].strip().strip('"').strip("'")
            break

img_path = sys.argv[1]
mime = "image/jpeg" if img_path.lower().endswith((".jpg",".jpeg")) else "image/png"
b64 = base64.b64encode(Path(img_path).read_bytes()).decode()
data_url = f"data:{mime};base64,{b64}"

client = OpenAI(api_key=key, base_url="https://openrouter.ai/api/v1")
resp = client.chat.completions.create(
    model="google/gemini-2.5-flash-lite",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "You are an ISO 9001 audit observer. Identify what this photo shows in ONE short label suitable for an audit evidence log. Examples: 'Fire extinguisher inspection tag, expiry 2026-08'; 'First aid kit, wall-mounted'; 'Calibration certificate \\u2014 torque wrench, 2025-03'; 'Employee training log \\u2014 Q3 2025'. Reply with the label only, no preamble."},
            {"type": "image_url", "image_url": {"url": data_url}},
        ],
    }],
    temperature=0,
)
print(resp.choices[0].message.content.strip())
`,
      imagePath,
    ],
    {}
  );
  return stdout.trim();
}
