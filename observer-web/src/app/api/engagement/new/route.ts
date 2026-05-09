import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { extractFromQms } from "@/lib/python";

const UPLOADS = path.resolve(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const file = fd.get("qms");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing qms file" }, { status: 400 });
  }

  // Create a placeholder engagement so we have an id to namespace files under.
  const engagement = await db.engagement.create({
    data: { status: "extracting" },
  });

  const qmsDirRel = path.join("qms", engagement.id);
  const qmsDirAbs = path.resolve(UPLOADS, qmsDirRel);
  await mkdir(qmsDirAbs, { recursive: true });
  const qmsAbsPath = path.join(qmsDirAbs, file.name);
  const qmsRelPath = path.join(qmsDirRel, file.name);
  await writeFile(qmsAbsPath, Buffer.from(await file.arrayBuffer()));

  try {
    const fields = await extractFromQms(qmsAbsPath);
    await db.engagement.update({
      where: { id: engagement.id },
      data: {
        qmsPath: qmsRelPath,
        organizationName: fields.organization_name || "Untitled audit",
        postalAddress: fields.postal_address,
        auditSite: fields.audit_site,
        contactPerson: fields.contact_person,
        contactDesignation: fields.contact_designation,
        contactNumber: fields.contact_number,
        contactEmail: fields.contact_email,
        auditScope: fields.audit_scope,
        employeeCount: fields.employee_count,
        iafCode: fields.iaf_code,
        standardsJson: JSON.stringify(fields.standards || []),
        status: "stage1_in_progress",
      },
    });
    return NextResponse.json({
      id: engagement.id,
      fields: {
        organizationName: fields.organization_name || "",
        postalAddress: fields.postal_address || "",
        auditSite: fields.audit_site || "",
        contactPerson: fields.contact_person || "",
        contactDesignation: fields.contact_designation || "",
        contactNumber: fields.contact_number || "",
        contactEmail: fields.contact_email || "",
        auditScope: fields.audit_scope || "",
        employeeCount: fields.employee_count || "",
        iafCode: fields.iaf_code || "",
        standards: fields.standards || [],
      },
    });
  } catch (err) {
    console.error("extraction failed", err);
    await db.engagement.update({
      where: { id: engagement.id },
      data: { qmsPath: qmsRelPath, status: "awaiting_qms" },
    });
    return NextResponse.json(
      {
        id: engagement.id,
        warning:
          err instanceof Error
            ? err.message
            : "extraction failed; engagement created without fields",
      },
      { status: 200 }
    );
  }
}
