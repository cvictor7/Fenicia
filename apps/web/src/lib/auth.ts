import { account, obterBanco, session, user, verification } from "@fenicia/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

/** Endereço do site: variável explícita, ou o domínio da Vercel, ou o PC. */
function urlBase() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/** Endereços que podem chamar o login (inclui as prévias da Vercel). */
function origensConfiaveis() {
  return [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`);
}

function segredo() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") return "segredo-so-para-desenvolvimento-local-123";
  throw new Error("BETTER_AUTH_SECRET não configurado");
}

async function montar() {
  const db = await obterBanco();
  return betterAuth({
    baseURL: urlBase(),
    secret: segredo(),
    trustedOrigins: origensConfiaveis(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
    },
    // grava o cookie de sessão quando o login roda dentro de uma Server Action
    plugins: [nextCookies()],
  });
}

let instancia: ReturnType<typeof montar> | undefined;

/** O login é montado na primeira requisição (precisa do banco) e reaproveitado depois. */
export function obterAuth() {
  instancia ??= montar();
  return instancia;
}
