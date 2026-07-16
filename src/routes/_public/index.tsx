import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  component: Root,
})

function Root() {
  return <Navigate to={'/chat'} />
}
