-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Signup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "practice" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "problemsJson" TEXT NOT NULL DEFAULT '[]',
    "referrer" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Signup" ("createdAt", "email", "id", "practice", "referrer", "userAgent") SELECT "createdAt", "email", "id", "practice", "referrer", "userAgent" FROM "Signup";
DROP TABLE "Signup";
ALTER TABLE "new_Signup" RENAME TO "Signup";
CREATE UNIQUE INDEX "Signup_email_key" ON "Signup"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
