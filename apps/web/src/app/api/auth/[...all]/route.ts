import { obterAuth } from "@/lib/auth";

/** Todas as rotas do login (/api/auth/...) passam por aqui. */
async function tratar(request: Request) {
  const auth = await obterAuth();
  return auth.handler(request);
}

export const GET = tratar;
export const POST = tratar;
