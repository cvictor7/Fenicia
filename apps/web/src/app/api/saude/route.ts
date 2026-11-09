import { loja, obterBanco } from "@fenicia/db";
import { sql } from "drizzle-orm";
import { connection } from "next/server";

/**
 * GET /api/saude: confere se o site fala com o banco.
 * Usado para conferir o deploy e, no futuro, pelo monitor de site fora do ar.
 */
export async function GET() {
  await connection(); // só roda quando alguém acessa, nunca no build

  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: false, banco: "não configurado" }, { status: 503 });
  }
  try {
    const db = await obterBanco();
    const [linha] = await db.select({ total: sql<number>`count(*)::int` }).from(loja);
    return Response.json({ ok: true, banco: "conectado", lojas: linha.total });
  } catch {
    return Response.json({ ok: false, banco: "erro ao consultar" }, { status: 503 });
  }
}
