import { getSession } from '@/lib/auth.functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  beforeLoad: async () => {
    const session = await getSession().catch((error) => {
      console.log('🚀 ~ error:', error)
    })
    if (session)
      throw redirect({
        to: '/chat',
      })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
