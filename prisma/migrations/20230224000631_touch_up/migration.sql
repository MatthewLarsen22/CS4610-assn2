-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reptile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "species" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reptile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reptile" ("createdAt", "id", "name", "sex", "species", "updatedAt", "userId") SELECT "createdAt", "id", "name", "sex", "species", "updatedAt", "userId" FROM "Reptile";
DROP TABLE "Reptile";
ALTER TABLE "new_Reptile" RENAME TO "Reptile";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
