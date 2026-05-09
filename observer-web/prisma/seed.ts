import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  await db.document.deleteMany();
  await db.evidence.deleteMany();
  await db.engagement.deleteMany();

  // 6 engagements spread across the lifecycle.
  // 3 are anonymized real (Syndeticom / NWCR / TRN), 3 fully fake.

  // 1) Awaiting QMS — empty state demo.
  await db.engagement.create({
    data: {
      organizationName: "Granite Peak Roofing",
      status: "awaiting_qms",
    },
  });

  // 2) Extracting — mid-pipeline.
  await db.engagement.create({
    data: {
      organizationName: "Cascade Networks Pty Ltd",
      status: "extracting",
      contactPerson: "—",
    },
  });

  // 3) Stage-1 in progress — fields filled, no docs yet.
  await db.engagement.create({
    data: {
      organizationName: "Northwind Cabling",
      status: "stage1_in_progress",
      postalAddress: "212 Industrial Dr\nReno, NV 89502",
      auditSite: "212 Industrial Dr, Reno, NV 89502",
      contactPerson: "Marcus Reyes",
      contactDesignation: "Operations Manager",
      contactNumber: "+1 775 555 0142",
      contactEmail: "mreyes@northwindcabling.com",
      auditScope:
        "Design, installation and maintenance of structured cabling, fiber optic networks, and wireless infrastructure for commercial and industrial sites in the western United States.",
      standardsJson: JSON.stringify(["ISO 9001:2015"]),
      employeeCount: "47",
      clientReference: "2026/NWC/004",
      contractNumber: "ARS-2026-0117",
      intimationDate: "2026-04-22",
      auditDateRange: "5/12-15/2026",
      auditManDays: "4",
      auditStage: "Stage 1",
      auditTeamJson: JSON.stringify([
        { name: "Jordan Carlson", role: "Lead Auditor" },
        { name: "Priya Shah", role: "Auditor" },
      ]),
    },
  });

  // 4) Stage-1 done — packet generated.
  const stage1Done = await db.engagement.create({
    data: {
      organizationName: "Trinity Rail Services",
      status: "stage1_done",
      postalAddress: "1840 Wabash Ave\nKansas City, MO 64108",
      auditSite: "1840 Wabash Ave, Kansas City, MO 64108",
      contactPerson: "Helena Voss",
      contactDesignation: "Quality Manager",
      contactNumber: "+1 816 555 0298",
      contactEmail: "h.voss@trinityrail.example",
      auditScope:
        "Provision of rail track maintenance, signaling installation, and rolling-stock inspection services for short-line and class-I rail operators.",
      standardsJson: JSON.stringify([
        "ISO 9001:2015",
        "ISO 14001:2015",
        "ISO 45001:2018",
      ]),
      employeeCount: "112",
      clientReference: "2026/TRS/002",
      contractNumber: "ARS-2026-0091",
      intimationDate: "2026-03-15",
      auditDateRange: "4/02-04/2026",
      auditManDays: "5",
      auditStage: "Stage 1",
      auditTeamJson: JSON.stringify([
        { name: "Jordan Carlson", role: "Lead Auditor" },
        { name: "Allyssa Chen", role: "Auditor" },
        { name: "Theo Marek", role: "Observer" },
      ]),
    },
  });
  for (const kind of [
    "stage1_plan",
    "stage1_intimation",
    "attendance",
    "stage1_report",
  ]) {
    await db.document.create({
      data: {
        engagementId: stage1Done.id,
        kind,
        filePath: `seed/${stage1Done.id}/${kind}.docx`,
      },
    });
  }

  // 5) Stage-2 in progress.
  await db.engagement.create({
    data: {
      organizationName: "Creekside Family Dental",
      status: "stage2_in_progress",
      postalAddress: "2244 Elm Crossing\nBoise, ID 83706",
      auditSite: "2244 Elm Crossing, Boise, ID 83706",
      contactPerson: "Dr. Anika Bose",
      contactDesignation: "Practice Owner",
      contactNumber: "+1 208 555 0144",
      contactEmail: "anika@creeksidedental.example",
      auditScope:
        "Provision of general and pediatric dentistry services including preventive care, restorative procedures, and orthodontic referral coordination.",
      standardsJson: JSON.stringify(["ISO 9001:2015"]),
      employeeCount: "9",
      clientReference: "2025/CFD/008",
      contractNumber: "ARS-2025-0388",
      intimationDate: "2025-11-20",
      auditDateRange: "1/14-15/2026",
      auditManDays: "2",
      auditStage: "Stage 2",
      auditTeamJson: JSON.stringify([
        { name: "Jordan Carlson", role: "Lead Auditor" },
      ]),
    },
  });

  // 6) Cert issued.
  const certIssued = await db.engagement.create({
    data: {
      organizationName: "Halcyon Foods Co.",
      status: "cert_issued",
      postalAddress: "5 Harborview Way\nPortland, ME 04101",
      auditSite: "5 Harborview Way, Portland, ME 04101",
      contactPerson: "Emil Tran",
      contactDesignation: "Plant Director",
      contactNumber: "+1 207 555 0190",
      contactEmail: "etran@halcyonfoods.example",
      auditScope:
        "Production, packaging, and cold-chain distribution of frozen seafood products for retail and food-service customers across North America.",
      standardsJson: JSON.stringify(["ISO 9001:2015", "ISO 14001:2015"]),
      employeeCount: "84",
      clientReference: "2025/HF/001",
      contractNumber: "ARS-2025-0123",
      intimationDate: "2025-08-04",
      auditDateRange: "11/18-21/2025",
      auditManDays: "6",
      auditStage: "Stage 2",
      auditTeamJson: JSON.stringify([
        { name: "Jordan Carlson", role: "Lead Auditor" },
        { name: "Priya Shah", role: "Auditor" },
      ]),
    },
  });
  for (const kind of [
    "stage1_plan",
    "stage1_intimation",
    "attendance",
    "stage1_report",
    "stage2_plan",
    "stage2_intimation",
    "stage2_report",
  ]) {
    await db.document.create({
      data: {
        engagementId: certIssued.id,
        kind,
        filePath: `seed/${certIssued.id}/${kind}.docx`,
      },
    });
  }

  // 7) Surveillance 1 — first annual after cert.
  await db.engagement.create({
    data: {
      organizationName: "Brightline Diagnostics",
      status: "surveillance_1_in_progress",
      postalAddress: "210 Innovation Pkwy\nDurham, NC 27709",
      auditSite: "210 Innovation Pkwy, Durham, NC 27709",
      contactPerson: "Dr. Renata Olsson",
      contactDesignation: "Quality Director",
      contactNumber: "+1 919 555 0173",
      contactEmail: "rolsson@brightlinedx.example",
      auditScope:
        "Provision of clinical-grade diagnostic imaging services and image-analysis software for hospital networks.",
      standardsJson: JSON.stringify(["ISO 9001:2015", "ISO 13485:2016"]),
      employeeCount: "61",
      clientReference: "2025/BLD/001-S1",
      contractNumber: "ARS-2025-0205",
      intimationDate: "2026-04-10",
      auditDateRange: "5/22-23/2026",
      auditManDays: "2",
      auditStage: "Surveillance 1",
      auditTeamJson: JSON.stringify([
        { name: "Jordan Carlson", role: "Lead Auditor" },
      ]),
      clientApprovedAt: new Date("2026-04-12T16:30:00"),
    },
  });

  // 8) Surveillance 2 — second annual.
  await db.engagement.create({
    data: {
      organizationName: "Pelagic Marine Coatings",
      status: "surveillance_2_done",
      postalAddress: "44 Drydock Rd\nNew Bedford, MA 02740",
      auditSite: "44 Drydock Rd, New Bedford, MA 02740",
      contactPerson: "Connor Whitley",
      contactDesignation: "Operations Manager",
      contactNumber: "+1 508 555 0119",
      contactEmail: "cwhitley@pelagiccoat.example",
      auditScope:
        "Manufacture and application of corrosion-resistant marine coatings for commercial and naval vessels.",
      standardsJson: JSON.stringify([
        "ISO 9001:2015",
        "ISO 14001:2015",
        "ISO 45001:2018",
      ]),
      employeeCount: "138",
      clientReference: "2024/PMC/001-S2",
      contractNumber: "ARS-2024-0091",
      intimationDate: "2026-02-04",
      auditDateRange: "3/18-19/2026",
      auditManDays: "2",
      auditStage: "Surveillance 2",
      auditTeamJson: JSON.stringify([
        { name: "Jordan Carlson", role: "Lead Auditor" },
        { name: "Priya Shah", role: "Auditor" },
      ]),
      clientApprovedAt: new Date("2026-02-06T10:15:00"),
      auditApprovedAt: new Date("2026-02-08T09:00:00"),
    },
  });

  console.log("seeded 8 engagements");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
