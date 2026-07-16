import type { ReactNode } from 'react'
import { QueryClient } from '@tanstack/react-query'
import superjson from 'superjson'
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
} from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import type { TRPCRouter } from '@/trpc/router'
import { TRPCProvider } from '@/trpc/react'
import { getRequestHeaders } from '@tanstack/react-start/server'

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return ''
    return `http://localhost:${process.env.PORT ?? 3000}`
  })()
  return `${base}/api/trpc`
}

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    splitLink({
      condition: (op) => {
        return op.type === 'subscription'
      },
      true: httpSubscriptionLink({
        transformer: superjson,
        url: getUrl(),
        connectionParams: () => {
          if (typeof window === 'undefined') {
            return getRequestHeaders()
          }
          return {}
        },
      }),
      false: httpBatchStreamLink({
        transformer: superjson,
        url: getUrl(),
        headers: () => {
          if (typeof window === 'undefined') {
            return getRequestHeaders()
          }
          return {}
        },
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),
    }),
  ],
})

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  })

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  })
  const context = {
    queryClient,
    trpc: serverHelpers,
  }

  return context
}

export default function TanstackQueryProvider({
  children,
  context,
}: {
  children: ReactNode
  context: ReturnType<typeof getContext>
}) {
  const { queryClient } = context

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  )
}
