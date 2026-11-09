import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/** Qualquer banco Postgres do Drizzle com o nosso schema (Neon em produção, PGlite nos testes). */
export type Banco = PgDatabase<PgQueryResultHKT, typeof schema>;
