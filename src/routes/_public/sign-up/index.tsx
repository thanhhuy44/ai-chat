import { SignUpPage } from '#/features/sign-in/sign-up'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/sign-up/')({
  component: SignUpPage,
})
