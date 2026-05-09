-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'awaiting_qms',
    "organizationName" TEXT NOT NULL DEFAULT 'Untitled audit',
    "postalAddress" TEXT NOT NULL DEFAULT '',
    "auditSite" TEXT NOT NULL DEFAULT '',
    "contactPerson" TEXT NOT NULL DEFAULT '',
    "contactDesignation" TEXT NOT NULL DEFAULT '',
    "contactNumber" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "auditScope" TEXT NOT NULL DEFAULT '',
    "employeeCount" TEXT NOT NULL DEFAULT '',
    "iafCode" TEXT NOT NULL DEFAULT '',
    "standardsJson" TEXT NOT NULL DEFAULT '[]',
    "clientReference" TEXT NOT NULL DEFAULT '',
    "contractNumber" TEXT NOT NULL DEFAULT '',
    "intimationDate" TEXT NOT NULL DEFAULT '',
    "auditDateRange" TEXT NOT NULL DEFAULT '',
    "auditManDays" TEXT NOT NULL DEFAULT '',
    "auditStage" TEXT NOT NULL DEFAULT 'Stage 1',
    "auditTeamJson" TEXT NOT NULL DEFAULT '[]',
    "qmsPath" TEXT
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'evidence',
    "caption" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Evidence_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    CONSTRAINT "Document_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_engagementId_kind_key" ON "Document"("engagementId", "kind");
