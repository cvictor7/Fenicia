import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";
import type { Banco } from "./tipos";

/** Banco novo, vazio e migrado, só para testes. */
export async function bancoDeTeste(): Promise<Banco> {
  const banco = drizzle(new PGlite(), { schema });
  await migrate(banco, {
    migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
  });
  return banco as unknown as Banco;
}
