import { defineConfig } from "drizzle-kit";

// gera os arquivos SQL de migração a partir do schema (não precisa de banco)
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
