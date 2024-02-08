/*
  Warnings:

  - Added the required column `hashedPassword` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "Post_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashedPassword" STRING NOT NULL;
