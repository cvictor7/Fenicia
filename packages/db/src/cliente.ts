import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Conexão com o Neon. Usa o driver "serverless" (WebSocket), que aceita transação,
 * necessária para baixar estoque e gravar o histórico ao mesmo tempo.
 */
export function criarBanco(url = process.env.DATABASE_URL) {
  if (!url) throw new Error("DATABASE_URL não configurada");
  const pool = new Pool({ connectionString: url });
  return { db: drizzle(pool, { schema }), pool };
}
