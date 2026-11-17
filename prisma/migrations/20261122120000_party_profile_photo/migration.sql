-- a foto que já era a capa redonda passa a ser a foto do aniversariante
ALTER TABLE "Party" ADD COLUMN "profileUrl" TEXT;
UPDATE "Party" SET "profileUrl" = "coverUrl", "coverUrl" = NULL WHERE "coverStyle" = 'redonda';
ALTER TABLE "Party" DROP COLUMN "coverStyle";
