-- CreateEnum
CREATE TYPE "Area" AS ENUM ('OPERACIONES', 'INSTRUCTIVOS', 'INTEGRIDAD_Y_MANTENCION', 'MEDIO_AMBIENTE', 'PREVENCION_RIESGOS', 'CALIDAD_Y_EXCELENCIA_PROFESIONAL', 'HSEQ', 'JURIDICA', 'COMUNIDADES');

-- CreateEnum
CREATE TYPE "Code" AS ENUM ('INSTRUCTIVO', 'FORMULARIO', 'PROCEDIMIENTO');

-- CreateTable
CREATE TABLE "folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "root" BOOLEAN NOT NULL DEFAULT false,
    "area" "Area" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "code" "Code" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
