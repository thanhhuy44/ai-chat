import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { trpcRouter } from '#/trpc/router'
import { createFileRoute } from '@tanstack/react-router'
import { createContext } from '#/trpc/context'

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: '/api/trpc',
    createContext: () => createContext({ req: request }),
  })
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
