import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { criarBanco } from "./cliente";
import { plantarSemente } from "./semente";

/**
 * Roda no deploy da Vercel, antes do build: aplica as migrações novas e planta a semente.
 * Sem DATABASE_URL (ex.: no CI do GitHub) ele só avisa e sai sem erro.
 */
async function principal() {
  if (!process.env.DATABASE_URL) {
    console.log("[migrar] DATABASE_URL ausente: migração pulada.");
    return;
  }
  const { db, pool } = criarBanco();
  try {
    const pasta = fileURLToPath(new URL("../drizzle", import.meta.url));
    await migrate(db, { migrationsFolder: pasta });
    console.log("[migrar] migrações aplicadas.");
    const { criada } = await plantarSemente(db);
    console.log(criada ? "[migrar] loja demo criada." : "[migrar] loja demo já existia.");
  } finally {
    await pool.end();
  }
}

principal().catch((erro) => {
  console.error("[migrar] falhou:", erro);
  process.exit(1);
});
