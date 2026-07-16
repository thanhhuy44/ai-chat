// src/server/trpc/context.ts
import { auth } from '@/lib/auth'

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  return {
    session,
    user: session?.user ?? null,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
