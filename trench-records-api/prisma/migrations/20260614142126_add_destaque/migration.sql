-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Disco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "artista" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "imagemUrl" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destaque" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Disco" ("artista", "criadoEm", "estoque", "genero", "id", "imagemUrl", "preco", "titulo") SELECT "artista", "criadoEm", "estoque", "genero", "id", "imagemUrl", "preco", "titulo" FROM "Disco";
DROP TABLE "Disco";
ALTER TABLE "new_Disco" RENAME TO "Disco";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
