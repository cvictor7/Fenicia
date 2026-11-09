import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import type { Banco } from "./tipos";

/**
 * Conexão com o Neon. Usa o driver "serverless" (WebSocket), que aceita transação,
 * necessária para baixar estoque e gravar o histórico ao mesmo tempo.
 */
export function criarBanco(url = process.env.DATABASE_URL) {
  if (!url) throw new Error("DATABASE_URL não configurada");
  const pool = new Pool({ connectionString: url });
  return { db: drizzle(pool, { schema }), pool };
}

let compartilhado: Promise<Banco> | undefined;

/**
 * Banco único do app (reaproveitado entre requisições na mesma função da Vercel).
 * Para rodar no PC sem internet: DATABASE_URL=pglite:./.banco-local
 * (Postgres embutido, criado e migrado sozinho; só para desenvolvimento).
 */
export function obterBanco(): Promise<Banco> {
  compartilhado ??= abrir();
  return compartilhado;
}

async function abrir(): Promise<Banco> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");

  if (url.startsWith("pglite:")) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const pasta = url.slice("pglite:".length) || undefined;
    const db = drizzlePglite(new PGlite(pasta), { schema });
    // roda com o app aberto em apps/web; a pasta das migrações fica em packages/db
    const migracoes =
      process.env.FENICIA_MIGRACOES ?? `${process.cwd()}/../../packages/db/drizzle`;
    await migrate(db, { migrationsFolder: migracoes });
    return db as unknown as Banco;
  }

  return criarBanco(url).db as unknown as Banco;
}
